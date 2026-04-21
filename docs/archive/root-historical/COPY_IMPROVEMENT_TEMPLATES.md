# Flavatix Copy Improvement - Templates & Code Examples

**Document:** Implementation templates and before/after examples
**For:** Developers and content editors improving copy across Flavatix

---

## 1. ERROR MESSAGE TEMPLATE SYSTEM

### Standard Error Message Format

```typescript
// lib/copyConstants/errorMessages.ts

interface ErrorMessageTemplate {
  title: string; // What went wrong
  message: string; // Why it happened (optional)
  suggestion: string; // What to do next
  helpLink?: string; // Link to documentation
  context?: string; // Additional context for developers
}

export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: {
      title: 'Invalid email address',
      message: 'Please enter a valid email format.',
      suggestion: 'Check spelling and try again (e.g., your.name@example.com)',
      context: 'email validation failed',
    },
    PASSWORD_TOO_SHORT: {
      title: 'Password too short',
      message: 'Your password must be at least 6 characters.',
      suggestion: 'Use a mix of letters, numbers, and symbols for security.',
      helpLink: '/help/password-requirements',
    },
    ACCOUNT_EXISTS: {
      title: 'Account already exists',
      message: 'This email is already registered.',
      suggestion: 'Try logging in instead, or use a different email.',
      context: 'user already exists error',
    },
  },
  TASTING: {
    INVALID_CODE: {
      title: 'Tasting code not found',
      message: "This code doesn't match any active tastings.",
      suggestion: 'Double-check the code (8 characters). Ask the host if unsure.',
      helpLink: '/help/finding-tasting-codes',
      context: 'code lookup failed',
    },
    ALREADY_JOINED: {
      title: 'Already participating',
      message: "You're already part of this tasting.",
      suggestion: 'Go to your dashboard to continue.',
      context: 'duplicate participant',
    },
    CATEGORY_REQUIRED: {
      title: 'Category required',
      message: 'You must select a flavor category to continue.',
      suggestion: 'Choose from Coffee, Wine, Tea, Beer, Spirits, or Chocolate.',
      context: 'category validation failed',
    },
    MIN_ITEMS_REQUIRED: {
      title: 'Items required',
      message: 'Competition mode requires at least one item.',
      suggestion: 'Add items to taste in the "Items" section above.',
      context: 'items count validation',
    },
  },
  FILE: {
    INVALID_TYPE: {
      title: 'Invalid file type',
      message: 'Only image files are accepted.',
      suggestion: 'Upload a JPG, PNG, or GIF (recommended size: <5MB).',
      context: 'file type validation',
    },
    TOO_LARGE: {
      title: 'File too large',
      message: 'Image must be smaller than 5MB.',
      suggestion: 'Compress your image and try again.',
      helpLink: '/help/photo-requirements',
      context: 'file size exceeds limit',
    },
  },
  NETWORK: {
    OFFLINE: {
      title: 'No internet connection',
      message: 'Please check your connection and try again.',
      suggestion: 'Reconnect to WiFi or mobile data.',
      context: 'network offline',
    },
    TIMEOUT: {
      title: 'Request timed out',
      message: 'The request took too long.',
      suggestion: 'Check your connection and try again.',
      context: 'request timeout',
    },
    PERMISSION_DENIED: {
      title: 'Permission denied',
      message: "You don't have access to this tasting.",
      suggestion: 'Ask the host to add you, or try logging out and back in.',
      context: 'RLS or authorization failed',
    },
  },
  GENERIC: {
    UNKNOWN: {
      title: 'Something went wrong',
      message: 'An unexpected error occurred.',
      suggestion: 'Try refreshing the page or contact support.',
      helpLink: '/help/contact-support',
      context: 'unknown error',
    },
    TRY_AGAIN: {
      title: 'Failed to save',
      message: 'Unable to save your changes.',
      suggestion: 'Check your connection and try again.',
      context: 'save operation failed',
    },
  },
};

// Usage pattern
const showError = (errorKey: string, context?: Record<string, any>) => {
  const error = ERROR_MESSAGES[category][errorKey];

  toast.error(error.title, {
    description: `${error.message}\n\n${error.suggestion}`,
    action: error.helpLink
      ? {
          label: 'Learn more',
          onClick: () => router.push(error.helpLink),
        }
      : undefined,
  });
};

// Example: showError('INVALID_CODE')
```

