const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const tenantCheck = require('../middleware/tenantCheck');

// Tenant Admin ONLY can manage tenant users
router.post(
  '/',
  auth,
  requireRole('tenant_admin'),
  tenantCheck,
  userCtrl.createUser
);

router.get(
  '/',
  auth,
  requireRole('tenant_admin'),
  tenantCheck,
  userCtrl.listUsers
);

router.put(
  '/role/:id',
  auth,
  requireRole('tenant_admin'),
  tenantCheck,
  userCtrl.updateRole
);

router.delete(
  '/:id',
  auth,
  requireRole('tenant_admin'),
  tenantCheck,
  userCtrl.deleteUser
);

// analytics
router.get(
  '/analytics',
  auth,
  requireRole('tenant_admin'),
  tenantCheck,
  userCtrl.analytics
);

module.exports = router;
