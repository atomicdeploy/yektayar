# YektaCare Tasks & Sprint Plan

## 🎯 Current Sprint: Prototype MVP (Days 1-5)

**Goal:** Create a functional, professional-looking prototype demonstrating all key user flows for YektaCare mental health platform.

**Status:** 🟡 Planning Complete - Ready to Start Development

---

## 📅 Day 1: Foundation & Design System ⏰ 8 hours

### Morning Session (4 hours)
- [ ] **Setup Base Theme** (1.5 hours)
  - [ ] Define color palette (blue/teal healthcare theme)
  - [ ] Configure Tailwind theme in `index.css`
  - [ ] Setup dark/light mode variables
  - [ ] Test theme switching

- [ ] **Typography & Fonts** (1 hour)
  - [ ] Add Vazirmatn font (Google Fonts) for Persian
  - [ ] Add Inter font for English
  - [ ] Define typography scale (H1-H6, body, caption)
  - [ ] Test RTL rendering

- [ ] **i18n System** (1.5 hours)
  - [ ] Create `src/lib/i18n.ts` utility
  - [ ] Create `src/i18n/fa.json` (Persian translations)
  - [ ] Create `src/i18n/en.json` (English translations)
  - [ ] Create `useI18n` hook
  - [ ] Test language switching

### Afternoon Session (4 hours)
- [ ] **Base Layout Components** (2 hours)
  - [ ] Create `AppShell` component (main container)
  - [ ] Create `Header` component (with language/theme toggles)
  - [ ] Create `BottomNav` component (mobile)
  - [ ] Create `Sidebar` component (desktop)
  - [ ] Responsive breakpoints

- [ ] **PWA Setup** (1.5 hours)
  - [ ] Create PWA manifest (`public/manifest.json`)
  - [ ] Add app icons (multiple sizes)
  - [ ] Create splash screen component
  - [ ] Add meta tags for PWA
  - [ ] Test "Add to Home Screen"

- [ ] **Update App.tsx** (0.5 hours)
  - [ ] Integrate theme provider
  - [ ] Integrate i18n provider
  - [ ] Setup basic routing structure
  - [ ] Add splash screen on first load

### Day 1 Deliverables
- ✅ Working theme switcher (dark/light)
- ✅ Working language switcher (Persian/English)
- ✅ RTL/LTR automatic switching
- ✅ Professional typography
- ✅ Installable PWA
- ✅ Base layout structure

---

## 📅 Day 2: Authentication & Navigation ⏰ 8 hours

### Morning Session (4 hours)
- [ ] **Auth Data Layer** (1 hour)
  - [ ] Create `src/types/auth.ts`
  - [ ] Create `useAuth` hook with useKV
  - [ ] Mock user types (patient, psychologist, admin)
  - [ ] Session management logic

- [ ] **Login Screen** (1.5 hours)
  - [ ] Create `src/components/auth/LoginScreen.tsx`
  - [ ] Email/phone input field
  - [ ] Password input (optional)
  - [ ] "Send OTP" button
  - [ ] Form validation
  - [ ] Error handling

- [ ] **Register Screen** (1.5 hours)
  - [ ] Create `src/components/auth/RegisterScreen.tsx`
  - [ ] Multi-step form (gradual data collection)
  - [ ] Step 1: Identifier (email/phone)
  - [ ] Step 2: Basic info (name, type)
  - [ ] Step 3: Additional info (optional)
  - [ ] Progress indicator

### Afternoon Session (4 hours)
- [ ] **OTP Verification** (1 hour)
  - [ ] Create `src/components/auth/OTPScreen.tsx`
  - [ ] OTP input component (6 digits)
  - [ ] Mock verification logic
  - [ ] Resend OTP functionality
  - [ ] Timer countdown

- [ ] **Pattern Lock** (1.5 hours)
  - [ ] Create `src/components/auth/PatternLock.tsx`
  - [ ] 3x3 grid drawing component
  - [ ] Pattern storage (useKV)
  - [ ] Lock/unlock logic
  - [ ] Setup during first use

- [ ] **Main Navigation** (1.5 hours)
  - [ ] Bottom navigation for mobile (4-5 tabs)
  - [ ] Sidebar for desktop
  - [ ] Icons for each section (Phosphor)
  - [ ] Active state styling
  - [ ] Badge for notifications

