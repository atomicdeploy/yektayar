# YektaYar - Complete Documentation Index

Welcome to YektaYar's complete documentation. This index helps you find the right documentation for your needs.

---

## 🚀 Quick Start

**New to YektaYar?** Start here:

1. **[Project Overview](../README.md)** - Understanding YektaYar platform
2. **[Getting Started Guide](guides/GETTING-STARTED.md)** - Comprehensive onboarding for new developers
3. **[Quick Start Guide](guides/QUICK-START.md)** - Get up and running quickly
4. **[Quick Reference](guides/QUICK-REFERENCE.md)** - Essential code snippets and daily checklist

---

## 📚 Documentation by Category

### 📖 Guides

**Development & Setup:**
- **[Getting Started](guides/GETTING-STARTED.md)** - Complete developer onboarding
- **[Development Guide](guides/DEVELOPMENT.md)** - Detailed development practices and environment setup
- **[Installation Guide](guides/INSTALLATION.md)** - Complete platform installation guide
- **[Quick Start](guides/QUICK-START.md)** - Fast setup for the current monorepo
- **[Quick Reference](guides/QUICK-REFERENCE.md)** - Essential code snippets and daily checklist
- **[Setup Guide](guides/SETUP.md)** - Complete setup instructions
- **[Visual Testing Guide](guides/VISUAL-TESTING-GUIDE.md)** - Guide for testing UI changes

**Configuration:**
- **[API Base URL Configuration](guides/API-BASE-URL.md)** - API endpoint configuration
- **[Environment Configuration](guides/ENV-GUIDE.md)** - Environment variables and configuration
- **[Bun vs NPM](guides/BUN-VS-NPM.md)** - Understanding runtime choices
- **[Database Structure](guides/DATABASE-STRUCTURE.md)** - Database schema and relationships
- **[Token Extraction Guide](guides/TOKEN-EXTRACTION-GUIDE.md)** - Authentication token handling

**Developer Tools:**
- **[Bash Features](guides/BASHRC-FEATURES.md)** - Enhanced bash features for development
- **[Dev Tools Guide](guides/DEV-TOOLS-GUIDE.md)** - Development tools installation and configuration

---

### 🏗️ Implementation Documentation

**Feature Implementations:**
- **[APK Build Summary](implementation/APK-BUILD-SUMMARY.md)** - Android APK build and analysis
- **[Branding Implementation](implementation/BRANDING-IMPLEMENTATION-SUMMARY.md)** - Brand assets and styling
- **[CI/CD Improvements](implementation/CI-CD-IMPROVEMENTS.md)** - Continuous integration and deployment
- **[CRUD Implementation](implementation/CRUD-IMPLEMENTATION-SUMMARY.md)** - CRUD endpoints implementation
- **[Database Health Check](implementation/DB-HEALTH-IMPLEMENTATION.md)** - DB health monitoring
- **[Health Check Implementation](implementation/HEALTH-CHECK-IMPLEMENTATION.md)** - Health endpoints
- **[Hero Image Preloading](implementation/HERO-IMAGE-PRELOADING-SUMMARY.md)** - Image optimization
- **[Icon Implementation](implementation/ICON-IMPLEMENTATION.md)** - Icons and logos
- **[Installation Report](implementation/INSTALLATION-REPORT.md)** - Installation implementation report
- **[Linting & Testing](implementation/LINTING-TESTING-SUMMARY.md)** - Code quality tools
- **[Modal Styling Fix](implementation/MODAL-STYLING-FIX-SUMMARY.md)** - Modal styling and dark mode
- **[OverlayScrollbars](implementation/OVERLAYSCROLLBARS-IMPLEMENTATION.md)** - Custom scrollbars
- **[Refactoring Summary](implementation/REFACTORING-SUMMARY.md)** - API client refactoring
- **[Security Summary](implementation/SECURITY-SUMMARY.md)** - Security scan results
- **[Speech Recognition](implementation/SPEECH-RECOGNITION-IMPLEMENTATION.md)** - Voice input
- **[Token Extraction](implementation/IMPLEMENTATION-TOKEN-EXTRACTION.md)** - Auth token handling
- **[WebSocket Implementation](implementation/WEBSOCKET-IMPLEMENTATION-SUMMARY.md)** - Real-time communication

**Infrastructure & Tools:**
- **[Dev Runner Improvements](implementation/DEV-RUNNER-IMPROVEMENTS.md)** - Development runner enhancements
- **[i18n Validation](implementation/I18N-VALIDATION.md)** - Internationalization validation
- **[Implementation Complete](implementation/IMPLEMENTATION-COMPLETE.md)** - Completed implementation summary
- **[Implementation Summary](implementation/IMPLEMENTATION-SUMMARY.md)** - Session acquisition implementation
- **[PM2 Integration](implementation/PM2-INTEGRATION.md)** - Process management
- **[Process Tree Diagram](implementation/PROCESS-TREE-DIAGRAM.md)** - Process management visualization
- **[OverlayScrollbars Guide](implementation/OVERLAYSCROLLBARS.md)** - Scrollbar usage guide
- **[Dependency Updates](implementation/DEPENDENCY-UPDATE-SUMMARY.md)** - Package updates summary

