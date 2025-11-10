# YektaYar Architecture Documentation

## 🏗️ System Architecture Overview

### Current Phase: Prototype (Client-Side Only)

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │         React Application                  │    │
│  │                                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │  UI      │  │  State   │  │  Mock   │ │    │
│  │  │  Layer   │  │  (hooks) │  │  Data   │ │    │
│  │  └──────────┘  └──────────┘  └─────────┘ │    │
│  │                                            │    │
│  │  ┌──────────────────────────────────────┐ │    │
│  │  │     Spark KV Storage (Persistent)    │ │    │
│  │  └──────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Future Architecture (Full-Stack Production)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Web App     │  │  Admin Panel │  │  Mobile App (Capacitor)  │ │
│  │  (React PWA) │  │  (React)     │  │  (React + Native APIs)   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS (REST + WebSocket)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CDN Layer (Optional)                        │
│  Cloudflare / ArvanCloud - Static Assets, Images, Videos           │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Web Server Layer                            │
│  Apache HTTP Server (Reverse Proxy) + SSL Termination              │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │         Node.js Backend (AdonisJS / Elysia.js)                │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   REST API  │  │  WebSocket  │  │  Background Jobs     │ │ │
│  │  │   Routes    │  │  Server     │  │  (Future: Queue)     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │                 Business Logic Layer                    │ │ │
│  │  │  • Authentication & Authorization                       │ │ │
│  │  │  • Session Management                                   │ │ │
│  │  │  • AI Integration                                       │ │ │
│  │  │  • Messaging & Real-time                                │ │ │
│  │  │  • Appointments                                         │ │ │
│  │  │  • Payments                                             │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              Middleware & Utilities                     │ │ │
│  │  │  • Rate Limiting                                        │ │ │
│  │  │  • Request Validation                                   │ │ │
│  │  │  • Error Handling                                       │ │ │
│  │  │  • Logging                                              │ │ │
│  │  │  • Security (CORS, CSRF, etc.)                          │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                          │ │
│  │                                                               │ │
│  │  Tables:                                                      │ │
│  │  • users, user_identifiers, user_groups                      │ │
│  │  • sessions                                                   │ │
│  │  • messages, message_threads, participants                   │ │
│  │  • appointments                                               │ │
│  │  • courses, enrollments, progress                            │ │
│  │  • assessments, assessment_results                           │ │
│  │  • payments, transactions                                     │ │
│  │  • permissions, roles                                         │ │
│  │  • config (dynamic configuration)                            │ │
│  │  • audit_logs                                                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Redis Cache (Future Phase 4)                                │ │
│  │  • Session cache                                              │ │
│  │  • API response cache                                         │ │
│  │  • Rate limiting data                                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  File Storage                                                 │ │
│  │  • User avatars                                               │ │
│  │  • Course videos / materials                                  │ │
│  │  • Message attachments                                        │ │
│  │  • Documents                                                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   External Services Layer                           │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  AI Service     │  │  SMS        │  │  Email                  │ │
│  │  (Pollination)  │  │  Gateway    │  │  Service                │ │
│  └─────────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Payment        │  │  Push Notifications                      │ │
│  │  Gateway (IPG)  │  │  (Web Push API)                          │ │
│  └─────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure (Monorepo Concept for Future)

```
yektayar/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   └── ISSUE_TEMPLATE/
├── docs/
│   ├── README.md
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md (this file)
│   ├── SETUP.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── packages/
│   ├── backend/                    # Node.js API Server
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── websocket/
│   │   │   └── app.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web-app/                    # React Web App (PWA)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── services/          # API client
│   │   │   ├── types/
│   │   │   ├── i18n/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── admin-panel/                # React Admin Panel
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── mobile-app/                 # Capacitor Mobile App
│   │   ├── android/
│   │   ├── ios/
│   │   ├── src/                   # Shared with web-app
│   │   └── capacitor.config.ts
│   │
│   └── shared/                     # Shared code
│       ├── types/                 # TypeScript types
│       ├── utils/                 # Shared utilities
│       ├── constants/             # Shared constants
│       └── package.json
│
├── scripts/
│   ├── setup.sh
│   ├── build.sh
│   └── deploy.sh
├── .gitignore
├── package.json                   # Root package.json (workspaces)
└── README.md
```

---

## 🗄️ Database Schema (Conceptual - PostgreSQL)

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),  -- nullable (TOTP-only users)
  type VARCHAR(20) NOT NULL CHECK (type IN ('patient', 'psychologist', 'admin')),
  profile JSONB DEFAULT '{}',  -- flexible profile data
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### user_identifiers
```sql
CREATE TABLE user_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'phone')),
  value VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_identifiers_value ON user_identifiers(type, value);
CREATE INDEX idx_user_identifiers_user_id ON user_identifiers(user_id);
```

