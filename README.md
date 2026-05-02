# Web-Based Multi-Client Chat

An advanced web-based version of a distributed chat system using Node.js, Express, Socket.IO, and TailwindCSS.

## Features

- **Real-time Messaging**: Instant communication across all connected clients.
- **Nicknames**: Choose a custom nickname before joining.
- **Timestamps**: Messages include the exact time they were sent.
- **Emoji Support**: Quick emoji picker for expressive chats.
- **Location Sharing**: Share your current location with a single click (integrates with Google Maps).
- **Modern UI**: Clean, responsive interface built with TailwindCSS.

## How to Run Locally

1. **Ensure Node.js is installed** on your machine.
2. **Install dependencies**:
   Open a terminal in the project directory and run:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   *(For development with auto-restart, you can run `npm run dev` if you have nodemon).*
4. **Open your browser** and navigate to `http://localhost:3000`.
   You can open multiple tabs or different browsers to simulate multiple clients interacting with each other.

## Deployment Advice

To deploy this application, it is highly recommended to split the hosting of the Frontend and Backend to optimize performance and take advantage of modern hosting platforms.

1. **Backend (Node.js + Socket.IO Server)**:
   Deploy the root folder (or specifically `server.js` and `package.json`) to a platform that supports persistent, long-running connections (WebSockets).
   - **Recommended Platforms**: [Render](https://render.com/), [Railway](https://railway.app/), or Heroku.
   - *Note: Serverless environments (like Vercel functions or AWS Lambda) are not ideal for WebSockets due to connection timeouts and statelessness.*

2. **Frontend (Static Files)**:
   Deploy the `public` folder to a static hosting platform. Since the backend handles CORS (`*`), the frontend can be hosted completely separately.
   - **Recommended Platforms**: [Vercel](https://vercel.com/), Netlify, or GitHub Pages.
   - *Important*: When deploying the frontend separately, you will need to update the `io()` connection in `public/app.js` to point to your deployed backend URL:
     ```javascript
     const socket = io('https://your-backend-url.onrender.com');
     ```

## Technical Note: Socket.IO vs. Java ServerSocket

Traditionally, a multi-client chat system built in Java uses `ServerSocket` and thread-per-client architectures to handle concurrent connections. 

**Socket.IO** provides a modern, more resilient approach for web applications:
- **Event-Driven vs. Thread-Blocking**: Java Sockets often block threads waiting for input, whereas Node.js and Socket.IO use a single-threaded, event-driven architecture that scales efficiently without the overhead of context-switching between hundreds of threads.
- **Protocol Upgrades**: Socket.IO initially connects via HTTP long-polling and automatically upgrades to WebSockets if supported. This ensures connection reliability across different network setups, firewalls, and proxies that might block raw TCP sockets.
- **Built-in Broadcasting**: Broadcasting a message to all clients or specific rooms is built natively into Socket.IO (e.g., `io.emit()`), eliminating the need to manually manage loops over connected client streams as in Java.
- **Automatic Reconnection**: Socket.IO clients automatically handle reconnections when a connection drops, a feature that typically requires complex custom logic in Java.
