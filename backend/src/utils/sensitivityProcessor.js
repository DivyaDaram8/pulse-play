// FAKE sensitivity processor for demo purposes.
// Emits periodic progress values via a callback. At the end returns label+score.
// Replace this with real FFmpeg + ML pipeline later.

const fakeProcess = (videoPath, onProgress) => {
  return new Promise((resolve) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 5; // random bump
      if (progress > 100) progress = 100;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        // fake score
        const score = Math.random(); // 0..1
        const label = score > 0.7 ? 'flagged' : 'safe';
        resolve({ score, label });
      }
    }, 400 + Math.floor(Math.random() * 600));
  });
};

module.exports = { fakeProcess };
