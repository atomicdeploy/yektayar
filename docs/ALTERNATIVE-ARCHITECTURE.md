# Alternative Architecture: Nuxt + Fastify Approach

This document describes an alternative architecture approach that was explored for YektaYar (originally called "YektaCare" in this iteration).

**Status**: Reference/Archive - Not the current implementation  
**Source**: Extracted from files.zip attachment  
**Date**: November 2025

---

## Overview

This alternative approach uses a different tech stack focused on rapid MVP development with Nuxt 3 and Fastify.

### Key Differences from Current Architecture

| Aspect | Alternative (Nuxt + Fastify) | Current (Ionic + Elysia) |
|--------|------------------------------|--------------------------|
| **Backend Framework** | Fastify | Elysia.js |
| **Runtime** | Node.js | Bun |
| **Frontend Framework** | Nuxt 3 (SSR capable) | Vue 3 + Ionic 7 |
| **Mobile** | Capacitor (deferred) | Ionic + Capacitor |
| **Database ORM** | Knex.js | (TBD) |
| **Package Manager** | Yarn workspaces | npm workspaces |
| **Build Tool** | Nuxt (Vite) | Vite |
| **State Management** | Pinia | Pinia |
| **Validation** | Zod | Zod |
| **Real-time** | Socket.IO | Socket.IO (planned) |

---

## Architecture Components

### Backend (`apps/backend`)

**Framework**: Fastify + Node.js

#### Key Features
- Lightweight REST API
- Socket.IO integration for real-time features
- Knex.js for database queries
- Opaque session tokens (no JWT refresh tokens)
- Modular route structure

#### Structure
```
apps/backend/
├── src/
│   ├── server.js           # Main server entry
│   ├── db.js               # Database connection
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── modules/
│   │   ├── auth.js         # Auth routes
│   │   ├── chat.js         # Chat routes
│   │   └── courses.js      # Course routes
│   ├── services/
│   │   └── session.js      # Session management
│   └── utils/
│       └── logger.js       # Logging utility
└── scripts/
    └── bootstrap.js        # Database initialization
```

#### Server Setup Example
```javascript
const Fastify = require('fastify');
const { Server } = require('socket.io');

const app = Fastify({ logger: false });

// CORS setup
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
});

// Auth middleware for all routes
app.addHook('preHandler', attachAuth);

// Socket.IO integration
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN, credentials: true }
});

// Share io instance with routes
app.decorate('io', io);
```

### Frontend (`apps/web`)

**Framework**: Nuxt 3 + Vue 3

#### Key Features
- Universal rendering (SSR/SPA/PWA)
- App and Admin panel in one codebase
- Tailwind CSS for styling
- vue-i18n for internationalization (Persian + English)
- Pinia for state management
- Service Worker for offline support

#### Structure
```
apps/web/
├── pages/
│   ├── index.vue           # Main app page
│   └── admin/
│       └── index.vue       # Admin dashboard
├── layouts/
│   └── default.vue         # Default layout
├── plugins/
│   ├── i18n.client.ts      # i18n setup
│   └── sw.client.ts        # Service worker
├── i18n/
│   ├── fa.json             # Persian translations
│   └── en.json             # English translations
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── styles/
│   └── tailwind.css        # Tailwind styles
├── app.vue                 # Root component
├── nuxt.config.ts          # Nuxt configuration
└── package.json
```

#### Nuxt Configuration Highlights
```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/styles/tailwind.css'],
  app: {
    head: {
      title: 'YektaCare',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
```

### Shared Code (`packages/shared`)

#### Purpose
- Share TypeScript types between frontend and backend
- Zod validation schemas
- Common utilities and constants

#### Structure
```
packages/shared/
└── src/
    ├── index.js            # Main exports
    └── schemas/
        └── user.js         # User validation schema
```

### UI Components (`packages/ui`)

#### Purpose
- Reusable UI components
- Theme tokens
- Design system

---

## Database Strategy

### ORM: Knex.js

**Advantages:**
- Query builder (not full ORM, lighter than Prisma/TypeORM)
- Migrations support
- Raw SQL when needed
- PostgreSQL focused but portable

### Schema Management
```javascript
// Bootstrap script creates tables
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique();
    table.string('password_hash');
    table.timestamps(true, true);
  });
};
```

---

## Authentication Strategy

### Opaque Session Tokens

Instead of JWT with refresh tokens, this approach uses:
- Server-side session storage (in database)
- Opaque tokens (random strings, not JWTs)
- No refresh token complexity

#### Advantages
- Simpler to implement
- Easy to invalidate sessions
- No JWT signature verification overhead
- Works for anonymous + logged-in users

#### Implementation
```javascript
// Create session
const sessionToken = crypto.randomBytes(32).toString('hex');
await db('sessions').insert({
  token: sessionToken,
  user_id: userId,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

// Validate session
const session = await db('sessions')
  .where({ token })
  .where('expires_at', '>', new Date())
  .first();
```