### Day 2 Deliverables
- ✅ Complete auth flow (login → register → OTP → dashboard)
- ✅ Pattern lock working
- ✅ Mock session management
- ✅ Different user types (patient/psychologist/admin)
- ✅ Navigation between main sections

---

## 📅 Day 3: AI Chat & Messaging ⏰ 8 hours

### Morning Session (4 hours)
- [ ] **Chat Data Layer** (1 hour)
  - [ ] Create `src/types/message.ts`
  - [ ] Create `useChat` hook
  - [ ] Mock AI response generator
  - [ ] Keyword-based responses (Persian + English)

- [ ] **Chat Interface** (3 hours)
  - [ ] Create `src/components/chat/ChatScreen.tsx`
  - [ ] Message list with scroll
  - [ ] Message bubble component (sent/received)
  - [ ] Text input with send button
  - [ ] Typing indicator
  - [ ] Timestamp formatting
  - [ ] Chat history persistence (useKV)

### Afternoon Session (4 hours)
- [ ] **Messaging Center** (3 hours)
  - [ ] Create `src/components/messaging/MessagingCenter.tsx`
  - [ ] Thread list view
  - [ ] Thread categories/filters
  - [ ] Unread count badges
  - [ ] Thread status (open/closed)
  - [ ] Search threads
  - [ ] Create new thread

- [ ] **Thread Details** (1 hour)
  - [ ] Thread info header
  - [ ] Participant list
  - [ ] Mark as resolved
  - [ ] Thread metadata display

### Day 3 Deliverables
- ✅ Working AI chat with mock intelligent responses
- ✅ Chat history saves and loads
- ✅ Messaging center with threads
- ✅ Support for Persian and English
- ✅ Professional chat UI

---

## 📅 Day 4: Appointments & Assessments ⏰ 8 hours

### Morning Session (4 hours)
- [ ] **Calendar Component** (2 hours)
  - [ ] Create dual calendar (Jalali + Gregorian)
  - [ ] Use `date-fns` for date handling
  - [ ] Create Jalali converter utility
  - [ ] Month navigation
  - [ ] Date selection
  - [ ] Available/unavailable styling

- [ ] **Professional Directory** (2 hours)
  - [ ] Create `src/components/professionals/ProfessionalCard.tsx`
  - [ ] List view with filters
  - [ ] Professional detail page
  - [ ] Specialties, ratings, availability
  - [ ] Mock professional data (5-10 profiles)

### Afternoon Session (4 hours)
- [ ] **Appointment Booking** (2 hours)
  - [ ] Create `src/components/appointments/BookingFlow.tsx`
  - [ ] Step 1: Select professional
  - [ ] Step 2: Select date
  - [ ] Step 3: Select time slot
  - [ ] Step 4: Confirmation
  - [ ] Save to useKV

- [ ] **Psychological Assessment** (2 hours)
  - [ ] Create `src/components/assessment/AssessmentForm.tsx`
  - [ ] Question component (multiple choice)
  - [ ] Progress bar
  - [ ] Mock assessment questions (10-15 questions)
  - [ ] Results page with personality type
  - [ ] Course recommendations based on results

### Day 4 Deliverables
- ✅ End-to-end booking flow
- ✅ Jalali calendar working
- ✅ Professional profiles
- ✅ Assessment completion
- ✅ Results and recommendations

---

## 📅 Day 5: Dashboard, Courses & Polish ⏰ 8-10 hours

### Morning Session (4 hours)
- [ ] **User Dashboard** (2 hours)
  - [ ] Create `src/components/dashboard/UserDashboard.tsx`
  - [ ] Upcoming appointments widget
  - [ ] Recent messages widget
  - [ ] Progress tracker widget
  - [ ] Recommended courses widget
  - [ ] Quick actions

- [ ] **Admin Dashboard** (2 hours)
  - [ ] Create `src/components/dashboard/AdminDashboard.tsx`
  - [ ] User activity feed (mock real-time)
  - [ ] Stats cards (total users, appointments, etc.)
  - [ ] Recent registrations
  - [ ] System health indicators

### Afternoon Session (4-6 hours)
- [ ] **Educational Content** (2 hours)
  - [ ] Create `src/components/courses/CourseCard.tsx`
  - [ ] Course browser with categories
  - [ ] Course detail page
  - [ ] Mock video player
  - [ ] Enrollment button
  - [ ] Progress tracking

