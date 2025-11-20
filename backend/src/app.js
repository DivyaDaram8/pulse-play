const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const auth = require("./middleware/auth");
const roles = require("./middleware/roles");
const authController = require("./controllers/authController");
const videoController = require("./controllers/videoController");

const app = express();

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random()*1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});
const upload = multer({ storage });

app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// video upload (editor or admin)
app.post("/api/videos/upload", auth, roles(["editor", "admin"]), upload.single("video"), videoController.uploadVideo);

// list & metadata (multi-tenant)
app.get("/api/videos", auth, videoController.listVideos);
app.get("/api/videos/:id", auth, videoController.getVideo);

// streaming (range supported)
app.get("/api/videos/stream/:id", auth, videoController.streamVideo);

// static serving of uploads for testing (only if you want)
/*
app.use("/uploads", express.static(UPLOAD_DIR));
*/

module.exports = app;
