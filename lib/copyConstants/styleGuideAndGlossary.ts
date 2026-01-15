/**
 * COPY STYLE GUIDE & GLOSSARY - Terminology consistency
 *
 * Ensures consistent language, capitalization, and explanations across the app.
 *
 * Usage:
 *   import { TERMINOLOGY, GLOSSARY, TONE_GUIDELINES } from '@/lib/copyConstants/styleGuideAndGlossary';
 *   const term = TERMINOLOGY.BLIND_TASTING; // Get correct capitalization
 */

// ============================================================================
// TERMINOLOGY - Correct names and capitalization
// ============================================================================

export const TERMINOLOGY = {
  // Features
  BLIND_TASTING: 'blind tasting',
  BLIND_TASTING_CAP: 'Blind Tasting',
  STUDY_MODE: 'Study Mode',
  COMPETITION_MODE: 'Competition Mode',
  FLAVOR_WHEEL: 'flavor wheel',
  FLAVOR_WHEEL_CAP: 'Flavor Wheel',
  FLAVOR_DESCRIPTOR: 'flavor descriptor',
  FLAVOR_DESCRIPTORS: 'flavor descriptors',

  // Categories
  COFFEE: 'coffee',
  WINE: 'wine',
  TEA: 'tea',
  BEER: 'beer',
  SPIRITS: 'spirits',
  CHOCOLATE: 'chocolate',
  OLIVE_OIL: 'olive oil',
  BEER_CAP: 'Beer',
  SPIRITS_CAP: 'Spirits',
  CHOCOLATE_CAP: 'Chocolate',
  OLIVE_OIL_CAP: 'Olive Oil',

  // Tasting structure
  TASTING_SESSION: 'tasting session',
  TASTING_SESSION_CAP: 'Tasting Session',
  TASTING: 'tasting',
  HOST: 'host',
  PARTICIPANT: 'participant',
  RESPONSE: 'response',
  ROUND: 'round',
  ITEM: 'item',

  // Social
  FOLLOW: 'follow',
  FOLLOWER: 'follower',
  FOLLOWERS: 'followers',
  LIKE: 'like',
  REVIEW: 'review',
  RATING: 'rating',

  // Profile
  EXPERTISE_LEVEL: 'expertise level',
  FAVORITE_CATEGORIES: 'favorite categories',
  BIO: 'bio',
  PROFILE: 'profile',

  // Other
  TYPICITY: 'typicity',
  AROMA: 'aroma',
  TASTE: 'taste',
  FINISH: 'finish',
  MOUTHFEEL: 'mouthfeel',
  ACIDITY: 'acidity',
  BODY: 'body',
} as const;

// ============================================================================
// GLOSSARY - Explain jargon for users
// ============================================================================

export interface GlossaryEntry {
  term: string;
  definition: string;
  example: string;
  context?: string;
  learnMore?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  BLIND_TASTING: {
    term: 'Blind Tasting',
    definition:
      'A tasting where participants evaluate items without knowing their identity. Item names are hidden and revealed only after voting/evaluation.',
    example:
      'In a blind wine tasting, you might taste "Wine A" and "Wine B" without knowing if they\'re Bordeaux or Burgundy.',
    context: 'Used in competitions and objective comparisons',
    learnMore: '/help/blind-tasting',
  },

  DESCRIPTOR: {
    term: 'Flavor Descriptor',
    definition:
      'A single flavor or aroma note that you identify in an item. Descriptors are the individual qualities that make up the overall taste.',
    example:
      'In coffee: "nutty", "earthy", "acidic", "fruity" are all descriptors. In wine: "cherry", "oak", "tannin", "mineral".',
    context: 'Used to build flavor profiles and taste notes',
    learnMore: '/help/descriptors',
  },

  FLAVOR_WHEEL: {
    term: 'Flavor Wheel',
    definition:
      'A circular visual representation of flavor preferences. Each segment represents a flavor descriptor, with size indicating how often you noticed or preferred that flavor.',
    example:
      'After 5 coffee tastings, your wheel might show a large "fruity" segment (you selected it often) and smaller "earthy" segment (you selected it less).',
    context: 'Generated from your tasting history',
    learnMore: '/help/flavor-wheels',
  },

  TYPICITY: {
    term: 'Typicity',
    definition:
      "A 1-10 scale rating how characteristic an item tastes for its type. 10 = tastes exactly as you'd expect; 1 = unusual/atypical flavors.",
    example:
      'A well-roasted espresso might get 9/10 typicity (tastes like quality espresso should). An experimental aged tea might get 4/10 (unusual, atypical flavors).',
    context: 'Helps evaluate quality and authenticity',
    learnMore: '/help/typicity',
  },

  STUDY_MODE: {
    term: 'Study Mode',
    definition:
      'A structured tasting format where participants taste items using a guided flavor wheel. Everyone uses the same descriptor categories and fills in their own observations.',
    example:
      'Wine study group uses Study Mode with categories: color, aroma, taste, finish. Each person fills in observations for each wine.',
    context: 'Best for learning and group tastings',
    learnMore: '/help/study-mode',
  },

