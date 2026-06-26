// reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Get all weekly reports for an application
router.get('/:applicationId', reportController.getReports);

// Submit a weekly progress report (Student only)
router.post('/:applicationId', requireRole(['Student']), reportController.submitReport);

// Approve or request clarification for a report (Mentor or Admin)
router.put('/:applicationId/reports/:reportId/status', requireRole(['Mentor', 'Admin']), reportController.reviewReport);

// Get report comment feed
router.get('/reports/:reportId/comments', reportController.getComments);

// Post a comment in report feed
router.post('/reports/:reportId/comments', reportController.postComment);

module.exports = router;