---

## Real-time Strategy

### Socket.IO Events

#### Examples
```javascript
// Dashboard events
io.emit('dashboard:user:new', { user });
io.emit('dashboard:chat:message', { message });

// Chat events
socket.to(threadId).emit('chat:thread:updated', { thread });

// Audit events
io.to('admin').emit('audit:action', { action, user });
```

---

## Development Workflow

### Day 1-2 Focus
- Auth and sessions
- Chat basics
- Skeleton UI with layouts

### Day 3 Focus
- Admin monitoring
- Courses
- i18n setup
- Theme system
- Offline basics

### Day 4 Focus
- AI stub provider
- Permission gating
- Dashboard live feed

### Day 5 Focus
- Polish
- Logging and audit
- Documentation
- VPS deployment prep

---

## Pros and Cons

### Advantages of This Approach

✅ **Nuxt 3 Benefits**
- SSR/SSG capabilities for better SEO
- Universal rendering
- Auto-imports for composables
- Built-in optimizations
- File-based routing

✅ **Fastify Benefits**
- Very fast (benchmarks well)
- Plugin ecosystem
- Schema-based validation built-in
- TypeScript support

✅ **Simplicity**
- Fewer moving parts
- Everything in one Nuxt app (app + admin)
- Straightforward monorepo

### Disadvantages

❌ **Mobile Experience**
- Nuxt is web-first
- Ionic provides better native mobile UX
- Capacitor integration less seamless

❌ **Runtime Performance**
- Node.js vs Bun (Bun is faster)
- Knex.js adds query builder overhead

❌ **TypeScript**
- Mix of JS and TS in the implementation
- Current approach is TypeScript-first

❌ **Admin Panel**
- Combined with main app (less separation)
- Harder to apply different security policies

---

## When to Consider This Approach

This alternative architecture might be suitable if:

1. **SEO is Critical**: Need server-side rendering for public pages
2. **Single Team**: One team handling both frontend and backend
3. **Rapid Prototyping**: Nuxt's conventions speed up development
4. **Web-First Strategy**: Mobile app is secondary or deferred
5. **Node.js Ecosystem**: Team expertise in Node.js

---

## Current Implementation Choice

The project uses **Ionic + Vue + Elysia + Bun** because:

1. ✅ **Mobile-First**: Ionic provides better mobile UX
2. ✅ **Performance**: Bun is significantly faster than Node.js
3. ✅ **Separation**: Clear boundaries between app, admin, and backend
4. ✅ **TypeScript**: Consistent TypeScript throughout
5. ✅ **Modern**: Elysia is newer, more ergonomic API design

---

## Code Samples from Alternative Implementation

### Backend: Auth Module
```javascript
// apps/backend/src/modules/auth.js
exports.register = (app) => {
  app.post('/auth/register', async (req, reply) => {
    const { email, password } = req.body;
    // Hash password, create user, create session
    const sessionToken = await createSession(user.id);
    reply.send({ sessionToken, user });
  });

  app.post('/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    // Verify credentials, create session
    const sessionToken = await createSession(user.id);
    reply.send({ sessionToken, user });
  });
};
```

### Frontend: Auth Composable
```typescript
// apps/web/composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null);
  const token = useCookie('session_token');

  const login = async (email: string, password: string) => {
    const res = await $fetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    token.value = res.sessionToken;
    user.value = res.user;
  };

  return { user, login, logout };
};
```

---

## Useful Patterns Extracted

### 1. Database Bootstrap Script
The bootstrap script pattern for initializing tables is useful:
```javascript
// Creates tables if they don't exist
const bootstrap = async () => {
  await createUsersTable();
  await createSessionsTable();
  await createPermissionsTable();
  await seedInitialData();
};
```

### 2. Modular Route Registration
Clean pattern for organizing routes:
```javascript
// Each module exports a register function
exports.register = (app) => {
  app.get('/endpoint', handler);
  app.post('/endpoint', handler);
};

// In server.js
authModule.register(app);
chatModule.register(app);
```

### 3. Shared Socket.IO Instance
Decorating Fastify with Socket.IO for route access:
```javascript
app.decorate('io', io);

// In routes
app.post('/message', async (req, reply) => {
  const message = await saveMessage(req.body);
  app.io.to(threadId).emit('message:new', message);
});
```

---

## References

- **Source Files**: Located in `temp/` directory (archived)
- **Original Name**: YektaCare
- **Implementation Date**: November 2025
- **Status**: Alternative approach, not currently used

---

## Conclusion

This alternative architecture represents a valid approach for building YektaYar with different trade-offs. While not chosen for the current implementation, it provides valuable insights and patterns that may be useful for specific use cases or future iterations of the project.

The current Ionic + Elysia + Bun architecture was chosen for its mobile-first approach, performance characteristics, and clear separation of concerns.

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-10  
**Status**: Reference/Archive