  COMPETITION_MODE: {
    term: 'Competition Mode',
    definition:
      'A tasting format where participants score items (usually 1-10), and results are ranked by total score. Good for determining group favorites.',
    example:
      'Taste 5 beers, score each 1-10, see which beer wins overall based on combined scores.',
    context: 'Used for competitions and preference polling',
    learnMore: '/help/competition-mode',
  },

  MOUTHFEEL: {
    term: 'Mouthfeel',
    definition:
      'The texture and physical sensation of an item in your mouth. Examples: smooth, creamy, bitter, dry, astringent.',
    example:
      'Whole milk has a smooth, creamy mouthfeel. Espresso has a bitter, slightly astringent mouthfeel.',
    context: 'Part of overall tasting evaluation',
  },

  ACIDITY: {
    term: 'Acidity',
    definition:
      'A bright, tangy sensation in taste. Not necessarily sour. In wine, acidity is important for balance.',
    example:
      'Lemon juice has high acidity. Milk chocolate has low acidity. A great Sauvignon Blanc has bright acidity.',
    context: 'Key characteristic in wine, coffee, and many foods',
  },

  BODY: {
    term: 'Body (in wine/coffee)',
    definition:
      'The weight and texture of a drink in your mouth. Light body = thin, watery. Full body = thick, rich.',
    example: 'Skim milk = light body. Whole milk = medium body. Heavy cream = full body.',
    context: 'Describes overall weight and richness',
  },

  AROMA: {
    term: 'Aroma',
    definition: 'The smell of an item. What you perceive through your nose when smelling directly.',
    example: 'The aroma of fresh-ground coffee is often described as nutty, earthy, or fruity.',
    context: 'First step in tasting evaluation',
  },

  FINISH: {
    term: 'Finish',
    definition: 'The lingering taste and sensations after swallowing. Can last seconds to minutes.',
    example:
      'A great wine might have a long, pleasant finish with notes of chocolate and vanilla. A cheap wine might have a short, unpleasant finish.',
    context: 'Indicates quality and balance',
  },

  TASTING_CODE: {
    term: 'Tasting Code',
    definition:
      'An 8-character unique code that lets others join your tasting session. Share it with participants.',
    example: 'Share code "ABC12XYZ" with friends. They enter it to join your tasting.',
    context: 'Used to invite participants',
    learnMore: '/help/tasting-codes',
  },

  HOST: {
    term: 'Host',
    definition:
      'The person who creates and runs a tasting session. The host controls what happens and can see all results.',
    example:
      "You're the host if you created the tasting. Only the host can start, pause, or end the tasting.",
    context: 'Tasting structure',
  },

  PARTICIPANT: {
    term: 'Participant',
    definition:
      "Someone who joins a tasting session. Participants taste items and provide responses but can't control the session.",
    example: 'Your friends are participants when you share a tasting code with them.',
    context: 'Tasting structure',
  },

  EXPERTISE_LEVEL: {
    term: 'Expertise Level',
    definition:
      'Your experience with a specific flavor category. Options: Beginner, Enthusiast, Expert.',
    example: 'You might be a Coffee Expert but a Wine Beginner.',
    context: 'Helps others understand your background',
    learnMore: '/help/expertise-levels',
  },

  VISIBILITY: {
    term: 'Visibility (for reviews)',
    definition:
      'Who can see your review: Private (only you), Participants (everyone in the tasting), or Public (anyone on Flavatix).',
    example:
      "Post a review publicly to help other coffee lovers. Mark it private if it's just for yourself.",
    context: 'Controls review sharing',
  },
} as const;

// ============================================================================
// TONE GUIDELINES
// ============================================================================

