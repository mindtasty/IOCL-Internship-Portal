// helpers.js
const db = require('../config/db');

/**
 * Utility to log audit trails of application activities
 */
async function logActivity(applicationId, actionBy, actionName, description) {
  try {
    await db.query(
      'INSERT INTO activity_logs (application_id, action_by, action_name, description) VALUES (?, ?, ?, ?)',
      [applicationId, actionBy, actionName, description]
    );
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

/**
 * Utility to push in-app alerts to users
 */
async function createNotification(userId, title, message) {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, title, message, status) VALUES (?, ?, ?, ?)',
      [userId, title, message, 'Unread']
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = {
  logActivity,
  createNotification
};
