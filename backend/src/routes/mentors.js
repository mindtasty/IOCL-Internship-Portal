// mentors.js
const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Get list of mentors (HODs/Admins can see)
router.get('/', requireRole(['HOD', 'Admin', 'HR']), mentorController.getMentors);

// Create or configure a new mentor (Admin only)
router.post('/', requireRole(['Admin']), mentorController.createMentor);

module.exports = router;
