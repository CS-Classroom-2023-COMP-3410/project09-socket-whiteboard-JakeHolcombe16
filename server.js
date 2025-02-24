const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// This array will hold the drawing actions that form the board state.
let boardState = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send the entire board state to the new client.
  socket.emit('init', boardState);

  // Listen for drawing actions from the client.
  socket.on('drawing', (data) => {
    // Add the drawing action to the board state.
    boardState.push(data);
    // Broadcast the drawing action to all clients (including the sender)
    // so that they draw only after receiving confirmation from the server.
    io.emit('drawing', data);
  });

  // Listen for a clear board event.
  socket.on('clear', () => {
    boardState = []; // Reset the board state.
    io.emit('clear'); // Inform all clients to clear their canvases.
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running on port 3000');
});
