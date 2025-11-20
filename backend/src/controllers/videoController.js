const fs = require("fs");
const path = require("path");
const Video = require("../models/Video");
const mockProcessor = require("../utils/mockProcessor");

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    const v = new Video({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: "uploaded"
    });
    await v.save();

    // Start mock processing (emits socket events)
    mockProcessor.startProcessing(v, req.app.get("io"));

    res.json({ message: "Uploaded", video: v });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const v = await Video.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Not found" });
    if (!v.userId.equals(req.user._id) && req.user.role === "viewer") {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const v = await Video.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Not found" });

    // ensure multi-tenant: only owner (or admin) can stream
    if (!v.userId.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
    const videoPath = path.join(UPLOAD_DIR, v.filename);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const stream = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": v.mimetype || "video/mp4"
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": v.mimetype || "video/mp4"
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
