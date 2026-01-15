# Flavatix Copy System - Quick Reference

**For developers implementing copy and messaging**

---

## Imports Cheat Sheet

```typescript
// Everything
import * from '@/lib/copyConstants';

// Specific imports
import { ERROR_MESSAGES, getErrorMessage } from '@/lib/copyConstants';
import { HELP_TEXTS, getHelpText } from '@/lib/copyConstants';
import { BUTTON_TEXT, VALIDATION_MESSAGES, CTA_MICROCOPY } from '@/lib/copyConstants';
import { EMPTY_STATES, ONBOARDING, formatEmptyState } from '@/lib/copyConstants';
import { TERMINOLOGY, GLOSSARY, getGlossaryEntry } from '@/lib/copyConstants';

// Components
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { ValidationFeedback } from '@/components/ui/ValidationFeedback';
import { EmptyState } from '@/components/ui/EmptyState';
```

---

## Common Usage Patterns

### Error Messages

```typescript
// Toast error
const error = ERROR_MESSAGES.AUTH.INVALID_EMAIL;
toast.error(error.title, { description: error.suggestion });

// Component error
<ErrorMessage
  title={error.title}
  description={error.message}
  suggestion={error.suggestion}
  helpLink={error.helpLink}
/>
```

### Help Text

```typescript
// Tooltip on hover
<HelpTooltip {...HELP_TEXTS.TASTING.BLIND_MODE} />

// Custom placement
<HelpTooltip
  {...HELP_TEXTS.TASTING.BLIND_MODE}
  position="bottom"
  trigger="click"
/>
```

### Button Text

```typescript
<button>{BUTTON_TEXT.CREATE_TASTING}</button>
<button>{BUTTON_TEXT.JOIN_TASTING}</button>
<button>{BUTTON_TEXT.SAVE_CHANGES}</button>
<button>{BUTTON_TEXT.DELETE}</button>
```

### Form Validation

```typescript
<input
  placeholder={CTA_MICROCOPY.PLACEHOLDER.TASTING_CODE}
  defaultValue="ABC12XYZ"
/>
<small>{CTA_MICROCOPY.HELPER.TASTING_CODE}</small>
<ValidationFeedback
  error={error ? VALIDATION_MESSAGES.CODE_FORMAT : undefined}
  success={isValid}
/>
```

### Empty States

```typescript
// No tastings
if (tastings.length === 0) {
  return <EmptyState {...EMPTY_STATES.NO_TASTINGS} />;
}

// No flavor wheel
if (!hasWheel) {
  return <EmptyState {...EMPTY_STATES.NO_FLAVOR_WHEELS} />;
}

// No reviews
if (reviews.length === 0) {
  return <EmptyState {...EMPTY_STATES.NO_REVIEWS} />;
}
```

### Terminology

```typescript
// Use correct capitalization
<h2>{TERMINOLOGY.FLAVOR_WHEEL_CAP}</h2>

// Show glossary definition
const entry = getGlossaryEntry('BLIND_TASTING');
<p>{entry.definition}</p>
<p>Example: {entry.example}</p>
```

---

## Error Messages Quick List

### Authentication

- `AUTH.INVALID_EMAIL` - Invalid email format
- `AUTH.PASSWORD_TOO_SHORT` - Password too short (< 8 chars)
- `AUTH.PASSWORD_WEAK` - Password lacks complexity
- `AUTH.ACCOUNT_EXISTS` - Email already registered
- `AUTH.INVALID_CREDENTIALS` - Wrong email/password
- `AUTH.EMAIL_VERIFICATION_REQUIRED` - Verify email first
- `AUTH.SESSION_EXPIRED` - Login session ended

### Tasting

- `TASTING.INVALID_CODE` - Code not found
- `TASTING.ALREADY_JOINED` - Already participating
- `TASTING.NOT_FOUND` - Tasting doesn't exist
- `TASTING.TASTING_ENDED` - Tasting is closed
- `TASTING.NOT_HOST` - Only host can do this

### Form Validation

- `FORM.CATEGORY_REQUIRED` - Category needed
- `FORM.NAME_REQUIRED` - Name needed
- `FORM.ITEMS_REQUIRED` - Items needed
- `FORM.MIN_ITEMS_FOR_MODE` - Not enough items
- `FORM.DUPLICATE_ITEM` - Item already added

