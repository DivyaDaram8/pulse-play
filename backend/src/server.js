require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const videosRoutes = require('./routes/videos');
const tenantsRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const path = require('path');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

// basic socket auth / room join
io.on('connection', (socket) => {
  // clients should emit 'join' with userId after login
  socket.on('join', (payload) => {
    if (!payload || !payload.userId) return;
    const room = `user:${payload.userId}`;
    socket.join(room);
  });
});

app.set('io', io);

app.use(cors());
app.use(express.json());

// static files (video serving with stream route uses filesystem)
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/users', userRoutes);

// connect db and start
const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/pulse')
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connect error', err);
  });
