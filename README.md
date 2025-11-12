# YektaYar Platform

<div align="center">
  <img src="assets/logo/logo.svg" alt="YektaYar Logo" width="150" />
</div>

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
- ✅ Telegram bot integration (admin notifications & user communication)

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

# Setup environment variables (unified .env for all packages)
./scripts/manage-env.sh init
# Then edit .env with your configuration, or use interactive mode:
./scripts/manage-env.sh edit
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
├── docs/                     # Complete documentation
│   ├── INDEX.md             # Documentation hub
│   ├── GETTING-STARTED.md   # Developer onboarding
│   ├── ARCHITECTURE.md      # System architecture
│   ├── SETUP.md             # Setup guide
│   └── ...                  # Additional guides
├── package.json              # Root workspace configuration
├── ROADMAP.md                # Implementation roadmap
├── DEVELOPMENT.md            # Development guide
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

### Build Mobile App (Android APK)

```bash
cd packages/mobile-app
npm run build:production    # Build web assets
npm run cap:sync            # Sync with Android project
npm run android:build:debug # Build debug APK
```

For detailed instructions on building Android APKs, see **[packages/mobile-app/BUILD_APK.md](packages/mobile-app/BUILD_APK.md)**.

---

## 📚 Documentation

> **📖 Complete Documentation**: Visit **[docs/INDEX.md](docs/INDEX.md)** for the complete documentation hub with guided reading paths.

### Quick Links

#### Getting Started
- **[Quick Start Guide](QUICK-START.md)** - Fast setup for the monorepo
- **[Getting Started Guide](docs/GETTING-STARTED.md)** - Comprehensive developer onboarding
- **[Development Guide](DEVELOPMENT.md)** - Detailed development practices
- **[Quick Reference](docs/QUICK-REFERENCE.md)** - Code snippets and daily checklist

#### Architecture & Planning
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Complete system architecture with prototype/production phases
- **[Implementation Roadmap](ROADMAP.md)** - Production roadmap with prototype sprint reference

#### Setup & Deployment
- **[Environment Configuration Guide](ENV-GUIDE.md)** - Complete .env management and configuration guide
- **[Setup Guide](docs/SETUP.md)** - Complete setup for all phases
- **[Ubuntu 24.04 Deployment](docs/UBUNTU-24-DEPLOYMENT.md)** - VPS deployment guide
- **[Network Configuration](docs/NETWORK-CONFIGURATION.md)** - Port and interface configuration
- **[Bun vs NPM](docs/BUN-VS-NPM.md)** - Runtime comparison guide

#### Additional Resources
- **[Requirements Review](docs/REQUIREMENTS-REVIEW.md)** - Comprehensive requirements analysis
- **[Security Policy](SECURITY.md)** - Security practices and reporting
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project

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

### Quick Start Deployment

For a quick web server setup with reverse proxy configurations:
- **[Web Server Setup Guide](WEBSERVER-SETUP.md)** - Quick start for Apache, Nginx, or Caddy setup

### Complete Deployment Guides

- **[Ubuntu 24.04 Deployment Guide](docs/UBUNTU-24-DEPLOYMENT.md)** - Complete VPS deployment instructions
- **[Mobile App Build Guide](packages/mobile-app/BUILD_APK.md)** - Android APK build instructions
- **[Web Server Configuration](config/webserver/README.md)** - Detailed web server configuration guide

### Deployment Overview

1. **Backend**: Deploy with PM2 on VPS (using Bun runtime)
2. **Admin Panel**: Build and serve via reverse proxy (Apache/Nginx/Caddy)
3. **Mobile App**: Build for Android/iOS with Capacitor
4. **Static Files**: Host .apk files and assets on static subdomain

### Subdomain Configuration

The platform uses separate subdomains for different services:
- **api.yektayar.ir** → Backend API (port 3000)
- **panel.yektayar.ir** → Admin Panel (port 5173)
- **app.yektayar.ir** → Mobile App (port 8100)
- **static.yektayar.ir** → Static files hosting

Use the installation scripts to set up quickly:
```bash
sudo ./scripts/install-apache.sh   # For Apache
sudo ./scripts/install-nginx.sh    # For Nginx
sudo ./scripts/install-caddy.sh    # For Caddy (automatic HTTPS)
```

### Additional Deployment Resources

- [Network Configuration Guide](docs/NETWORK-CONFIGURATION.md) - Configure ports and interfaces
- [Bun vs NPM Guide](docs/BUN-VS-NPM.md) - Understanding the runtime and package manager

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
