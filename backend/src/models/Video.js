const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  originalName: String,
  mimetype: String,
  size: Number,
  status: { type: String, enum: ["uploaded","processing","safe","flagged","ready","error"], default: "uploaded" },
  processingProgress: { type: Number, default: 0 },
  result: { type: Object, default: {} }, // store fake analysis results or real meta
  tenantId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
