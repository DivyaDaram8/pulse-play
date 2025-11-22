// src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['superadmin', 'tenant_admin', 'editor', 'viewer'], 
    default: 'viewer' 
  },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false }, // null for superadmin
  createdAt: { type: Date, default: Date.now }
});

// Hide sensitive fields when converting to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