### Toast Implementation Pattern

```typescript
// lib/toast.ts - Enhanced

interface ToastErrorOptions {
  title: string;
  message?: string;
  suggestion?: string;
  helpLink?: string;
}

function errorWithContext(options: ToastErrorOptions) {
  const { title, message, suggestion, helpLink } = options;

  const description = [message, suggestion].filter(Boolean).join('\n\n');

  return sonnerToast.error(title, {
    duration: 5000,
    description,
    action: helpLink
      ? {
          label: 'Help',
          onClick: () => window.open(helpLink, '_blank'),
        }
      : undefined,
  });
}

// Usage
toast.errorWithContext({
  title: 'Tasting code not found',
  message: "This code doesn't match any active tastings.",
  suggestion: "Double-check the code and ask the host if you're unsure.",
  helpLink: '/help/finding-tasting-codes',
});
```

### Before/After Examples

**Before (Vague):**

```jsx
if (!tastingCode.trim()) {
  toast.error('Please enter a tasting code');
  return;
}
```

**After (Contextual):**

```jsx
if (!tastingCode.trim()) {
  toast.error('Tasting code required', {
    description:
      'Enter the 8-character code shared by the session host. ' +
      "Ask the host if you don't have it.",
  });
  return;
}

if (!isValidCode(tastingCode)) {
  toast.error('Invalid code format', {
    description:
      'Codes are 8 characters (e.g., ABC12XYZ). ' +
      'Check for typos or ask the host for the correct code.',
    action: {
      label: 'Get help',
      onClick: () => router.push('/help/tasting-codes'),
    },
  });
  return;
}
```

---

## 2. HELP TEXT & TOOLTIP SYSTEM

### Help Text Constants

