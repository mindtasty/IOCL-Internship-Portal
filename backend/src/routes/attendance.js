// attendance.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Get attendance logs for an application
router.get('/:applicationId', attendanceController.getAttendanceByApplication);

// Mark daily attendance (Mentor and Admin only)
router.post('/:applicationId', requireRole(['Mentor', 'Admin']), attendanceController.markAttendance);

module.exports = router;
