const db = require('../db');
const { z } = require('zod');

function register(app) {
  app.get('/courses', async () => {
    const items = await db('courses').select('id', 'title', 'status', 'visibility').orderBy('id', 'desc').limit(100);
    return { items };
  });

  app.post('/courses', async (req, reply) => {
    if (!req.session?.is_logged_in) return reply.code(401).send({ error: 'unauthorized' });
    const schema = z.object({
      title: z.string().min(1),
      status: z.enum(['draft', 'published']).default('draft'),
      visibility: z.enum(['public', 'private']).default('public'),
      metadata: z.any().optional()
    });
    const body = schema.parse(req.body || {});
    const [row] = await db('courses').insert({
      title: body.title,
      status: body.status,
      visibility: body.visibility,
      metadata_json: body.metadata ? JSON.stringify(body.metadata) : null
    }).returning('*');
    app.io.emit('dashboard:courses:created', { id: row.id });
    return { ok: true, course: row };
  });
}

module.exports = { register };