```typescript
// lib/copyConstants/helpTexts.ts

export const HELP_TEXTS = {
  // Tasting Setup
  CATEGORY: {
    label: 'Flavor Category',
    hint: "Choose the category of items you're tasting (coffee, wine, tea, etc.). This helps customize the flavor wheel and tasting notes for your category.",
    examples: ['Coffee', 'Wine', 'Tea', 'Beer', 'Spirits', 'Chocolate'],
  },

  // Tasting Modes
  STUDY_MODE: {
    label: 'Study Mode',
    hint: 'Structured tasting sessions perfect for learning or comparison. Set up items in advance and receive guided prompts during tasting.',
    learnMore: '/help/study-mode',
  },
  QUICK_MODE: {
    label: 'Quick Tasting',
    hint: 'Casual, freeform tasting. Add items as you taste them and write notes at your own pace.',
    learnMore: '/help/quick-tasting',
  },
  COMPETITION_MODE: {
    label: 'Competition Mode',
    hint: 'Blind tasting with scoring and participant ranking. You set correct answers in advance; participants try to identify items.',
    learnMore: '/help/competition-mode',
  },

  // Blind Tasting Options
  BLIND_ITEMS: {
    label: 'Blind Items',
    hint: "Hide item names from participants. They taste without knowing what they're tasting, focusing purely on sensory experience.",
    impacts: ['Reduces bias', 'Focuses on pure flavor', 'More challenging and fun'],
  },
  BLIND_ATTRIBUTES: {
    label: 'Blind Attributes',
    hint: 'Hide tasting criteria and prompts. Participants describe freely without guided questions, forcing them to develop their own vocabulary.',
    impacts: ['Tests pure perception', 'Develops taste vocabulary', 'More difficult'],
  },
  BLIND_PARTICIPANTS: {
    label: 'Blind Participants',
    hint: "Hide rankings and scores during the tasting. Participants can't see how others are doing, preventing bias.",
    impacts: [
      'Reduces competitive pressure',
      'Focuses on individual taste',
      'Reveals rankings after',
    ],
  },

  // Scoring
  OVERALL_SCORE: {
    label: 'Overall Score (0-100)',
    hint: 'Rate the item on a scale of 0-100. 90+ = Exceptional, 80-89 = Excellent, 70-79 = Very Good, 60-69 = Good, 50-59 = Average, Below 50 = Poor',
    examples: [
      '95: Outstanding',
      '85: Excellent',
      '75: Good',
      '65: Average',
      '55: Acceptable',
      '45: Below acceptable',
    ],
  },

  // Flavor Notes
  AROMA: {
    label: 'Aroma',
    hint: 'Describe what you smell. This is distinct from taste. Use descriptors like fruity, floral, earthy, spicy, etc.',
    examples: ['Fruity', 'Chocolate', 'Nutty', 'Floral', 'Earthy', 'Spicy'],
  },
  FLAVOR: {
    label: 'Flavor',
    hint: 'Describe what you taste. Combine taste with aroma. Include body (light/medium/full) and mouthfeel (smooth/rough/lingering).',
    examples: ['Bright citrus with chocolate', 'Rich, full body', 'Crisp finish'],
  },
  AFTERTASTE: {
    label: 'Aftertaste / Finish',
    hint: 'Describe what lingers after swallowing or spitting. Note the duration and character.',
    examples: ['Clean finish', 'Lingering spice', 'Dry aftertaste'],
  },

  // Advanced
  TYPICITY: {
    label: 'Typicity (How much it tastes as expected)',
    hint: "Rate how much this item matches the expected taste profile for its category (0-100). 100 = Perfect example, 0 = Doesn't taste like its category.",
    examples: [
      '95: Perfect example of category',
      '75: Typical',
      '50: Unusual for category',
      '25: Questionable',
    ],
  },

  // Flavor Wheel
  FLAVOR_WHEEL: {
    label: 'Flavor Wheel',
    hint: 'AI-generated visualization of your tasting preferences. Shows which flavors you describe most often, colored by category.',
    howItWorks: 'Appears after 3+ tastings. Updates automatically as you add more tastings.',
    learnMore: '/help/flavor-wheels',
  },

  // Sharing
  SHARE_TASTING: {
    label: 'Share Tasting',
    hint: 'Invite others to join your tasting session using a unique 8-character code. They can see your notes (if you allow it) and add their own.',
    privacy: 'You control what others can see',
  },
};
```

### Tooltip Component Implementation

```typescript
// components/ui/Tooltip.tsx

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  helpLink?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = 'right',
  helpLink
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      {children}

      {isOpen && (
        <div className="absolute z-50 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg"
             style={{ [side]: '100%' }}>
          <div>{content}</div>
          {helpLink && (
            <a href={helpLink} className="text-primary-300 text-xs mt-2 inline-block">
              Learn more →
            </a>
          )}
        </div>
      )}

      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 w-4 h-4 rounded-full flex items-center justify-center
                   text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
```

### Field-Level Help Text Implementation

```jsx
// components/forms/FormField.tsx

interface FormFieldProps {
  label: string;
  hint?: string;
  helpText?: string;
  helpLink?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  helpText,
  helpLink,
  children,
  required,
  error
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helpLink && (
          <Tooltip
            content={helpText}
            helpLink={helpLink}
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </Tooltip>
        )}
      </div>

      {hint && (
        <p className="text-xs text-gray-600 -mt-1">{hint}</p>
      )}

      {children}

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Usage:
<FormField
  label="Category"
  hint="Choose the flavor category for this tasting"
  helpText={HELP_TEXTS.CATEGORY.hint}
  helpLink="/help/categories"
  required
  error={errors.category}
>
  <CategorySelector {...props} />
</FormField>
```

