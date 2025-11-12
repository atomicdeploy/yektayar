# GitHub Copilot Instructions for YektaYar

Welcome to YektaYar, a comprehensive mental health care platform! This document provides context and guidelines to help you work effectively on this codebase.

## Project Overview

YektaYar is a mental health care platform that connects users with AI-powered support and professional psychologists. The platform consists of:
- **Backend API** (Elysia.js with Bun runtime)
- **Admin Panel** (Vue.js 3 web application)
- **Mobile App** (Ionic + Capacitor + Vue.js)
- **Shared Package** (Common types, utilities, and schemas)

**Primary Language**: Persian (Farsi) with English as secondary
**Architecture**: Monorepo with workspaces managed by npm

## Monorepo Structure

```
yektayar/
├── packages/
│   ├── backend/              # Elysia.js API server (Bun runtime)
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── db/           # Database connection and queries
│   │   │   ├── middleware/   # Custom middleware
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   ├── admin-panel/          # Vue.js admin interface
│   │   ├── src/
│   │   │   ├── main.ts       # Entry point
│   │   │   ├── router/       # Vue Router configuration
│   │   │   ├── stores/       # Pinia state management
│   │   │   ├── views/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   └── i18n/         # Internationalization
│   │   └── package.json
│   ├── mobile-app/           # Ionic + Capacitor app
│   │   ├── src/
│   │   │   ├── main.ts       # Entry point
│   │   │   ├── router/       # Ionic Router
│   │   │   ├── stores/       # Pinia state management
│   │   │   ├── views/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   └── i18n/         # Internationalization
│   │   ├── android/          # Android native project
│   │   └── package.json
│   └── shared/               # Shared code across packages
│       ├── src/
│       │   ├── types/        # TypeScript type definitions
│       │   ├── schemas/      # Zod validation schemas
│       │   └── utils/        # Shared utilities
│       └── package.json
├── docs/                     # Comprehensive documentation
├── scripts/                  # Utility scripts
└── package.json              # Root workspace configuration
```

## Tech Stack

### Backend
- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia.js (modern TypeScript-first web framework)
- **Database**: PostgreSQL 15+
- **Validation**: Zod schemas
- **Real-time**: Socket.IO for WebSocket connections
- **API Docs**: Swagger/OpenAPI
- **Authentication**: Session-based with JWT support

### Frontend (Admin Panel)
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router 4
- **UI Components**: Headless UI, Hero Icons
- **Styling**: Tailwind CSS 4
- **Charts**: Chart.js with vue-chartjs
- **i18n**: vue-i18n
- **HTTP Client**: Axios

### Mobile App
- **Framework**: Ionic 7 + Vue.js 3 with Composition API
- **Native Runtime**: Capacitor 7
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Ionic Router
- **i18n**: vue-i18n
- **HTTP Client**: Axios
- **Icons**: Ionicons

### Shared
- **Language**: TypeScript (strict mode)
- **Validation**: Zod schemas (shared between frontend and backend)

## Development Commands

### Root Level (run from repository root)
```bash
npm install              # Install all dependencies
npm run dev              # Start all packages in development mode
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run test             # Test all packages
npm run clean            # Clean build artifacts
```

### Package-Specific
```bash
npm run dev:backend      # Start backend only (port 3000)
npm run dev:admin        # Start admin panel only (port 5173)
npm run dev:mobile       # Start mobile app only (port 8100)

npm run build:backend    # Build backend only
npm run build:admin      # Build admin panel only
npm run build:mobile     # Build mobile app only
```

### Mobile App Specific
```bash
cd packages/mobile-app
npm run build:production       # Build for production
npm run cap:sync               # Sync with Android project
npm run android:build:debug    # Build debug APK
npm run android:build:release  # Build release APK
```

## Coding Standards

### General Principles
1. **TypeScript First**: Use TypeScript for all new code
2. **No `console.*`**: Use the `logger` utility from `@yektayar/shared` instead
3. **Minimal Changes**: Make the smallest possible changes to achieve the goal
4. **Don't Break Working Code**: Never remove or modify working code unless absolutely necessary
5. **Validate Everything**: Use Zod schemas for all data validation
6. **Share Code**: Put shared types, schemas, and utilities in `@yektayar/shared`

### Vue.js Standards
- **Always** use Composition API with `<script setup>` syntax
- **Always** use TypeScript in Vue components: `<script setup lang="ts">`
- Use Pinia for state management
- Use `vue-i18n` for all user-facing text (no hardcoded strings)
- Follow RTL support patterns for Persian language
- Keep components focused and reusable

### Backend Standards
- Use async/await for asynchronous operations
- Handle errors properly with try-catch blocks
- Use proper HTTP status codes
- Document API endpoints with JSDoc comments
- Use Zod for request/response validation
- Never log sensitive data (passwords, tokens, etc.)
- Use parameterized queries (handled by the ORM)