### Files

- `FILE.INVALID_TYPE` - Wrong file type
- `FILE.TOO_LARGE` - File too big (>5MB)
- `FILE.UPLOAD_FAILED` - Upload failed

### Network

- `NETWORK.OFFLINE` - No internet connection
- `NETWORK.TIMEOUT` - Request timed out
- `NETWORK.SERVER_ERROR` - Server error

---

## Help Texts Quick List

### Tasting Setup

- `TASTING.SESSION_NAME` - Give tasting a name
- `TASTING.BLIND_MODE` - Hide item names
- `TASTING.STUDY_MODE` - Structured learning
- `TASTING.COMPETITION_MODE` - Score and rank
- `TASTING.FLAVOR_CATEGORY` - Type of item
- `TASTING.DESCRIPTOR` - Single flavor note
- `TASTING.TYPICITY` - How typical it tastes

### Participants

- `PARTICIPANT.TASTING_CODE` - How to invite
- `PARTICIPANT.PARTICIPANT_ROLE` - Host vs participant
- `PARTICIPANT.MAX_PARTICIPANTS` - Up to 100 people

### Features

- `FLAVOR_WHEEL.WHAT_IS_IT` - Visual taste map
- `FLAVOR_WHEEL.HOW_BUILT` - Generated from selections
- `FLAVOR_WHEEL.SHARING` - Share preferences

### Reviews

- `REVIEW.PROSE_REVIEW` - Write detailed notes
- `REVIEW.RATING_SCALE` - 1-10 rating guide
- `REVIEW.VISIBILITY` - Who sees this

---

## Button Text Quick List

```typescript
// Primary actions
BUTTON_TEXT.CREATE_TASTING;
BUTTON_TEXT.START_TASTING;
BUTTON_TEXT.SUBMIT_RESPONSE;
BUTTON_TEXT.SAVE_CHANGES;
BUTTON_TEXT.JOIN_TASTING;
BUTTON_TEXT.CONTINUE;

// Secondary actions
BUTTON_TEXT.BACK;
BUTTON_TEXT.CANCEL;
BUTTON_TEXT.SKIP;
BUTTON_TEXT.CLEAR;

// Destructive
BUTTON_TEXT.DELETE;
BUTTON_TEXT.LEAVE_TASTING;

// Social
BUTTON_TEXT.SHARE_RESULTS;
BUTTON_TEXT.FOLLOW_USER;
BUTTON_TEXT.POST_REVIEW;
```

---

## Validation Messages Quick List

```typescript
VALIDATION_MESSAGES.REQUIRED_FIELD;
VALIDATION_MESSAGES.INVALID_EMAIL;
VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
VALIDATION_MESSAGES.USERNAME_TAKEN;
VALIDATION_MESSAGES.CODE_FORMAT;
VALIDATION_MESSAGES.CATEGORY_REQUIRED;
VALIDATION_MESSAGES.ITEMS_REQUIRED;
VALIDATION_MESSAGES.DUPLICATE_ITEM;
```

---

## Placeholder Text Examples

```typescript
CTA_MICROCOPY.PLACEHOLDER.SESSION_NAME;
// "e.g., Ethiopian Yirgacheffe Tasting"

CTA_MICROCOPY.PLACEHOLDER.ITEM_NAME;
// "e.g., Ethiopian Yirgacheffe, Batch #4"

CTA_MICROCOPY.PLACEHOLDER.TASTING_CODE;
// "e.g., ABC12XYZ"

CTA_MICROCOPY.PLACEHOLDER.REVIEW;
// "What did you think? Share your impressions..."
```

---

## Helper Text Examples

```typescript
CTA_MICROCOPY.HELPER.PASSWORD;
// "Must be 8+ characters with uppercase, lowercase, numbers, symbols"

CTA_MICROCOPY.HELPER.TASTING_CODE;
// "8-character code shared by the host"

CTA_MICROCOPY.HELPER.ITEMS_COUNT;
// "You can add up to 50 items"

CTA_MICROCOPY.HELPER.VISIBILITY;
// "Private = only you. Public = anyone on Flavatix"
```

---

## Microcopy Examples

