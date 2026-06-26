// authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_jwt_auth_123!@#';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 1. Student Self-Registration
async function register(req, res) {
  const { email, password, first_name, last_name, department_id, phone } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Please provide all required fields (email, password, first_name, last_name).' });
  }

  try {
    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default Role ID for Student is 2 (as defined in schema.sql seeding)
    const roleId = 2; 

    // Insert user
    const insertResult = await db.query(
      'INSERT INTO users (email, password_hash, role_id, first_name, last_name, department_id, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, passwordHash, roleId, first_name, last_name, department_id || null, phone || null, 'active']
    );

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      userId: insertResult.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
}

// 2. User Login (Any role)
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // Retrieve user and join role details
    const users = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'Your account has been disabled. Please contact the administrator.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token containing key user meta information
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name,
        departmentId: user.department_id,
        first_name: user.first_name,
        last_name: user.last_name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name,
        first_name: user.first_name,
        last_name: user.last_name,
        departmentId: user.department_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
}

// 3. Simulated Forgot Password
async function forgotPassword(req, res) {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Please provide email and the new password.' });
  }

  try {
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No user registered with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);

    res.status(200).json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error during password reset.' });
  }
}

// 4. Get authenticated user details
async function getMe(req, res) {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role_id, u.department_id, u.phone, u.status, r.name as role, d.name as department_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  getMe
};
