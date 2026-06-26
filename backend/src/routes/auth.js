// auth.js route
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, getMe } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// GET /api/auth/me  (protected)
router.get('/me', authenticateJWT, getMe);

module.exports = router;
