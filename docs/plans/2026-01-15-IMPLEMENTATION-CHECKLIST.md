# FLAVATIX REDESIGN: IMPLEMENTATION CHECKLIST
**Developer Quick Reference**

**Status:** ✅ Ready to Execute
**Created:** January 15, 2026
**Timeline:** 4-6 weeks
**Docs:** 2026-01-15-MASTER-IMPLEMENTATION-PLAN.md, 2026-01-15-VISUAL-WIREFRAMES.md

---

## WEEK 1: DESIGN SYSTEM FOUNDATION

### Day 1-2: Tailwind Configuration

- [ ] **Update `tailwind.config.js`**
  - [ ] Add spring easing timing functions (spring, spring-tight, spring-gentle, spring-back)
  - [ ] Add context-aware shadows (button, button-hover, button-active, card, card-hover, card-active, modal)
  - [ ] Add scale utilities (scale-102, scale-98) if not already present
  - [ ] Verify flavor descriptor colors are in config

  ```javascript
  // Location: tailwind.config.js → theme.extend
  transitionTimingFunction: { ... },
  boxShadow: { ... },
  scale: { ... }
  ```

- [ ] **Test Tailwind build**
  ```bash
  npm run dev
  # Verify no errors in console
  ```

### Day 3-4: Global Styles

- [ ] **Update `styles/globals.css`**
  - [ ] Add glassmorphism utilities (`.glass`, `.glass-strong`, `.glass-soft`)
  - [ ] Add spring transition utilities (`.transition-spring`, `.transition-spring-tight`, `.transition-spring-gentle`)
  - [ ] Add `@media (prefers-reduced-motion)` override

  ```css
  /* Paste from MASTER-IMPLEMENTATION-PLAN.md Part 6 */
  ```

- [ ] **Test in browser**
  - [ ] Apply `.glass` class to a test div
  - [ ] Verify backdrop blur works
  - [ ] Test in light and dark mode

### Day 5: Verification

- [ ] **Run full app in dev mode**
  ```bash
  npm run dev
  # Navigate to http://localhost:3000
  ```

- [ ] **Verify no regressions**
  - [ ] Existing pages still render correctly
  - [ ] No console errors
  - [ ] Dark mode toggle works

---

## WEEK 2: HOMEPAGE REDESIGN

### Day 1: Create New Components

- [ ] **Create `/components/home/FloatingFlavorBadges.tsx`**
  - [ ] Copy code from MASTER-IMPLEMENTATION-PLAN.md Part 2.2
  - [ ] Import `framer-motion`
  - [ ] Verify flavors array with correct colors
  - [ ] Test animation in isolation

  ```bash
  # Test component renders
  npm run dev
  # Import in test page to verify
  ```

### Day 2-3: Update Homepage

- [ ] **Backup current homepage**
  ```bash
  cp pages/index.tsx pages/index.tsx.backup
  cp pages/HeroSection.module.css pages/HeroSection.module.css.backup
  ```

- [ ] **Update `pages/HeroSection.module.css`**
  - [ ] Replace `.hero` background-image with gradient
  - [ ] Update `::before` overlay if needed
  - [ ] Add dark mode gradient variant

  ```css
  /* Paste gradient code from MASTER-IMPLEMENTATION-PLAN.md Part 2.2 */
  ```

- [ ] **Update `pages/index.tsx` hero section**
  - [ ] Remove Supabase image reference
  - [ ] Import `FloatingFlavorBadges` component
  - [ ] Replace hero content with new design (Part 2.3 of master plan)
  - [ ] Add motion animations from `framer-motion`
  - [ ] Update feature pills to horizontal layout with icons
  - [ ] Update CTA button with new styles

### Day 4: Testing

- [ ] **Visual testing**
  - [ ] Mobile (320px) - Chrome DevTools
  - [ ] Tablet (768px) - Chrome DevTools
  - [ ] Desktop (1024px+) - Chrome DevTools
  - [ ] Dark mode on all sizes

- [ ] **Animation testing**
  - [ ] Floating badges animate smoothly (60fps)
  - [ ] Hero content fades in with spring easing
  - [ ] No layout shift during animations
  - [ ] Test with `prefers-reduced-motion` enabled

- [ ] **Cross-browser testing**
  - [ ] Chrome (desktop)
  - [ ] Safari (macOS & iOS)
  - [ ] Firefox
  - [ ] Edge

### Day 5: Polish

- [ ] **Fine-tune spacing**
  - [ ] Adjust logo size on mobile if needed
  - [ ] Verify CTA button is prominent
  - [ ] Check social proof text visibility

- [ ] **Performance check**
  - [ ] Run Lighthouse audit
  - [ ] Verify Performance score 90+
  - [ ] Check for console warnings

---

## WEEK 3: LOGIN PAGE REDESIGN

