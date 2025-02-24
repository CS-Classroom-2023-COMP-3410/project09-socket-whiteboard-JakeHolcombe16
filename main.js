import { io } from "socket.io-client";

// Connect to the Socket.IO server.
const socket = io('http://localhost:3000');

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBoard'); // Corrected ID

// Set canvas dimensions.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let current = {
  color: colorPicker.value,
  x: 0,
  y: 0
};

// Update current color when the user picks a new one.
colorPicker.addEventListener('change', (e) => {
  current.color = e.target.value;
});

// Draw a line on the canvas.
function drawLine(data) {
  ctx.beginPath();
  ctx.moveTo(data.x0, data.y0);
  ctx.lineTo(data.x1, data.y1);
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

// Handle mouse events.
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current.x = e.clientX;
  current.y = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const x0 = current.x;
  const y0 = current.y;
  const x1 = e.clientX;
  const y1 = e.clientY;

  // Instead of drawing immediately, emit the drawing action.
  socket.emit('drawing', { x0, y0, x1, y1, color: current.color });

  current.x = x1;
  current.y = y1;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});
canvas.addEventListener('mouseout', () => {
  drawing = false;
});

// Handle the clear button.
clearBtn.addEventListener('click', () => {
  socket.emit('clear');
});

// Listen for drawing events from the server and render them.
socket.on('drawing', (data) => {
  drawLine(data);
});

// When a new client connects, draw the existing board state.
socket.on('init', (boardState) => {
  boardState.forEach(data => drawLine(data));
});

// Listen for a clear event to reset the canvas.
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