- [ ] **Admin: User Management** (1.5 hours)
  - [ ] User list with search
  - [ ] User profile viewer
  - [ ] Secret notes feature (admin only)
  - [ ] User activity log (mock)

- [ ] **Polish & Animations** (2.5 hours)
  - [ ] Add Framer Motion to key transitions
  - [ ] Page transition animations
  - [ ] Skeleton loaders
  - [ ] Loading states
  - [ ] Empty states with illustrations
  - [ ] Error states with retry
  - [ ] Success toasts (sonner)
  - [ ] Smooth scrolling

### Final Testing (1-2 hours)
- [ ] Test all user flows
- [ ] Test on mobile device
- [ ] Test RTL/LTR switching
- [ ] Test dark/light mode
- [ ] Test PWA installation
- [ ] Fix critical bugs
- [ ] Performance check

### Day 5 Deliverables
- ✅ Complete user journey
- ✅ Complete admin journey
- ✅ Educational content browsing
- ✅ Polished animations
- ✅ Professional look and feel
- ✅ No critical bugs
- ✅ Responsive design

---

## 📋 Component Checklist

### Core Components (Day 1-2)
- [ ] `AppShell` - Main layout wrapper
- [ ] `Header` - Top navigation with theme/language toggle
- [ ] `BottomNav` - Mobile navigation
- [ ] `Sidebar` - Desktop navigation
- [ ] `SplashScreen` - Initial loading screen
- [ ] `ThemeToggle` - Dark/light mode switcher
- [ ] `LanguageToggle` - Persian/English switcher

### Auth Components (Day 2)
- [ ] `LoginScreen` - Login form
- [ ] `RegisterScreen` - Multi-step registration
- [ ] `OTPScreen` - OTP verification
- [ ] `PatternLock` - Pattern security
- [ ] `AuthGuard` - Protected route wrapper

### Chat Components (Day 3)
- [ ] `ChatScreen` - Main chat interface
- [ ] `MessageBubble` - Individual message
- [ ] `ChatInput` - Message input field
- [ ] `TypingIndicator` - Animated typing indicator
- [ ] `MessagingCenter` - Thread list
- [ ] `ThreadCard` - Thread preview
- [ ] `ThreadHeader` - Thread details

### Appointment Components (Day 4)
- [ ] `Calendar` - Date picker (dual calendar)
- [ ] `ProfessionalCard` - Professional profile card
- [ ] `ProfessionalDetail` - Full profile page
- [ ] `BookingFlow` - Multi-step booking
- [ ] `TimeSlotPicker` - Time selection
- [ ] `AppointmentCard` - Appointment display

### Assessment Components (Day 4)
- [ ] `AssessmentForm` - Question form
- [ ] `AssessmentQuestion` - Single question
- [ ] `AssessmentProgress` - Progress bar
- [ ] `AssessmentResults` - Results display
- [ ] `PersonalityType` - Type visualization

### Dashboard Components (Day 5)
- [ ] `UserDashboard` - User main dashboard
- [ ] `AdminDashboard` - Admin main dashboard
- [ ] `DashboardWidget` - Reusable widget container
- [ ] `StatCard` - Statistics display
- [ ] `ActivityFeed` - Activity list
- [ ] `QuickActions` - Action buttons

### Course Components (Day 5)
- [ ] `CourseCard` - Course preview
- [ ] `CourseBrowser` - Course list/grid
- [ ] `CourseDetail` - Course full page
- [ ] `VideoPlayer` - Mock video player
- [ ] `ProgressBar` - Course progress
- [ ] `EnrollButton` - Enrollment action

### Admin Components (Day 5)
- [ ] `UserList` - User management table
- [ ] `UserProfile` - User detail view
- [ ] `SecretNotes` - Admin-only notes
- [ ] `ActivityLog` - User activity

### Shared Components (Throughout)
- [ ] `Button` - Custom button variants
- [ ] `Input` - Form input with validation
- [ ] `Card` - Content card
- [ ] `Badge` - Status/count badge
- [ ] `Avatar` - User avatar
- [ ] `Skeleton` - Loading placeholder
- [ ] `EmptyState` - No data state
- [ ] `ErrorState` - Error display

---

## 🎨 Design System Elements

### Colors (To Be Defined Day 1)
```typescript
// Healthcare-focused palette
primary: 'Blue' // Trust, calm
secondary: 'Teal' // Healthcare, growth
accent: 'Orange' // CTAs, warmth
success: 'Green'
warning: 'Amber'
destructive: 'Red' (minimal use)
```

