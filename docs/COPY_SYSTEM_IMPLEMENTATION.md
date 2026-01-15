# Flavatix Copy & Messaging System - Implementation Guide

**Status:** Complete - Ready for Integration
**Version:** 1.0.0
**Last Updated:** January 15, 2026

---

## Overview

A comprehensive, centralized copy and messaging system for Flavatix with:

- **50+ error messages** with context and recovery suggestions
- **30+ help texts** with tooltips and progressive disclosure
- **Optimized CTAs** with action-oriented button text and microcopy
- **10+ empty state variations** with encouraging guidance
- **Onboarding copy** for new users and feature introductions
- **Terminology guide & glossary** ensuring consistency
- **Reusable components** (ErrorMessage, HelpTooltip, ValidationFeedback, EmptyState)

---

## Files Created

### 1. Copy Constants (Single Source of Truth)

```
lib/copyConstants/
├── index.ts                          # Central export file
├── errorMessages.ts                  # 50+ error message templates
├── helpTexts.ts                      # 30+ help text with examples
├── ctaAndValidation.ts               # Button text, CTA variants, validation
├── emptyStatesAndOnboarding.ts       # 10+ empty states, onboarding flow
└── styleGuideAndGlossary.ts          # Terminology, glossary, tone rules
```

### 2. UI Components

```
components/ui/
├── ErrorMessage.tsx                  # Error display with icon/color
├── HelpTooltip.tsx                   # Contextual help popup
├── ValidationFeedback.tsx            # Real-time form validation
└── EmptyState.tsx                    # Empty state messaging (updated)
```

---

## Quick Start

### Using Error Messages

```typescript
import { ERROR_MESSAGES, getErrorMessage } from '@/lib/copyConstants';

// Direct access
const error = ERROR_MESSAGES.AUTH.INVALID_EMAIL;
console.log(error.title); // "Invalid email address"
console.log(error.suggestion); // "Check spelling and try again..."

// Or use helper
const error = getErrorMessage('AUTH', 'INVALID_EMAIL');

// Display in toast
import { useToast } from '@/components/ui/use-toast';
const { toast } = useToast();

toast.error(error.title, {
  description: error.suggestion,
  action: error.helpLink ? { label: 'Get Help', onClick: () => {} } : undefined,
});
```

### Using Help Text

```typescript
import { HELP_TEXTS, getHelpText } from '@/lib/copyConstants';
import { HelpTooltip } from '@/components/ui/HelpTooltip';

// Direct access
<HelpTooltip {...HELP_TEXTS.TASTING.BLIND_MODE} />

// Or helper
const help = getHelpText('TASTING', 'BLIND_MODE');
<HelpTooltip
  short={help.short}
  long={help.long}
  example={help.example}
  learnMore={help.learnMore}
/>
```

### Using CTAs

```typescript
import { BUTTON_TEXT, VALIDATION_MESSAGES, CTA_MICROCOPY } from '@/lib/copyConstants';

// Button text
<button>{BUTTON_TEXT.CREATE_TASTING}</button>
// Output: "Create New Tasting"

// Form labels
<label>{BUTTON_TEXT.NAME_REQUIRED}</label>

// Validation
<input
  placeholder={CTA_MICROCOPY.PLACEHOLDER.SESSION_NAME}
  // "e.g., Ethiopian Yirgacheffe Tasting"
/>

// Helper text
<small>{CTA_MICROCOPY.HELPER.PASSWORD}</small>
```

### Using Empty States

```typescript
import { EMPTY_STATES } from '@/lib/copyConstants';
import { EmptyState } from '@/components/ui/EmptyState';

// If no tastings
if (tastings.length === 0) {
  return <EmptyState {...EMPTY_STATES.NO_TASTINGS} />;
}

// With dynamic data
import { formatEmptyState } from '@/lib/copyConstants';
const noParticipants = formatEmptyState(EMPTY_STATES.NO_PARTICIPANTS, {
  CODE: tastingCode
});
return <EmptyState {...noParticipants} />;
```

### Using Terminology

```typescript
import { TERMINOLOGY, GLOSSARY, getGlossaryEntry } from '@/lib/copyConstants';

// Get correct capitalization
<h1>{TERMINOLOGY.FLAVOR_WHEEL_CAP}</h1>

// Get glossary entry
const glossaryEntry = getGlossaryEntry('BLIND_TASTING');
console.log(glossaryEntry.definition);
console.log(glossaryEntry.example);
```

---

## Implementation Checklist

### Phase 1: Error Messages (Week 1)

- [ ] Import error messages in API error handling
- [ ] Replace all `toast.error()` calls with standardized messages
- [ ] Add error message component to critical flows
- [ ] Test error scenarios with 5 new users
- [ ] Document API error to message mapping

**Files to update:**

- `pages/api/**/*.ts` - API routes
- `lib/api/*.ts` - API client functions
- All components with error handling

