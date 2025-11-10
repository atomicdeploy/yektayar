require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { Server } = require('socket.io');
const http = require('http');
const db = require('./db');
const { attachAuth } = require('./middleware/auth');
const authModule = require('./modules/auth');
const chatModule = require('./modules/chat');
const coursesModule = require('./modules/courses');
const { logger } = require('./utils/logger');

const app = Fastify({ logger: false });

async function start() {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  });

  app.get('/health', async () => ({ ok: true, ts: Date.now() }));

  // Auth/session extraction for all routes below
  app.addHook('preHandler', attachAuth);

  // Routes
  authModule.register(app);
  chatModule.register(app);
  coursesModule.register(app);

  // Create HTTP server to attach Socket.IO
  const server = http.createServer(app.server);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      credentials: true
    }
  });

  // Share io instance
  app.decorate('io', io);

  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['x-session-token'];
    socket.data.token = token;
    logger.info('socket_connected', { id: socket.id });
  });

  const port = Number(process.env.BACKEND_PORT || 4000);
  server.listen(port, '0.0.0.0', () => {
    logger.info('server_started', { port });
  });
}

start().catch((err) => {
  logger.error('server_error', { err: err.message, stack: err.stack });
  process.exit(1);
});