### Typography (Day 1)
- **Persian:** Vazirmatn (Regular, Medium, Bold)
- **English:** Inter (Regular, Medium, Bold)
- Scale: H1(32px) → H2(28px) → H3(24px) → H4(20px) → Body(16px) → Caption(14px)

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 6px
- md: 10px
- lg: 16px
- full: 9999px

---

## 🔄 Mock Data Requirements

### Users (5-10 mock profiles)
- 2-3 patients
- 2-3 psychologists
- 1-2 admins

### Professionals (5-7 profiles)
- Name, avatar, specialty
- Bio (Persian + English)
- Years of experience
- Rating (4-5 stars)
- Availability schedule

### Courses (8-10 courses)
- Titles (Persian + English)
- Descriptions
- Categories (anxiety, depression, relationships, etc.)
- Duration
- Difficulty level
- Thumbnail images

### Assessment Questions (10-15 questions)
- Multiple choice questions
- Options (4-5 per question)
- Scoring logic
- Personality types (4-5 types)

### Chat Responses (20-30 keywords)
- Trigger words (Persian + English)
- Responses for common mental health topics
- Empathetic, professional tone

---

## 🐛 Known Issues to Address

### Immediate (During Sprint)
- [ ] Ensure all text supports both Persian and English
- [ ] Test RTL layout edge cases
- [ ] Verify pattern lock on different screen sizes
- [ ] Check calendar display on mobile
- [ ] Validate form error messages in both languages

### Post-Prototype
- Mock data → Real backend
- Client-side validation → Server-side
- localStorage → Server sessions
- Mock AI → Real AI API
- Simulated real-time → WebSocket

---

## 📊 Success Criteria

### Functional
- [ ] All user flows are completable
- [ ] No JavaScript errors in console
- [ ] Data persists across sessions (useKV)
- [ ] PWA installable on mobile
- [ ] Works offline (basic functionality)

### Visual
- [ ] Professional, modern design
- [ ] Consistent spacing and alignment
- [ ] Smooth animations (60fps)
- [ ] Proper RTL mirroring
- [ ] Dark mode looks good
- [ ] Accessible contrast ratios

### Performance
- [ ] Initial load < 3 seconds
- [ ] Interactions feel instant (< 100ms)
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Optimized images

---

## 🚀 Post-Prototype Next Steps

1. **Gather Feedback** (1 day)
   - Demo to stakeholders
   - Collect UX feedback
   - Identify pain points

2. **Backend Planning** (2-3 days)
   - Finalize tech stack (AdonisJS vs Elysia)
   - Design complete API spec
   - Plan database schema migrations
   - Setup development environment

3. **Backend Development** (2 weeks)
   - Implement authentication
   - Build REST API
   - Setup WebSocket server
   - Database integration

4. **Integration** (1 week)
   - Replace mock data with API calls
   - Real-time messaging
   - File uploads
   - Testing

5. **External Services** (1 week)
   - AI integration (Pollinations)
   - SMS gateway
   - Email service
   - Payment gateway

6. **Deployment** (2-3 days)
   - VPS setup
   - Apache configuration
   - SSL certificates
   - Monitoring

---

## 📝 Development Notes

### Priority Order
1. **Must Have:** Auth, Chat, Appointments, Dashboard
2. **Should Have:** Assessments, Courses, Admin panel
3. **Nice to Have:** Advanced animations, additional features

### Time Buffers
- Each day includes 1-2 hours buffer
- Can be used for debugging or extending features
- If ahead, add polish or start next day's tasks

### Daily Wrap-up
- Commit code at end of each day
- Update task checklist
- Note any blockers
- Plan next day's focus

---

## 🤝 Collaboration (Future)

### Code Review Process
- Feature branches
- Pull request template
- At least 1 approval
- CI checks passing

### Communication
- GitHub Issues for bugs
- GitHub Discussions for features
- Weekly sync meetings

---

**Created:** Initial Planning  
**Last Updated:** Day 0  
**Next Review:** End of Day 1

---

## ✅ Quick Daily Goals

**Day 1:** Can switch themes and languages, PWA installs  
**Day 2:** Can login and navigate app  
**Day 3:** Can chat with AI and send messages  
**Day 4:** Can book appointment and take assessment  
**Day 5:** Can browse courses, see dashboard, app is polished

---

**Ready to Start!** 🚀
