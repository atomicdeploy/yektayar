# Task Board (Prototype)

Legend:
- P0: Critical path for 5-day MVP.
- P1: Nice to have if time permits.
- FUTURE: Deferred post-prototype.

## Day 1
- [ ] P0 Init repo + workspaces
- [ ] P0 Backend skeleton (Fastify + health route)
- [ ] P0 Env loader + config service (DB-backed values later)
- [ ] P0 Knex setup + bootstrap script (create tables)
- [ ] P0 Users table + minimal register endpoint
- [ ] P0 Session creation (anonymous + login)
- [ ] P0 Opaque token storage + middleware extraction
- [ ] P0 Seed initial permissions
- [ ] P0 Socket.IO integration (connect + auth handshake)

## Day 2
- [ ] P0 Chat threads CRUD (create/list)
- [ ] P0 Chat messages endpoint + Socket broadcast
- [ ] P0 Course listing (public) + admin create stub
- [ ] P0 Permission middleware usage
- [ ] P0 Nuxt app setup (Tailwind, Pinia, i18n)
- [ ] P0 Layouts: public, app, admin
- [ ] P0 Auth composable (session init + login)
- [ ] P1 Lock screen (pattern storage)

## Day 3
- [ ] P0 Admin user list + profile view
- [ ] P0 Admin user secret notes
- [ ] P0 Dashboard real-time feed (users, chat messages)
- [ ] P0 Jalali date utility integration
- [ ] P0 Theme system (colors, dark/light, RTL toggle)
- [ ] P1 Offline caching (courses + recent messages)
- [ ] P1 Personality test endpoint (stub + result storage)

## Day 4
- [ ] P0 AI provider interface + stub replies
- [ ] P0 Unified messaging center (tickets/chats)
- [ ] P0 Thread close action + event
- [ ] P0 Audit logging for admin actions
- [ ] P1 Basic rate limiting middleware
- [ ] P1 Splash screen + brand tagline
- [ ] P1 Animations (page transitions, loader/spinner)

## Day 5
- [ ] P0 Polish UI (spacing, typography, brand accents)
- [ ] P0 Add minimal smoke tests
- [ ] P0 Review validation coverage (annotate TODOs)
- [ ] P0 Finalize docs (README, ARCHITECTURE, DEVELOPMENT)
- [ ] P0 VPS deployment script notes
- [ ] P1 Simple export/import script (users + courses)
- [ ] P1 TOTP stub finalize (SMS/email placeholder)

## Post-Prototype (FUTURE)
- [ ] Migrations tooling
- [ ] Multi-tenancy groundwork
- [ ] AI real integration (Pollination AI)
- [ ] Feature flags system
- [ ] Privacy/data deletion workflows
- [ ] Plugin architecture scaffolding
- [ ] Marketplace design doc
- [ ] Advanced monitoring
- [ ] CI/CD pipeline expansion
- [ ] Dockerization (optional)
- [ ] Full search (Postgres tsvector OR external engine)
- [ ] Rate limit persistence (Redis)
- [ ] Queue system (Kafka/RabbitMQ) when needed