### Day 1-2: Update AuthSection Component

- [ ] **Backup current auth page**
  ```bash
  cp components/auth/AuthSection.tsx components/auth/AuthSection.tsx.backup
  ```

- [ ] **Update `components/auth/AuthSection.tsx`**
  - [ ] Wrap in full-screen gradient container
  - [ ] Add glassmorphic card wrapper (`.glass-strong`)
  - [ ] Update form layout (centered, max-w-md)
  - [ ] Import `framer-motion` for card entrance
  - [ ] Add card entrance animation
  - [ ] Update input styles with premium focus states
  - [ ] Update button styles with spring easing
  - [ ] Add logo and headings to card

  ```tsx
  /* Paste updated component from MASTER-IMPLEMENTATION-PLAN.md Part 3.3 */
  ```

### Day 3: Input Focus Enhancement

- [ ] **Test input focus states**
  - [ ] Click email input - verify ring glow appears
  - [ ] Click password input - verify ring glow appears
  - [ ] Tab through inputs - verify focus indicator visible
  - [ ] Verify ring color is primary
  - [ ] Verify shadow appears on focus

- [ ] **Fine-tune focus ring**
  - [ ] Adjust `ring-offset-2` if needed
  - [ ] Test in light and dark mode
  - [ ] Verify accessibility (WCAG AA)

### Day 4: Testing

- [ ] **Functional testing**
  - [ ] Test login flow (existing user)
  - [ ] Test register flow (new user)
  - [ ] Test form validation errors
  - [ ] Test loading state
  - [ ] Test toggle between login/register

- [ ] **Visual testing**
  - [ ] Mobile (320px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1024px+)
  - [ ] Dark mode on all sizes

- [ ] **Animation testing**
  - [ ] Card entrance bounces in smoothly
  - [ ] Inputs focus with spring easing
  - [ ] Button hover/active states work
  - [ ] No janky animations

### Day 5: Polish

- [ ] **Error handling**
  - [ ] Verify error messages display correctly
  - [ ] Test with invalid email
  - [ ] Test with short password
  - [ ] Verify toast notifications work

- [ ] **Accessibility**
  - [ ] Keyboard navigation works (Tab, Enter)
  - [ ] Focus indicators visible
  - [ ] Labels associated with inputs
  - [ ] Error messages announced to screen readers

---

## WEEK 4: POLISH & TESTING

### Day 1-2: Cross-Browser Testing

- [ ] **Desktop browsers**
  - [ ] Chrome (latest) - Homepage + Login
  - [ ] Safari (macOS) - Homepage + Login
  - [ ] Firefox (latest) - Homepage + Login
  - [ ] Edge (latest) - Homepage + Login

- [ ] **Mobile browsers**
  - [ ] Safari (iOS 15+) - Homepage + Login
  - [ ] Chrome (Android) - Homepage + Login
  - [ ] Samsung Internet - Homepage + Login (if available)

- [ ] **Document any browser-specific issues**

### Day 3: Performance Audit

- [ ] **Run Lighthouse audits**
  - [ ] Homepage (desktop)
    - [ ] Performance: 90+
    - [ ] Accessibility: 100
    - [ ] Best Practices: 100
    - [ ] SEO: 100
  - [ ] Homepage (mobile)
    - [ ] Performance: 90+
    - [ ] Accessibility: 100
  - [ ] Login page (desktop & mobile)
    - [ ] Performance: 90+
    - [ ] Accessibility: 100

- [ ] **DevTools Performance profiling**
  - [ ] Record page load
  - [ ] Verify no long tasks (>50ms)
  - [ ] Check animation frame rate (60fps)
  - [ ] Verify no layout shifts (CLS = 0)

### Day 4: Accessibility Audit

- [ ] **Keyboard navigation**
  - [ ] Tab through all interactive elements
  - [ ] Enter/Space activates buttons
  - [ ] Focus indicators always visible

- [ ] **Screen reader testing** (optional but recommended)
  - [ ] VoiceOver (macOS/iOS) or NVDA (Windows)
  - [ ] Verify all content is announced
  - [ ] Verify form labels work
  - [ ] Verify error messages announced

- [ ] **Color contrast**
  - [ ] Run WebAIM contrast checker
  - [ ] Verify all text meets WCAG AA (4.5:1)
  - [ ] Check in light and dark mode

### Day 5: Final Polish

- [ ] **Code cleanup**
  - [ ] Remove commented-out code
  - [ ] Remove console.log statements (except errors)
  - [ ] Add comments to complex sections
  - [ ] Format with Prettier

- [ ] **Documentation**
  - [ ] Update README if needed
  - [ ] Add migration notes for other developers
  - [ ] Document any edge cases

---

## WEEK 5-6: DEPLOYMENT & MONITORING (Optional Buffer)

