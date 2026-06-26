const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Middleware to verify JWT and attach user to request
function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user info to request
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = { authenticateToken };