### Naming Conventions
- **Files**: kebab-case (e.g., `user-profile.ts`, `chat-thread.vue`)
- **Components**: PascalCase (e.g., `UserProfile.vue`, `ChatThread.vue`)
- **Functions/Variables**: camelCase (e.g., `getUserProfile`, `chatThreadId`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `ChatMessage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use trailing commas in objects/arrays
- No unused imports or variables
- Add comments only for complex logic, prefer self-documenting code

## Authentication Flow

The platform uses a session-based authentication system:

1. **Session Acquisition**: Client sends stored token to backend via `acquireSession`
2. **Session Validation**: Backend validates token and returns session info
3. **Login Check**: Client checks if user is logged in (`is_logged_in` flag)
4. **Authentication**: 
   - Admin Panel: Blocked by auth wall until login (phone/email + OTP)
   - Mobile App: Can browse, login required for certain features
5. **User Properties**: Phone numbers and emails must be verified via OTP
6. **Session Token**: All requests include the session token in headers

## Database

- **Type**: PostgreSQL 15+
- **ORM**: Direct SQL with `postgres` package
- **Migrations**: TODO (not yet implemented)
- **Connection**: Managed in `packages/backend/src/db/`

## API Documentation

- **Base URL**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/swagger`
- All endpoints should be documented with Swagger decorators

## i18n (Internationalization)

- **Primary Language**: Persian (Farsi) - RTL
- **Secondary Language**: English - LTR
- **Keys**: Use descriptive keys in English (e.g., `user.profile.name`)
- **Files**: Located in `src/i18n/` in each frontend package
- **Usage**: Always use `$t()` for user-facing text
- **Numbers/Dates**: Use locale-specific formatting

## Branding and Colors

### Brand Colors
- **Primary (Gold)**: `#d4a43e` - Used for accent and primary actions
- **Secondary (Navy Seal)**: `#01183a` - Used for backgrounds and secondary elements
- Support both light and dark variants

### Fonts
- **Primary**: System fonts for main content
- **Secondary**: IranNastaliq for special taglines and decorative text

### Logo
- Use `assets/logo/logo.svg` for app icon (not ion-heart)
- Style with gradients and shadows for splash screen

## Common Patterns

### API Calls
- **Don't** use raw `fetch()` calls
- **Do** create a shared API client in `@yektayar/shared` package
- Include session token in all requests
- Handle errors consistently

### Loading States
- Use consistent loading components (avoid duplicating spinner code)
- For charts: Update smoothly without blocking overlays
- For forms: Use appropriate loading indicators

### Error Handling
- Display user-friendly error messages (never white screen)
- Show errors in UI, not just console
- Log errors with the logger utility

### Session Management
- Store token securely (localStorage for web, secure storage for mobile)
- Include token in all authenticated requests
- Handle token expiration gracefully

## Testing

- **Unit Tests**: Not yet fully implemented, use placeholder
- **Integration Tests**: TODO
- **E2E Tests**: TODO
- Always ensure code builds and lints before committing

## Security Best Practices

1. **Never** commit secrets, API keys, or passwords
2. **Always** use environment variables for sensitive config
3. **Always** validate and sanitize user input
4. **Never** log sensitive data
5. Use HTTPS in production
6. Implement proper session management
7. Follow OWASP security guidelines

## Git Workflow

### Commit Messages
Follow conventional commit format:
```
<type>: <subject>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add user profile page`
- `fix: correct session validation`
- `docs: update API documentation`

### Branching
- Feature branches: `feat/<short-name>`
- Bug fixes: `fix/<bug-name>`
- Documentation: `docs/<doc-name>`

## Documentation

- **Entry Point**: `docs/INDEX.md` - Complete documentation hub
- **Development**: `DEVELOPMENT.md` - Detailed development guide
- **Quick Start**: `QUICK-START.md` - Fast setup guide
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **Security**: `SECURITY.md` - Security policy

## Important Notes

1. **Session Before WebSocket**: Always acquire session before initializing Socket.IO connection
2. **No Hardcoded Strings**: Use i18n for all user-facing text
3. **Logger Utility**: Use the shared logger, not `console.*`
4. **Shared Package**: Build `@yektayar/shared` before other packages (`npm run postinstall`)
5. **RTL Support**: Consider RTL layout for Persian language throughout
6. **Environment Variables**: Use `.env` files, see `ENV-GUIDE.md` for details

## Common Issues to Watch For

Based on open issues, be aware of:

1. **Session Management**: Ensure session is acquired before any API calls
2. **Loading States**: Avoid duplicate loading spinners, use consistent patterns
3. **Error Display**: Never show white screen, always display errors to users
4. **WebSocket Timing**: Don't connect to Socket.IO before session validation
5. **API Client Pattern**: Use shared API client, not raw fetch calls
6. **Color Consistency**: Follow brand colors across all interfaces
7. **Icon Usage**: Use proper app icon (logo.svg), not placeholder icons

## When Working on Issues

1. **Read Carefully**: Understand the full scope before starting
2. **Check Related Issues**: Many issues reference each other
3. **Minimal Changes**: Only change what's necessary to fix the issue
4. **Test Thoroughly**: Ensure your changes don't break existing functionality
5. **Document Changes**: Update relevant documentation
6. **Follow Patterns**: Look at existing code for patterns to follow

## Helpful Resources

- **GitHub Issues**: Review open issues for context and common patterns
- **Documentation**: Start with `docs/INDEX.md` for guided reading
- **Architecture**: See `docs/ARCHITECTURE.md` for system design
- **Setup Guide**: See `docs/SETUP.md` for complete setup instructions
- **Environment**: See `ENV-GUIDE.md` for environment configuration

## Questions?

- Check existing documentation first
- Review related GitHub issues
- Look for similar patterns in the codebase
- Follow the coding standards outlined above

---

**Remember**: Quality over speed. Write clean, maintainable code that follows the established patterns and conventions. When in doubt, look at existing code for examples.
