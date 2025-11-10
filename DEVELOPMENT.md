# YektaCare - Development Guide

This document provides detailed information for developers working on the YektaCare platform.

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
   git clone https://github.com/atomicdeploy/yektacare-spark.git
   cd yektacare-spark
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
   createdb yektacare
   
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
import { User, UserType, userSchema } from '@yektacare/shared'

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

---

## 📖 API Documentation

### Access Swagger UI

When backend is running: http://localhost:3000/swagger

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
npm test -w @yektacare/backend
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

## 📚 Additional Resources

- [Elysia.js Documentation](https://elysiajs.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Zod Documentation](https://zod.dev/)

---

**Happy Coding!** 🚀
