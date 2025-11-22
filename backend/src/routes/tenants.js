const express = require('express');
const router = express.Router();
const tenantCtrl = require('../controllers/tenantController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// list tenants (superadmin)
router.get('/', auth, requireRole('superadmin'), tenantCtrl.listTenants);

// tenant detail (superadmin)
router.get('/:id', auth, requireRole('superadmin'), tenantCtrl.getTenantDetails);

// delete tenant (superadmin)
router.delete('/:id', auth, requireRole('superadmin'), tenantCtrl.deleteTenant);

module.exports = router;