export const TONE_GUIDELINES = {
  OVERVIEW: {
    description: 'Flavatix uses a friendly, encouraging, expert tone.',
    principles: [
      "Friendly: We're helping people explore flavors, not lecturing",
      'Encouraging: We celebrate curiosity and learning',
      'Expert: We use correct terminology while explaining it',
      'Clear: We explain jargon when first used',
      'Action-oriented: We tell people what to do next',
      'Respectful: All palates are valid. No judgment.',
    ],
  },

  DO: [
    'Use "you" to address users directly',
    'Break down complex concepts with examples',
    'Celebrate progress ("You completed your first tasting!")',
    'Provide clear next steps',
    'Use conversational language',
    'Ask questions to guide users',
    'Explain why (not just what)',
    "Use contractions (we're, don't, it's)",
    'Keep sentences short and simple',
    'Use active voice ("Create a tasting" not "A tasting should be created")',
  ],

  DONT: [
    'Use corporate jargon ("leverage", "synergize", "optimize")',
    'Assume user knowledge (explain terms like "descriptor")',
    'Use ALL CAPS except for emphasis',
    'Make users feel stupid ("Obviously...", "Simply...")',
    'Use passive voice ("Your response was received")',
    'Be overly casual (avoid slang, emojis in help text)',
    'Give only problems without solutions',
    'Use "please" excessively',
    'Make assumptions about user preferences',
    'Use technical jargon without explanation',
  ],

  EXAMPLES: {
    GREETING: {
      GOOD: 'Welcome back! Ready to taste something new?',
      BAD: 'Hello. System ready for tasting session initialization.',
    },
    ERROR: {
      GOOD: 'Tasting code not found. Double-check the code (format: ABC12XYZ) and ask the host if unsure.',
      BAD: 'Error 404: Tasting session lookup failed. Please verify input parameters.',
    },
    ENCOURAGEMENT: {
      GOOD: "You've completed 2 of 3 tastings. One more and your flavor wheel unlocks!",
      BAD: 'Progress: 2/3 tastings completed. Additional tastings required to unlock flavor wheel feature.',
    },
    INSTRUCTION: {
      GOOD: 'Click each flavor you notice. You can select multiple. No wrong answers.',
      BAD: 'Select all applicable flavor descriptors from the provided list.',
    },
  },
} as const;

// ============================================================================
// CAPITALIZATION & FORMATTING RULES
// ============================================================================

export const FORMATTING_RULES = {
  // Product names (always these)
  PRODUCT_NAMES: {
    FLAVATIX: 'Flavatix',
    FLAVOR_WHEEL: 'Flavor Wheel',
    STUDY_MODE: 'Study Mode',
    COMPETITION_MODE: 'Competition Mode',
  },

  // Categories (lowercase except proper nouns)
  CATEGORIES: {
    coffee: 'coffee',
    wine: 'wine',
    tea: 'tea',
    beer: 'beer',
    spirits: 'spirits',
    chocolate: 'chocolate',
    oliveOil: 'olive oil',
  },

  // Features (title case when referring to feature names)
  FEATURE_NAMES: {
    blind: 'Blind Tasting',
    wheel: 'Flavor Wheel',
    descriptor: 'Flavor Descriptor',
    review: 'Review',
    rating: 'Rating',
  },

  // Button text rules
  BUTTON_TEXT_RULES: {
    titleCase: true, // Capitalize first word of each major word
    noEllipsis: true, // "Continue" not "Continue..."
    noColons: true, // "Save Changes" not "Save: Changes"
    actionVerb: true, // Start with verb: "Create", "Join", "Save"
  },

  // Form label rules
  FORM_LABEL_RULES: {
    titleCase: true,
    endWithColon: true, // "Session Name:"
    indicateRequired: true, // Add asterisk for required fields
  },
} as const;

// ============================================================================
// COMMON PHRASES & SNIPPETS
// ============================================================================

export const COMMON_PHRASES = {
  READY_TO: 'Ready to {action}?',
  ALMOST_THERE: "You're almost there!",
  GREAT_JOB: 'Great job!',
  NO_WRONG_ANSWERS: "No wrong answers. We're just curious about your palate.",
  TRY_AGAIN: 'Please try again',
  CHECK_CONNECTION: 'Check your connection and try again',
  CONTACT_SUPPORT: 'Contact support if this keeps happening',
  LEARN_MORE: 'Learn more about {topic}',
  MORE_HELP: 'Need more help? Contact us →',
  SAVED_AUTOMATICALLY: 'Saved automatically',
  CHANGES_SAVED: 'Changes saved',
  JUST_NOW: 'Just now',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get glossary entry with fallback
 * @param term - Glossary term key
 * @returns Glossary entry or undefined
 */
export function getGlossaryEntry(term: keyof typeof GLOSSARY): GlossaryEntry | undefined {
  return GLOSSARY[term];
}

/**
 * Format glossary term with definition
 * @param term - Glossary term key
 * @returns Formatted HTML string
 */
export function formatGlossaryTerm(term: keyof typeof GLOSSARY): string {
  const entry = getGlossaryEntry(term);
  if (!entry) {
    return '';
  }

  return `<strong>${entry.term}</strong>: ${entry.definition}`;
}

/**
 * Check if text follows tone guidelines
 * @param text - Text to check
 * @returns Issues found
 */
export function checkToneCompliance(text: string): string[] {
  const issues: string[] = [];

  // Check for corporate jargon
  const jargon = ['leverage', 'synergize', 'optimize', 'utilize', 'facilitate', 'facilitate'];
  jargon.forEach((word) => {
    if (text.toLowerCase().includes(word)) {
      issues.push(`Avoid corporate jargon: "${word}"`);
    }
  });

  // Check for passive voice (simplified check)
  if (text.includes('was ') || text.includes('were ')) {
    issues.push('Consider using active voice');
  }

  // Check for all caps
  if (text.match(/[A-Z]{2,}/)) {
    issues.push('Avoid ALL CAPS (use for emphasis only)');
  }

  return issues;
}
