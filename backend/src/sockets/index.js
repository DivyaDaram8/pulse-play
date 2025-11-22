// (Optional) helper to centralize socket logic if you want to expand
module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      socket.join(`user:${userId}`);
    });
  });
};
