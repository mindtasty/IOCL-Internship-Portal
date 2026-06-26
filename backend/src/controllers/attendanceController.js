// attendanceController.js
const db = require('../config/db');

// 1. Get Attendance History & Calculated Aggregations for an Internship Application
async function getAttendanceByApplication(req, res) {
  const applicationId = req.params.applicationId;
  const { roleName, id: userId } = req.user;

  try {
    // Access validation: Student can only view their own application attendance
    if (roleName === 'Student') {
      const apps = await db.query('SELECT student_id FROM applications WHERE id = ?', [applicationId]);
      if (apps.length === 0 || apps[0].student_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You cannot access another student\'s attendance.' });
      }
    }

    // Retrieve attendance history
    const logs = await db.query(
      `SELECT a.*, u.first_name as marked_by_first, u.last_name as marked_by_last 
       FROM attendance a
       JOIN users u ON a.marked_by = u.id
       WHERE a.application_id = ? 
       ORDER BY a.date DESC`,
      [applicationId]
    );

    // Compute counters
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;

    logs.forEach(log => {
      if (log.status === 'Present') presentCount++;
      else if (log.status === 'Absent') absentCount++;
      else if (log.status === 'Half Day') halfDayCount++;
    });

    const totalDays = presentCount + absentCount + halfDayCount;
    // Calculate percentage: Present counts as 1.0, Half-day as 0.5, Absent as 0.0
    const effectiveDays = presentCount + (halfDayCount * 0.5);
    const attendancePercentage = totalDays > 0 ? Math.round((effectiveDays / totalDays) * 100) : 100;

    res.status(200).json({
      summary: {
        presentDays: presentCount,
        absentDays: absentCount,
        halfDays: halfDayCount,
        totalDays,
        attendancePercentage
      },
      logs
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ message: 'Failed to retrieve attendance logs.' });
  }
}

// 2. Mark Attendance (Mentor / Admin action)
async function markAttendance(req, res) {
  const applicationId = req.params.applicationId;
  const { date, status, remarks } = req.body;
  const markedBy = req.user.id;

  if (!date || !status) {
    return res.status(400).json({ message: 'Please provide both date (YYYY-MM-DD) and status.' });
  }

  try {
    // 1. Verify internship application is active
    const apps = await db.query('SELECT status FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Internship application not found.' });
    }
    if (apps[0].status !== 'Internship Active') {
      return res.status(400).json({ message: 'Cannot mark attendance unless the internship is active.' });
    }

    // 2. Insert or update the daily attendance log
    await db.query(
      'INSERT INTO attendance (application_id, date, status, marked_by, remarks) VALUES (?, ?, ?, ?, ?) ON CONFLICT(application_id, date) DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by, remarks = excluded.remarks',
      [applicationId, date, status, markedBy, remarks || null]
    );

    res.status(200).json({ message: 'Attendance marked successfully.' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Failed to record attendance.' });
  }
}

module.exports = {
  getAttendanceByApplication,
  markAttendance
};
