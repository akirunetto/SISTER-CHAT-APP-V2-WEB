const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Izinkan CORS untuk API Express biasa (jika diperlukan)
app.use(cors());

const server = http.createServer(app);

// 2. Izinkan CORS spesifik untuk koneksi Socket.IO (SANGAT PENTING)
const io = new Server(server, {
  cors: {
    origin: "*", // Menerima koneksi dari domain Vercel mana pun
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 1. join
  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    // Broadcast system message to all other users
    socket.broadcast.emit('systemMessage', `${nickname} has joined the chat`);
  });

  // 2. chatMessage
  socket.on('chatMessage', (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    // Broadcast to all clients (including sender)
    io.emit('chatMessage', {
      nickname: socket.nickname,
      message: msg,
      timestamp: timestamp,
      type: 'chat'
    });
  });

  // 3. locationShare
  socket.on('locationShare', (coords) => {
    const timestamp = new Date().toLocaleTimeString();
    // Broadcast to all clients (including sender)
    io.emit('locationShare', {
      nickname: socket.nickname,
      lat: coords.lat,
      lon: coords.lon,
      timestamp: timestamp,
      type: 'location'
    });
  });

  // 4. disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.nickname) {
      // Broadcast system message to all other users
      socket.broadcast.emit('systemMessage', `${socket.nickname} has left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
// Mengikat ke 0.0.0.0 SANGAT PENTING untuk deployment Railway agar port bisa di-expose dengan benar
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} at 0.0.0.0`);
});
