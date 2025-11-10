# YektaCare Platform - Quick Reference

**Version**: 0.1.0  
**Status**: ✅ Mono repo structure complete, ready for implementation  
**Last Updated**: 2025-11-10

---

## 📁 Repository Structure

```
yektacare-spark/
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

### Backend (@yektacare/backend)
- **Port**: 3000
- **Framework**: Elysia.js
- **Runtime**: Bun
- **Config**: packages/backend/.env

**Key Files**:
- `src/index.ts` - Entry point
- `src/routes/` - API endpoints
- `.env.example` - Config template

### Admin Panel (@yektacare/admin-panel)
- **Port**: 5173
- **Framework**: Vue.js 3
- **Build**: Vite

**Key Files**:
- `src/main.ts` - Entry point
- `src/App.vue` - Root component
- `src/router/` - Routes
- `src/views/` - Pages

### Mobile App (@yektacare/mobile-app)
- **Port**: 8100
- **Framework**: Ionic 7 + Vue.js 3
- **Native**: Capacitor

**Key Files**:
- `src/main.ts` - Entry point
- `src/App.vue` - Root component
- `src/router/` - Routes
- `src/views/` - Pages
- `capacitor.config.json` - Native config

### Shared (@yektacare/shared)
- **Purpose**: Common code
- **Exports**: Types, schemas, utilities, i18n

**Key Files**:
- `src/types/` - TypeScript types
- `src/schemas/` - Zod schemas
- `src/utils/` - Helper functions
- `src/i18n/` - Translations

---

## 🔧 Configuration

### Backend Environment Variables

Create `packages/backend/.env` from `.env.example`:

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/yektacare
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:8100
```

### Database Setup

```bash
# Create database
createdb yektacare

# TODO: Run migrations when available
```

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
- **GitHub**: https://github.com/atomicdeploy/yektacare-spark
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
