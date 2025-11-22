// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    // Expect "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization header format' });
    }
    const token = parts[1];

    const secret = process.env.JWT_SECRET || 'change_this_secret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach a plain object copy to avoid unexpected Mongoose behavior elsewhere
    req.user = typeof user.toObject === 'function' ? user.toObject() : user;

    // Helpful debug log (uncomment while debugging)
    // console.log('auth -> user loaded:', { id: req.user._id, role: req.user.role, tenantId: String(req.user.tenantId || '') });

    return next();
  } catch (err) {
    console.error('auth middleware error:', err);
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

module.exports = auth;
