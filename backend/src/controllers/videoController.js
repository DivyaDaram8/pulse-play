const Video = require("../models/Video");
const fs = require('fs');
const path = require('path');
const { fakeProcess } = require('../utils/sensitivityProcessor');

// upload single video (multer handles saving)
exports.upload = async (req, res) => {
  // req.file from multer
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const { title } = req.body;
  const vid = await Video.create({
    title: title || req.file.originalname,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploader: req.user._id,
    tenantId: req.user.tenantId || null,
    status: 'processing'
  });

  // Emit initial via socket (server will accept socket.io)
  const io = req.app.get('io');
  const room = `user:${req.user._id}`;
  io.to(room).emit('video:upload:started', { videoId: vid._id, title: vid.title });

  // start fake processing asynchronously (no blocking)
  (async () => {
    try {
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', req.file.filename);
      // fakeProcess accepts onProgress callback
      const result = await fakeProcess(filePath, (progress) => {
        // update clients
        io.to(room).emit('video:processing:progress', { videoId: vid._id, progress });
      });
      vid.sensitivity = { label: result.label, score: result.score };
      vid.status = 'processed';
      await vid.save();
      io.to(room).emit('video:processing:complete', { videoId: vid._id, label: result.label, score: result.score });
    } catch (err) {
      vid.status = 'failed';
      await vid.save();
      io.to(room).emit('video:processing:failed', { videoId: vid._id, error: err.message });
    }
  })();

  res.json({ video: vid });
};

// list videos for tenant
exports.list = async (req, res) => {
  const tenantId = req.user.role === 'superadmin' ? req.query.tenantId : req.user.tenantId;
  const filter = { tenantId };
  if (req.query.status) filter.status = req.query.status;
  const videos = await Video.find(filter).sort({ createdAt: -1 });
  res.json({ videos });
};

// streaming with range support
exports.stream = async (req, res) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ message: 'Not found' });
  // tenant enforcement
  if (req.user.role !== 'superadmin' && video.tenantId.toString() !== req.user.tenantId.toString()) {
    return res.status(403).json({ message: 'Tenant mismatch' });
  }
  const filePath = path.join(process.env.UPLOAD_DIR || './uploads', video.filename);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': video.mimeType
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': video.mimeType
    });
    fs.createReadStream(filePath).pipe(res);
  }
};