### Phase 2: Help Text & Tooltips (Week 2)

- [ ] Add help tooltips to 10 critical features
- [ ] Implement progressive disclosure on complex screens
- [ ] Create help documentation for each major feature
- [ ] Test help text comprehension with users
- [ ] Add keyboard shortcut indicators

**Files to update:**

- `components/*/CreateTasting.tsx`
- `components/*/StudyModeSetup.tsx`
- `components/*/FlavorWheelView.tsx`
- Any form with complex fields

### Phase 3: CTAs & Validation (Week 3)

- [ ] Replace vague buttons ("Continue", "Submit") with specific ones
- [ ] Add validation feedback to all forms
- [ ] Implement password strength meter
- [ ] Create form field helper text
- [ ] Add required field indicators

**Files to update:**

- All form components
- `pages/auth/*.tsx`
- `components/profile/*.tsx`
- `components/quick-tasting/*.tsx`

### Phase 4: Empty States & Onboarding (Week 4)

- [ ] Update all empty state screens with encouraging copy
- [ ] Create onboarding flow for new users
- [ ] Add feature intro modals
- [ ] Implement progress indicators
- [ ] Create welcome sequence

**Files to update:**

- Dashboard components
- Flavor wheel views
- Results screens
- Profile pages

---

## Content Strategy

### Error Messages Best Practices

✅ **DO:**

- Include the problem, why it happened, and how to fix it
- Use 2-3 sentences max
- Link to help documentation
- Be specific (not "Error" but "Tasting code not found")
- Show the expected format (e.g., "8 characters like ABC12XYZ")

❌ **DON'T:**

- Use technical jargon without explaining
- Blame the user ("You entered invalid data")
- Show error codes without explanation
- Make assumptions about user knowledge

### Help Text Best Practices

✅ **DO:**

- Keep short version under 50 characters
- Explain why feature matters (not just what it does)
- Include real examples
- Link to full documentation
- Use progressive disclosure (short → long → example)

❌ **DON'T:**

- Use jargon without definition
- Make it longer than needed
- Hide help away - make discoverable
- Assume domain knowledge

### CTA Best Practices

✅ **DO:**

- Start with action verb ("Create", "Join", "Save")
- Be specific ("Create New Tasting" not "Continue")
- Use conversational language
- Match button importance to visual weight
- A/B test variations

❌ **DON'T:**

- Use generic text ("OK", "Submit", "Done")
- Use vague actions ("View All" without count)
- Assume context is clear
- Use ALL CAPS
- Use ellipsis ("Continue...")

---

## Tone & Voice

### Flavatix Tone Guidelines

**Friendly + Expert + Encouraging**

- Use "you" language (address users directly)
- Celebrate progress and learning
- Explain why, not just what
- Be concise but complete
- Use active voice
- Break down complex concepts

### Writing Examples

**❌ Bad:**

```
"Error 404: Session lookup failed. Please verify credentials."
```

**✅ Good:**

```
"Tasting code not found
This code doesn't match any active tastings.
Double-check the code (format: ABC12XYZ) and ask the host if unsure."
```

---

**❌ Bad:**

```
"Please input a valid email address format in accordance with RFC 5322."
```

**✅ Good:**

```
"Enter a valid email
Format: your.name@example.com"
```

---

**❌ Bad:**

```
"Continue"
```

**✅ Good:**

```
"Continue to Items" or "Add Items to Tasting"
```

---

## Component Usage Examples

### ErrorMessage Component

```tsx
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ERROR_MESSAGES } from '@/lib/copyConstants';

<ErrorMessage
  {...ERROR_MESSAGES.TASTING.INVALID_CODE}
  severity="error"
  dismissible
  onDismiss={() => setError(null)}
/>;
```

### HelpTooltip Component

```tsx
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { HELP_TEXTS } from '@/lib/copyConstants';

<label className="flex items-center gap-2">
  Blind Mode
  <HelpTooltip trigger="hover" {...HELP_TEXTS.TASTING.BLIND_MODE} />
</label>;
```

### ValidationFeedback Component

```tsx
import { ValidationFeedback } from '@/components/ui/ValidationFeedback';
import { VALIDATION_MESSAGES } from '@/lib/copyConstants';

<input
  type="email"
  placeholder={CTA_MICROCOPY.PLACEHOLDER.EMAIL}
/>
<ValidationFeedback
  error={email.error}
  success={email.isValid}
  helperText={CTA_MICROCOPY.HELPER.EMAIL}
/>
```

### EmptyState Component

```tsx
import { EmptyState, formatEmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATES } from '@/lib/copyConstants';

if (tastings.length === 0) {
  return (
    <EmptyState
      {...EMPTY_STATES.NO_TASTINGS}
      primaryAction={{
        text: EMPTY_STATES.NO_TASTINGS.primaryAction.text,
        onClick: () => navigate('/create-tasting'),
      }}
    />
  );
}
```

