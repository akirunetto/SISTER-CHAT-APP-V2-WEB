Web-Based Multi-Client Chat - Antigravity Agent Prompts

This project is an advanced web-based version of a distributed chat system. The stack will be Node.js, Express, and Socket.IO for the backend, and HTML/Vanilla JS with TailwindCSS for the frontend.

New Features to Implement: Nickname, Timestamp, Emoji, and Location sharing.

Agent, please execute these phases sequentially. Wait for my confirmation after each phase before proceeding.

🛠️ Phase 1: Project Setup & Backend (Node.js + Socket.IO)

Goal: Initialize the project and build the WebSocket server.

Instructions for Agent:

Generate the package.json file with dependencies: express, socket.io, cors. (CORS is crucial as the frontend and backend might be deployed on different domains).

Create server.js. Set up an Express server and initialize Socket.IO with CORS enabled for all origins (*).

Implement the following Socket.IO event listeners for each connection:

join: Accepts a nickname, stores it in the socket instance, and broadcasts a system message (e.g., "Akiru has joined the chat") to all other users.

chatMessage: Accepts a message string. The server must append a generated Timestamp, attach the user's Nickname, and broadcast it to ALL clients.

locationShare: Accepts latitude and longitude. The server formats this, attaches the Nickname and Timestamp, and broadcasts it to ALL clients.

disconnect: Broadcasts a system message that the user has left.

Provide the code for package.json and server.js.

🖥️ Phase 2: Frontend Structure & UI (HTML + TailwindCSS)

Goal: Build a modern, responsive chat interface inside public/index.html.

Instructions for Agent:

Create public/index.html. Include TailwindCSS via CDN and the Socket.IO client script (<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>).

Login/Nickname Modal: Create a simple, centered overlay UI that asks for the user's "Nickname" before they can see the chat. It should have an input field and a "Join" button.

Main Chat UI:

A sticky header showing "Web Chat Room".

A main chat box (scrollable area, overflow-y-auto) for messages.

A message input area at the bottom fixed to the screen.

Input Area Features:

A text input field (<input type="text">).

An "Emoji" button (😊).

A "Share Location" button (📍).

A "Send" button.

Provide the complete HTML structure with Tailwind utility classes. Do not write the complex JS logic yet.

💻 Phase 3: Frontend Logic & Advanced Features Integration

Goal: Connect the UI to Socket.IO and implement the new features (Emoji & Location) inside public/app.js (or inline <script>).

Instructions for Agent:

Connection & Nickname: Write the JS logic to capture the nickname from the modal, emit the join event to the server, hide the modal, and show the chat UI.

Receiving Messages: Listen for incoming chatMessage, locationShare, and system messages. Dynamically create DOM elements (e.g., chat bubbles) to append them to the chat box. Ensure the chat box auto-scrolls to the bottom automatically.

Requirement: Display the Nickname and Timestamp clearly on every message bubble. Distinguish UI styling between "My messages" (right aligned) and "Other users' messages" (left aligned).

Emoji Feature: Implement a simple emoji picker. When the Emoji button is clicked, show a small floating div with 10 standard emojis (e.g., 😀, 😂, 😍, 😭, 👍). Clicking an emoji appends it to the text input field.

Location Feature: When the "Share Location" button is clicked, use the HTML5 Geolocation API (navigator.geolocation.getCurrentPosition). Send the lat/lon to the server via the locationShare event.

Requirement: When rendering a location message, display it as a clickable hyperlink to Google Maps (e.g., https://www.google.com/maps?q=lat,lon) with text like "📍 Shared a location".

🚀 Phase 4: Final Polish & Deployment Prep

Goal: Ensure everything works smoothly and prepare instructions for deployment.

Instructions for Agent:

Review the generated code to ensure there are no missing variables and the UI looks cohesive.

Generate a README.md containing:

Instructions on how to run the project locally.

Deployment Advice: Explicitly explain that the Node.js server.js should be deployed on a platform like Render or Railway (since WebSockets require long-polling/persistent connections), while the public folder (Frontend) can be safely deployed on Vercel.

A brief technical explanation of how Socket.IO replaces the old Java ServerSocket approach.