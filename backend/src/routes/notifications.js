// notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Retrieve notifications list
router.get('/', notificationController.getNotifications);

// Mark specific notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