---

## 3. VALIDATION FEEDBACK PATTERNS

### Input Validation Template

```typescript
// components/forms/ValidatedInput.tsx

interface ValidatedInputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  validation: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  helpText?: string;
  label?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  validation,
  helpText,
  label
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateInput = (inputValue: string) => {
    // Required
    if (validation.required && !inputValue.trim()) {
      return `${label} is required`;
    }

    // Min length
    if (validation.minLength && inputValue.length < validation.minLength) {
      return `Must be at least ${validation.minLength} characters`;
    }

    // Max length
    if (validation.maxLength && inputValue.length > validation.maxLength) {
      return `Must be no more than ${validation.maxLength} characters`;
    }

    // Pattern
    if (validation.pattern && !validation.pattern.test(inputValue)) {
      return `Invalid format`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(inputValue);
    }

    return null;
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (touched) {
      setError(validateInput(newValue));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateInput(value));
  };

  return (
    <div className="space-y-1">
      {label && <label className="block font-medium text-sm">{label}</label>}

      <div>
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'w-full px-3 py-2 border rounded-lg transition-all',
            touched && error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:ring-blue-200'
          )}
          aria-invalid={touched && !!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
      </div>

      {helpText && !error && (
        <p className="text-xs text-gray-600">{helpText}</p>
      )}

      {error && (
        <p id={`${label}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

// Usage:
<ValidatedInput
  label="Session Name"
  placeholder="e.g., Coffee Comparison Session"
  value={sessionName}
  onChange={setSessionName}
  validation={{
    required: true,
    maxLength: 100
  }}
  helpText="Name your tasting session (max 100 characters)"
/>
```

### Form-Level Validation Pattern

```typescript
// lib/validation/tastingValidation.ts

export const validateTastingForm = (formData: TastingFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Category validation
  if (!formData.category?.trim()) {
    errors.category = 'Please select a flavor category (coffee, wine, tea, etc.)';
  }

  // Session name validation
  if (formData.session_name && formData.session_name.length > 100) {
    errors.session_name = 'Session name must be 100 characters or fewer';
  }

  // Items validation (if required)
  if (formData.mode === 'competition' && formData.items.length === 0) {
    errors.items = 'Competition mode requires at least one item. Add items to compare.';
  }

  // Blind settings validation
  if (formData.is_blind_items && !formData.items.length) {
    errors.blind_items = "You can't blind items if you haven't added any items yet";
  }

  return errors;
};

// Usage:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = validateTastingForm(formData);

  if (Object.keys(errors).length > 0) {
    // Show errors
    setFormErrors(errors);

    // Show summary toast
    const errorCount = Object.keys(errors).length;
    toast.error(`Please fix ${errorCount} error${errorCount !== 1 ? 's' : ''}`, {
      description: 'See the form for details',
    });
    return;
  }

  // Submit form...
};
```

---

## 4. CTA IMPROVEMENT EXAMPLES

### CTA Pattern Library

```jsx
// Before & After Examples

// PATTERN 1: Primary Action CTAs
// Before (Vague):
<button>Continue</button>

// After (Specific):
<button>Create Your First Tasting</button>

// Usage:
const PrimaryActionCTA = ({ action, target, size = 'md' }) => (
  <button className={`btn btn-primary btn-${size}`}>
    {action} {target}
    <ArrowRight className="w-4 h-4 ml-2" />
  </button>
);

<PrimaryActionCTA action="Create" target="Your First Tasting" />

// -----

// PATTERN 2: Secondary Action CTAs
// Before:
<button>Skip</button>

// After:
<button>Skip for now, I'll do this later</button>

// Usage:
const SecondaryActionCTA = ({ action, detail }) => (
  <button className="btn btn-secondary">
    {action}
    {detail && <span className="text-xs opacity-75 block">{detail}</span>}
  </button>
);

<SecondaryActionCTA
  action="Skip"
  detail="You can add items anytime"
