# YektaCare - Quick Reference Card

**Keep this open while coding!**

---

## 📋 Today's Focus

**Current Day:** _____  
**Main Goal:** _________________________________  
**Hours Available:** _____

---

## ✅ Daily Checklist

### Every Day
- [ ] Update STATUS.md at end of day
- [ ] Test on mobile (at least once)
- [ ] Check console for errors
- [ ] Test RTL/LTR switch
- [ ] Test dark/light mode
- [ ] Commit code (2-3 times)
- [ ] Take breaks every 2 hours

---

## 🎯 5-Day Goals (Quick View)

| Day | Core Goal | Deliverable |
|-----|-----------|-------------|
| 1   | Foundation | Theme + i18n + PWA working |
| 2   | Auth & Nav | Can login and navigate |
| 3   | Chat | Can chat with AI and message |
| 4   | Booking | Can book appointment and assess |
| 5   | Polish | Complete, professional, tested |

---

## 🔧 Essential Code Snippets

### i18n
```typescript
import { useI18n } from '@/hooks/useI18n'
const { t, locale, setLocale } = useI18n()
<h1>{t('key.subkey')}</h1>
```

### Persistence
```typescript
import { useKV } from '@github/spark/hooks'
const [data, setData] = useKV('key', defaultValue)
setData(current => [...current, newItem]) // functional update!
```

### Import Asset
```typescript
import myImage from '@/assets/images/logo.png'
<img src={myImage} alt="Logo" />
```

### shadcn Component
```typescript
import { Button } from "@/components/ui/button"
<Button>Click Me</Button>
```

### Icon
```typescript
import { Heart } from "@phosphor-icons/react"
<Heart />
```

### Toast
```typescript
import { toast } from 'sonner'
toast.success('Success!')
toast.error('Error!')
```

### Route
```typescript
// Will need to setup routing
import { useNavigate } from 'react-router-dom' // if using react-router
const navigate = useNavigate()
navigate('/path')
```

---

## 🎨 Theme Colors (Placeholder - Define Day 1)

```css
/* Will be defined in index.css Day 1 */
--primary: /* Blue - trust, calm */
--secondary: /* Teal - healthcare */
--accent: /* Orange - warmth */
```

---

## 📐 Spacing Scale

```
xs:  4px   (gap-1, p-1)
sm:  8px   (gap-2, p-2)
md:  16px  (gap-4, p-4)
lg:  24px  (gap-6, p-6)
xl:  32px  (gap-8, p-8)
2xl: 48px  (gap-12, p-12)
```

---

## 🗂️ File Organization

```
src/
├── components/
│   ├── auth/        - Login, Register, OTP, Pattern
│   ├── chat/        - Chat interface
│   ├── messaging/   - Thread list
│   ├── appointments/- Booking flow
│   ├── dashboard/   - Dashboards
│   ├── layout/      - Shell, Header, Nav
│   └── common/      - Shared components
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useI18n.ts
├── lib/
│   ├── i18n.ts
│   ├── mock-data.ts
│   └── persian-date.ts
├── i18n/
│   ├── fa.json
│   └── en.json
└── types/
    └── index.ts
```

---

## 🐛 Quick Troubleshooting

**Changes not showing?**
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

**Import error?**
- Check path (use `@/` for src)
- Check file exists
- Check spelling

**useKV not updating?**
- Use functional update: `setData(current => ...)`
- Don't reference stale closures

**RTL broken?**
- Use `start`/`end` not `left`/`right`
- Check `dir="rtl"` on html element
- Test with actual Persian text

**Dark mode not working?**
- Check `:root` and `.dark` in index.css
- Check `@theme` block has color mappings
- Use Tailwind color classes (bg-background, etc.)

---

## 📱 Test Checklist (Daily)

- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Persian text displays correctly
- [ ] English text displays correctly
- [ ] RTL layout mirrors properly
- [ ] Dark mode looks good
- [ ] Light mode looks good
- [ ] Animations are smooth
- [ ] No console errors

