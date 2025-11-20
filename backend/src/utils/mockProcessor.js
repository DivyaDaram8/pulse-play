const Video = require("../models/Video");

/**
 * Simple mock processor that:
 *  - emits processingUpdate events to a room named `video_<videoId>`
 *  - simulates progress and then sets status to safe/flagged
 */
exports.startProcessing = async (videoDoc, io) => {
  // ensure we update DB to processing
  await Video.findByIdAndUpdate(videoDoc._id, { status: "processing", processingProgress: 0 });

  const room = `video_${videoDoc._id.toString()}`;

  let progress = 0;
  const interval = setInterval(async () => {
    progress += Math.floor(Math.random() * 15) + 5; // increment
    if (progress > 100) progress = 100;

    // update DB
    await Video.findByIdAndUpdate(videoDoc._id, { processingProgress: progress });

    // emit to clients listening to this video room
    io.to(room).emit("processingUpdate", {
      videoId: videoDoc._id,
      progress
    });

    if (progress >= 100) {
      clearInterval(interval);
      // simple fake classification logic — you can tweak
      const flagged = Math.random() > 0.6; // 40% safe, 60% flagged - invert as you like
      const status = flagged ? "flagged" : "safe";
      const result = {
        flagged,
        reason: flagged ? "simulated_sensitive_content" : "no_issues"
      };
      await Video.findByIdAndUpdate(videoDoc._id, { status, result, processingProgress: 100 });

      io.to(room).emit("processingComplete", {
        videoId: videoDoc._id,
        status,
        result
      });
    }
  }, 700); // emits roughly every 0.7s
};
