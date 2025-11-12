# YektaYar Platform - Quick Reference

**Version**: 0.1.0  
**Status**: ✅ Mono repo structure complete, ready for implementation  
**Last Updated**: 2025-11-10

---

## 📁 Repository Structure

```
yektayar/
├── packages/
│   ├── backend/           # Elysia.js API (Port 3000)
│   ├── admin-panel/       # Vue.js Admin UI (Port 5173)
│   ├── mobile-app/        # Ionic Mobile App (Port 8100)
│   └── shared/            # Shared code (types, schemas, utils, i18n)
├── docs-archive/          # Old Spark prototype documentation
├── README.md              # Project overview
├── DEVELOPMENT.md         # Development guide
├── ROADMAP.md             # Implementation roadmap
└── package.json           # Root workspace config
```

---

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Start all services
npm run dev

# Start individual services
npm run dev:backend    # Backend only
npm run dev:admin      # Admin panel only
npm run dev:mobile     # Mobile app only

# Build all
npm run build

# Clean everything
npm run clean
```

---

## 🔗 Local URLs

- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/swagger
- **Admin Panel**: http://localhost:5173
- **Mobile App**: http://localhost:8100

---

## 🛠️ Tech Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend Runtime | Bun | Fast JavaScript runtime |
| Backend Framework | Elysia.js | API server |
| Database | PostgreSQL | Data storage |
| Admin Frontend | Vue.js 3 | Web interface |
| Mobile App | Ionic 7 + Capacitor | Native capabilities |
| State Management | Pinia | Both frontends |
| Validation | Zod | All packages |
| i18n | vue-i18n | Persian + English |
| Build Tool | Vite | Both frontends |
| Package Manager | npm workspaces | Mono repo |

---

## 📦 Package Details

### Backend (@yektayar/backend)
- **Port**: 3000
- **Framework**: Elysia.js
- **Runtime**: Bun
- **Config**: Unified .env at project root

**Key Files**:
- `src/index.ts` - Entry point
- `src/routes/` - API endpoints

### Admin Panel (@yektayar/admin-panel)
- **Port**: 5173
- **Framework**: Vue.js 3
- **Build**: Vite

**Key Files**:
- `src/main.ts` - Entry point
- `src/App.vue` - Root component
- `src/router/` - Routes
- `src/views/` - Pages

### Mobile App (@yektayar/mobile-app)
- **Port**: 8100
- **Framework**: Ionic 7 + Vue.js 3
- **Native**: Capacitor

**Key Files**:
- `src/main.ts` - Entry point
- `src/App.vue` - Root component
- `src/router/` - Routes
- `src/views/` - Pages
- `capacitor.config.json` - Native config

### Shared (@yektayar/shared)
- **Purpose**: Common code
- **Exports**: Types, schemas, utilities, i18n

**Key Files**:
- `src/types/` - TypeScript types
- `src/schemas/` - Zod schemas
- `src/utils/` - Helper functions
- `src/i18n/` - Translations

## 🔧 Configuration

### Environment Variables (Unified .env)

YektaYar uses a **unified `.env` file** at the project root for all packages.

**Quick Setup**:
```bash
# Create .env from template
./scripts/manage-env.sh init

# Edit in interactive TUI mode
./scripts/manage-env.sh edit

# Or edit manually
nano .env

# Validate configuration
./scripts/manage-env.sh validate

# Test configuration (includes database check)
./scripts/manage-env.sh test
```

**Management Script Commands**:
- `init` - Create .env from template
- `show` - Display current configuration (with masked secrets)
- `validate` - Check all required variables are set
- `test` - Test configuration + database connectivity
- `edit` - Interactive TUI mode
- `generate-secret` - Generate secure random secrets

For detailed information, see **[ENV-GUIDE.md](ENV-GUIDE.md)**.

### Backend Environment Variables

The unified `.env` at project root contains:

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/yektayar
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
VITE_API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

**Per-Package Configuration**: Frontend apps (mobile-app, admin-panel) can have their own `.env` files in `packages/{app}/.env` to override root values. This is useful for app-specific settings like `VITE_PROXY_DOMAIN`.

**HMR Auto-Detection**: HMR (Hot Module Replacement) WebSocket now auto-detects the domain from the browser's Host header. This means:
- Accessing via `localhost:8100` → uses `ws://localhost:8100`
- Accessing via `app.yektayar.ir` → uses `wss://app.yektayar.ir:443`
- No manual configuration needed for reverse proxy setups!

Only set `VITE_PROXY_DOMAIN` in `packages/{app}/.env` if you need to override auto-detection.

### Database Setup

```bash
# Create database
createdb yektayar

# TODO: Run migrations when available
```

---

## 🚀 Deployment & Service Management

### Development Mode

Run services in development mode with hot-reload:

```bash
# Run individual service in foreground
./scripts/dev-runner.sh backend
./scripts/dev-runner.sh admin
./scripts/dev-runner.sh mobile

# Run all services in background (detached mode)
./scripts/dev-runner.sh all --detached

# Stop all detached services
./scripts/dev-runner.sh stop

# View logs
tail -f /tmp/yektayar-backend.log
```

### Production Deployment

Install and run services as system services using systemd:

```bash
# 1. Install systemd service files
sudo ./scripts/install-services.sh

# 2. Enable services to start on boot
sudo ./scripts/manage-services.sh enable all

# 3. Start all services
sudo ./scripts/manage-services.sh start all

# 4. Check service status
sudo ./scripts/manage-services.sh status

# 5. View logs
sudo ./scripts/manage-services.sh logs backend
```

### Service Management Commands

