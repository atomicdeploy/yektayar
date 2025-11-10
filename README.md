# YektaCare - Mental Health Care Platform

**Version:** 0.1.0 (Prototype/MVP)  
**Timeline:** 5-day sprint  
**Status:** 📋 Planning Complete - Ready to Start

## 🚀 Quick Start for Developers

**👉 [START HERE - Developer Quick Start Guide](./START-HERE.md)** 

New to the project? Read the documentation in this order:
1. **[START-HERE.md](./START-HERE.md)** - Your command center
2. **[PROTOTYPE-vs-PRODUCTION.md](./PROTOTYPE-vs-PRODUCTION.md)** - Critical context ⚠️
3. **[TASKS.md](./TASKS.md)** - Your daily task guide 📋
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive
5. **[SETUP.md](./SETUP.md)** - Setup guide (for future production)
6. **[ROADMAP.md](./ROADMAP.md)** - Feature roadmap

---

## 🎯 Project Overview

YektaCare is a mental health care platform connecting users with AI-powered support, professional psychologists, educational content, and appointment booking services.

### Core Value Proposition
Users can chat with AI to explain their mental health concerns, receive personalized educational content based on psychological assessments, book appointments with professionals, and access mental health resources - all in Persian (primary) and English (secondary).

### What This Is
This is a **UI/UX prototype** built in a browser-based React environment (GitHub Spark). It demonstrates the complete user experience with mock data and simulated interactions. It does NOT include a real backend, database, or server-side functionality.

---

## ⚠️ CRITICAL: Current Environment Limitations

This Spark template is a **browser-based React runtime** with key-value storage. It is **NOT** a full-stack Node.js environment. This prototype demonstrates:

- ✅ UI/UX flows and design system
- ✅ Client-side state management and routing
- ✅ Mock AI chat interactions
- ✅ Appointment booking interfaces
- ✅ Dashboard and admin panel layouts
- ✅ PWA capabilities (installable, offline-ready)
- ✅ Real-time-like interactions (simulated)

This prototype **DOES NOT** include:
- ❌ Real backend server (Node.js/Elysia/AdonisJS)
- ❌ Database (PostgreSQL/MySQL)
- ❌ Real authentication/sessions
- ❌ Payment processing
- ❌ SMS/Email sending
- ❌ WebSocket server

**Next Step:** Use this prototype to validate UX/UI, then build the actual backend stack separately.

---

## 📋 5-Day Prototype Scope (MVP-MVP)

### Day 1-2: Core UI Foundation
- [ ] Design system setup (colors, typography, RTL support)
- [ ] Authentication screens (login, register, OTP mock)
- [ ] Main navigation structure
- [ ] Dashboard layout (user + admin views)
- [ ] Persian/English i18n setup

### Day 3: Key Features - Part 1
- [ ] AI Chat interface with mock responses
- [ ] User profile with gradual data collection
- [ ] Psychological assessment form (mock)
- [ ] Results display

### Day 4: Key Features - Part 2
- [ ] Appointment booking interface
- [ ] Professional profiles listing
- [ ] Messaging/ticketing center (unified)
- [ ] Educational content browser

### Day 5: Polish & PWA
- [ ] Animations and transitions
- [ ] Loading states and error handling
- [ ] PWA manifest and icons
- [ ] Pattern lock screen
- [ ] Dark/Light mode
- [ ] Final testing

---

## 🏗️ Architecture (Prototype)