---

## ⏱️ Time Management

**If stuck >30 minutes:**
1. Simplify the requirement
2. Use a pre-built solution
3. Skip and come back later
4. Ask AI for help
5. Move on to next task

**Pomodoro Technique:**
- 25 min focused work
- 5 min break
- Repeat 4 times
- Then 15-30 min break

---

## 🎯 Priority Order

### Must Have (Do First)
1. Core user flows work
2. Data persists
3. Looks professional
4. No critical bugs

### Should Have (Do Second)
1. Animations
2. Loading states
3. Empty states
4. Error handling

### Nice to Have (Do If Time)
1. Extra animations
2. Advanced features
3. Additional polish

---

## 📊 Component Status Tracker

### Day 1
- [ ] AppShell
- [ ] Header
- [ ] ThemeToggle
- [ ] LanguageToggle
- [ ] SplashScreen

### Day 2
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] OTPScreen
- [ ] PatternLock
- [ ] BottomNav
- [ ] Sidebar

### Day 3
- [ ] ChatScreen
- [ ] MessageBubble
- [ ] ChatInput
- [ ] MessagingCenter
- [ ] ThreadCard

### Day 4
- [ ] Calendar
- [ ] ProfessionalCard
- [ ] BookingFlow
- [ ] AssessmentForm
- [ ] AssessmentResults

### Day 5
- [ ] UserDashboard
- [ ] AdminDashboard
- [ ] CourseCard
- [ ] CourseBrowser
- [ ] UserList

---

## 💡 Design Principles (Quick Reminder)

1. **Mobile-First** - Design for phones
2. **RTL-First** - Design for Persian
3. **Simplicity** - Less is more
4. **Consistency** - Reuse patterns
5. **Feedback** - Always respond to actions
6. **Performance** - 60fps or nothing
7. **Accessibility** - Everyone can use it

---

## 🚫 Don't Do This

- ❌ Add features not in TASKS.md
- ❌ Optimize prematurely
- ❌ Build components shadcn has
- ❌ Work >10 hours (burnout risk)
- ❌ Skip testing until day 5
- ❌ Forget to commit code
- ❌ Aim for perfection

---

## ✅ Do This

- ✅ Follow TASKS.md order
- ✅ Use shadcn components
- ✅ Test frequently
- ✅ Take breaks
- ✅ Commit often
- ✅ Update STATUS.md
- ✅ Aim for "good enough"

---

## 📞 When You Need Help

1. Check documentation in repo
2. Check shadcn docs
3. Check Tailwind docs
4. Search for examples online
5. Ask AI for boilerplate
6. Simplify the requirement
7. Move on, come back later

---

## 🎉 Celebrate Wins

- [ ] First component renders
- [ ] Theme switching works
- [ ] Persian text looks good
- [ ] PWA installs
- [ ] Chat feels nice
- [ ] Booking flow is smooth
- [ ] Dashboard impresses you
- [ ] Day 1 complete
- [ ] Day 2 complete
- [ ] Day 3 complete
- [ ] Day 4 complete
- [ ] Day 5 complete
- [ ] Prototype DONE! 🎉

---

## 📝 End of Day Routine

1. Update STATUS.md with:
   - Tasks completed
   - Tasks in progress
   - Any blockers
   - Tomorrow's plan
   - Actual hours worked

2. Commit code:
```bash
git add .
git commit -m "Day X: [what you did]"
```

3. Test the app one more time

4. Plan tomorrow (5 minutes)

5. Rest!

---

## 🚀 Reminder

**You're building something meaningful.**

Mental health support matters. This platform could help real people. Take pride in your work, but remember: perfect is the enemy of done.

**Focus. Build. Ship.**

---

**Current Sprint:** Days 1-5 (Prototype)  
**Timeline:** 5 days / 40 hours  
**Goal:** Professional demo-ready prototype  
**Deadline:** [Fill in your deadline]

**You got this!** 💪
