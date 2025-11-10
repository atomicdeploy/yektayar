# YektaCare (Prototype)

YektaCare is a rapid MVP platform for delivering personalized educational courses, AI-assisted chat, unified messaging (chat/ticket hybrid), and admin supervision.

This repository is a monorepo containing:
- apps/backend: Fastify-based API + Socket.IO real-time server
- apps/web: Nuxt 3 (App + Admin Panel)
- apps/android: (Capacitor wrapper – deferred)
- packages/shared: Shared schemas, constants, simple validation layer
- packages/ui: Extracted UI components / theme tokens
- docs: Additional design & ops notes

## Core Principles
- Speed over completeness; ship in days.
- Avoid over-engineering (minimal abstractions).
- Single developer friendly.
- Extensible foundation for later phases (multi-tenancy, plugin marketplace, advanced AI).
- Stateful opaque sessions (no refresh tokens) supporting anonymous + logged-in flows.
- Persian (Farsi) + English i18n (Jalali calendar support).

## Deferred (Not in Prototype)
Privacy / deletion workflows, feature flags, advanced CI/CD, containerization, multi-tenancy, migrations, dependency upgrade automation, full AI integration, plugin marketplace.

## Tech Stack (Prototype)
| Layer | Choice | Notes |
|-------|--------|-------|
| Backend | Node.js + Fastify | Lightweight; easy to expand |
| Real-time | Socket.IO | Chat, dashboard events |
| DB | PostgreSQL (Knex) | Portable; can switch to MySQL later |
| Validation | Zod | Shared schemas (optionally in frontend) |
| Frontend | Nuxt 3 (Vue 3) | SPA/PWA; admin + app in one |
| Styling | TailwindCSS + Nuxt UI (optional) + Headless UI | Custom theming, RTL, animations |
| State | Pinia | Simple store; can scale later |
| Auth | Opaque session tokens | Stored server-side; TOTP + password optional |
| AI | Stub provider | Replace with Pollination AI later |
| Android | Capacitor (deferred) | Wrap web app |
| i18n | vue-i18n | fa (default) + en |

## Monorepo Layout
```
yektacare/
  apps/
    backend/
    web/
    android/ (stub)
  packages/
    shared/
    ui/
  docs/
  .github/
    workflows/
  README.md
  TASKS.md
  ARCHITECTURE.md
  DEVELOPMENT.md
  ROADMAP.md
```

## Running (Prototype)
1. Install global dependencies: Node >= 18, PostgreSQL.
2. Create `.env` at repo root:
```
NODE_ENV=dev
BACKEND_PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yektacare
DB_USER=postgres
DB_PASS=yourpassword
SESSION_SECRET=change_me
CORS_ORIGIN=http://localhost:3000
```
3. Bootstrap DB: `node apps/backend/scripts/bootstrap.js`
4. Start backend: `yarn workspace backend dev`
5. Start web: `yarn workspace web dev`
6. Access app: http://localhost:3000

## Development Workflow
- Single main branch (`main`).
- Direct commits acceptable for prototype.
- Lint warnings only (no blocking).
- Minimal smoke tests later: `yarn test`.
- Manual deploy to VPS: pull latest, install, run PM2 process.

## Real-Time Events (Examples)
- `dashboard:user:new`
- `dashboard:chat:message`
- `chat:thread:updated`
- `audit:action`

## Licensing
Proprietary (internal). Public API doc deferred.

## Contributing
Single developer prototype; AI assistance welcomed. See CONTRIBUTING.md.

## Roadmap (Short Form)
- Day 1–2: Auth, sessions, chat basics, skeleton UI.
- Day 3: Admin monitor, courses, i18n, theme, offline basics.
- Day 4: AI stub, permission gating, dashboard live feed.
- Day 5: Polish, logging, audit, docs, deploy.