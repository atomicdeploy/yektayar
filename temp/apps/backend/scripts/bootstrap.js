require('dotenv').config();
const db = require('../src/db');

async function run() {
  const q = (sql) => db.raw(sql);

  await q(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    primary_identifier VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS user_identifiers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'phone' | 'email'
    value VARCHAR(255) UNIQUE NOT NULL,
    verified_at TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL,
    is_logged_in BOOLEAN DEFAULT FALSE,
    ip VARCHAR(64),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(150) UNIQUE NOT NULL,
    description TEXT
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS user_groups (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS group_permissions (
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, permission_id)
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    visibility VARCHAR(20) DEFAULT 'public',
    metadata_json TEXT
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS chat_threads (
    id SERIAL PRIMARY KEY,
    category_id INTEGER,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS chat_participants (
    thread_id INTEGER REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20),
    PRIMARY KEY (thread_id, user_id)
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    meta_json TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);

  await q(`
  CREATE TABLE IF NOT EXISTS admin_user_notes (
    id SERIAL PRIMARY KEY,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);

  // Seed basic permissions
  const perms = [
    'admin.dashboard.view',
    'admin.users.view',
    'admin.users.note.add',
    'chat.read',
    'chat.write',
    'course.view',
    'course.manage',
    'personality.test.take'
  ];
  for (const code of perms) {
    await db('permissions').insert({ code }).onConflict('code').ignore();
  }

  console.log('Bootstrap complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});