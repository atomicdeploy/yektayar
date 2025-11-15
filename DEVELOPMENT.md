# YektaYar - Development Guide

This document provides detailed information for developers working on the YektaYar platform.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Architecture](#project-architecture)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Mobile App Development](#mobile-app-development)
7. [Shared Package](#shared-package)
8. [Database](#database)
9. [API Documentation](#api-documentation)
10. [Testing](#testing)
11. [Debugging](#debugging)
12. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/atomicdeploy/yektayar.git
   cd yektayar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   # Edit packages/backend/.env with your configuration
   ```

4. **Setup database**
   ```bash
   # Install PostgreSQL if not already installed
   # Create database
   createdb yektayar
   
   # TODO: Run migrations when available
   ```

5. **Start development servers**
   ```bash
   # All services
   npm run dev
   
   # Or individually
   npm run dev:backend
   npm run dev:admin
   npm run dev:mobile
   ```

---

## 💻 Development Environment

### Required Tools

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Bun**: >= 1.0.0 (for backend runtime)
- **PostgreSQL**: >= 15.0
- **Git**: Latest version

### Recommended Tools

- **VS Code**: With extensions:
  - Volar (Vue.js support)
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - PostgreSQL

- **Database Tools**:
  - pgAdmin 4
  - DBeaver
  - TablePlus

- **API Testing**:
  - Postman
  - Insomnia
  - REST Client (VS Code extension)

### Install Bun

```bash
# macOS, Linux, WSL
curl -fsSL https://bun.sh/install | bash

# Or use npm
npm install -g bun
```

---

## 🏗️ Project Architecture

### Mono Repo Structure

```
packages/
├── backend/         # Elysia.js API server
├── admin-panel/     # Vue.js admin interface
├── mobile-app/      # Ionic + Capacitor mobile app
└── shared/          # Shared types, schemas, utilities
```

### Technology Decisions

- **Backend Framework**: Elysia.js
  - Fast (built on Bun)
  - TypeScript-first
  - Great DX
  - Easy to learn

- **Frontend Framework**: Vue.js 3
  - Simpler than React
  - Better i18n support
  - Good RTL support
  - Composition API

- **Mobile Framework**: Ionic + Capacitor
  - Vue.js compatible
  - Native capabilities
  - Cross-platform
  - PWA support

---

## 🔧 Backend Development

### Directory Structure

```
packages/backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── messages.ts
│   │   ├── appointments.ts
│   │   └── courses.ts
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── index.ts         # Main entry point
├── .env.example
├── package.json
└── tsconfig.json
```

### Running Backend

```bash
cd packages/backend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Adding New Routes

1. Create a new file in `src/routes/`
2. Define routes using Elysia
3. Import and use in `src/index.ts`

Example:
```typescript
// src/routes/example.ts
import { Elysia } from 'elysia'

export const exampleRoutes = new Elysia({ prefix: '/api/example' })
  .get('/', () => ({ message: 'Example route' }))
  .post('/', ({ body }) => ({ success: true, data: body }))

// src/index.ts
import { exampleRoutes } from './routes/example'
app.use(exampleRoutes)
```

### Database Connection

```typescript
// TODO: Add database connection setup
// Example with postgres.js:
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)
```

---

## 🎨 Frontend Development (Admin Panel)

### Directory Structure

```
packages/admin-panel/
├── src/
│   ├── components/      # Reusable components
│   ├── views/           # Page components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── composables/     # Composition API composables
│   ├── types/           # TypeScript types
│   ├── assets/          # Static assets
│   ├── App.vue          # Root component
│   └── main.ts          # Entry point
├── index.html
├── vite.config.ts
└── package.json
```

### Running Admin Panel

```bash
cd packages/admin-panel

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Creating Components

```vue
<!-- src/components/ExampleComponent.vue -->
<template>
  <div class="example">
    <h1>{{ t('title') }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = ref('Hello World')
</script>

<style scoped>
.example {
  padding: 1rem;
}
</style>
```

### State Management (Pinia)

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoggedIn = ref(false)

  function login(userData: any) {
    user.value = userData
    isLoggedIn.value = true
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, logout }
})
```

---

## 📱 Mobile App Development

### Directory Structure

```
packages/mobile-app/
├── src/
│   ├── views/           # Ionic pages
│   ├── components/      # Ionic components
│   ├── router/          # Ionic Router
│   ├── stores/          # Pinia stores
│   ├── theme/           # Theme variables
│   ├── App.vue
│   └── main.ts
├── capacitor.config.json
├── vite.config.ts
└── package.json
```

### Running Mobile App

```bash
cd packages/mobile-app

# Web development server
npm run dev

# Build for mobile
npm run build

# Android
ionic capacitor run android

# iOS (macOS only)
ionic capacitor run ios
```

### Creating Ionic Pages

```vue
<!-- src/views/ExamplePage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('title') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="container">
        <h1>Example Page</h1>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

---

## 📦 Shared Package

### Purpose

The shared package contains code used by multiple packages:
- TypeScript types
- Validation schemas (Zod)
- Utility functions
- i18n translations

### Usage

```typescript
// In backend, admin-panel, or mobile-app
import { User, UserType, userSchema } from '@yektayar/shared'

const user: User = {
  id: '123',
  name: 'John Doe',
  type: UserType.PATIENT,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Validate
userSchema.parse(user)
```

### Building Shared Package

```bash
cd packages/shared

# Build once
npm run build

# Watch for changes
npm run dev
```

---

## 🗄️ Database

### Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('patient', 'psychologist', 'admin')),
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_logged_in BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- More tables to be defined...
```

### Migrations

```bash
# TODO: Setup migration tool (e.g., node-pg-migrate)
# For now, run SQL scripts manually
```

### Database CLI Access

To quickly connect to the database using credentials from your `.env` file:

```bash
npm run db:cli
```

This command will:
1. Load database credentials from the unified `.env` file in the project root
2. Launch `pgcli` if available (recommended for better experience)
3. Fall back to `psql` if `pgcli` is not installed

**Install pgcli for enhanced features:**
```bash
pip install pgcli
```

**Direct connection (alternative):**
```bash
# Using psql
psql -h localhost -U yektayar_user -d yektayar

# Using pgcli
pgcli -h localhost -U yektayar_user -d yektayar
```

---

## 📖 API Documentation

### Access API Documentation

When backend is running: http://localhost:3000/api-docs

**Note**: The API documentation is protected with Basic Authentication. Use the credentials defined in your `.env` file:
- Username: Set via `SWAGGER_USERNAME` environment variable (default: `admin`)
- Password: Set via `SWAGGER_PASSWORD` environment variable

When prompted by your browser, enter these credentials to access the documentation.

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session

#### Users
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/profile` - Get user profile

#### Messages
- `GET /api/messages/threads` - List threads
- `GET /api/messages/threads/:id` - Get thread
- `POST /api/messages/threads` - Create thread
- `POST /api/messages/threads/:id/messages` - Send message
- `POST /api/messages/chat` - AI chat

#### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment
- `PUT /api/appointments/:id` - Update appointment
- `GET /api/appointments/professionals` - List professionals

#### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/assessments` - List assessments
- `POST /api/courses/assessments/:id/submit` - Submit assessment

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -w @yektayar/backend
```

*Note: Tests not yet implemented in prototype phase.*

### Manual Testing

Use the Swagger UI or tools like Postman to test API endpoints.

---

## 🐛 Debugging

### Backend Debugging

```bash
# Enable debug logs
DEBUG=* npm run dev
```

### Frontend Debugging

Use Vue DevTools browser extension:
- Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

---

## ✅ Best Practices

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use async/await for async operations
- Keep functions small and focused
- Write descriptive variable names

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Add: my feature description"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

### Commit Messages

Format: `Type: Description`

Types:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Update existing feature
- `Remove:` Remove code/feature
- `Refactor:` Code refactoring
- `Docs:` Documentation changes

### Security

- Never commit `.env` files
- Use environment variables for secrets
- Validate all user input
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production

---

## 📋 Prototype Sprint Guide (5-Day MVP)

If building a rapid prototype/MVP, use this detailed task breakdown:

### Project Status Tracking

**Current Phase:** Prototype Sprint (Days 1-5)  
**Overall Progress:** Track against milestones

**Key Milestones:**
1. Theme and i18n working (End of Day 1)
2. User can navigate through app (End of Day 2)
3. Chat functionality complete (End of Day 3)
4. Booking and assessment flows complete (End of Day 4)
5. Prototype complete and polished (End of Day 5)

### Day 1: Foundation & Design System (8 hours)

**Morning Session (4 hours):**
- Setup Base Theme (1.5 hours)
  - Define color palette (blue/teal healthcare theme)
  - Configure Tailwind theme
  - Setup dark/light mode variables
  - Test theme switching

- Typography & Fonts (1 hour)
  - Add Vazirmatn font (Persian)
  - Add Inter font (English)
  - Define typography scale
  - Test RTL rendering

- i18n System (1.5 hours)
  - Create i18n utility
  - Persian translations
  - English translations
  - Language switching hook

**Afternoon Session (4 hours):**
- Base Layout Components (2 hours)
  - AppShell component
  - Header with language/theme toggles
  - BottomNav (mobile)
  - Sidebar (desktop)
  - Responsive breakpoints

- PWA Setup (1.5 hours)
  - PWA manifest
  - App icons
  - Splash screen
  - Meta tags
  - Test "Add to Home Screen"

- Integration (0.5 hours)
  - Theme provider
  - i18n provider
  - Basic routing
  - Splash screen on first load

**Deliverables:** Working theme switcher, language switcher, RTL/LTR switching, professional typography, installable PWA, base layout

### Day 2: Authentication & Navigation (8 hours)

**Morning Session:**
- Auth data layer with mock user types
- Login screen with email/phone input
- Register screen with multi-step form
- Form validation and error handling

**Afternoon Session:**
- OTP verification screen
- Pattern lock (3x3 grid)
- Main navigation (bottom nav + sidebar)
- User profile screen
- Admin panel layout
- Role-based UI rendering

**Deliverables:** Complete auth flow (mocked), navigation, pattern lock, different views per user type

### Day 3: AI Chat & Messaging (8 hours)

**Tasks:**
- Chat interface component
- Message bubbles (sent/received)
- Typing indicator
- Mock AI response generator
- Chat history persistence
- Unified messaging center
- Message categories/departments
- Thread management
- Multi-participant UI

**Deliverables:** Working AI chat with mock responses, messaging center, chat persistence

### Day 4: Appointments & Assessments (8 hours)

**Tasks:**
- Professional directory
- Professional profiles
- Appointment booking interface
- Calendar (Jalali + Gregorian)
- Time slot selection
- Booking confirmation
- Psychological assessment form
- Results display
- Personality type visualization
- Course recommendations

**Deliverables:** End-to-end booking flow, assessment completion, results visualization, dual calendar system

### Day 5: Dashboard, Courses & Polish (8-10 hours)

**Tasks:**
- User dashboard (appointments, messages, progress)
- Admin dashboard (activity, stats, monitoring)
- Course browser
- Course detail pages
- Progress tracking UI
- Course enrollment
- Admin user profile viewer
- Admin secret notes feature
- Loading states and skeletons
- Error handling and empty states
- Page transitions (Framer Motion)
- Animation polish
- Responsive design fixes
- Final testing (mobile/desktop/tablet)
- Performance optimization
- Accessibility audit (basic)

**Deliverables:** Complete user journey, complete admin journey, polished animations, professional look, working PWA

### Feature Completion Checklist

**Core Features:**
- [ ] Authentication System (Mock)
- [ ] AI Chat Interface
- [ ] Messaging System
- [ ] Appointment Booking
- [ ] Psychological Assessment
- [ ] Educational Courses
- [ ] User Dashboard
- [ ] Admin Dashboard

**Technical Features:**
- [ ] PWA Support
- [ ] Dark/Light Mode
- [ ] Persian/English i18n
- [ ] RTL/LTR Support
- [ ] Pattern Lock
- [ ] Data Persistence

**Polish Features:**
- [ ] Animations
- [ ] Loading States
- [ ] Error Handling
- [ ] Empty States
- [ ] Responsive Design

### Development Tips for Prototype

**For Speed:**
1. Use shadcn components - Don't build from scratch
2. Copy and adapt - Similar components can share code
3. Mock smartly - Create reusable mock data
4. Don't overthink - This is a prototype
5. Skip perfection - Good enough is good enough

**For Quality:**
1. Test on mobile - Use browser dev tools
2. Test RTL - Switch to Persian frequently
3. Test dark mode - Toggle often
4. Check console - No errors
5. User perspective - Think like a patient

**Time Management:**
- Set timer for each task
- Take breaks every 2 hours
- If stuck > 30 min, simplify or skip
- End each day by updating progress

---

## 📚 Additional Resources

- [Elysia.js Documentation](https://elysiajs.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Zod Documentation](https://zod.dev/)

---

**Happy Coding!** 🚀