```bash
# Start/stop services
sudo ./scripts/manage-services.sh start [backend|admin|mobile|all]
sudo ./scripts/manage-services.sh stop [backend|admin|mobile|all]
sudo ./scripts/manage-services.sh restart [backend|admin|mobile|all]

# Enable/disable auto-start on boot
sudo ./scripts/manage-services.sh enable [backend|admin|mobile|all]
sudo ./scripts/manage-services.sh disable [backend|admin|mobile|all]

# View service status and logs
sudo ./scripts/manage-services.sh status [backend|admin|mobile|all]
sudo ./scripts/manage-services.sh logs [backend|admin|mobile|all]
```

For detailed deployment instructions, see [scripts/README.md](scripts/README.md).

---

## 📋 API Endpoints (Stubs)

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login
- `POST /otp/send` - Send OTP
- `POST /otp/verify` - Verify OTP
- `POST /logout` - Logout
- `GET /session` - Check session

### Users (`/api/users`)
- `GET /` - List users (admin)
- `GET /:id` - Get user
- `PUT /:id` - Update user
- `GET /:id/profile` - Get profile

### Messages (`/api/messages`)
- `GET /threads` - List threads
- `GET /threads/:id` - Get thread
- `POST /threads` - Create thread
- `POST /threads/:id/messages` - Send message
- `POST /chat` - AI chat

### Appointments (`/api/appointments`)
- `GET /` - List appointments
- `POST /` - Create appointment
- `GET /:id` - Get appointment
- `PUT /:id` - Update appointment
- `GET /professionals` - List professionals

### Courses (`/api/courses`)
- `GET /` - List courses
- `GET /:id` - Get course
- `POST /:id/enroll` - Enroll
- `GET /assessments` - List assessments
- `POST /assessments/:id/submit` - Submit

---

## 🌐 Internationalization

### Supported Languages
- **Persian (Farsi)** - Primary (`fa`)
- **English** - Secondary (`en`)

### Translation Files
- Shared: `packages/shared/src/i18n/translations.json`
- Admin: Inline in components
- Mobile: Inline in components

### RTL Support
- Automatic based on locale
- `dir="rtl"` for Persian
- `dir="ltr"` for English

---

## 🔐 Security

### Completed
- ✅ CodeQL security scanning
- ✅ Fixed ReDoS vulnerability
- ✅ Input sanitization (basic)
- ✅ Environment variable template

### TODO
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] SQL injection prevention (parameterized queries)
- [ ] Password hashing (bcrypt)
- [ ] Session security
- [ ] HTTPS in production

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Project overview and quick start |
| **DEVELOPMENT.md** | Detailed development guide |
| **ROADMAP.md** | Implementation plan and roadmap |
| **THIS FILE** | Quick reference |
| **docs-archive/** | Original Spark documentation (reference) |

---

## 🎯 Current Status

### ✅ Completed
- Mono repo structure
- All packages scaffolded
- API routes defined (stubs)
- Basic UI views
- Documentation complete
- Security verified

### 🚧 In Progress
- Nothing (ready to start implementation)

### 📋 Next Steps
1. Setup PostgreSQL database
2. Implement authentication system
3. Implement user management
4. Implement messaging system
5. See ROADMAP.md for full plan

---

## 🐛 Common Issues & Solutions

### Issue: Bun not installed
**Solution**: `curl -fsSL https://bun.sh/install | bash`

### Issue: PostgreSQL not running
**Solution**: 
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Issue: Port already in use
**Solution**: Change port in .env or kill the process

**Note**: If you see "EADDRINUSE" error when running backend directly with `bun src/index.ts`, this is expected behavior when the server code calls `.listen()` explicitly. The backend is now configured to work with Bun's automatic serving. Use `npm run dev` or `PORT=xxxx bun src/index.ts` instead.

### Issue: Dependencies not installing
**Solution**: 
```bash
npm run clean
npm install
```

---

## 💡 Development Tips

### Hot Reload
- Backend: `bun --watch` (automatic)
- Admin Panel: Vite HMR (automatic)
- Mobile App: Vite HMR (automatic)

### Debugging
- Backend: Use `console.log` or VS Code debugger
- Frontend: Use Vue DevTools browser extension
- Mobile: Chrome DevTools for web, native debuggers for mobile

### Testing API
- Use Swagger UI at http://localhost:3000/swagger
- Or use Postman/Insomnia

### Code Style
- TypeScript for type safety
- ESLint for linting (warnings only for prototype)
- Async/await for async operations
- Small, focused functions

---

## 🤝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: description"

# Push
git push origin feature/my-feature

# Create PR on GitHub
```

### Commit Message Format
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Update existing
- `Remove:` Remove code
- `Refactor:` Code refactor
- `Docs:` Documentation
- `Security:` Security fix

---

## 📞 Support & Resources

### Documentation
- [Elysia.js](https://elysiajs.com/)
- [Vue.js](https://vuejs.org/)
- [Ionic](https://ionicframework.com/docs)
- [Capacitor](https://capacitorjs.com/docs)
- [Pinia](https://pinia.vuejs.org/)
- [Zod](https://zod.dev/)

### Repository
- **GitHub**: https://github.com/atomicdeploy/yektayar
- **Issues**: Use GitHub Issues
- **Discussions**: Use GitHub Discussions

---

## 🎉 Project Goals

### Short-term (5 weeks)
- Complete all core features
- Functional prototype ready for demo
- All user flows working
- Professional UI/UX

### Long-term (Post-MVP)
- Production deployment
- Real external service integrations
- Advanced features
- Performance optimization
- User testing and feedback

---

**Need help?** Check DEVELOPMENT.md for detailed guides or create a GitHub issue.

**Ready to code?** Start with ROADMAP.md Priority 1: Authentication System!
