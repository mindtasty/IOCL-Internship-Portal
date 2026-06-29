const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

router.get('/run', async (req, res) => {
  // Security key so random people can't trigger this
  const key = req.query.key;
  if (key !== process.env.SETUP_KEY) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  try {
    const hash = async (pw) => bcrypt.hash(pw, 10);

    // Seed departments
    const departments = [
      { name: 'Human Resources',       code: 'HR'  },
      { name: 'Learning & Development', code: 'L&D' },
      { name: 'Information Systems',    code: 'IS'  },
      { name: 'Finance',                code: 'FIN' },
      { name: 'Operations',             code: 'OPS' },
      { name: 'Marketing',              code: 'MKT' },
    ];

    for (const dept of departments) {
      await db.query(
        `INSERT INTO departments (name, code) VALUES (?, ?)
         ON CONFLICT(code) DO UPDATE SET name = excluded.name`,
        [dept.name, dept.code]
      );
    }

    // Seed users
    const users = [
      { email: 'admin@portal.com',   password: 'password', role_id: 1, first_name: 'Admin',  last_name: 'User'   },
      { email: 'hr@portal.com',      password: 'password', role_id: 3, first_name: 'HR',     last_name: 'Admin'  },
      { email: 'hod@portal.com',     password: 'password', role_id: 4, first_name: 'HOD',    last_name: 'Admin'  },
      { email: 'ld@portal.com',      password: 'password', role_id: 6, first_name: 'L&D',    last_name: 'Admin'  },
      { email: 'mentor@portal.com',  password: 'password', role_id: 5, first_name: 'Mentor', last_name: 'Admin'  },
      { email: 'student@portal.com', password: 'password', role_id: 2, first_name: 'Test',   last_name: 'Student'},
    ];

    for (const u of users) {
      const passwordHash = await hash(u.password);
      await db.query(
        `INSERT INTO users (email, password_hash, role_id, first_name, last_name, status)
         VALUES (?, ?, ?, ?, ?, 'active')
         ON CONFLICT(email) DO UPDATE SET
           password_hash = excluded.password_hash,
           role_id       = excluded.role_id,
           first_name    = excluded.first_name,
           last_name     = excluded.last_name`,
        [u.email, passwordHash, u.role_id, u.first_name, u.last_name]
      );
    }

    // Seed mentor record for mentor@portal.com
    const mentorUser = await db.query(`SELECT id FROM users WHERE email = 'mentor@portal.com'`);
    const isDeprt    = await db.query(`SELECT id FROM departments WHERE code = 'IS'`);
    if (mentorUser.length > 0 && isDeprt.length > 0) {
      await db.query(
        `INSERT INTO mentors (user_id, department_id, max_interns)
         VALUES (?, ?, 5)
         ON CONFLICT(user_id) DO UPDATE SET department_id = excluded.department_id`,
        [mentorUser[0].id, isDeprt[0].id]
      );
    }

    res.json({
      message: 'Setup complete!',
      accounts: users.map(u => ({ email: u.email, password: u.password }))
    });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ message: 'Setup failed.', error: err.message });
  }
});

module.exports = router;