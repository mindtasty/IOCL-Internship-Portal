// adminController.js
const bcrypt = require('bcrypt');
const db = require('../config/db');

// 1. Fetch System Analytics Counts
async function getStats(req, res) {
  try {
    const totalApps = await db.query('SELECT COUNT(*) as count FROM applications');
    const pendingApps = await db.query("SELECT COUNT(*) as count FROM applications WHERE status IN ('Submitted', 'Resubmitted', 'Under HR Review', 'Under HOD Review', 'Under L&D Review')");
    const approvedApps = await db.query("SELECT COUNT(*) as count FROM applications WHERE status IN ('HOD Approved', 'L&D Approved', 'Internship Active', 'Internship Completed')");
    const rejectedApps = await db.query("SELECT COUNT(*) as count FROM applications WHERE status = 'Rejected'");
    const activeInterns = await db.query("SELECT COUNT(*) as count FROM applications WHERE status = 'Internship Active'");
    const completedInterns = await db.query("SELECT COUNT(*) as count FROM applications WHERE status = 'Internship Completed'");
    const totalMentors = await db.query('SELECT COUNT(*) as count FROM mentors');
    const totalDepts = await db.query('SELECT COUNT(*) as count FROM departments');

    res.status(200).json({
      stats: {
        totalApplications: totalApps[0].count,
        pendingApplications: pendingApps[0].count,
        approvedApplications: approvedApps[0].count,
        rejectedApplications: rejectedApps[0].count,
        activeInterns: activeInterns[0].count,
        completedInternships: completedInterns[0].count,
        totalMentors: totalMentors[0].count,
        totalDepartments: totalDepts[0].count
      }
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ message: 'Failed to compile analytical statistics.' });
  }
}

// 2. Fetch User Accounts
async function getUsers(req, res) {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role_id, u.department_id, u.phone, u.status, u.created_at,
             r.name as role_name, d.name as department_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Failed to retrieve user accounts.' });
  }
}

// 3. Create Custom Role Account (HR, HOD, Mentor, L&D, Admin)
async function createUser(req, res) {
  const { email, password, role_id, first_name, last_name, department_id, phone } = req.body;

  if (!email || !password || !role_id || !first_name || !last_name) {
    return res.status(400).json({ message: 'Please provide all mandatory user fields.' });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, role_id, first_name, last_name, department_id, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
      [email, passwordHash, role_id, first_name, last_name, department_id || null, phone || null]
    );

    const newUserId = result.insertId;

    // If role is Mentor (role_id = 5), also initialize record in mentors table
    if (role_id === 5 || role_id === '5') {
      if (!department_id) {
        return res.status(400).json({ message: 'Mentors must be assigned to a department.' });
      }
        await db.query(
          'INSERT INTO mentors (user_id, department_id, max_interns) VALUES (?, ?, 5) ON CONFLICT(user_id) DO UPDATE SET department_id = excluded.department_id, max_interns = excluded.max_interns',
          [newUserId, department_id]
        );
    }

    res.status(201).json({ message: 'User account created successfully.', userId: newUserId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user account.' });
  }
}

// 4. Update / Manage User Status & Details
async function updateUser(req, res) {
  const userId = req.params.id;
  const { first_name, last_name, role_id, department_id, phone, status, password } = req.body;

  try {
    const users = await db.query('SELECT role_id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let updateFields = [];
    let queryParams = [];

    if (first_name) {
      updateFields.push('first_name = ?');
      queryParams.push(first_name);
    }
    if (last_name) {
      updateFields.push('last_name = ?');
      queryParams.push(last_name);
    }
    if (role_id) {
      updateFields.push('role_id = ?');
      queryParams.push(role_id);
    }
    if (department_id) {
      updateFields.push('department_id = ?');
      queryParams.push(department_id);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      queryParams.push(phone || null);
    }
    if (status) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updateFields.push('password_hash = ?');
      queryParams.push(passwordHash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No update parameters provided.' });
    }

    queryParams.push(userId);
    await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, queryParams);

    // Sync mentors table if user role was updated to or from Mentor
    if (role_id && (role_id === 5 || role_id === '5')) {
        await db.query(
          'INSERT INTO mentors (user_id, department_id, max_interns) VALUES (?, ?, 5) ON CONFLICT(user_id) DO UPDATE SET department_id = excluded.department_id',
          [userId, department_id || null]
        );
    }

    res.status(200).json({ message: 'User account updated successfully.' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user account.' });
  }
}

// 5. Get List of Departments
async function getDepartments(req, res) {
  try {
    const departments = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ departments });
  } catch (error) {
    console.error('Fetch departments error:', error);
    res.status(500).json({ message: 'Failed to retrieve departments.' });
  }
}

// 6. Create a Department
async function createDepartment(req, res) {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: 'Please provide department name and code.' });
  }

  try {
    const existing = await db.query('SELECT id FROM departments WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A department with this code already exists.' });
    }

    await db.query('INSERT INTO departments (name, code) VALUES (?, ?)', [name, code]);
    res.status(201).json({ message: 'Department registered successfully.' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Failed to register department.' });
  }
}

// 7. Get Global System Logs
async function getLogs(req, res) {
  try {
    const logs = await db.query(
      `SELECT al.*, u.first_name, u.last_name, r.name as role_name
       FROM activity_logs al
       JOIN users u ON al.action_by = u.id
       JOIN roles r ON u.role_id = r.id
       ORDER BY al.timestamp DESC 
       LIMIT 250`
    );
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    res.status(500).json({ message: 'Failed to retrieve activity logs.' });
  }
}

module.exports = {
  getStats,
  getUsers,
  createUser,
  updateUser,
  getDepartments,
  createDepartment,
  getLogs
};
