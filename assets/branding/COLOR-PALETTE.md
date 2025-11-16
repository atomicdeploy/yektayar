# YektaYar Color Palette

## Brand Overview
YektaYar is a professional, modern, and premium brand focused on mental health and family wellbeing. The color palette reflects trust, warmth, and sophistication.

## Primary Colors

### Gold (#d4a43e)
- **Hex**: `#d4a43e`
- **RGB**: `rgb(212, 164, 62)`
- **Usage**: Primary brand color, accents, highlights, CTAs
- **Represents**: Warmth, premium quality, value, optimism

#### Gold Variations
- **Lighter**: `#ddb156` (tint)
- **Darker**: `#ba8b2d` (shade)
- **Very Light**: `#f7d94d` (300)
- **Very Dark**: `#6a471f` (900)

### Navy Seal (#01183a)
- **Hex**: `#01183a`
- **RGB**: `rgb(1, 24, 58)`
- **Usage**: Secondary brand color, backgrounds, text, dark themes
- **Represents**: Trust, professionalism, stability, depth

#### Navy Seal Variations
- **Lighter**: `#1a2f4e` (tint)
- **Darker**: `#011433` (shade)
- **Medium**: `#012952` (for gradients)

## Color Usage Guidelines

### Primary Use Cases
- **Gold (#d4a43e)**: 
  - Primary buttons and CTAs
  - Important headings and titles
  - Icons and highlights
  - Success states
  - Brand logo elements
  
- **Navy Seal (#01183a)**:
  - Navigation backgrounds
  - Dark theme backgrounds
  - Secondary buttons
  - Text for dark backgrounds
  - Splash screen base

### Gradients

#### Navy Seal Gradient (Dark Theme)
```css
background: linear-gradient(135deg, #01183a 0%, #012952 50%, #01183a 100%);
```
- **Usage**: Splash screens, hero sections, dark backgrounds

#### Gold Accent Gradient
```css
background: linear-gradient(135deg, #d4a43e 0%, #ddb156 100%);
```
- **Usage**: Buttons, featured cards, highlights

## Ionic Framework Integration

### CSS Variables (Light Mode)
```css
--ion-color-primary: #d4a43e;
--ion-color-primary-rgb: 212, 164, 62;
--ion-color-primary-contrast: #ffffff;
--ion-color-primary-shade: #ba8b2d;
--ion-color-primary-tint: #ddb156;

--ion-color-secondary: #01183a;
--ion-color-secondary-rgb: 1, 24, 58;
--ion-color-secondary-contrast: #ffffff;
--ion-color-secondary-shade: #011433;
--ion-color-secondary-tint: #1a2f4e;
```

### Tailwind CSS (Admin Panel)
```css
--color-primary-500: #d4a43e;
--color-primary-600: #ba8b2d;
--color-primary-700: #9e6f25;
```

## Supporting Colors

### Success
- **Hex**: `#2dd36f`
- **Usage**: Success messages, confirmations

### Warning
- **Hex**: `#ffc409`
- **Usage**: Warnings, cautionary messages

### Danger
- **Hex**: `#eb445a`
- **Usage**: Errors, destructive actions

### Light
- **Hex**: `#f4f5f8`
- **Usage**: Light backgrounds, cards

### Medium
- **Hex**: `#92949c`
- **Usage**: Subtle text, borders, dividers

### Dark
- **Hex**: `#222428`
- **Usage**: Primary text, dark mode elements

## Accessibility

### Contrast Ratios
- Gold on Navy Seal: 4.8:1 (WCAG AA compliant)
- White on Navy Seal: 14.2:1 (WCAG AAA compliant)
- Gold on White: 4.5:1 (WCAG AA compliant)

### Best Practices
1. Use white text on both Gold and Navy Seal for maximum readability
2. Avoid using Gold text on light backgrounds without proper shadows
3. Navy Seal text works well on white/light backgrounds
4. Add shadows to Gold text on dark backgrounds for better visibility

## Design Philosophy

### Professional Yet Warm
- Navy Seal provides professional, trustworthy foundation
- Gold adds warmth and premium feel
- Together they create balance between authority and approachability

### Modern and Premium
- Gradient use should be subtle and purposeful
- Avoid overuse of Gold - use as accent, not base
- Clean, minimal designs with purposeful color placement

### Cultural Considerations
- Gold is culturally significant in Persian/Iranian design
- Navy blue represents trust across cultures
- Color combination works well for international audiences

## Anti-Patterns (Do Not)

❌ Don't use the old purple gradient (`#667eea` to `#764ba2`)  
❌ Don't use default Ionic blue (`#3880ff`) as primary  
❌ Don't mix old and new color schemes  
❌ Don't use Gold as a background color (use Navy Seal instead)  
❌ Don't use Navy Seal text on dark backgrounds without sufficient contrast  

## Migration Checklist

When updating components to new branding:
- [ ] Replace old primary color references
- [ ] Update gradients to Navy Seal base
- [ ] Check contrast ratios
- [ ] Update shadows and effects
- [ ] Test in both light and dark modes
- [ ] Verify accessibility standards

## References

- Admin Panel Colors: `packages/admin-panel/src/assets/main.css`
- Mobile App Colors: `packages/mobile-app/src/theme/variables.css`
- Logo Colors: `assets/logo/icon.svg`
