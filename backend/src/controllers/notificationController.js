// notificationController.js
const db = require('../config/db');

// 1. Get User's In-App Notifications
async function getNotifications(req, res) {
  const userId = req.user.id;

  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
}

// 2. Mark Notification as Read
async function markAsRead(req, res) {
  const notificationId = req.params.id;
  const userId = req.user.id;

  try {
    const notifications = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }

    await db.query(
      "UPDATE notifications SET status = 'Read' WHERE id = ?",
      [notificationId]
    );

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Failed to update notification state.' });
  }
}

module.exports = {
  getNotifications,
  markAsRead
};
