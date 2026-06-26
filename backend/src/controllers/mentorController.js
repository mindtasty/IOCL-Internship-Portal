// mentorController.js
const db = require('../config/db');

// 1. Get List of Mentors (Filtered by HOD department, or general lists)
async function getMentors(req, res) {
  const { departmentId, roleName } = req.user;
  const targetDeptId = req.query.department_id || (roleName === 'HOD' ? departmentId : null);

  try {
    let queryStr = `
      SELECT m.id, m.user_id, m.department_id, m.specialization, m.max_interns,
             u.first_name, u.last_name, u.email, u.phone,
             d.name as department_name, d.code as department_code,
             COUNT(CASE WHEN a.status = 'Internship Active' THEN 1 END) as active_interns_count
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      JOIN departments d ON m.department_id = d.id
      LEFT JOIN mentor_assignments ma ON m.id = ma.mentor_id
      LEFT JOIN applications a ON ma.application_id = a.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (targetDeptId) {
      queryStr += ' AND m.department_id = ?';
      queryParams.push(targetDeptId);
    }

    queryStr += ' GROUP BY m.id ORDER BY u.first_name ASC';

    const mentors = await db.query(queryStr, queryParams);
    res.status(200).json({ mentors });
  } catch (error) {
    console.error('Fetch mentors error:', error);
    res.status(500).json({ message: 'Failed to retrieve mentors list.' });
  }
}

// 2. Add/Promote User to Mentor (Admin only)
async function createMentor(req, res) {
  const { user_id, department_id, specialization, max_interns } = req.body;

  if (!user_id || !department_id) {
    return res.status(400).json({ message: 'Please provide user_id and department_id.' });
  }

  try {
    // Verify user role matches Mentor (role_id = 5)
    const users = await db.query('SELECT role_id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (users[0].role_id !== 5) {
      // Automatically promote/update role to Mentor in the users table
      await db.query('UPDATE users SET role_id = 5, department_id = ? WHERE id = ?', [department_id, user_id]);
    }

    // Insert into mentors table
    await db.query(
      'INSERT INTO mentors (user_id, department_id, specialization, max_interns) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET department_id = excluded.department_id, specialization = excluded.specialization, max_interns = excluded.max_interns',
      [user_id, department_id, specialization || null, max_interns || 5]
    );

    res.status(201).json({ message: 'Mentor profile initialized successfully.' });
  } catch (error) {
    console.error('Create mentor error:', error);
    res.status(500).json({ message: 'Failed to configure mentor.' });
  }
}

module.exports = {
  getMentors,
  createMentor
};
