const User = require('../models/User');
const Video = require('../models/Video');
const Tenant = require('../models/Tenant');
const bcrypt = require('bcryptjs');

// Tenant Admin creates Editor/Viewer users
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'Missing fields' });

  if (!['editor', 'viewer'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  // tenant admin's tenant
  const tenantId = req.user.tenantId;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    tenantId
  });

  res.json({ user });
};

// Change roles: viewer <-> editor
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['editor', 'viewer'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // ensure tenant scope is valid
 const userTenantId = user.tenantId ? user.tenantId.toString() : null;
const requesterTenantId = req.user.tenantId ? req.user.tenantId.toString() : null;
if (!userTenantId || !requesterTenantId || userTenantId !== requesterTenantId) {
  return res.status(403).json({ message: 'Tenant mismatch' });
}

  user.role = role;
  await user.save();

  res.json({ message: 'Role updated', user });
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

 const userTenantId = user.tenantId ? user.tenantId.toString() : null;
const requesterTenantId = req.user.tenantId ? req.user.tenantId.toString() : null;
if (!userTenantId || !requesterTenantId || userTenantId !== requesterTenantId) {
  return res.status(403).json({ message: 'Tenant mismatch' });
}

  await Video.deleteMany({ uploader: user._id });
  await User.findByIdAndDelete(id);

  res.json({ message: 'User deleted' });
};

// List all users in tenant
exports.listUsers = async (req, res) => {
  const tenantId = req.user.tenantId;
  const users = await User.find({ tenantId }).select('-passwordHash');
  res.json({ users });
};

// Analytics for tenant admin
exports.analytics = async (req, res) => {
  const tenantId = req.user.tenantId;

  // Editors: video upload count
  const editors = await User.find({ tenantId, role: 'editor' });
  const editorStats = await Promise.all(
    editors.map(async (editor) => {
      const videos = await Video.find({ uploader: editor._id });
      return {
        editorId: editor._id,
        name: editor.name,
        email: editor.email,
        uploads: videos.length,
        videos
      };
    })
  );

  // Viewers: videos watched (we store this later if needed)
  // Placeholder for future "watched videos" tracking
  const viewers = await User.find({ tenantId, role: 'viewer' });

  res.json({ editorStats, viewers });
};
