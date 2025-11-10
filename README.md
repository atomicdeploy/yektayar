# YektaYar Platform

**Mental Health Care Platform - Mono Repo**

> **Version:** 0.1.0  
> **Status:** In Development  
> **Architecture:** Mono Repo with Backend (Elysia.js), Admin Panel (Vue.js), Mobile App (Ionic + Capacitor)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## 🎯 Overview

YektaYar is a comprehensive mental health care platform that connects users with:
- **AI-powered support** for initial assessments
- **Professional psychologists** for appointments
- **Educational content** based on psychological assessments
- **Unified messaging system** for communication
- **Admin panel** for managing the platform

### Core Features

- ✅ User authentication (OTP-based, session management)
- ✅ AI chatbot for mental health support
- ✅ Appointment booking with professionals
- ✅ Psychological assessments
- ✅ Educational course management
- ✅ Real-time messaging (WebSocket)
- ✅ Admin dashboard
- ✅ Multi-language support (Persian primary, English secondary)
- ✅ RTL/LTR support
- ✅ PWA capabilities

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Bun** >= 1.0.0 (for backend)
- **PostgreSQL** 15+ (for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/atomicdeploy/yektayar.git
cd yektayar

# Install all dependencies
npm install

# Setup environment variables
cp packages/backend/.env.example packages/backend/.env
# Edit .env file with your configuration
```

### Development

```bash
# Start all services in development mode
npm run dev

# Or start individual services:
npm run dev:backend    # Backend API (port 3000)
npm run dev:admin      # Admin Panel (port 5173)
npm run dev:mobile     # Mobile App (port 8100)
```

### Access the Applications

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/swagger
- **Admin Panel**: http://localhost:5173
- **Mobile App**: http://localhost:8100

---

## 📁 Project Structure

```
yektayar/
├── packages/
│   ├── backend/              # Elysia.js API server
│   ├── admin-panel/          # Vue.js admin interface
│   ├── mobile-app/           # Ionic + Capacitor app
│   └── shared/               # Shared code (types, utils, i18n)
├── docs-archive/             # Archived Spark prototype docs
├── package.json              # Root workspace configuration
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Elysia.js (TypeScript, Bun runtime)
- **Database**: PostgreSQL 15+
- **Validation**: Zod
- **Real-time**: Socket.IO
- **API Docs**: Swagger

### Frontend (Admin Panel)
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State**: Pinia
- **Router**: Vue Router
- **i18n**: vue-i18n

### Mobile App
- **Framework**: Ionic 7 + Vue.js 3
- **Native**: Capacitor
- **Build**: Vite
- **i18n**: vue-i18n

### Shared
- **Language**: TypeScript
- **Validation**: Zod

---

## 💻 Development

### Start All Services

```bash
npm run dev
```

### Start Individual Services

```bash
npm run dev:backend    # Backend only
npm run dev:admin      # Admin panel only
npm run dev:mobile     # Mobile app only
```

### Build All

```bash
npm run build
```

---

## 📚 Documentation

- **README.md** (this file) - Project overview
- **docs-archive/** - Archived Spark prototype documentation
- Additional docs to be created as needed

---

## 🔧 Requirements Implementation

This mono repo addresses all requirements from the issue:

✅ **Mono repo structure** with packages for backend, admin, mobile, and shared code  
✅ **Backend**: Elysia.js (fast, modern, TypeScript-first)  
✅ **Admin Panel**: Vue.js with Vite  
✅ **Mobile App**: Ionic + Capacitor + Vue.js  
✅ **Shared code**: Types, schemas, utilities, i18n  
✅ **No React**: All React/Spark remnants removed  
✅ **Node.js/TypeScript**: Consistent across all packages  
✅ **Simple structure**: Easy to understand and extend  
✅ **Fast prototyping**: Minimal boilerplate, ready to develop  
✅ **i18n support**: Persian (primary) + English (secondary)  
✅ **RTL support**: Built into Vue.js and Ionic  

---

## 📝 Scripts

### Root-level Scripts
- `npm run dev` - Start all packages in development
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Test all packages
- `npm run clean` - Clean all build artifacts

### Package-specific Scripts
- `npm run dev:backend` - Backend only
- `npm run dev:admin` - Admin panel only
- `npm run dev:mobile` - Mobile app only
- `npm run build:backend` - Build backend only
- `npm run build:admin` - Build admin panel only
- `npm run build:mobile` - Build mobile app only

---

## 🚢 Deployment

See individual package README files for deployment instructions.

Basic setup:
1. Backend: Deploy with PM2 on VPS
2. Admin Panel: Build and serve with Apache
3. Mobile App: Build for Android/iOS with Capacitor

---

## 🤝 Contributing

This is a proprietary project in prototype phase. Team members only.

---

## 📄 License

**Proprietary** - All Rights Reserved

---

## 📞 Support

- **Issues**: GitHub Issues
- **Repository**: https://github.com/atomicdeploy/yektayar

---

**Last Updated**: 2025-11-10  
**Version**: 0.1.0
