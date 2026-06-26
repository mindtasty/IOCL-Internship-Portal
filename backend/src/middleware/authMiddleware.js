// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_jwt_auth_123!@#';

/**
 * Authenticates user requests by verifying JWT in Authorization header.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Expected format: Bearer <Token>
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing or invalid format.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is invalid or expired.' });
      }

      req.user = user; // user object contains id, email, roleId, roleName, departmentId
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header is missing.' });
  }
}

/**
 * Middleware wrapper to enforce access to specific user roles.
 * @param {string[]} allowedRoles - List of role names allowed to access the route.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User authentication required.' });
    }

    const hasRole = allowedRoles.includes(req.user.roleName);
    if (!hasRole) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted. Required roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.roleName}` 
      });
    }

    next();
  };
}

module.exports = {
  authenticateJWT,
  requireRole
};