/>

// -----

// PATTERN 3: Destructive Action CTAs
// Before:
<button className="text-red-600">Delete</button>

// After (with confirmation):
<AlertDialog>
  <AlertDialogTrigger asChild>
    <button className="btn btn-danger">Delete This Tasting</button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete tasting?</AlertDialogTitle>
    <AlertDialogDescription>
      This tasting will be permanently deleted. You cannot undo this.
    </AlertDialogDescription>
    <AlertDialogAction variant="danger">
      Yes, delete it
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>

// -----

// PATTERN 4: Context-Aware CTAs
// Before (static):
<button>Start Tasting</button>

// After (state-aware):
const TastingCTA = ({ userTastingCount, phase }) => {
  if (userTastingCount === 0) {
    return <button>Create Your First Tasting</button>;
  }

  if (phase === 'tasting') {
    return <button>Continue Tasting</button>;
  }

  return <button>Start New Tasting</button>;
};
```

### CTA Content Strategy

```markdown
# CTA Writing Framework

## Structure

[ACTION VERB] + [OBJECT/VALUE] + [OPTIONAL: CONTEXT]

## Action Verbs (Priority Order)

- Primary: Create, Start, Join, Continue, Complete
- Secondary: Learn, Explore, Discover, Try
- Destructive: Delete, Remove, Exit
- Avoid: Submit, OK, Done (too generic)

## Value Proposition

What does the user get by clicking?

- "Create Your Account" (vs "Sign Up")
- "Start Your First Tasting" (vs "Begin")
- "Join the Community" (vs "Enter")

## Examples

✅ "Create Your Account" (specific, valuable)
❌ "Sign Up" (generic)

✅ "Start Your First Tasting" (encouraging)
❌ "Begin" (vague)

✅ "Join This Tasting with Code ABC123" (specific)
❌ "Enter Code" (unclear)

✅ "Download Your Results as PDF" (clear outcome)
❌ "Export" (unclear)

✅ "Save & Share with Group" (shows multiple benefits)
❌ "Save" (incomplete)
```

---

## 5. EMPTY STATE ENHANCEMENT TEMPLATE

```typescript
// components/ui/EnhancedEmptyState.tsx

interface EnhancedEmptyStateProps {
  icon?: string;
  title: string;
  description: string;

  // Progress indication (optional)
  progress?: {
    current: number;
    required: number;
    label: string;
  };

  // Primary action (required)
  action: {
    label: string;
    onClick: () => void;
    hint?: string;
  };

  // Alternative actions
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;

  // Timeline (optional)
  timeline?: {
    estimated: string;
    example: string;
  };
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  progress,
  action,
  secondaryActions,
  timeline
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center
                      justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>

