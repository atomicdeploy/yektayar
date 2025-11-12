# YektaYar Branding Guide

## Brand Identity

### What is YektaYar?
YektaYar (یکتایار) is a professional mental health and family wellbeing platform. The name means "unique companion" or "one-of-a-kind friend" in Persian, emphasizing personalized care and trusted support.

### Brand Personality
- **Professional**: Clinical excellence and evidence-based practices
- **Warm**: Approachable and compassionate care
- **Modern**: Contemporary design and technology
- **Premium**: High-quality service and attention to detail
- **Trustworthy**: Reliable and secure platform

## Visual Identity

### Logo
- Location: `assets/logo/icon.svg` and `assets/logo/logo.svg`
- The logo features a stylized design in Gold (#d4a43e)
- Never distort, rotate, or alter logo colors
- Maintain clear space around logo (minimum 20px)

### Color Palette
See [COLOR-PALETTE.md](./COLOR-PALETTE.md) for detailed color specifications.

**Primary Colors:**
- Gold: `#d4a43e` - Warmth and premium quality
- Navy Seal: `#01183a` - Trust and professionalism

### Typography

#### Primary Fonts
- **Arabic/Persian**: Sahel (Sans-serif)
  - Regular, Light, Bold weights
  - Location: `packages/mobile-app/public/fonts/`
  
- **English**: System fonts fallback
  - -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

#### Special Fonts
- **IranNastaliq**: For special taglines and decorative Persian text
  - Usage: Splash screen tagline only
  - Provides traditional calligraphic feel
  - Location: `packages/mobile-app/public/fonts/IranNastaliq.*`

### Font Hierarchy
```
Heading 1: 2.5rem, Bold, Gold color
Heading 2: 2rem, Bold
Heading 3: 1.5rem, Semi-bold
Body: 1rem, Regular
Small: 0.875rem, Regular
Caption: 0.75rem, Light
```

## User Interface Guidelines

### Splash Screen
The splash screen is the first impression users have:
- Navy Seal gradient background
- Animated logo with gold accent circle
- Persian tagline in IranNastaliq font with gold color
- App and API version display
- Smooth fade-in animations
- See: `packages/mobile-app/src/views/SplashScreen.vue`

### Buttons
- **Primary**: Gold background, white text
- **Secondary**: Navy Seal background, white text
- **Outline**: Transparent with gold border
- Border radius: 8px (standard), 24px (rounded)

### Cards
- White background in light mode
- Subtle shadow: `0 2px 8px rgba(0, 0, 0, 0.1)`
- Border radius: 12px
- Gold accent for active/selected states

### Navigation
- Navy Seal background for dark mode
- Gold highlight for active items
- White icons with gold highlight on active

### Spacing
- Use 8px base unit (0.5rem)
- Common spacing: 8px, 16px, 24px, 32px, 48px
- Consistent padding within components

## Animation Guidelines

### Principles
- Subtle and purposeful
- Enhance UX, don't distract
- Duration: 200-400ms for micro-interactions, 800ms for page transitions
- Easing: ease-out for entrances, ease-in for exits

### Common Animations
```css
/* Fade in */
opacity: 0 → 1
transition: opacity 0.8s ease-out

/* Slide up */
transform: translateY(20px) → translateY(0)
transition: transform 0.8s ease-out

/* Pulse (for emphasis) */
transform: scale(1) → scale(1.05) → scale(1)
animation: 2s ease-in-out infinite
```

### Logo Animations
- Pulse effect on splash screen
- Floating motion (subtle)
- Gold glow effect for emphasis

## Content Guidelines

### Tone of Voice
- **Professional but warm**: Like a trusted advisor
- **Clear and concise**: Avoid jargon
- **Empathetic**: Understanding and supportive
- **Respectful**: Honor cultural context

### Language
- Primary: Persian (Farsi)
- Secondary: English (for technical terms)
- Right-to-left (RTL) layout for Persian
- Use formal Persian address forms

### Writing Style
- Use active voice
- Keep sentences short and clear
- Explain technical terms in simple language
- Use bullet points for lists
- Include helpful examples

## Icon System

### Style
- Outlined style (2px stroke)
- Consistent corner radius
- 24x24px base size
- Gold color for primary actions
- Gray for neutral/inactive states

### Usage
- Use Ionicons for consistency
- Custom icons should match Ionicons style
- Meaningful icons that users recognize
- Include text labels for important actions

## Platform-Specific Guidelines

### Mobile App (Ionic/Vue)
- Follow Ionic design patterns
- Native-feeling interactions
- Touch-friendly targets (minimum 44x44px)
- Bottom navigation for primary actions
- Pull-to-refresh where appropriate

### Admin Panel (Vue/Tailwind)
- Clean, data-focused interface
- Desktop-optimized layouts
- Sidebar navigation
- Consistent table designs
- Efficient workflows

### Backend API
- Consistent error messages
- Clear API versioning
- Helpful documentation
- Proper status codes

## Accessibility

### Requirements
- WCAG 2.1 Level AA compliance minimum
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators visible
- Alternative text for images

### Best Practices
- Don't rely on color alone to convey information
- Provide text alternatives for icons
- Ensure forms are properly labeled
- Test with screen readers
- Support system font size preferences

## Brand Applications

### Marketing Materials
- Use brand colors consistently
- Include logo with proper spacing
- Follow typography hierarchy
- Maintain professional tone
- Include tagline when appropriate

### Social Media
- Profile picture: Icon logo on white
- Cover images: Navy Seal background with gold accents
- Post templates with brand colors
- Consistent visual style

### Documentation
- Clear hierarchy with headings
- Code examples with syntax highlighting
- Screenshots with proper branding
- Consistent formatting

## Quality Standards

### Design
- Pixel-perfect implementations
- Consistent spacing and alignment
- Proper use of brand colors
- High-quality assets (2x, 3x for mobile)

### Development
- Clean, maintainable code
- Follow project conventions
- Comprehensive testing
- Performance optimization
- Accessibility compliance

### Content
- No spelling or grammar errors
- Culturally appropriate
- Accurate and up-to-date
- Clear and helpful

## Review Checklist

Before submitting designs or implementations:
- [ ] Uses correct brand colors
- [ ] Typography follows hierarchy
- [ ] Spacing is consistent
- [ ] Animations are subtle and purposeful
- [ ] Meets accessibility standards
- [ ] Works in both light and dark modes
- [ ] Tested on target devices
- [ ] No placeholder content
- [ ] High-quality assets
- [ ] Follows naming conventions

## Resources

### Design Assets
- Logo files: `assets/logo/`
- Color swatches: See COLOR-PALETTE.md
- Fonts: `packages/mobile-app/public/fonts/`

### Code References
- Theme variables: `packages/mobile-app/src/theme/variables.css`
- Admin panel theme: `packages/admin-panel/src/assets/main.css`
- Example components: See respective `components/` directories

### External Resources
- Ionicons: https://ionic.io/ionicons
- Sahel Font: https://github.com/rastikerdar/sahel-font
- IranNastaliq Font: https://github.com/rastikerdar/iran-nastaliq-font

## Getting Help

For branding questions or approvals:
1. Check this guide first
2. Review existing implementations
3. Ask in development channel
4. Request design review for major changes

## Version History

- **v1.0** (2025-11-12): Initial branding guide
  - Defined Gold and Navy Seal as primary colors
  - Established typography system
  - Created splash screen design
  - Documented brand personality

---

**Remember**: Consistency is key to strong branding. When in doubt, refer to existing implementations in the admin panel and mobile app.
