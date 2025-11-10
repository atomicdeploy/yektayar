# Development Guide (Prototype)

## Prerequisites
- Node.js >= 18
- Yarn classic
- PostgreSQL local instance
- Git

## Initial Setup
```
git clone https://github.com/DRSDavidSoft/YektaCare.git
cd YektaCare
yarn install
cp .env.example .env
# Edit .env with local DB credentials
node apps/backend/scripts/bootstrap.js
yarn workspace backend dev
yarn workspace web dev
```

## Workspaces
Run commands per workspace:
```
yarn workspace backend <script>
yarn workspace web <script>
```

## Scripts (Planned)
Backend:
- `dev`: Start Fastify server
- `lint`: Run ESLint (warnings only)
- `test`: Smoke tests (later)

Web:
- `dev`: Nuxt dev server (SPA)
- `build`: Production build
- `preview`: Preview production build

## Permissions Example (Backend)
```
ensurePermissions(['admin.users.view'])
```

## Offline Caching
- Service worker caches app shell, last course list, recent chat messages.

## Deployment (Prototype)
1. VPS: Pull latest main.
2. Install dependencies.
3. Run bootstrap if new tables added.
4. Start PM2 process:
```
pm2 start apps/backend/src/server.js --name yektacare-backend
pm2 start --name yektacare-web -- yarn -- run build && npx serve -s .output/public
```
(For prototype, dev server is acceptable; switch to production build when ready.)