```
YektaCare/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Register, OTP
│   │   ├── chat/           # AI Chat, Messaging
│   │   ├── dashboard/      # Admin & User dashboards
│   │   ├── appointments/   # Booking interface
│   │   ├── courses/        # Educational content
│   │   ├── profiles/       # User/Professional profiles
│   │   └── common/         # Shared components
│   ├── hooks/
│   │   ├── useAuth.ts      # Auth state management
│   │   ├── useChat.ts      # Chat functionality
│   │   └── useI18n.ts      # Internationalization
│   ├── lib/
│   │   ├── mock-data.ts    # Sample data
│   │   ├── ai-mock.ts      # Mock AI responses
│   │   └── persian-date.ts # Jalali calendar utils
│   ├── types/
│   │   └── index.ts        # TypeScript definitions
│   └── i18n/
│       ├── fa.json         # Persian translations
│       └── en.json         # English translations
└── docs/
    ├── SETUP.md            # Development setup
    ├── ARCHITECTURE.md     # Technical architecture
    ├── DEPLOYMENT.md       # Deployment guide
    └── ROADMAP.md          # Future features
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome/Firefox/Edge)
- Code editor (VS Code recommended)

### Run Locally
```bash
# The Spark environment auto-installs dependencies
# Just refresh the browser to see changes
# No build process needed for development
```

### Key Technologies
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React hooks + useKV (persistent storage)
- **Icons:** Phosphor Icons
- **Animations:** Framer Motion
- **i18n:** Custom lightweight solution

---

## 🎨 Design System

### Colors (Light Mode Primary)
- Primary: Blue-based for trust and calm
- Secondary: Soft teal for healthcare
- Accent: Warm orange for CTAs
- Success: Green
- Warning: Amber
- Destructive: Red (minimal use)

### Typography
- Primary Font: **Vazirmatn** (Persian) / **Inter** (English)
- Clear hierarchy: H1-H6, body, caption
- RTL-first design with LTR support

### Key Principles
- Clean, modern, professional
- Accessibility (WCAG AA minimum)
- Mobile-first responsive design
- Smooth animations (subtle, purposeful)
- Dark mode support

---

## 🔑 Key Features (Prototype)

### 1. Authentication System (Mock)
- Email + Phone number registration
- OTP verification (simulated)
- Optional password
- Session management (localStorage)
- Pattern lock screen

### 2. AI Chat Support
- Conversational interface
- Mock AI responses based on keywords
- Chat history persistence
- Typing indicators
- Support for Persian/English

### 3. Dashboard
**User View:**
- Upcoming appointments
- Recent messages
- Recommended courses
- Progress tracking

**Admin View:**
- User activity monitoring
- Appointment management
- Message moderation
- Analytics overview

### 4. Appointment Booking
- Professional directory
- Availability calendar (mock)
- Booking confirmation
- Appointment history

### 5. Unified Messaging System
- Chat with professionals
- Ticketing/support requests
- System notifications
- Message categories (departments)
- Multi-participant support

### 6. Educational Content
- Course browsing
- Video content (mock)
- Progress tracking
- Recommendations based on assessments

### 7. Psychological Assessment
- Question forms
- Personality type results
- Customized recommendations

---

## 🌐 Internationalization (i18n)

### Supported Languages
1. **Persian (Farsi)** - Primary
2. **English** - Secondary

### Implementation
```typescript
// Simple hook-based approach
const { t, locale, setLocale } = useI18n()

// Usage
<h1>{t('welcome.title')}</h1>
```

### Date/Time
- Jalali (Persian) calendar for Persian locale
- Gregorian calendar for English locale
- Timezone: Asia/Tehran (default, configurable)

---

## 📱 PWA Features

- ✅ Installable on mobile/desktop
- ✅ Offline capability (limited)
- ✅ Splash screen with logo
- ✅ App icons (multiple sizes)
- ✅ Push notification support (UI only)
- ✅ Pattern lock for security

---

## 🔐 Security Considerations (Prototype)

**Note:** This prototype uses CLIENT-SIDE ONLY storage and authentication. NOT suitable for production.

For production, implement:
- Server-side session management
- Secure token handling (JWT/Opaque)
- HTTPS only
- CSRF protection
- Rate limiting
- SQL injection prevention (parameterized queries)
- Input validation and sanitization
- Secure password hashing (bcrypt/argon2)

---

## 📊 Data Model (Conceptual)

### Users Table
```typescript
{
  id: string
  identifiers: { email?: string[], phone?: string[] }
  profile: { name, avatar, birthdate, ... }
  type: 'patient' | 'psychologist' | 'admin'
  permissions: string[]
  createdAt: Date
  lastLoginAt: Date
}
```

### Sessions Table
```typescript
{
  token: string (opaque)
  userId?: string
  isLoggedIn: boolean
  metadata: { ip, userAgent, ... }
  expiresAt: Date
}
```

### Messages Table
```typescript
{
  id: string
  threadId: string
  participants: string[]
  category: string
  status: 'open' | 'closed'
  messages: Array<{
    senderId: string
    content: string
    timestamp: Date
  }>
}
```

### Appointments Table
```typescript
{
  id: string
  patientId: string
  psychologistId: string
  scheduledAt: Date
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}
```

---

## 🛠️ Development Workflow

### Branching Strategy (Prototype)
- `main` - production-ready code
- Direct commits for rapid prototyping
- Feature branches if needed: `feature/chat-ui`, `feature/booking`

### Code Style
- ESLint warnings only (not blocking)
- Prettier for formatting (optional)
- TypeScript strict mode: OFF (for speed)

### Testing
- Manual testing only for prototype
- Unit tests: Deferred to post-MVP
- E2E tests: Deferred to post-MVP

---

## 🚢 Deployment (Future - Not This Prototype)

### Infrastructure Requirements
- **Server:** VPS (Ubuntu 22.04 LTS recommended)
- **Web Server:** Apache + PM2/PM2-runtime
- **Database:** PostgreSQL 15+ or MySQL 8+
- **Cache:** Redis (when needed)
- **Queue:** Defer until needed

### Environment Variables (.env)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/yektacare
SESSION_SECRET=<secure-random-string>
JWT_SECRET=<secure-random-string>
```

