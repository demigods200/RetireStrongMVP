# Step 2.1 Testing Checklist - Frontend Layout and Design System

## ✅ What to Test

### 1. Navigation & Routing

**Test all routes are accessible:**
- [ ] **Home page** (`/`) - Shows welcome message and quick navigation cards
- [ ] **Today** (`/today`) - Daily session and check-in placeholders
- [ ] **Plan** (`/plan`) - Weekly plan overview placeholder
- [ ] **Progress** (`/progress`) - Progress tracking placeholder
- [ ] **Coach** (`/coach`) - AI coach chat placeholder
- [ ] **Library** (`/library`) - Content library placeholder
- [ ] **Settings** (`/settings`) - Settings placeholder

**Navigation behavior:**
- [ ] Click through all navigation links in the navbar
- [ ] Verify active page is highlighted in navbar (blue background)
- [ ] Logo links back to home page
- [ ] Navigation persists across all pages

### 2. Design System Components

**Button Component:**
- [ ] Primary button (blue) - Check "Get Started" on home page
- [ ] Button has proper size (large enough for 50+ users)
- [ ] Button has hover effects
- [ ] Button has focus states (keyboard navigation)

**Card Component:**
- [ ] Cards display properly on all pages
- [ ] Cards have title and subtitle when provided
- [ ] Cards have proper spacing and shadows
- [ ] Cards are readable with good contrast

**Layout Component:**
- [ ] Navbar appears on all pages
- [ ] Footer appears on all pages
- [ ] Content area has proper padding
- [ ] Layout is responsive (try resizing browser)

### 3. 50+ Friendly Design Features

**Typography:**
- [ ] Text is large enough (minimum 18px base)
- [ ] Headings are prominent and readable
- [ ] Line spacing is comfortable (1.6 line-height)

**Colors & Contrast:**
- [ ] Primary blue color (#0066CC) is visible
- [ ] Text has good contrast against background
- [ ] Links are clearly distinguishable

**Touch Targets:**
- [ ] Buttons are at least 44x44px (large enough to tap)
- [ ] Navigation links are easy to click
- [ ] Interactive elements are well-spaced

**Accessibility:**
- [ ] Can navigate with keyboard (Tab key)
- [ ] Focus indicators are visible
- [ ] ARIA labels are present (check navbar)

### 4. Responsive Design

**Desktop (1920px+):**
- [ ] Navigation shows all links horizontally
- [ ] Content is centered with max-width
- [ ] Cards display in grid layout

**Tablet (768px - 1024px):**
- [ ] Navigation still shows all links
- [ ] Layout adapts appropriately
- [ ] Text remains readable

**Mobile (320px - 767px):**
- [ ] Mobile menu button appears (hamburger icon)
- [ ] Navigation links may be hidden (mobile menu)
- [ ] Content stacks vertically
- [ ] Touch targets remain large

### 5. Visual Consistency

**Check across all pages:**
- [ ] Same navbar on every page
- [ ] Same footer on every page
- [ ] Consistent spacing and padding
- [ ] Consistent color scheme
- [ ] Consistent typography

**Home Page Specific:**
- [ ] "Get Started" button is prominent
- [ ] Quick navigation cards are clickable
- [ ] Cards show hover effects

### 6. Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)

### 7. Performance

- [ ] Pages load quickly
- [ ] Navigation between pages is smooth
- [ ] No console errors (check browser DevTools)
- [ ] No layout shifts when loading

## 🎯 Expected Results

### Home Page (`/`)
- Large heading: "Retire Strong MVP is running"
- Welcome message
- "Get Started" button (blue, large)
- Quick Navigation section with 3 cards (Today, Plan, Coach)

### All Other Pages
- Page title (h1, large)
- Placeholder cards with titles and descriptions
- Consistent layout with navbar and footer

### Navigation
- Active page highlighted in blue
- Smooth transitions between pages
- Logo returns to home

## 🐛 Common Issues to Watch For

1. **Missing styles** - If Tailwind isn't working, you'll see unstyled content
2. **Broken links** - Click all navigation links
3. **Layout breaks** - Resize browser window
4. **Console errors** - Check browser DevTools console
5. **Slow loading** - Pages should load instantly

## ✅ Success Criteria

Step 2.1 is complete when:
- ✅ All 7 routes work and are accessible
- ✅ Navigation persists across all pages
- ✅ Design system components (Button, Card, Layout) work correctly
- ✅ 50+ friendly design is evident (large text, high contrast, big buttons)
- ✅ No console errors
- ✅ Responsive design works

---

**Once all items are checked, Step 2.1 is complete!** ✅

Ready to move to **Step 2.2: Real authentication flow**