---

### 🔧 Troubleshooting

**Fixes & Solutions:**
- **[CORS Fix](troubleshooting/CORS-FIX.md)** - CORS OPTIONS verb fix
- **[Fix: Acquire Session 404](troubleshooting/FIX-ACQUIRE-SESSION-404.md)** - Session API error fix
- **[Fix Summary](troubleshooting/FIX-SUMMARY.md)** - Bun double-listen issue
- **[Stop Fix Summary](troubleshooting/STOP-FIX-SUMMARY.md)** - Dev runner stop issue
- **[Solution](troubleshooting/SOLUTION.md)** - Database health check fix
- **[Solutions](troubleshooting/SOLUTIONS.md)** - Various solutions

### Setup & Deployment
- [Setup Guide](SETUP.md) - Complete setup instructions
- [Ubuntu 24.04 Deployment](UBUNTU-24-DEPLOYMENT.md) - VPS deployment
- [Network Configuration](NETWORK-CONFIGURATION.md) - Network setup
- [Bun vs NPM](BUN-VS-NPM.md) - Runtime guide
- [Telegram Bot Integration](TELEGRAM-BOT.md) - Telegram bot setup and usage

**Debugging & Investigation:**
- **[Database Health Troubleshooting](troubleshooting/DATABASE-HEALTH-TROUBLESHOOTING.md)** - DB health issues
- **[Investigation Summary](troubleshooting/INVESTIGATION-SUMMARY.md)** - DB hanging investigation
- **[Production Debug Session](troubleshooting/PRODUCTION-DEBUG-SESSION.md)** - Production debugging
- **[Troubleshooting Dev Errors](troubleshooting/TROUBLESHOOTING-DEV-ERRORS.md)** - Common development errors
- **[WebSocket Authentication Fix](troubleshooting/WEBSOCKET-AUTHENTICATION-FIX.md)** - WebSocket auth issues

**Verification:**
- **[Feedback Response](troubleshooting/FEEDBACK-RESPONSE.md)** - Implementation feedback
- **[Verification Results](troubleshooting/VERIFICATION-RESULTS.md)** - Configuration verification

---

## 🗂️ Complete File Structure

```
yektayar/
├── README.md                      # Main project overview
├── ROADMAP.md                     # Implementation roadmap (includes prototype sprint)
├── DEVELOPMENT.md                 # Development guide (includes prototype sprint details)
├── QUICK-START.md                 # Quick start for monorepo
├── SECURITY.md                    # Security policy
├── CONTRIBUTING.md                # Contributing guidelines
│
└── docs/                          # Documentation directory
    ├── INDEX.md                   # This file - documentation hub
    ├── README.md                  # Documentation overview
    │
    ├── GETTING-STARTED.md         # New developer onboarding
    ├── QUICK-REFERENCE.md         # Code snippets & daily checklist
    │
    ├── ARCHITECTURE.md            # System architecture (all phases & alternatives)
    ├── REQUIREMENTS-REVIEW.md     # Requirements analysis
    │
    ├── SETUP.md                   # Setup guide (all phases)
    ├── UBUNTU-24-DEPLOYMENT.md    # Ubuntu VPS deployment
    ├── NETWORK-CONFIGURATION.md   # Network configuration
    ├── BUN-VS-NPM.md             # Bun vs NPM guide
    └── TELEGRAM-BOT.md           # Telegram bot integration
```

### 🚀 Deployment

**Setup & Configuration:**
- **[Capacitor SDK 34 Patches](deployment/CAPACITOR-SDK34-PATCHES.md)** - Mobile SDK compatibility
- **[Dotfiles Guide](deployment/DOTFILES-GUIDE.md)** - Editor and git configuration
- **[Network Configuration](deployment/NETWORK-CONFIGURATION.md)** - Network and port setup
- **[Ubuntu 24.04 Deployment](deployment/UBUNTU-24-DEPLOYMENT.md)** - VPS deployment guide
- **[Web Server Setup](deployment/WEBSERVER-SETUP.md)** - Apache/Nginx/Caddy setup

---

### 🌐 API Documentation

