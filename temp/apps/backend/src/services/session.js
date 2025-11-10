const crypto = require('crypto');
const db = require('../db');

function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

async function createAnonymousSession(meta = {}) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await db('sessions').insert({
    token,
    user_id: null,
    is_logged_in: false,
    ip: meta.ip || null,
    user_agent: meta.ua || null,
    expires_at: expiresAt
  });
  return token;
}

async function getSessionByToken(token) {
  if (!token) return null;
  const s = await db('sessions').where({ token }).first();
  if (!s) return null;
  if (new Date(s.expires_at).getTime() < Date.now()) {
    await db('sessions').where({ token }).del();
    return null;
  }
  return s;
}

async function setSessionUser(token, userId) {
  return db('sessions').where({ token }).update({ user_id: userId, is_logged_in: true });
}

module.exports = { createAnonymousSession, getSessionByToken, setSessionUser };