---

## Integration with Existing Code

### Step 1: Update Toast Error Handling

Find all instances of:

```typescript
toast.error('Message here');
```

Replace with:

```typescript
import { ERROR_MESSAGES } from '@/lib/copyConstants';

const error = ERROR_MESSAGES.CATEGORY.ERROR_KEY;
toast.error(error.title, {
  description: error.suggestion,
});
```

### Step 2: Update Form Validation

Find all form validation messages and centralize them:

```typescript
// Before
if (!email) setError('Email is required');

// After
import { VALIDATION_MESSAGES } from '@/lib/copyConstants';
if (!email) setError(VALIDATION_MESSAGES.REQUIRED_FIELD);
```

### Step 3: Update Button Labels

Find all generic button labels:

```typescript
// Before
<button>Continue</button>
<button>Submit</button>

// After
import { BUTTON_TEXT } from '@/lib/copyConstants';
<button>{BUTTON_TEXT.CONTINUE_ACTION}</button>
<button>{BUTTON_TEXT.SUBMIT_RESPONSE}</button>
```

### Step 4: Add Help Tooltips

Find complex form fields and add help:

```typescript
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { HELP_TEXTS } from '@/lib/copyConstants';

<label className="flex items-center gap-2">
  Category
  <HelpTooltip {...HELP_TEXTS.TASTING.FLAVOR_CATEGORY} />
</label>
```

---

## Metrics & Success

### Track These Metrics

**Before Implementation:**

- Support tickets related to confusion: \_\_\_
- User satisfaction (1-5): \_\_\_
- First-time tasting completion: \_\_\_
- Feature discovery rate: \_\_\_

**After Implementation (Target):**

- Support tickets: -50%
- User satisfaction: +0.8 points
- First-time completion: +25%
- Feature discovery: +20%

### User Testing Plan

**Week 1-2:** Test error messages

- 5 new users
- Observe: Can they understand what went wrong?
- Observe: Do they know what to do next?

**Week 3:** Test help text

- 10 users
- Observe: Do they find the help?
- Observe: Does it answer their question?

**Week 4:** Test CTAs

- 10 users
- Observe: Are CTAs clear?
- Observe: Do they click the right button?

---

## Common Patterns

### API Error to Message Mapping

```typescript
// lib/api/errorHandler.ts
import { ERROR_MESSAGES } from '@/lib/copyConstants';

export function getErrorMessage(error: ApiError) {
  switch (error.code) {
    case 'INVALID_EMAIL':
      return ERROR_MESSAGES.AUTH.INVALID_EMAIL;
    case 'ACCOUNT_EXISTS':
      return ERROR_MESSAGES.AUTH.ACCOUNT_EXISTS;
    case 'INVALID_TASTING_CODE':
      return ERROR_MESSAGES.TASTING.INVALID_CODE;
    default:
      return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  }
}
```

### Form Validation Helper

```typescript
// lib/validation/messages.ts
import { VALIDATION_MESSAGES, CTA_MICROCOPY } from '@/lib/copyConstants';

export const formConfig = {
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    error: VALIDATION_MESSAGES.INVALID_EMAIL,
    helperText: CTA_MICROCOPY.HELPER.PASSWORD,
  },
  password: {
    validate: (value) => value.length >= 8,
    error: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
    helperText: CTA_MICROCOPY.HELPER.PASSWORD,
  },
};
```

---

## Next Steps

1. **Week 1:** Import error messages, update error handling
2. **Week 2:** Add help tooltips to 10+ features
3. **Week 3:** Update CTAs and validation messaging
4. **Week 4:** Implement empty states and onboarding
5. **Week 5:** User testing and refinement
6. **Ongoing:** Add new copy as features launch

---

## FAQ

**Q: Can I add custom error messages?**
A: Yes! Add to the appropriate section in `errorMessages.ts` and export. Follow the template pattern.

**Q: How do I handle translated copy?**
A: Export all messages to a translation file. Each language gets its own copy constants file.

**Q: What if I need a help text that's not in the library?**
A: Add it to `helpTexts.ts` with the same structure. Then it's automatically documented and reusable.

**Q: Can I A/B test CTA text?**
A: Yes! Use the `CTA_VARIANTS` object. Test VARIANT_A vs VARIANT_B and note which wins.

**Q: How do I ensure copy consistency?**
A: Use the `TERMINOLOGY` and `FORMATTING_RULES` constants. Lint tools can be built to catch inconsistencies.

---

## Support

For questions or additions to the copy system:

1. Check the constants file for similar examples
2. Follow the template structure
3. Add documentation/examples
4. Test with real users
5. Submit for review before shipping

---

**Created:** January 15, 2026
**Ready for:** Immediate integration
**Estimated Impact:** -50% support tickets, +40% feature discovery
