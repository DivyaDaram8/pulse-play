// src/middleware/tenantCheck.js
/**
 * Ensures the requester belongs to a tenant (unless superadmin).
 * If the caller provides tenantId (params/body/query), it must match requester's tenant.
 */

module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authenticated. Ensure auth middleware runs before tenantCheck.'
    });
  }

  // superadmin bypasses tenant checks
  if (req.user.role === 'superadmin') return next();

  // Normalize requester's tenantId
  const requesterTenant = req.user.tenantId ? String(req.user.tenantId) : null;
  if (!requesterTenant) {
    return res.status(403).json({ message: 'No tenant association for this user' });
  }

  // If caller provided a tenantId (route param, body or query), ensure it matches
  const candidate = req.params?.tenantId || req.body?.tenantId || req.query?.tenantId;
  if (candidate) {
    const candidateStr = String(candidate);
    if (candidateStr !== requesterTenant) {
      return res.status(403).json({ message: 'Tenant mismatch' });
    }
  }

  return next();
};
