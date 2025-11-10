# YektaCare - Developer Quick Start

## 👋 Welcome Developer!

This is your **command center** for building YektaCare. Everything you need to know is documented here.

---

## 📚 Documentation Map

Read these in order:

1. **PROTOTYPE-vs-PRODUCTION.md** ⚠️ **READ THIS FIRST**
   - Understand what you're building and its limitations
   - Set proper expectations
   - ~10 min read

2. **README.md** 
   - Project overview and vision
   - Key features and design principles
   - Roadmap overview
   - ~15 min read

3. **TASKS.md** 📋 **YOUR DAILY GUIDE**
   - Detailed 5-day sprint plan
   - Task breakdown by day
   - Component checklist
   - ~15 min read

4. **ARCHITECTURE.md**
   - Technical architecture (prototype and future)
   - Database schema (for reference)
   - API design (for future)
   - ~20 min read

5. **SETUP.md**
   - Current setup: automatic (Spark environment)
   - Future production setup guide
   - Reference only for now

6. **ROADMAP.md**
   - Feature roadmap
   - What's deferred to later phases
   - Decision log

---

## 🎯 Your Mission (5 Days)

Build a **professional-looking, feature-demonstrating prototype** of YektaCare mental health platform that:

✅ Shows all key user flows  
✅ Looks modern and trustworthy  
✅ Works as a PWA (installable)  
✅ Supports Persian (primary) and English  
✅ Works in RTL and LTR  
✅ Has smooth animations  
✅ Demonstrates the concept to stakeholders  

❌ Does NOT have a real backend  
❌ Does NOT store data on a server  
❌ Does NOT handle real users  
❌ Is NOT production-ready  

---

## 📅 Your 5-Day Plan

### Day 1: Foundation (Today?)
- Setup theme (colors, fonts)
- Build i18n system (Persian/English)
- Create base layout
- Make it a PWA

**Goal:** Can switch languages/themes, install as app

### Day 2: Auth & Navigation
- Login/register screens
- Pattern lock
- Navigation structure

**Goal:** Can login and navigate around

### Day 3: Chat & Messaging
- AI chat interface (mock responses)
- Messaging center
- Thread management

**Goal:** Can chat with "AI" and send messages

### Day 4: Appointments & Assessments
- Calendar (Jalali + Gregorian)
- Professional profiles
- Booking flow
- Psychological assessment

**Goal:** Can book appointment and take assessment

### Day 5: Dashboard & Polish
- User dashboard
- Admin dashboard
- Course browser
- Animations
- Bug fixes

**Goal:** Everything works and looks professional

---

## 🎨 Design Direction

### Visual Identity
- **Feeling:** Professional, trustworthy, calm, modern
- **Colors:** Blue (trust) + Teal (healthcare) + Orange accents (warmth)
- **Typography:** Vazirmatn (Persian) + Inter (English)
- **Style:** Clean, minimalist, Apple-like, glassmorphic touches

### Key Principles
1. **Mobile-first** - Most users will be on phones
2. **RTL-first** - Design for Persian, adapt for English
3. **Accessibility** - WCAG AA minimum
4. **Performance** - 60fps animations, instant interactions
5. **Simplicity** - Clear hierarchy, obvious actions

---

## 🛠️ Tech Stack (Prototype)

What you're working with:

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Phosphor Icons (already installed)
- **Animations:** Framer Motion (already installed)
- **Storage:** Spark KV (useKV hook) - persists in browser
- **Date/Time:** date-fns (already installed)
- **Forms:** React Hook Form + Zod (already installed)
- **Toasts:** Sonner (already installed)

Everything is pre-installed. Just use it!

---

## 📁 File Structure (What You'll Create)

```
src/
├── components/
│   ├── auth/              # Day 2
│   ├── chat/              # Day 3
│   ├── messaging/         # Day 3
│   ├── appointments/      # Day 4
│   ├── professionals/     # Day 4
│   ├── assessment/        # Day 4
│   ├── dashboard/         # Day 5
│   ├── courses/           # Day 5
│   ├── admin/             # Day 5
│   ├── layout/            # Day 1
│   └── common/            # Throughout
├── hooks/
│   ├── useAuth.ts         # Day 2
│   ├── useChat.ts         # Day 3
│   └── useI18n.ts         # Day 1
├── lib/
│   ├── i18n.ts            # Day 1
│   ├── mock-data.ts       # Throughout
│   ├── ai-mock.ts         # Day 3
│   └── persian-date.ts    # Day 4
├── types/
│   └── index.ts           # Throughout
├── i18n/
│   ├── fa.json            # Day 1
│   └── en.json            # Day 1
├── App.tsx                # Modify Day 1
└── index.css              # Modify Day 1
```

---

## 🚀 Getting Started (Right Now)

### Step 1: Understand the Scope
Read `PROTOTYPE-vs-PRODUCTION.md` if you haven't already.

### Step 2: Review Day 1 Tasks
Open `TASKS.md` and review the Day 1 section in detail.

### Step 3: Start with Theme
Begin with the first task: "Setup Base Theme"

### Step 4: Work Through Tasks
Follow the task list in order. Check off items as you complete them.

### Step 5: Commit Often
Use git to commit your progress:
```bash
git add .
git commit -m "Day 1: Theme setup complete"
```

---

## 💡 Development Tips

### For Speed
1. **Use shadcn components** - Don't build from scratch
2. **Copy and adapt** - Similar components can share code
3. **Mock smartly** - Create reusable mock data
4. **Don't overthink** - This is a prototype, not production
5. **Skip perfection** - Good enough is good enough

