// src/middleware/roles.js
/**
 * requireRole(...allowedRoles) returns middleware that permits the request
 * only if req.user.role is one of the allowed roles.
 *
 * Example: router.get('/', auth, tenantCheck, requireRole('tenant_admin', 'superadmin'), handler)
 */

const requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  const role = req.user.role;
  if (allowed.includes(role)) return next();

  return res.status(403).json({ message: `Forbidden - requires one of [${allowed.join(', ')}]` });
};

module.exports = { requireRole };