#### sessions
```sql
CREATE TABLE sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_logged_in BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',  -- ip, user_agent, device_info
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

#### permissions
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
```

#### user_groups
```sql
CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_group_members
```sql
CREATE TABLE user_group_members (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, group_id)
);
```

#### user_permissions
```sql
CREATE TABLE user_permissions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);
```

#### group_permissions
```sql
CREATE TABLE group_permissions (
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, permission_id)
);
```

### Messaging Tables

#### message_threads
```sql
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  category VARCHAR(50),  -- departments
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_threads_status ON message_threads(status);
CREATE INDEX idx_message_threads_category ON message_threads(category);
```

#### thread_participants
```sql
CREATE TABLE thread_participants (
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX idx_thread_participants_user_id ON thread_participants(user_id);
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id, created_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
```

### Appointment Tables

#### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_psychologist_id ON appointments(psychologist_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
```

#### appointment_notes
```sql
CREATE TABLE appointment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,  -- only visible to psychologist/admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointment_notes_appointment_id ON appointment_notes(appointment_id);
```

### Educational Content Tables

#### courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  content_type VARCHAR(20) CHECK (content_type IN ('video', 'article', 'interactive')),
  content_url VARCHAR(500),
  duration_minutes INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_tags ON courses USING GIN(tags);
```

#### enrollments
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```

### Assessment Tables

#### assessments
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,  -- flexible question structure
  scoring_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### assessment_results
```sql
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  scores JSONB,
  personality_type VARCHAR(50),
  recommendations JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
```

### Payment Tables

#### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IRR',
  type VARCHAR(20) CHECK (type IN ('payment', 'refund')),
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway_reference VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### System Tables

#### config
```sql
CREATE TABLE config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(100),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

## 🔌 API Design (Future Backend)

### REST API Endpoints

#### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login with identifier + password/OTP
POST   /api/v1/auth/send-otp          # Send OTP to email/phone
POST   /api/v1/auth/verify-otp        # Verify OTP code
POST   /api/v1/auth/logout            # Logout (invalidate session)
GET    /api/v1/auth/session           # Get current session info
```

#### Users
```
GET    /api/v1/users/me               # Get current user profile
PATCH  /api/v1/users/me               # Update current user profile
POST   /api/v1/users/me/identifiers   # Add email/phone
DELETE /api/v1/users/me/identifiers/:id # Remove identifier
GET    /api/v1/users/:id               # Get user by ID (admin only)
GET    /api/v1/users                   # List users (admin only)
```

#### Appointments
```
GET    /api/v1/appointments            # List user's appointments
POST   /api/v1/appointments            # Book new appointment
GET    /api/v1/appointments/:id        # Get appointment details
PATCH  /api/v1/appointments/:id        # Update appointment
DELETE /api/v1/appointments/:id        # Cancel appointment
GET    /api/v1/professionals           # List available professionals
GET    /api/v1/professionals/:id/availability  # Get availability
```

#### Messaging
```
GET    /api/v1/threads                 # List user's threads
POST   /api/v1/threads                 # Create new thread
GET    /api/v1/threads/:id             # Get thread details
POST   /api/v1/threads/:id/messages    # Send message
PATCH  /api/v1/threads/:id             # Update thread (close, etc.)
```

#### Courses
```
GET    /api/v1/courses                 # List courses
GET    /api/v1/courses/:id             # Get course details
POST   /api/v1/courses/:id/enroll      # Enroll in course
PATCH  /api/v1/enrollments/:id/progress # Update progress
```

#### Assessments
```
GET    /api/v1/assessments             # List assessments
GET    /api/v1/assessments/:id         # Get assessment
POST   /api/v1/assessments/:id/submit  # Submit answers
GET    /api/v1/assessments/results     # Get user's results
```

#### Payments
```
POST   /api/v1/payments/initiate       # Start payment
POST   /api/v1/payments/verify         # Verify payment (callback)
GET    /api/v1/payments/history        # Payment history
```

### WebSocket Events

#### Connection
```
connect                                # Client connects
disconnect                             # Client disconnects
authenticate                           # Authenticate socket with token
```

#### Messaging
```
// Client → Server
message:send                           # Send message
thread:join                            # Join thread room
thread:leave                           # Leave thread room
typing:start                           # Start typing indicator
typing:stop                            # Stop typing indicator

// Server → Client
message:new                            # New message received
message:updated                        # Message edited
thread:updated                         # Thread status changed
typing:indicator                       # Someone is typing
user:online                            # User came online
user:offline                           # User went offline
```

#### Notifications
```
// Server → Client
notification:new                       # New notification
appointment:reminder                   # Appointment reminder
system:announcement                    # System announcement
```

---

## 🔒 Security Architecture

### Authentication Flow
```
1. User submits identifier (email/phone)
2. Server generates OTP, sends via email/SMS
3. User submits OTP
4. Server validates OTP
5. Server creates session, generates secure token
6. Token returned to client
7. Client stores token (localStorage/cookie)
8. Client includes token in all subsequent requests
9. Server validates token on each request
10. Session tracked in database (stateful)
```

### Authorization Flow
```
1. Request comes with valid session token
2. Middleware resolves user from session
3. Load user's permissions (direct + groups)
4. Check if user has required permission for action
5. Allow/deny request
```

### Security Layers
- **Transport:** HTTPS only
- **Input Validation:** Zod schemas (unified)
- **SQL Injection:** ORM (parameterized queries)
- **XSS:** Content sanitization
- **CSRF:** Token-based protection
- **Rate Limiting:** Per-IP and per-user
- **Session Security:** Secure tokens, expiration, revocation

---

## 🔄 Real-Time Architecture

### WebSocket Connection Management
```typescript
// Server-side (conceptual)
io.on('connection', (socket) => {
  // Authenticate
  socket.on('authenticate', async (token) => {
    const session = await validateSession(token)
    if (session) {
      socket.userId = session.userId
      socket.join(`user:${socket.userId}`)
      
      // Update online status
      await updateUserStatus(socket.userId, 'online')
      
      // Notify relevant users
      io.to(getUserContacts(socket.userId))
        .emit('user:online', { userId: socket.userId })
    }
  })
  
  // Handle disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      await updateUserStatus(socket.userId, 'offline')
      io.to(getUserContacts(socket.userId))
        .emit('user:offline', { userId: socket.userId })
    }
  })
  
  // Message handling
  socket.on('message:send', async (data) => {
    // Save to database
    const message = await saveMessage(data)
    
    // Emit to thread participants
    io.to(`thread:${data.threadId}`)
      .emit('message:new', message)
  })
})
```

---

## 📦 State Management (Client-Side)

### Prototype (Current)
- React hooks (`useState`, `useEffect`, `useReducer`)
- `useKV` for persistence
- Context API for global state (auth, i18n)

### Production (Future)
Consider: Zustand, Jotai, or TanStack Query
- **TanStack Query** recommended for server state
- **Zustand** for client state (if needed)
- Avoid Redux (overkill for this project)

---

## 🌐 Internationalization

### Structure
```typescript
// i18n/fa.json
{
  "auth": {
    "login": "ورود",
    "register": "ثبت‌نام",
    "logout": "خروج"
  },
  "dashboard": {
    "welcome": "خوش آمدید، {{name}}"
  }
}

// Usage
const { t } = useI18n()
t('auth.login') // "ورود"
t('dashboard.welcome', { name: 'علی' }) // "خوش آمدید، علی"
```

### RTL Handling
```css
/* Automatic with dir="rtl" on <html> */
html[dir="rtl"] {
  /* Tailwind handles most RTL automatically */
}
```

---

## 🚀 Deployment Architecture (Future)

### VPS Setup
```
┌─────────────────────────────────────┐
│         Ubuntu 22.04 LTS VPS        │
├─────────────────────────────────────┤
│  Apache (Reverse Proxy + SSL)       │
│    ↓                                │
│  PM2 (Process Manager)              │
│    ↓                                │
│  Node.js Application                │
│    ↓                                │
│  PostgreSQL (Local)                 │
│                                     │
│  Optional: Redis (Phase 4)          │
└─────────────────────────────────────┘
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName yektayar.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://localhost:3000/$1 [P,L]
    
    # Static files
    DocumentRoot /var/www/yektayar/public
</VirtualHost>
```

### PM2 Configuration
```json
{
  "apps": [{
    "name": "yektayar-api",
    "script": "./dist/server.js",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

---

## 📊 Monitoring & Logging (Future)

### Logging Strategy
```typescript
// Simple file-based logging
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Usage
logger.info('User logged in', { userId: '123' })
logger.error('Payment failed', { error, userId: '123' })
```

### Monitoring
- Application logs: File-based
- Error tracking: (Future: Sentry or similar)
- Performance: (Future: New Relic or similar)
- Uptime: (Future: UptimeRobot or similar)

---

## 🔧 Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | SQLite / Mock | PostgreSQL |
| Session | localStorage | Server-side (DB) |
| AI | Mock responses | Real API |
| Email/SMS | Console logs | Real gateways |
| Payments | Mocked | Real IPG |
| WebSocket | Simulated | Socket.IO server |
| File Storage | Local | VPS + optional CDN |
| HTTPS | Not required | Required |
| Logging | Console | File + monitoring |

---

**Last Updated:** Initial version  
**Review Schedule:** After each major phase
