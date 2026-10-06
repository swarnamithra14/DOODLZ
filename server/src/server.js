import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection, getDatabaseStatus } from './config/db.js';
import { registerRoomHandlers } from './socket/roomHandlers.js';
import { registerGameHandlers } from './socket/gameHandlers.js';
import { registerDrawingHandlers } from './socket/drawingHandlers.js';
import { registerChatHandlers } from './socket/chatHandlers.js';
import path from 'path';
import { fileURLToPath } from 'url';
import roomManager from './game/RoomManager.js';
import gameManager from './game/GameManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl.split(',').map((u) => u.trim());

const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, server-to-server) or wildcard
  if (!origin || rawClientUrl === '*' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    return callback(null, true);
  }
  // Allow any vercel.app preview deployment
  if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
    return callback(null, true);
  }
  return callback(null, true); // Permissive fallback for seamless live demo
};

// Middleware
app.use(cors({
  origin: corsOriginHandler,
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// REST Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DOODLZ Backend Authority',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: getDatabaseStatus(),
    stats: {
      activeRooms: roomManager.getAllRooms().length,
      connectedClients: io.engine.clientsCount,
    },
  });
});

// Serve frontend static build
app.use(express.static(clientDistPath));

// SPA Wildcard fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

  // Handshake ping-pong for connectivity verification
  socket.emit('server:welcome', {
    message: 'Connected to DOODLZ Real-Time Engine',
    socketId: socket.id,
    timestamp: Date.now(),
  });

  socket.on('client:ping', (data, callback) => {
    const response = {
      message: 'pong',
      receivedData: data,
      serverTime: Date.now(),
    };
    if (typeof callback === 'function') {
      callback(response);
    } else {
      socket.emit('server:pong', response);
    }
  });

  // Register modular handlers
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerDrawingHandlers(io, socket);
  registerChatHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
    gameManager.handleDisconnect(io, socket.id);
  });
});

// Boot Server and Test DB
async function startServer() {
  await testDatabaseConnection();

  server.listen(PORT, () => {
    console.log('==============================================');
    console.log('🎨 DOODLZ Server — Authoritative Game Engine');
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`🌐 Accepting CORS from: ${rawClientUrl}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log('==============================================');
  });
}

// Graceful termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down DOODLZ server gracefully...');
  server.close(() => {
    console.log('Server terminated.');
    process.exit(0);
  });
});

startServer();
