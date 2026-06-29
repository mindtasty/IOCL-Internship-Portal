// applicationController.js
const db = require('../config/db');
const { logActivity, createNotification } = require('../utils/helpers');

// 1. Submit a New Application
async function createApplication(req, res) {
  const studentId = req.user.id;
  const { company_name, internship_title, start_date, end_date, department_id, is_draft } = req.body;

  if (!company_name || !internship_title || !start_date || !end_date || !department_id) {
    return res.status(400).json({ message: 'Please provide all required application fields.' });
  }

  try {
    // Check if the student already has an active or pending application to prevent double filing
    const activeApps = await db.query(
      "SELECT id FROM applications WHERE student_id = ? AND status NOT IN ('Rejected', 'Internship Completed')",
      [studentId]
    );
    if (activeApps.length > 0 && is_draft !== 'true') {
      return res.status(400).json({ message: 'You already have a pending or active internship application.' });
    }

    const status = is_draft === 'true' ? 'Draft' : 'Submitted';

    // Insert into applications
    const appResult = await db.query(
      'INSERT INTO applications (student_id, department_id, status, company_name, internship_title, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, department_id, status, company_name, internship_title, start_date, end_date]
    );
    const applicationId = appResult.insertId;

    // Handle Uploaded Documents
    if (req.files) {
      const docTypes = ['resume', 'noc', 'recommendation', 'other'];
      for (const type of docTypes) {
        if (req.files[type]) {
          const file = req.files[type][0];
          // Map backend fieldname to SQL friendly casing
          const docTypeName = type.charAt(0).toUpperCase() + type.slice(1); // 'Resume', 'Noc', etc.
          await db.query(
            'INSERT INTO application_documents (application_id, document_type, file_name, file_path, status) VALUES (?, ?, ?, ?, ?)',
            [applicationId, docTypeName === 'Noc' ? 'NOC' : docTypeName, file.originalname, file.path, 'Pending']
          );
        }
      }
    }

    // Log Activity & Create Notification
    if (status === 'Submitted') {
      await logActivity(applicationId, studentId, 'Application Submitted', 'Student submitted a new internship application.');
      await createNotification(studentId, 'Application Submitted', 'Your internship application has been successfully submitted and is under HR Review.');
    } else {
      await logActivity(applicationId, studentId, 'Draft Saved', 'Student saved application as draft.');
    }

    res.status(201).json({
      message: status === 'Draft' ? 'Application saved as draft.' : 'Application submitted successfully!',
      applicationId
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Failed to create application.' });
  }
}

// 2. Fetch Applications List Based on User Role
async function getApplications(req, res) {
  const { roleName, id: userId, departmentId } = req.user;
  const { status, search } = req.query;

  try {
    let queryStr = `
      SELECT a.*, u.first_name, u.last_name, u.email, d.name as department_name, d.code as department_code,
             m.first_name as mentor_first_name, m.last_name as mentor_last_name
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN departments d ON a.department_id = d.id
      LEFT JOIN mentor_assignments ma ON a.id = ma.application_id
      LEFT JOIN mentors men ON ma.mentor_id = men.id
      LEFT JOIN users m ON men.user_id = m.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Filter by Role Permissions
    if (roleName === 'Student') {
      queryStr += ' AND a.student_id = ?';
      queryParams.push(userId);
    } else if (roleName === 'HOD') {
      // HODs see their department's applications
      queryStr += ' AND a.department_id = ? AND a.status NOT IN (\'Draft\')';
      queryParams.push(departmentId);
    } else if (roleName === 'Mentor') {
      // Mentors see applications they are assigned to
      queryStr += ' AND ma.mentor_id = (SELECT id FROM mentors WHERE user_id = ?)';
      queryParams.push(userId);
    } else if (roleName === 'L&D') {
      // L&D reviews applications forwarded to L&D
      queryStr += ' AND a.status IN (\'Forwarded To L&D\', \'Under L&D Review\', \'L&D Approved\', \'Internship Active\', \'Internship Completed\')';
    } else if (roleName === 'HR') {
      // HR sees all applications except Drafts
      queryStr += ' AND a.status NOT IN (\'Draft\')';
    }

    // Additional Filters
    if (status) {
      queryStr += ' AND a.status = ?';
      queryParams.push(status);
    }

    if (search) {
      queryStr += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR a.company_name LIKE ? OR a.internship_title LIKE ?)';
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    queryStr += ' ORDER BY a.updated_at DESC';

    const applications = await db.query(queryStr, queryParams);
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ message: 'Failed to retrieve applications.' });
  }
}

// 3. Fetch Application Detail, Docs & Audit Trail
async function getApplicationById(req, res) {
  const applicationId = req.params.id;
  const { roleName, id: userId, departmentId } = req.user;

  try {
    // 1. Fetch main application info
    const apps = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.email, u.phone, d.name as department_name, d.code as department_code
       FROM applications a
       JOIN users u ON a.student_id = u.id
       JOIN departments d ON a.department_id = d.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const application = apps[0];

    // Enforce role-based view permissions
    if (roleName === 'Student' && application.student_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: You cannot view another student\'s application.' });
    }
    if (roleName === 'HOD' && application.department_id !== departmentId) {
      return res.status(403).json({ message: 'Forbidden: This application belongs to another department.' });
    }

    // 2. Fetch associated documents
    const documents = await db.query(
      'SELECT id, document_type, file_name, file_path, status, remarks FROM application_documents WHERE application_id = ?',
      [applicationId]
    );

    // 3. Fetch activity timeline logs
    const activityLogs = await db.query(
      `SELECT al.*, u.first_name, u.last_name, r.name as role_name 
       FROM activity_logs al
       JOIN users u ON al.action_by = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE al.application_id = ? 
       ORDER BY al.timestamp ASC`,
      [applicationId]
    );

    // 4. Fetch Mentor Assignment (if any)
    const mentorAssignments = await db.query(
      `SELECT ma.*, u.first_name, u.last_name, u.email, m.specialization
       FROM mentor_assignments ma
       JOIN mentors m ON ma.mentor_id = m.id
       JOIN users u ON m.user_id = u.id
       WHERE ma.application_id = ?`,
      [applicationId]
    );

    // 5. Fetch Certificate/Summary details (if uploaded)
    const certificate = await db.query(
      'SELECT file_name, file_path, uploaded_at FROM certificates WHERE application_id = ?',
      [applicationId]
    );

    const summary = await db.query(
      'SELECT technical_skills, learning_ability, communication, discipline, attendance_score, evaluation_remarks, file_path, created_at FROM internship_summaries WHERE application_id = ?',
      [applicationId]
    );

    res.status(200).json({
      application,
      documents,
      activityLogs,
      mentor: mentorAssignments.length > 0 ? mentorAssignments[0] : null,
      certificate: certificate.length > 0 ? certificate[0] : null,
      summary: summary.length > 0 ? summary[0] : null
    });
  } catch (error) {
    console.error('Fetch application detail error:', error);
    res.status(500).json({ message: 'Failed to retrieve application details.' });
  }
}

// 4. Update Status (HR, HOD, L&D, Admin workflow state controller)
async function updateStatus(req, res) {
  const applicationId = req.params.id;
  const { status, remarks, documentRemarks } = req.body; // documentRemarks is optional object: { docId: 'remarks' }
  const actionBy = req.user.id;
  const role = req.user.roleName;

  if (!status) {
    return res.status(400).json({ message: 'Status field is required.' });
  }

  try {
    // Retrieve current status
    const apps = await db.query('SELECT status, student_id, department_id FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    const currentApp = apps[0];

    // State guards (Admin can bypass)
    if (role !== 'Admin') {
      if (role === 'HR' && !['Under HR Review', 'Modification Requested', 'Forwarded To HOD', 'Rejected', 'Forwarded To L&D'].includes(status)) {
        return res.status(403).json({ message: 'HR not authorized for this status change.' });
      }
      if (role === 'HOD' && !['Under HOD Review', 'HOD Approved', 'Rejected'].includes(status)) {
        return res.status(403).json({ message: 'HOD not authorized for this status change.' });
      }
      if (role === 'L&D' && !['Under L&D Review', 'L&D Approved', 'Rejected', 'Internship Active'].includes(status)) {
        return res.status(403).json({ message: 'L&D not authorized for this status change.' });
      }
    }

    // If L&D approves, make the internship active
    let finalStatus = status;
    if (status === 'L&D Approved') {
      finalStatus = 'Internship Active';
    }

    // Update main application status
    await db.query('UPDATE applications SET status = ?, remarks = ? WHERE id = ?', [finalStatus, remarks || null, applicationId]);

    // If HR requested modifications, mark relevant documents as rejected/modified
    if (status === 'Modification Requested' && documentRemarks) {
      for (const [docId, docRemarks] of Object.entries(documentRemarks)) {
        await db.query(
          "UPDATE application_documents SET status = 'Rejected', remarks = ? WHERE id = ? AND application_id = ?",
          [docRemarks, docId, applicationId]
        );
      }
    }

    // Log the transaction in the activity log
    await logActivity(applicationId, actionBy, `Status Updated to ${finalStatus}`, remarks || `Application state moved to ${finalStatus}.`);

    // Notify the student
    await createNotification(
      currentApp.student_id,
      `Application Status: ${finalStatus}`,
      `Your application status is now "${finalStatus}". ${remarks ? 'Remarks: ' + remarks : ''}`
    );

    res.status(200).json({ message: 'Status updated successfully.', currentStatus: finalStatus });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update application status.' });
  }
}

// 5. Student Resubmits Application (with corrected uploads)
async function resubmitApplication(req, res) {
  const applicationId = req.params.id;
  const studentId = req.user.id;

  try {
    const apps = await db.query('SELECT status, student_id FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (apps[0].student_id !== studentId) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    // Change status to Resubmitted
    await db.query("UPDATE applications SET status = 'Resubmitted' WHERE id = ?", [applicationId]);

    // Handle Uploaded Documents
    if (req.files) {
      const docTypes = ['resume', 'noc', 'recommendation', 'other'];
      for (const type of docTypes) {
        if (req.files[type]) {
          const file = req.files[type][0];
          const docTypeName = type.charAt(0).toUpperCase() + type.slice(1);
          const finalDocType = docTypeName === 'Noc' ? 'NOC' : docTypeName;

          // Delete/archive older document record of this type if it was rejected
          await db.query(
            'DELETE FROM application_documents WHERE application_id = ? AND document_type = ?',
            [applicationId, finalDocType]
          );

          // Insert the corrected document
          await db.query(
            'INSERT INTO application_documents (application_id, document_type, file_name, file_path, status) VALUES (?, ?, ?, ?, ?)',
            [applicationId, finalDocType, file.originalname, file.path, 'Pending']
          );
        }
      }
    }

    // Log Activity & notify HR
    await logActivity(applicationId, studentId, 'Application Resubmitted', 'Student resubmitted corrected documents.');
    await createNotification(studentId, 'Application Resubmitted', 'Your corrected application is now resubmitted and waiting for HR review.');

    res.status(200).json({ message: 'Application resubmitted successfully!' });
  } catch (error) {
    console.error('Resubmission error:', error);
    res.status(500).json({ message: 'Failed to resubmit application.' });
  }
}

// 6. HOD / Admin Assigns Mentor
async function assignMentor(req, res) {
  const applicationId = req.params.id;
  const { mentor_id } = req.body;
  const HODUserId = req.user.id;

  if (!mentor_id) {
    return res.status(400).json({ message: 'Mentor ID is required.' });
  }

  try {
    // Verify application
    const apps = await db.query('SELECT student_id, status FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Insert or update mentor assignment
    await db.query(
      'INSERT INTO mentor_assignments (application_id, mentor_id) VALUES (?, ?) ON CONFLICT(application_id) DO UPDATE SET mentor_id = excluded.mentor_id',
      [applicationId, mentor_id]
    );

    // Update status to Mentor Assigned -> Forwarded To L&D
    const nextStatus = 'Forwarded To L&D';
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [nextStatus, applicationId]);

    // Fetch Mentor User Name to create logs
    const mentorDetails = await db.query(
      'SELECT u.first_name, u.last_name, u.id as user_id FROM mentors m JOIN users u ON m.user_id = u.id WHERE m.id = ?',
      [mentor_id]
    );
    const mentorName = mentorDetails.length > 0 ? `${mentorDetails[0].first_name} ${mentorDetails[0].last_name}` : 'Assigned Mentor';
    const mentorUserId = mentorDetails.length > 0 ? mentorDetails[0].user_id : null;

    // Log actions
    await logActivity(applicationId, HODUserId, 'Mentor Assigned', `HOD assigned mentor ${mentorName} and forwarded application to L&D.`);
    await createNotification(apps[0].student_id, 'Mentor Assigned', `Mentor ${mentorName} has been assigned to your internship. Application forwarded to L&D.`);
    if (mentorUserId) {
      await createNotification(mentorUserId, 'New Intern Assigned', `You have been assigned as a mentor to a new student internship.`);
    }

    res.status(200).json({ message: 'Mentor assigned and application forwarded to L&D successfully.' });
  } catch (error) {
    console.error('Assign mentor error:', error);
    res.status(500).json({ message: 'Failed to assign mentor.' });
  }
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateStatus,
  resubmitApplication,
  assignMentor
};
