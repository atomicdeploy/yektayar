# Architecture Overview (Prototype)

## Goals
- Fast iteration.
- Minimal moving parts.
- Shared validation logic to reduce drift.
- Clear boundary between backend modules.

## Backend Modules
| Module | Responsibility |
|--------|----------------|
| auth | Login/register, session handling, TOTP stub |
| users | User CRUD, identifiers, notes (admin only) |
| permissions | RBAC tables + middleware |
| chat | Threads, messages, categories, real-time events |
| courses | Course listing, modules, personalization stub |
| personality | Survey endpoints (stub + result storage) |
| monitoring | Dashboard event emission & audit logging |

## Data Flow
1. Browser loads app → requests `/session/init`.
2. Backend returns session token (anonymous if not logged in).
3. User logs in (phone/email/password or TOTP) → session updated: `is_logged_in=true`, `user_id`.
4. Socket.IO connects with token (header or query).
5. Events propagate: chat messages, admin monitoring actions, dashboard metrics.

## Session Model
Stateful opaque token (random 32–64 bytes base64). Stored in `sessions` table:
- `token`
- `user_id` (nullable)
- `is_logged_in`
- `expires_at`
- Metadata: IP, UA.

## Permission Checking
Middleware:
1. Extract session → user → aggregate permissions (direct + groups).
2. Cache (in-memory map) for short TTL (e.g. 60s) for prototype.
3. Endpoint declares required permission code list.

## Chat / Ticket Hybrid
- One `chat_threads` table: status open/closed.
- `chat_categories` unify ticket departments.
- Admin can close thread (status change event).
- Messages may contain `meta_json` for future features (attachments, AI hints).

## Validation Strategy
Zod schemas in `packages/shared/src/schemas`:
- Input: parse/validate at route boundary.
- Output: optional shaping (not strict now).
- Reuse in frontend forms.

## AI Chatbot Stub
Interface: `aiProvider.reply({threadId, userId, prompt})`.
- Stub returns canned responses or echoes.
- Future adapter: Pollination AI / other provider with retry & rate-limit.

## Offline (PWA)
- Service Worker caches:
  - App shell (HTML, CSS, JS).
  - Last fetched course list.
  - Last N chat messages (per thread).
- Fallback view if offline for posting (queued sending deferred).

## Internationalization
- `i18n/fa.json`, `i18n/en.json`.
- Date utilities wrapper: Jalali via dayjs + jalaliday plugin.
- Avoid hard-coded strings.

## Future Extension Points (Annotated)
- Multi-tenancy: Add `tenant_id` columns (deferred).
- ABAC: Introduce policy evaluation layer later.
- Feature flags: Insert simple `features` table (deferred).
- Migrations: Replace bootstrap script with migration tooling later.

## Security (Prototype Level)
- Prepared statements via Knex.
- Basic rate-limit middleware (IP + action code) using in-memory map.
- Password hashing: bcryptjs (for build simplicity).
- Session revocation: delete row by token.
- TOTP stub: generate code, store ephemeral (in-memory), later integrate real SMS/email gateway.

## Logging / Audit
- Console logger: `[timestamp] [level] message metaJSON`.
- `audits` table for admin actions only (view user profile, add note, close thread).

## Deployment (Prototype)
- VPS: Apache reverse proxy → Node backend (PM2).
- Static front served by Nuxt SPA (same host).
- No containers, no serverless.