// applications.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Fields structure for document uploads
const uploadFields = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'noc', maxCount: 1 },
  { name: 'recommendation', maxCount: 1 },
  { name: 'other', maxCount: 1 }
]);

// Apply JWT verification globally on this router
router.use(authenticateJWT);

// Submit new application (Student only)
router.post('/', requireRole(['Student']), uploadFields, applicationController.createApplication);

// Retrieve all applications filtered by role permissions
router.get('/', applicationController.getApplications);

// Retrieve specific application details
router.get('/:id', applicationController.getApplicationById);

// Update status (HR, HOD, L&D, Admin workflow state controller)
router.put('/:id/status', requireRole(['HR', 'HOD', 'L&D', 'Admin']), applicationController.updateStatus);

// Student Resubmits corrected document uploads
router.put('/:id/resubmit', requireRole(['Student']), uploadFields, applicationController.resubmitApplication);

// HOD / Admin assigns mentor
router.post('/:id/assign-mentor', requireRole(['HOD', 'Admin']), applicationController.assignMentor);

// Submit evaluation (Mentor and Admin only)
const certificateController = require('../controllers/certificateController');
router.post('/:id/evaluation', requireRole(['Mentor', 'Admin']), certificateController.submitEvaluation);

// Upload completion certificate (Admin, HR, L&D)
router.post('/:id/certificate', requireRole(['Admin', 'HR', 'L&D']), upload.single('certificate'), certificateController.uploadCertificate);

module.exports = router;
