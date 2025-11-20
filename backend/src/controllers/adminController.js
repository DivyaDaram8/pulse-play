const User = require("../models/User");
const Video = require("../models/Video");
const bcrypt = require("bcryptjs");

// Admin: create a new user (admin supplies role & optional tenantId)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = "viewer", tenantId = null } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email & password required" });

    // basic existence check
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // create user (password will be hashed by model pre-save if using your existing pre save)
    const user = new User({ name, email, password, role, tenantId, createdByAdmin: true });
    await user.save();

    // DO NOT return password
    const safe = { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId };
    res.status(201).json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: list all users (optionally filter by tenantId or role)
exports.listUsers = async (req, res) => {
  try {
    const { tenantId, role } = req.query;
    const q = {};
    if (tenantId) q.tenantId = tenantId;
    if (role) q.role = role;
    const users = await User.find(q).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: update a user's role (and optionally tenant)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId } = req.body;
    const allowed = ["viewer", "editor", "admin"];
    if (role && !allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });

    const update = {};
    if (role) update.role = role;
    if (tenantId !== undefined) update.tenantId = tenantId;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: list ALL videos (optional filters: tenantId, status)
exports.listAllVideos = async (req, res) => {
  try {
    const { tenantId, status } = req.query;
    const q = {};
    if (tenantId) q.tenantId = tenantId;
    if (status) q.status = status;
    const videos = await Video.find(q).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
