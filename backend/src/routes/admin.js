// admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Stats analytics (Accessible to Admin, HR, HOD, and L&D to feed dashboard summaries)
router.get('/stats', requireRole(['Admin', 'HR', 'HOD', 'L&D']), adminController.getStats);

// User CRUD operations (Admin only)
router.get('/users', requireRole(['Admin']), adminController.getUsers);
router.post('/users', requireRole(['Admin']), adminController.createUser);
router.put('/users/:id', requireRole(['Admin']), adminController.updateUser);

// Department operations
router.get('/departments', adminController.getDepartments); // Shared endpoint for forms
router.post('/departments', requireRole(['Admin']), adminController.createDepartment);

// Audit stream (Admin only)
router.get('/logs', requireRole(['Admin']), adminController.getLogs);

module.exports = router;
