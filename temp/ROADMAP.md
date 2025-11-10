# Roadmap (Prototype to Future)

## Phase 0 (Days 1–5)
Deliver functional demo:
- Auth (anonymous + login + session)
- Chat/ticket system + real-time
- Course listing + basic creation
- Admin panel (user list, notes, monitoring)
- Permissions gating
- Theming, RTL, i18n (fa/en), Jalali dates
- AI chatbot stub
- Documentation

## Phase 1 (Weeks 2–4)
- Replace stubs with operational TOTP flows.
- Introduce migrations tooling.
- Harden validation + error codes standardization.
- Offline caching improvements (queued sends).
- Real AI integration (provider adapter).
- Basic metrics dashboard.

## Phase 2
- Privacy & deletion workflows.
- Multi-tenancy groundwork.
- Feature flags.
- Search & indexing.
- Background job queue.
- Rate-limit persistence via Redis.