Dynamic configuration stored in database `config` table.

### Build & Deploy
```bash
# Backend (future)
npm run build
pm2 start dist/server.js --name yektacare

# Frontend (future)
npm run build
# Serve from Apache with proper routing
```

---

## 📖 Documentation Structure

- **README.md** (this file) - Overview and quick start
- **SETUP.md** - Detailed setup instructions
- **ARCHITECTURE.md** - Technical deep dive (future backend)
- **ROADMAP.md** - Feature roadmap and deferred items
- **API.md** - API documentation (future)

---

## 🗺️ Roadmap (Post-Prototype)

### Phase 1: Backend Foundation (Weeks 1-2)
- Choose framework: Elysia.js (Bun) or AdonisJS
- Setup PostgreSQL with proper schema
- Implement authentication (session-based)
- REST API endpoints
- WebSocket server for real-time

### Phase 2: Core Features (Weeks 3-4)
- Real AI integration (Pollination AI or similar)
- Email/SMS gateway integration
- Payment gateway (IPG/POS)
- File upload/storage
- Admin panel functionality

### Phase 3: Enhancement (Weeks 5-6)
- Role-based access control (RBAC)
- Attribute-based access control (ABAC) where needed
- Advanced analytics
- Export/import functionality
- Logging and monitoring

### Phase 4: Optimization (Weeks 7-8)
- Redis caching layer
- Database query optimization
- CDN integration (Cloudflare/ArvanCloud)
- Performance tuning
- Load testing

### Deferred to Future Phases
- Multi-tenancy (row-level)
- Plugin architecture
- Marketplace
- Advanced ML features
- Public API documentation portal
- Automated testing suite
- CI/CD pipeline (GitHub Actions)
- Backup/disaster recovery automation
- Feature flags
- Data retention policies
- Legal/compliance features (GDPR-equivalent)
- User data deletion workflows
- Changelog automation
- Dependabot integration
- Migration tools
- Duplicate user merging
- Impersonation feature
- Full offline mode

---

## 🤝 Contributing

This is a proprietary project in prototype phase. Contributions limited to core team only.

Future: Parts of the codebase (public API clients, SDKs) will be open-sourced.

---

## 📞 Support & Contact

- **Issue Tracking:** GitHub Issues
- **Project Management:** GitHub Projects
- **Code Repository:** GitHub

---

## 📜 License

Proprietary - All Rights Reserved (for now)

Future: Gradual open-sourcing of non-core components under MIT/Apache-2.0.

---

## ⚡ Quick Development Tips

1. **Don't Over-Engineer:** This is a prototype, not production
2. **Mock Everything:** AI, payments, emails, SMS - all mocked
3. **Focus on UX:** The goal is to validate user flows
4. **Use Real Design:** Make it look professional even if backend is fake
5. **Document Assumptions:** Note what's real vs. mocked
6. **Keep It Simple:** Avoid premature optimization
7. **RTL First:** Design for Persian, adapt for English
8. **Mobile First:** Most users will be on phones

---

**Last Updated:** {DATE}  
**Maintained By:** Solo Developer  
**Next Review:** After prototype completion
