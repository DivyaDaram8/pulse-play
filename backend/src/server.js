require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

(async function start() {
  await mongoose.connect(MONGO_URI);
  console.log("Mongo connected");

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // expose io to express app for controllers
  app.set("io", io);

  // Socket auth & join logic
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return next(new Error("Invalid token"));
      socket.user = user;
      // optional: save socketId to user
      user.socketId = socket.id;
      await user.save();
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.user.email);

    // join user-room for user-level notifications
    socket.join(`user_${socket.user._id}`);

    // clients can subscribe to video rooms
    socket.on("subscribeVideo", ({ videoId }) => {
      socket.join(`video_${videoId}`);
    });

    socket.on("unsubscribeVideo", ({ videoId }) => {
      socket.leave(`video_${videoId}`);
    });

    socket.on("disconnect", async () => {
      try {
        const u = await User.findById(socket.user._id);
        if (u) {
          u.socketId = null;
          await u.save();
        }
      } catch (e) {}
      console.log("Socket disconnected", socket.id);
    });
  });

  server.listen(PORT, () => console.log("Server running on port", PORT));
})();