### For Quality
1. **Test on mobile** - Use browser dev tools
2. **Test RTL** - Switch to Persian frequently
3. **Test dark mode** - Toggle often
4. **Check console** - No errors
5. **User perspective** - Think like a patient

### Time Management
- Set timer for each task
- Take breaks every 2 hours
- If stuck > 30 min, simplify or skip
- End each day by updating TASKS.md

---

## 🎯 Daily Goals (Quick Reference)

✅ **Day 1:** Themes work, languages work, PWA installs  
✅ **Day 2:** Can login and navigate  
✅ **Day 3:** Can chat and message  
✅ **Day 4:** Can book and assess  
✅ **Day 5:** Polished and complete  

---

## 🔑 Key Patterns

### i18n Usage
```typescript
const { t, locale, setLocale } = useI18n()

// In JSX
<h1>{t('welcome.title')}</h1>
<p>{t('welcome.message', { name: 'Ali' })}</p>

// Switch language
setLocale(locale === 'fa' ? 'en' : 'fa')
```

### Persistence (useKV)
```typescript
import { useKV } from '@github/spark/hooks'

const [data, setData] = useKV('key-name', defaultValue)

// Always use functional updates!
setData(current => [...current, newItem])
```

### Mock Data Pattern
```typescript
// lib/mock-data.ts
export const mockProfessionals = [
  { id: '1', name: 'دکتر مریم احمدی', specialty: 'روانشناس بالینی' },
  // ... more
]

// In component
import { mockProfessionals } from '@/lib/mock-data'
```

### RTL Handling
```typescript
// Automatic with dir attribute
<html dir={locale === 'fa' ? 'rtl' : 'ltr'}>
```

---

## 🐛 Common Issues

### "Component not found"
- Check import path (use `@/` for src)
- Ensure file exists
- Check for typos

### "useKV not working"
- Import from `@github/spark/hooks`
- Use functional updates for state that depends on previous value
- Don't reference stale closures

### "RTL layout broken"
- Use `start`/`end` instead of `left`/`right` in Tailwind
- Test with actual Persian text
- Check if dir="rtl" is set

### "Dark mode not working"
- Ensure variables defined in :root and .dark
- Use Tailwind's color classes (bg-background, etc.)
- Check @theme block has color mappings

---

## 📦 Pre-installed Packages

You have access to:
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui v4 (40+ components)
- Framer Motion
- Phosphor Icons
- date-fns
- React Hook Form
- Zod
- Sonner (toasts)
- Lucide React (more icons)
- clsx / tailwind-merge
- And more (check package.json)

**Don't install new packages unless absolutely necessary.**

---

## 🎓 Resources

### When Stuck
1. Check shadcn docs: https://ui.shadcn.com/
2. Check Tailwind docs: https://tailwindcss.com/
3. Check Framer Motion docs: https://www.framer.com/motion/
4. Check component examples in `src/components/ui/`

### Design Inspiration
- Dribbble: "healthcare app"
- Behance: "mental health platform"
- Mobbin: "health & fitness" category

### Persian Resources
- Vazirmatn font: https://fonts.google.com/?query=vazirmatn
- Jalali calendar libs (for reference)

---

## ✅ Definition of Done (Day 5)

Your prototype is complete when:

### Functional
- [ ] All user flows are clickable
- [ ] Data persists across refresh
- [ ] No console errors
- [ ] PWA installs on mobile
- [ ] Works in both languages

### Visual
- [ ] Looks professional
- [ ] Consistent spacing
- [ ] Smooth animations
- [ ] Dark mode looks good
- [ ] Mobile responsive

### Content
- [ ] All text translated (Persian + English)
- [ ] Mock data feels realistic
- [ ] AI responses make sense
- [ ] Empty states exist

### Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback (toasts)
- [ ] Smooth transitions
- [ ] No layout shifts

---

## 🎬 After Prototype

### Immediate (Day 6)
1. Test with a friend/colleague
2. Note what's confusing
3. Fix critical issues
4. Create a demo video

### Next Week
1. Demo to stakeholders
2. Collect feedback
3. Update design if needed
4. Start backend planning

### Weeks 3-8
1. Learn backend tech if needed
2. Build production backend
3. Integrate with this frontend
4. Deploy to VPS
5. Launch! 🚀

---

## 🆘 Need Help?

### During Development
- Check documentation in this repo
- Review shadcn component code
- Search for similar examples online
- Simplify if stuck too long

### After Prototype
- Create GitHub Issues for bugs
- Use GitHub Discussions for questions
- Reference ARCHITECTURE.md for backend

---

## 🎉 You Got This!

You have:
✅ Clear requirements  
✅ Detailed task breakdown  
✅ 5-day timeline  
✅ All tools pre-installed  
✅ Comprehensive documentation  

**Just start with Day 1, Task 1, and work through the list.**

The timeline is aggressive but achievable. Stay focused, don't over-engineer, and remember: this is a prototype to validate the concept, not production software.

---

## 📋 Quick Checklist (Before Starting)

- [ ] Read PROTOTYPE-vs-PRODUCTION.md
- [ ] Read this file (you're here!)
- [ ] Skim TASKS.md Day 1 section
- [ ] Have 8 hours available
- [ ] Eliminate distractions
- [ ] Open TASKS.md in another window
- [ ] Start coding! 🚀

---

**Current Status:** 📋 Ready to Start  
**Next Action:** Begin Day 1, Task 1 in TASKS.md  
**Time Estimate:** 5 days (40 hours)  

**Good luck! You're building something meaningful.** 💙