      {/* Progress Bar (Optional) */}
      {progress && (
        <div className="w-full max-w-xs mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{progress.current} of {progress.required} {progress.label}</span>
            <span>{Math.round((progress.current / progress.required) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(progress.current / progress.required) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary Action */}
      <button
        onClick={action.onClick}
        className="btn btn-primary mb-3"
      >
        {action.label}
        {action.hint && (
          <span className="block text-xs opacity-75 font-normal">{action.hint}</span>
        )}
      </button>

      {/* Timeline (Optional) */}
      {timeline && (
        <p className="text-xs text-gray-500 mb-4">
          Takes about {timeline.estimated} • {timeline.example}
        </p>
      )}

      {/* Secondary Actions */}
      {secondaryActions && (
        <div className="flex gap-3 mt-4">
          {secondaryActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// USAGE EXAMPLES:

// Example 1: No tastings yet (with progress)
<EnhancedEmptyState
  icon="wine_bar"
  title="No tastings yet"
  description="Create your first tasting to start exploring flavors and building your personalized flavor wheel."
  progress={{
    current: 0,
    required: 3,
    label: 'tastings needed for flavor wheel'
  }}
  action={{
    label: 'Create Your First Tasting',
    hint: 'Takes about 5 minutes',
    onClick: () => router.push('/quick-tasting')
  }}
  secondaryActions={[
    { label: 'Watch tutorial', onClick: handleWatchTutorial, icon: <PlayIcon /> },
    { label: 'Join a tasting', onClick: () => router.push('/join'), icon: <UsersIcon /> }
  ]}
  timeline={{
    estimated: '5 minutes',
    example: 'or create a competition in 2 minutes'
  }}
/>

// Example 2: No flavor wheels yet (with context)
<EnhancedEmptyState
  icon="pie_chart"
  title="Flavor wheel coming soon"
  description="Your personalized flavor wheel will appear after you complete 3 tastings. It shows your flavor preferences across categories."
  progress={{
    current: currentTastingCount,
    required: 3,
    label: 'tastings'
  }}
  action={{
    label: 'Start Your Next Tasting',
    onClick: () => router.push('/quick-tasting')
  }}
/>

// Example 3: No posts yet (with alternatives)
<EnhancedEmptyState
  icon="pen"
  title="No reviews yet"
  description="Share your tasting experiences with the community. Your reviews help others discover new favorites."
  action={{
    label: 'Write Your First Review',
    onClick: () => router.push('/review/new')
  }}
  secondaryActions={[
    { label: 'Browse community reviews', onClick: handleBrowse },
    { label: 'Learn about reviews', onClick: handleLearnMore }
  ]}
/>
```

---

## 6. COPY STYLE GUIDE TEMPLATE

```markdown
# Flavatix Copy Style Guide

## Voice & Tone

### Who We Are

- Expert but approachable tasting community
- Empowering users to discover and appreciate flavors
- Welcoming to beginners and professionals

### Tone Guidelines

**Always:**

- Be helpful and encouraging
- Assume users are intelligent but may be new to tasting
- Use plain language
- Be specific rather than vague

**Never:**

- Be condescending
- Use technical jargon without explanation
- Make assumptions about knowledge level
- Be overly casual or use slang

### Examples

✅ "Create your first tasting to start exploring flavors"
❌ "Get tasty tasting vibes going" (too casual)

✅ "Add items you want to compare"
❌ "Input items for comparative analysis" (too technical)

✅ "Blind tasting hides item names so you can focus on pure flavor"
❌ "Blind tastes anonymize commodities" (jargony)

---

## Terminology

### Standard Terms

| Concept               | Standard Term             | Variations to Avoid                        |
| --------------------- | ------------------------- | ------------------------------------------ |
| User in group tasting | Participant               | Taster, attendee, person                   |
| Things being tasted   | Item                      | Sample, product, commodity                 |
| Types of tastings     | Tasting mode              | Tasting type, tasting approach             |
| Individual notes      | Tasting note / Descriptor | Flavor note, description                   |
| Numeric rating        | Score                     | Rating, grade, ranking (different meaning) |
| Color visualization   | Flavor wheel              | Taste wheel, aroma wheel                   |

### Writing the Terms

- **Participant** (not taster) - broader, clearer
- **Item** (not sample, product) - consistent throughout
- **Tasting mode** (not type, approach) - implies it's a selection/setting
- **Flavor wheel** (not taste wheel) - preferred terminology

---

## Grammar & Mechanics

### Numbers

- 0-9: Spell out ("three tastings")
- 10+: Use numerals ("25 people joined")
- Exception: Codes, scores, percentages always numeric (ABC123, 85 points, 100%)

### Capitalization

- Capitalize feature names (Flavor Wheel, Study Mode, Quick Tasting)
- Don't capitalize general concepts ("tasting session", "blind tasting")
- Sentence case for buttons and headers

### Punctuation

- Use periods in complete sentences
- Omit periods in UI copy (labels, buttons, short tips)
- Use em dashes (—) not hyphens for breaks: "This is useful — try it"

### Lists

- Use bullet points for features/options
- Use numbered lists for steps
- Parallel construction (all start with verbs or all nouns)

---

## CTA (Call-to-Action) Standards

### Formula

[ACTION VERB] + [OBJECT/VALUE]

### Action Verbs

**Primary (Encouraged):**

- Create, Start, Join, Continue, Complete, Explore, Discover

**Secondary (Acceptable):**

- Learn, Try, Browse, Save, Share

**Avoid:**

- Submit, OK, Done, Go, Click (too generic)

### Examples

✅ "Create Your Account"
✅ "Start Your First Tasting"
✅ "Join This Tasting"
✅ "Continue Tasting"
❌ "Sign Up" (generic)
❌ "Go" (unclear)
❌ "Submit" (cold, technical)

---

## Error Messages

### Format

1. What went wrong (title)
2. Why (optional message)
3. What to do (suggestion)
4. Help link (optional)

### Examples

✅ "Category required"
"You must select a flavor category"
"Choose from Coffee, Wine, Tea, Beer, Spirits, or Chocolate"

✅ "Tasting code not found"
"This code doesn't match any active tastings"
"Double-check the code and ask the host"

❌ "Error 404" (technical)
❌ "PGRST116" (database jargon)

---

## Help Text & Hints

### Placement

- **Labels:** Why this field matters
- **Hints:** How to fill it in (constraints, examples, format)
- **Tooltips:** Definition of terms or context
- **Help links:** Detailed explanation or docs

### Examples

**Label:** "Flavor Category"
**Hint:** "Choose the flavor category (e.g., Coffee, Wine). This customizes your tasting guide."
**Tooltip:** "Category affects which descriptors and templates you see"
**Help link:** "Learn about categories"

---

## Reading Level

**Target: 7th-8th grade level**

### Simple vs. Complex

✅ "Hide item names" (8 letters, 3 words)
❌ "Anonymize commodity identifiers" (27 letters, 3 words)

✅ "How much it tastes as expected" (5 words)
❌ "Typicity assessment metric" (3 words but 7th grade → 12th grade)

### Plain English Alternatives

- Don't use → Do use
- Utilize → Use
- Commence → Start
- Descriptor → Flavor note
- Commodity → Item
- Anonymize → Hide
- Verification → Confirmation
```

---

## 7. QUICK IMPLEMENTATION CHECKLIST

```markdown
# Copy Improvement Implementation Checklist

## Phase 1: Error Messages (Week 1)

- [ ] Create `errorMessages.ts` constant file
- [ ] Review all toast.error() calls
- [ ] Add title + suggestion to all errors
- [ ] Remove technical jargon (PGRST116, RLS, etc.)
- [ ] Add help links to critical errors
- [ ] Test with 5 new users

## Phase 2: Help Text (Week 2)

- [ ] Create `helpTexts.ts` constant file
- [ ] Add tooltips to 10 critical features
- [ ] Add field hints to all forms
- [ ] Document Blind Tasting terms
- [ ] Create glossary page
- [ ] Link help from tooltips

## Phase 3: CTAs & Copy (Week 3)

- [ ] Audit all button text
- [ ] Improve vague CTAs
- [ ] Create copy style guide
- [ ] Add CTA hints (e.g., "Takes 2 minutes")
- [ ] Standardize terminology across codebase
- [ ] Remove technical language from UI

## Phase 4: Onboarding & Empty States (Week 4)

- [ ] Add progress indicators to multi-step flows
- [ ] Enhance 5 most-viewed empty states
- [ ] Add "How it works" sections
- [ ] Create feature intro modals
- [ ] Add secondary action options to empty states
- [ ] User test with 10 new users

## Ongoing

- [ ] A/B test new CTAs
- [ ] Monitor error patterns
- [ ] Quarterly copy audits
- [ ] User feedback surveys
- [ ] Update style guide as patterns emerge
```

---

**Document prepared:** January 15, 2026
**For implementation by:** Development team + Content/UX leads
**Estimated effort:** 80-120 developer hours + 40 content hours
