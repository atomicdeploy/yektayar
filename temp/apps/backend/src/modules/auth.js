const db = require('../db');
const bcrypt = require('bcryptjs');
const { setSessionUser } = require('../services/session');
const { z } = require('zod');

const memTotp = new Map(); // identifier -> { code, exp }

function register(app) {
  app.get('/session/init', async (req, reply) => {
    // token is set by middleware if missing
    return { token: req.sessionToken, is_logged_in: !!req.session?.is_logged_in, user_id: req.session?.user_id || null };
  });

  app.post('/auth/register', async (req, reply) => {
    const schema = z.object({
      identifier: z.string().min(3), // phone or email
      type: z.enum(['phone', 'email']),
      password: z.string().min(6).optional()
    });
    const body = schema.parse(req.body || {});
    const now = new Date();

    // Create user
    const [user] = await db('users').insert({
      primary_identifier: body.identifier,
      password_hash: body.password ? await bcrypt.hash(body.password, 10) : null,
      is_active: true,
      created_at: now,
      updated_at: now
    }).returning('*');

    await db('user_identifiers').insert({
      user_id: user.id,
      type: body.type,
      value: body.identifier,
      verified_at: null,
      is_primary: true
    });

    await setSessionUser(req.sessionToken, user.id);
    return { ok: true, user_id: user.id };
  });

  app.post('/auth/login', async (req, reply) => {
    const schema = z.object({
      identifier: z.string(),
      password: z.string().optional(),
      code: z.string().optional()
    });
    const body = schema.parse(req.body || {});
    const idRow = await db('user_identifiers').where({ value: body.identifier }).first();
    if (!idRow) return reply.code(400).send({ error: 'not_found' });
    const user = await db('users').where({ id: idRow.user_id, is_active: true }).first();
    if (!user) return reply.code(400).send({ error: 'not_found' });

    if (body.password) {
      if (!user.password_hash) return reply.code(400).send({ error: 'no_password_set' });
      const ok = await bcrypt.compare(body.password, user.password_hash);
      if (!ok) return reply.code(401).send({ error: 'invalid_credentials' });
    } else if (body.code) {
      const rec = memTotp.get(body.identifier);
      if (!rec || rec.code !== body.code || rec.exp < Date.now()) return reply.code(401).send({ error: 'invalid_code' });
    } else {
      return reply.code(400).send({ error: 'missing_credentials' });
    }

    await setSessionUser(req.sessionToken, user.id);
    return { ok: true, user_id: user.id, token: req.sessionToken };
  });

  app.post('/auth/request_code', async (req, reply) => {
    const schema = z.object({ identifier: z.string() });
    const { identifier } = schema.parse(req.body || {});
    const code = String(Math.floor(10 ** (Number(process.env.TOTP_CODE_LENGTH || 6) - 1) + Math.random() * 9 * 10 ** (Number(process.env.TOTP_CODE_LENGTH || 6) - 1))).padStart(Number(process.env.TOTP_CODE_LENGTH || 6), '0');
    memTotp.set(identifier, { code, exp: Date.now() + (Number(process.env.TOTP_EXP_MINUTES || 5) * 60 * 1000) });
    // For prototype, return code in response (replace with SMS/email later)
    return { ok: true, code };
  });

  app.post('/auth/logout', async (req, reply) => {
    await db('sessions').where({ token: req.sessionToken }).del();
    return { ok: true };
  });
}

module.exports = { register };