**API Testing & Usage:**
- **[Health DB Endpoint](api/HEALTH-DB-ENDPOINT.md)** - Database health API
- **[Health DB Examples](api/HEALTH-DB-EXAMPLES.md)** - Health check examples
- **[Session Acquisition](api/SESSION-ACQUISITION.md)** - Session API documentation
- **[Session Quick Start](api/SESSION-QUICK-START.md)** - Quick session setup
- **[Socket.IO Guide](api/SOCKETIO-GUIDE.md)** - Real-time WebSocket communication
- **[WebSocket Testing](api/WEBSOCKET-TESTING.md)** - WebSocket testing guide
- **[Test Session Acquisition](api/TEST-SESSION-ACQUISITION.md)** - Session acquisition testing

**Testing Tools:**
- **[Pollination AI TUI](api/README-POLLINATION-AI-TUI.md)** - AI testing interface
- **[Socket.IO TUI](api/README-SOCKETIO-TUI.md)** - Socket.IO testing interface

---

### 🎨 Features

**Feature-Specific Documentation:**
- **[Speech Recognition Examples](features/SPEECH-RECOGNITION-CODE-EXAMPLES.md)** - Voice input code examples

---

### 📐 Architecture

- **[Architecture Overview](ARCHITECTURE.md)** - Complete system architecture
- **[Requirements Review](REQUIREMENTS-REVIEW.md)** - Comprehensive requirements analysis

---

## 📋 Documentation by Role

### For New Developers

- **Authentication**: [Architecture](ARCHITECTURE.md), [Development Guide](../DEVELOPMENT.md)
- **Database**: [Architecture](ARCHITECTURE.md), [Setup Guide](SETUP.md), [Ubuntu Deployment](UBUNTU-24-DEPLOYMENT.md)
- **i18n/Internationalization**: [Getting Started](GETTING-STARTED.md), [Quick Reference](QUICK-REFERENCE.md), [Architecture](ARCHITECTURE.md)
- **RTL/LTR**: [Getting Started](GETTING-STARTED.md), [Quick Reference](QUICK-REFERENCE.md)
- **PWA**: [Getting Started](GETTING-STARTED.md), [Development Guide](../DEVELOPMENT.md)
- **Deployment**: [Setup Guide](SETUP.md), [Ubuntu Deployment](UBUNTU-24-DEPLOYMENT.md)
- **API**: [Architecture](ARCHITECTURE.md), [Development Guide](../DEVELOPMENT.md)
- **WebSocket**: [Architecture](ARCHITECTURE.md), [Setup Guide](SETUP.md)
- **Telegram Bot**: [Telegram Bot Integration](TELEGRAM-BOT.md), [Scripts README](../scripts/README.md)
- **Prototype Sprint**: [Development Guide](../DEVELOPMENT.md), [Roadmap](../ROADMAP.md)

**Start here in order:**
1. [Project Overview](../README.md) - What is YektaYar?
2. [Getting Started Guide](guides/GETTING-STARTED.md) - Setup and first steps
3. [Development Guide](guides/DEVELOPMENT.md) - Development workflow
4. [Quick Reference](guides/QUICK-REFERENCE.md) - Daily development checklist

### For DevOps/Deployment

**Essential reading:**
1. [Ubuntu 24.04 Deployment](deployment/UBUNTU-24-DEPLOYMENT.md) - Server setup
2. [Web Server Setup](deployment/WEBSERVER-SETUP.md) - Web server configuration
3. [Network Configuration](deployment/NETWORK-CONFIGURATION.md) - Networking setup
4. [Environment Configuration](guides/ENV-GUIDE.md) - Environment variables

### For Frontend Developers

**Focus on:**
- [Quick Start](guides/QUICK-START.md) - Get running quickly
- [Socket.IO Guide](api/SOCKETIO-GUIDE.md) - Real-time features
- [Session Quick Start](api/SESSION-QUICK-START.md) - Authentication
- [OverlayScrollbars Guide](implementation/OVERLAYSCROLLBARS.md) - UI components

### For Backend Developers

**Focus on:**
- [Database Structure](guides/DATABASE-STRUCTURE.md) - Database schema
- [API Documentation](api/) - All API endpoints
- [Health DB Endpoint](api/HEALTH-DB-ENDPOINT.md) - Health checks
- [Token Extraction Guide](guides/TOKEN-EXTRACTION-GUIDE.md) - Authentication

---

## 🔍 Finding Documentation

**Can't find what you need?**

1. Use the search function (Ctrl+F / Cmd+F) on this page
2. Check [README.md](README.md) for an overview
3. Browse by category above
4. Look in the [troubleshooting](troubleshooting/) section for fixes

---

## 📝 Contributing

See [Contributing Guidelines](../CONTRIBUTING.md) for how to contribute to this project.

## 🔒 Security

See [Security Policy](../SECURITY.md) for security practices and vulnerability reporting.

## 🗺️ Roadmap

See [Implementation Roadmap](../ROADMAP.md) for project planning and progress.

---

**Last Updated:** 2025-12-02
