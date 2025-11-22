const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true }, // stored filename
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  status: { type: String, enum: ['uploaded','processing','processed','failed'], default: 'uploaded' },
  sensitivity: {
    label: { type: String, enum: ['safe','flagged','unknown'], default: 'unknown' },
    score: { type: Number, default: 0 } // 0..1
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);
