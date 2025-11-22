const express = require('express');
const router = express.Router();
const videoCtrl = require('../controllers/videoController');
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Editor uploads
router.post('/upload', auth, requireRole('editor','tenant_admin','superadmin'), upload.single('video'), videoCtrl.upload);

// List tenant videos
router.get('/', auth, videoCtrl.list);

// Stream
router.get('/stream/:id', auth, videoCtrl.stream);

module.exports = router;
