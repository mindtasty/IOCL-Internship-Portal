// staff.js - HR, HOD, L&D shared routes
const express = require('express');
const router = express.Router();
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');
const adminController = require('../controllers/adminController');

router.use(authenticateJWT);

// Get all applications (with role-based filtering inside controller)
router.get('/applications', requireRole(['HR', 'HOD', 'L&D', 'Admin']), applicationController.getApplications);

// Get single application detail
router.get('/applications/:id', requireRole(['HR', 'HOD', 'L&D', 'Admin']), applicationController.getApplicationById);

// Update application status
router.put('/applications/:id/status', requireRole(['HR', 'HOD', 'L&D', 'Admin']), applicationController.updateStatus);

// Assign mentor (HOD/Admin only)
router.post('/applications/:id/assign-mentor', requireRole(['HOD', 'Admin']), applicationController.assignMentor);

// Get mentors list (for HOD mentor dropdown)
router.get('/mentors', requireRole(['HOD', 'Admin', 'HR']), adminController.getMentors);

// Get departments (for filters)
router.get('/departments', adminController.getDepartments);

module.exports = router;