### Pre-Deployment Checklist

- [ ] **Environment variables**
  - [ ] Verify all env vars are set in production
  - [ ] Test with production Supabase instance

- [ ] **Build verification**
  ```bash
  npm run build
  # Check for errors
  # Verify bundle size is reasonable
  ```

- [ ] **Staging deployment** (if available)
  - [ ] Deploy to staging environment
  - [ ] Full smoke test on staging
  - [ ] Share with team for feedback

### Deployment

- [ ] **Deploy to production**
  ```bash
  # Example: Vercel
  vercel --prod
  ```

- [ ] **Post-deployment verification**
  - [ ] Homepage loads correctly
  - [ ] Login page loads correctly
  - [ ] Login flow works end-to-end
  - [ ] Check analytics/error monitoring

### Monitoring (First 48 Hours)

- [ ] **Watch error logs**
  - [ ] Check for new errors
  - [ ] Monitor error rate
  - [ ] Fix critical issues immediately

- [ ] **User feedback**
  - [ ] Monitor support channels
  - [ ] Watch for user reports
  - [ ] Document any unexpected issues

- [ ] **Performance metrics**
  - [ ] Monitor page load times
  - [ ] Check bounce rate
  - [ ] Verify conversion rate (signups)

---

## ROLLBACK PLAN (IF NEEDED)

### If Critical Issues Arise

1. **Immediate rollback**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   git push origin main
   # Or use Vercel rollback feature
   ```

2. **Restore backup files**
   ```bash
   cp pages/index.tsx.backup pages/index.tsx
   cp pages/HeroSection.module.css.backup pages/HeroSection.module.css
   cp components/auth/AuthSection.tsx.backup components/auth/AuthSection.tsx
   ```

3. **Communicate with team**
   - Notify team of rollback
   - Document issues encountered
   - Plan fix and re-deployment

---

## TESTING COMMANDS

### Local Development
```bash
# Start dev server
npm run dev

# Build for production (test)
npm run build

# Start production server locally
npm start

# Run linter
npm run lint

# Run tests (if available)
npm test
```

### Browser DevTools

```javascript
// Check for layout shifts
// In Chrome DevTools Console:
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout shift:', entry.value, entry);
  }
}).observe({type: 'layout-shift', buffered: true});

// Check animation frame rate
let lastTime = performance.now();
function checkFPS() {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);
  console.log('FPS:', Math.round(fps));
  lastTime = now;
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: Glassmorphism not working
**Solution:** Verify `backdrop-filter` is supported. Add vendor prefix if needed.
```css
.glass {
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}
```

### Issue: Animations janky on mobile
**Solution:** Use `will-change` sparingly, reduce animation complexity.
```css
.animate-smooth {
  will-change: transform, opacity;
}
```

### Issue: Dark mode flash on page load
**Solution:** Use `next-themes` and set `attribute="class"` + add script in `_document.tsx`.

### Issue: Focus ring cut off
**Solution:** Ensure parent has `overflow-visible` or add padding.
```css
.form-container {
  padding: 0.5rem; /* Space for focus ring */
}
```

---

## FINAL VERIFICATION CHECKLIST

Before marking as complete:

- [ ] Homepage looks identical to wireframes
- [ ] Login page looks identical to wireframes
- [ ] All animations smooth (60fps)
- [ ] Dark mode works everywhere
- [ ] Mobile responsive (320px+)
- [ ] Accessibility: Keyboard nav works
- [ ] Accessibility: Focus indicators visible
- [ ] Accessibility: Color contrast passes WCAG AA
- [ ] Performance: Lighthouse 90+ on all pages
- [ ] Cross-browser: Works in Chrome, Safari, Firefox, Edge
- [ ] No console errors
- [ ] No layout shifts
- [ ] Code is clean and commented
- [ ] Backup files removed (or archived)
- [ ] Team has reviewed and approved
- [ ] Deployed to production successfully
- [ ] Monitoring set up for first 48 hours

---

## RESOURCES

### Documentation
- [MASTER-IMPLEMENTATION-PLAN.md](./2026-01-15-MASTER-IMPLEMENTATION-PLAN.md) - Complete specs
- [VISUAL-WIREFRAMES.md](./2026-01-15-VISUAL-WIREFRAMES.md) - Visual reference

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Performance profiling
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audits
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast
- [Framer Motion Docs](https://www.framer.com/motion/) - Animation library

### Design References
- **Linear** - Spring animations, premium feel
- **Stripe** - Glassmorphism, gradients
- **Vercel** - Clean, minimal design
- **Notion** - Delight moments, smooth interactions

---

**Document Version:** 1.0
**Created:** January 15, 2026
**Status:** ✅ Ready to Execute
**Estimated Time:** 4-6 weeks (1 developer)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
