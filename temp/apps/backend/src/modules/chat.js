const db = require('../db');
const { z } = require('zod');

function ensureLoggedIn(req, reply) {
  if (!req.session?.is_logged_in) {
    reply.code(401).send({ error: 'unauthorized' });
    return false;
  }
  return true;
}

function register(app) {
  app.get('/chat/threads', async (req) => {
    const threads = await db('chat_threads').select('*').orderBy('created_at', 'desc').limit(100);
    return { items: threads };
  });

  app.post('/chat/threads', async (req, reply) => {
    if (!ensureLoggedIn(req, reply)) return;
    const schema = z.object({
      category_id: z.number().nullable().optional(),
      title: z.string().min(1).optional()
    });
    const body = schema.parse(req.body || {});
    const [thr] = await db('chat_threads').insert({
      category_id: body.category_id || null,
      status: 'open',
      created_at: new Date()
    }).returning('*');

    await db('chat_participants').insert({ thread_id: thr.id, user_id: req.session.user_id, role: 'member' });
    app.io.emit('chat:thread:updated', { id: thr.id });
    return { ok: true, thread: thr };
  });

  app.get('/chat/threads/:id/messages', async (req) => {
    const msgs = await db('chat_messages').where({ thread_id: req.params.id }).orderBy('created_at', 'asc').limit(200);
    return { items: msgs };
  });

  app.post('/chat/threads/:id/messages', async (req, reply) => {
    if (!ensureLoggedIn(req, reply)) return;
    const schema = z.object({
      body: z.string().min(1),
      meta: z.any().optional()
    });
    const body = schema.parse(req.body || {});
    const [msg] = await db('chat_messages').insert({
      thread_id: req.params.id,
      sender_user_id: req.session.user_id,
      body: body.body,
      meta_json: body.meta ? JSON.stringify(body.meta) : null,
      created_at: new Date()
    }).returning('*');

    app.io.emit('dashboard:chat:message', { thread_id: req.params.id, message_id: msg.id });
    app.io.emit('chat:message', { thread_id: req.params.id, message: msg });
    return { ok: true, message: msg };
  });

  app.post('/chat/threads/:id/close', async (req, reply) => {
    if (!ensureLoggedIn(req, reply)) return;
    await db('chat_threads').where({ id: req.params.id }).update({ status: 'closed' });
    app.io.emit('chat:thread:updated', { id: req.params.id, status: 'closed' });
    return { ok: true };
  });
}

module.exports = { register };