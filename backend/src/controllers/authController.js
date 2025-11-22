const User = require('../models/User');
const Tenant = require('../models/Tenant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES = '7d';

exports.registerTenantAndAdmin = async (req, res) => {
  // Superadmin only action to create tenant + tenant admin
  const { tenantName, adminName, adminEmail, adminPassword } = req.body;
  if (!tenantName || !adminName || !adminEmail || !adminPassword) return res.status(400).json({ message: 'Missing' });
  const existingTenant = await Tenant.findOne({ name: tenantName });
  if (existingTenant) return res.status(400).json({ message: 'Tenant exists' });

  const tenant = await Tenant.create({ name: tenantName });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'tenant_admin',
    tenantId: tenant._id
  });
  res.json({ tenant, admin });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid creds' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid creds' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, role: user.role, tenantId: user.tenantId });
};

// for seeding the single superadmin manually
exports.createSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: 'superadmin' });
  res.json({ user });
};
