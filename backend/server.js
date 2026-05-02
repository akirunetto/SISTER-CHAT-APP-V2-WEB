const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// State storage
const messageHistory = [];
const users = new Map(); // socket.id -> { nickname, status }

const broadcastUserList = () => {
    const userList = Array.from(users.values());
    io.emit('updateUserList', userList);
};

// Strict WIB Time formatter for server side (Asia/Jakarta)
const getWIBTime = () => {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date());
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    users.set(socket.id, { nickname, status: 'Online' }); // Default status
    
    // Send chat history to ONLY the newly joined client
    socket.emit('chatHistory', messageHistory);
    
    // Broadcast system message & update user list globally
    socket.broadcast.emit('systemMessage', `${nickname} has joined the chat`);
    broadcastUserList();
  });

  socket.on('chatMessage', (msg) => {
    const timestamp = getWIBTime();
    const msgData = {
      nickname: socket.nickname,
      message: msg,
      timestamp: timestamp,
      type: 'chat'
    };
    
    // Manage History: Keep only last 50 messages
    messageHistory.push(msgData);
    if (messageHistory.length > 50) messageHistory.shift();

    io.emit('chatMessage', msgData);
  });

  socket.on('locationShare', (coords) => {
    const timestamp = getWIBTime();
    const msgData = {
      nickname: socket.nickname,
      lat: coords.lat,
      lon: coords.lon,
      timestamp: timestamp,
      type: 'location'
    };
    
    // Save location to history too
    messageHistory.push(msgData);
    if (messageHistory.length > 50) messageHistory.shift();

    io.emit('locationShare', msgData);
  });

  socket.on('changeStatus', (status) => {
      if (users.has(socket.id)) {
          const user = users.get(socket.id);
          user.status = status;
          users.set(socket.id, user);
          broadcastUserList();
      }
  });

  socket.on('typing', () => {
      if (socket.nickname) {
          socket.broadcast.emit('typing', socket.nickname);
      }
  });

  socket.on('stopTyping', () => {
      if (socket.nickname) {
          socket.broadcast.emit('stopTyping', socket.nickname);
      }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.nickname) {
      socket.broadcast.emit('systemMessage', `${socket.nickname} has left the chat`);
      users.delete(socket.id);
      broadcastUserList(); // Update connected users list
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} at 0.0.0.0`);
});
