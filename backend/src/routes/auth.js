const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// superadmin route to seed tenant + admin (or create via UI)
router.post('/tenant/create', auth, requireRole('superadmin'), authCtrl.registerTenantAndAdmin);

// public login
router.post('/login', authCtrl.login);

// route to create superadmin (one-time) - protect in production
router.post('/create-superadmin', authCtrl.createSuperAdmin);

router.get('/me-debug', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId
    }
  });
});


module.exports = router;
