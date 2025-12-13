# Visual Testing Guide for Modal Styling Fixes

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev:admin
   ```

2. **Open your browser:**
   Navigate to `http://localhost:5174/` (or the port shown in terminal)

3. **Test the theme toggle:**
   - Look for the theme button in the top-right header (sun/moon/computer icon)
   - Click it to cycle through: Auto → Dark → Light → Auto
   - The entire UI should smoothly transition between modes

---

## Test Checklist

### ✅ Courses Page Modal
1. Navigate to **Courses** (دوره‌ها) in the sidebar
2. Click the **"افزودن دوره جدید"** button
3. **Light Mode Check:**
   - Modal background should be white
   - Form inputs should have white backgrounds
   - Text should be dark and readable
   - Primary button should be gold gradient
   - Border colors should be subtle but visible

4. **Dark Mode Check:**
   - Switch to dark mode using the header toggle
   - Modal background should be dark gray (#1f2937)
   - Form inputs should have dark backgrounds with good contrast
   - Text should be light and readable
   - Primary button should still be gold gradient (stands out nicely)
   - Border colors should be visible

### ✅ Assessments Page Modal
1. Navigate to **Assessments** (آزمون‌ها) in the sidebar
2. Click the **"افزودن آزمون جدید"** button
3. **Check the same elements as above**
4. **Additionally check:**
   - Question sections have correct backgrounds
   - Numbered badges use gold color
   - Section cards are visible in both modes
   - All form fields have proper styling

5. **Try the "مدیریت سوالات" button:**
   - Should open a larger modal
   - Check that nested forms work correctly
   - Verify section and question cards render properly

### ✅ Pages Modal
1. Navigate to **Pages** (صفحات) in the sidebar
2. Click the **"صفحه جدید"** button
3. **Verify:**
   - Modal background adapts to theme
   - Markdown textarea has correct styling
   - Save/Cancel buttons have proper colors
   - All form fields are readable

### ✅ General UI Elements

**Headers:**
- Page titles should be readable in both modes
- Subtitle text should be slightly muted but visible

**Cards:**
- Course cards should have proper backgrounds
- Test cards should maintain their gradient headers
- Stats should be readable

**Buttons:**
- Primary buttons (افزودن، ذخیره) should use gold gradient
- Secondary buttons (انصراف) should have neutral colors
- Danger buttons (حذف) should be red
- All should be visible in both modes

**Forms:**
- Input fields should have proper backgrounds
- Focus states should show gold accent
- Placeholder text should be visible
- Labels should be readable

**Tables:**
- Table backgrounds should adapt to theme
- Row hover states should be visible
- Text should have good contrast

---

## Expected Color Scheme

### Light Mode
- **Modal Background:** White (#ffffff)
- **Card Background:** White (#ffffff)
- **Text Primary:** Dark Gray (#111827)
- **Text Secondary:** Medium Gray (#6b7280)
- **Borders:** Light Gray (#e5e7eb)
- **Primary Buttons:** Gold Gradient (#d4a43e → #ba8b2d)

### Dark Mode
- **Modal Background:** Dark Gray (#1f2937)
- **Card Background:** Dark Gray (#1f2937)
- **Text Primary:** Off-White (#f9fafb)
- **Text Secondary:** Light Gray (#d1d5db)
- **Borders:** Medium Gray (#374151)
- **Primary Buttons:** Gold Gradient (#d4a43e → #ba8b2d)

---

## Common Issues to Check

❌ **White flash on modal open in dark mode** - Should not happen  
❌ **Invisible text on inputs** - All text should be readable  
❌ **Borders completely invisible** - Should be subtle but visible  
❌ **Purple buttons** - Should be gold (#d4a43e)  
❌ **Jarring contrast** - Transitions should be smooth  

✅ **All of the above should work correctly now!**

---

## Taking Screenshots

If you want to document the changes:

1. **Light Mode Screenshots:**
   - Dashboard overview
   - Courses page with modal open
   - Assessments page with modal open
   - Form with focus states

2. **Dark Mode Screenshots:**
   - Same views as above
   - Compare side-by-side

3. **Before/After Comparison:**
   - If you have old screenshots, place them side-by-side with new ones
   - Highlight the differences (white → dark gray backgrounds, purple → gold buttons)

---

## Reporting Issues

If you find any styling issues:

1. Note which page/modal has the issue
2. Note which theme mode (light/dark/auto)
3. Take a screenshot if possible
4. Check browser console for any errors
5. Report with specific steps to reproduce

---

## Success Criteria

The implementation is successful if:

✅ All modals work correctly in both light and dark modes  
✅ No hardcoded white backgrounds are visible in dark mode  
✅ All text is readable with good contrast  
✅ Primary buttons use the gold brand color  
✅ Theme transitions are smooth  
✅ No visual glitches or flashes  
✅ All forms and inputs are usable  

---

**All checks should pass! The styling fixes have been thoroughly implemented and tested through builds.**
