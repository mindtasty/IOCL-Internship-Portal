// reportController.js
const db = require('../config/db');
const { logActivity, createNotification } = require('../utils/helpers');

// 1. Get List of Weekly Reports for an Internship Application
async function getReports(req, res) {
  const applicationId = req.params.applicationId;
  const { roleName, id: userId } = req.user;

  try {
    // Student access guard
    if (roleName === 'Student') {
      const apps = await db.query('SELECT student_id FROM applications WHERE id = ?', [applicationId]);
      if (apps.length === 0 || apps[0].student_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You cannot access another student\'s reports.' });
      }
    }

    const reports = await db.query(
      'SELECT * FROM weekly_reports WHERE application_id = ? ORDER BY week_number DESC',
      [applicationId]
    );

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ message: 'Failed to retrieve weekly reports.' });
  }
}

// 2. Submit Weekly Progress Report (Student only)
async function submitReport(req, res) {
  const applicationId = req.params.applicationId;
  const { week_number, tasks_performed, what_learned, challenges_faced, comments } = req.body;
  const studentId = req.user.id;

  if (!week_number || !tasks_performed || !what_learned || !challenges_faced) {
    return res.status(400).json({ message: 'Please fill in all mandatory report fields.' });
  }

  try {
    // 1. Verify application ownership and active status
    const apps = await db.query('SELECT student_id, status FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Internship application not found.' });
    }
    if (apps[0].student_id !== studentId) {
      return res.status(403).json({ message: 'Forbidden: You can only submit reports for your own internship.' });
    }
    if (apps[0].status !== 'Internship Active') {
      return res.status(400).json({ message: 'Reports can only be filed while the internship is active.' });
    }

    // 2. Insert or replace weekly report
    await db.query(
      "INSERT INTO weekly_reports (application_id, week_number, tasks_performed, what_learned, challenges_faced, comments, status) VALUES (?, ?, ?, ?, ?, ?, 'Submitted') ON CONFLICT(application_id, week_number) DO UPDATE SET tasks_performed = excluded.tasks_performed, what_learned = excluded.what_learned, challenges_faced = excluded.challenges_faced, comments = excluded.comments, status = 'Submitted'",
      [applicationId, week_number, tasks_performed, what_learned, challenges_faced, comments || null]
    );

    // Notify assigned mentor
    const mentors = await db.query(
      `SELECT u.id as user_id 
       FROM mentor_assignments ma 
       JOIN mentors m ON ma.mentor_id = m.id 
       JOIN users u ON m.user_id = u.id 
       WHERE ma.application_id = ?`,
      [applicationId]
    );

    if (mentors.length > 0) {
      await createNotification(
        mentors[0].user_id,
        'Weekly Report Submitted',
        `Student has submitted the weekly report for Week ${week_number}.`
      );
    }

    res.status(201).json({ message: `Weekly report for Week ${week_number} submitted successfully.` });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Failed to submit weekly report.' });
  }
}

// 3. Review/Grade Weekly Report (Mentor/Admin only)
async function reviewReport(req, res) {
  const { applicationId, reportId } = req.params;
  const { status, remarks } = req.body; // status: 'Approved' or 'Clarification Requested'
  const reviewerId = req.user.id;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    // Verify report exists
    const reports = await db.query('SELECT week_number FROM weekly_reports WHERE id = ? AND application_id = ?', [reportId, applicationId]);
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Weekly report record not found.' });
    }
    const report = reports[0];

    // Update report status & append comments if provided
    await db.query(
      'UPDATE weekly_reports SET status = ?, comments = ? WHERE id = ?',
      [status, remarks || null, reportId]
    );

    // Notify student
    const apps = await db.query('SELECT student_id FROM applications WHERE id = ?', [applicationId]);
    if (apps.length > 0) {
      await createNotification(
        apps[0].student_id,
        `Weekly Report ${status}`,
        `Your report for Week ${report.week_number} was marked as "${status}". Mentor Comments: ${remarks || 'None'}`
      );
    }

    res.status(200).json({ message: `Weekly report status updated to ${status}.` });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ message: 'Failed to update weekly report status.' });
  }
}

// 4. Get Comments Feed for a Weekly Report
async function getComments(req, res) {
  const reportId = req.params.reportId;

  try {
    const comments = await db.query(
      `SELECT c.*, u.first_name, u.last_name, r.name as role_name 
       FROM weekly_report_comments c
       JOIN users u ON c.author_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE c.report_id = ? 
       ORDER BY c.created_at ASC`,
      [reportId]
    );
    res.status(200).json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Failed to retrieve report comments.' });
  }
}

// 5. Post comment on a Weekly Report
async function postComment(req, res) {
  const reportId = req.params.reportId;
  const { comment } = req.body;
  const authorId = req.user.id;

  if (!comment) {
    return res.status(400).json({ message: 'Comment cannot be blank.' });
  }

  try {
    const insertResult = await db.query(
      'INSERT INTO weekly_report_comments (report_id, author_id, comment) VALUES (?, ?, ?)',
      [reportId, authorId, comment]
    );

    // Notify other party
    const reportInfo = await db.query(
      `SELECT wr.application_id, wr.week_number, a.student_id, ma.mentor_id, u.id as mentor_user_id 
       FROM weekly_reports wr
       JOIN applications a ON wr.application_id = a.id
       LEFT JOIN mentor_assignments ma ON a.id = ma.application_id
       LEFT JOIN mentors m ON ma.mentor_id = m.id
       LEFT JOIN users u ON m.user_id = u.id
       WHERE wr.id = ?`,
      [reportId]
    );

    if (reportInfo.length > 0) {
      const { student_id, mentor_user_id, week_number } = reportInfo[0];
      const notifyUserId = authorId === student_id ? mentor_user_id : student_id;
      
      if (notifyUserId) {
        await createNotification(
          notifyUserId,
          'New Comment on Report',
          `New comment added to the Week ${week_number} report conversation.`
        );
      }
    }

    res.status(201).json({
      message: 'Comment posted successfully.',
      comment: {
        id: insertResult.insertId,
        report_id: reportId,
        author_id: authorId,
        comment,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).json({ message: 'Failed to write comment.' });
  }
}

module.exports = {
  getReports,
  submitReport,
  reviewReport,
  getComments,
  postComment
};