```typescript
// Empty states
CTA_MICROCOPY.EMPTY_STATE.NO_TASTINGS;
// "No tastings yet. Create your first one to get started!"

CTA_MICROCOPY.EMPTY_STATE.NO_PARTICIPANTS;
// "Invite friends to join your tasting. Share the code below."

CTA_MICROCOPY.EMPTY_STATE.NO_WHEEL;
// "Complete 3 tastings to unlock your personalized flavor wheel."

// Reassurance
CTA_MICROCOPY.REASSURANCE.PROGRESS_SAVED;
// "Your progress is automatically saved."

CTA_MICROCOPY.REASSURANCE.NO_PRESSURE;
// "There are no wrong answers. We're just curious about your palate."

// Confirmations
SUCCESS_COPY.ACCOUNT_CREATED;
// "Welcome to Flavatix! Verify your email to get started."

SUCCESS_COPY.TASTING_CREATED;
// "Tasting created! Add items to get started."
```

---

## Glossary Quick List

```typescript
GLOSSARY.BLIND_TASTING; // Hide item names until reveal
GLOSSARY.DESCRIPTOR; // Single flavor note
GLOSSARY.FLAVOR_WHEEL; // Visual taste map
GLOSSARY.TYPICITY; // How typical it tastes
GLOSSARY.STUDY_MODE; // Structured learning
GLOSSARY.COMPETITION_MODE; // Score and rank
GLOSSARY.MOUTHFEEL; // Texture in mouth
GLOSSARY.ACIDITY; // Bright, tangy sensation
GLOSSARY.BODY; // Weight in mouth
GLOSSARY.AROMA; // What you smell
GLOSSARY.FINISH; // Lingering taste
```

---

## Quick Integration Steps

### 1. Replace Generic Error Messages

```typescript
// Before
catch (error) {
  toast.error('An error occurred');
}

// After
catch (error) {
  const msg = ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  toast.error(msg.title, { description: msg.suggestion });
}
```

### 2. Add Help to Forms

```typescript
// Before
<label>Category</label>

// After
<label className="flex items-center gap-2">
  Category
  <HelpTooltip {...HELP_TEXTS.TASTING.FLAVOR_CATEGORY} />
</label>
```

### 3. Improve Button Labels

```typescript
// Before
<button>Continue</button>

// After
<button>{BUTTON_TEXT.CONTINUE_ACTION}</button>
```

### 4. Add Form Hints

```typescript
// Before
<input placeholder="Code" />

// After
<input placeholder={CTA_MICROCOPY.PLACEHOLDER.TASTING_CODE} />
<small>{CTA_MICROCOPY.HELPER.TASTING_CODE}</small>
```

### 5. Handle Empty States

```typescript
// Before
{items.length === 0 && <div>No items</div>}

// After
{items.length === 0 && <EmptyState {...EMPTY_STATES.NO_TASTINGS} />}
```

---

## Testing Checklist

- [ ] Error messages are clear and actionable
- [ ] Help text appears when needed
- [ ] Button labels are specific (not generic)
- [ ] Form validation provides guidance
- [ ] Empty states encourage next steps
- [ ] Terminology is consistent across app
- [ ] Tone is friendly and encouraging
- [ ] All copy is spell-checked
- [ ] Links in help text work
- [ ] Tested with 5+ new users

---

## File Locations

```
lib/copyConstants/
├── index.ts                     # Central export
├── errorMessages.ts             # All error messages
├── helpTexts.ts                 # All help text
├── ctaAndValidation.ts          # Button text, CTA variants
├── emptyStatesAndOnboarding.ts  # Empty states, onboarding
└── styleGuideAndGlossary.ts     # Terminology, glossary

components/ui/
├── ErrorMessage.tsx             # Error display
├── HelpTooltip.tsx              # Help tooltip
├── ValidationFeedback.tsx       # Form validation feedback
└── EmptyState.tsx               # Empty state display

docs/
├── COPY_SYSTEM_IMPLEMENTATION.md # Full guide
└── COPY_QUICK_REFERENCE.md       # This file
```

---

## Need More Help?

1. **Full implementation guide:** See `COPY_SYSTEM_IMPLEMENTATION.md`
2. **Check usage examples:** Look at the "Usage" comment in each copy constants file
3. **Component examples:** See component files (e.g., `ErrorMessage.tsx`)
4. **Original analysis:** See `FLAVATIX_COPY_ANALYSIS.md` for strategy details

---

**Version:** 1.0.0
**Last Updated:** January 15, 2026
**Status:** Ready for immediate use
