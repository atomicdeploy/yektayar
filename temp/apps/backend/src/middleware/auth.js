const { createAnonymousSession, getSessionByToken } = require('../services/session');

async function attachAuth(req, reply) {
  if (req.url === '/health') return;

  let token = req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
              req.headers['x-session-token'] ||
              req.query['token'];

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'];

  if (!token) {
    token = await createAnonymousSession({ ip, ua });
    // Expose token to client for storage
    reply.header('x-session-token', token);
  }

  const session = await getSessionByToken(token);
  req.sessionToken = token;
  req.session = session;
}

module.exports = { attachAuth };