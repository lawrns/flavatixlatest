/**
 * HELP TEXT & TOOLTIP LIBRARY - Contextual guidance for all features
 *
 * Every help text includes:
 * - short: Brief tooltip (one line, <50 chars)
 * - long: Detailed explanation for expanded help
 * - example: Real example from Flavatix
 * - learnMore: Optional link to detailed documentation
 *
 * Usage:
 *   import { HELP_TEXTS } from '@/lib/copyConstants/helpTexts';
 *   <Tooltip content={HELP_TEXTS.TASTING.BLIND_MODE.short} />
 */

export interface HelpTextTemplate {
  short: string;
  long: string;
  example?: string;
  learnMore?: string;
}

export const HELP_TEXTS = {
  // ========================================================================
  // TASTING SETUP & MODES
  // ========================================================================
  TASTING: {
    SESSION_NAME: {
      short: 'Give your tasting a memorable name',
      long: 'Choose a descriptive name that helps you remember this tasting later. Examples: "Cold Brew Comparison", "Vintage Port Night", "Bean Roast Test".',
      example: 'Ethiopian Yirgacheffe Tasting - March 2026',
      learnMore: '/help/naming-your-tasting',
    },
    BLIND_MODE: {
      short: 'Participants see items as "Item 1", "Item 2", etc.',
      long: 'In blind tasting mode, participant names are hidden until results are revealed. This removes bias and makes for more honest evaluations. Common in wine and coffee competitions.',
      example: 'Show Item 1, Item 2, Item 3 → Reveal names after scoring',
      learnMore: '/help/blind-tasting',
    },
    STUDY_MODE: {
      short: 'Learn with structured tasting exercises',
      long: 'Study Mode guides participants through a structured tasting with custom flavor categories. Each participant tastes items and fills in a flavor profile. Great for education and comparison.',
      example: 'Coffee tasting: Rate acidity, body, finish',
      learnMore: '/help/study-mode',
    },
    COMPETITION_MODE: {
      short: 'Score items blindly, see rankings',
      long: 'Participants score items without knowing what they are. Results show rankings and scores. Perfect for friendly competitions or determining group favorites.',
      example: '5 wines, scored 1-10 by 8 tasters, ranked by total points',
      learnMore: '/help/competition-mode',
    },
    FLAVOR_CATEGORY: {
      short: 'Type of item being tasted (Coffee, Wine, Tea, etc.)',
      long: 'Flavor categories determine which flavor descriptors appear in your tasting. Each category has its own standardized tasting wheel with specific aroma and taste notes.',
      example: 'Wine category shows: fruity, earthy, spicy, floral',
      learnMore: '/help/flavor-categories',
    },
    DESCRIPTOR: {
      short: 'A single flavor or aroma note (e.g., "cherry", "acidity")',
      long: 'Descriptors are the specific flavors and aromas that tasters select. The flavor wheel shows all descriptors available for your category.',
      example: 'In coffee: "nutty", "earthy", "acidic" are descriptors',
      learnMore: '/help/descriptors',
    },
    TYPICITY: {
      short: 'How much it tastes "typical" for its type',
      long: 'Typicity is a 1-10 scale showing how typical the item tastes for its category. A "typical" coffee tastes like you\'d expect coffee to taste.',
      example: '9/10 = tastes exactly like quality coffee should; 3/10 = unusual, atypical flavors',
      learnMore: '/help/typicity',
    },
  },

  // ========================================================================
  // PARTICIPANTS & SHARING
  // ========================================================================
  PARTICIPANT: {
    TASTING_CODE: {
      short: 'Share this code to invite others to join',
      long: 'Give this 8-character code to participants. They enter it in Flavatix to join your tasting session. Codes expire after the tasting ends.',
      example: 'Share code "ABC12XYZ" with friends via text or email',
      learnMore: '/help/inviting-participants',
    },
    PARTICIPANT_ROLE: {
      short: 'Host controls the session; participants join and taste',
      long: 'Host: Can start/end tasting, set items, reveal results. Participants: Can only taste items and submit responses.',
      example: 'You are the host; your friends are participants',
      learnMore: '/help/roles',
    },
    MAX_PARTICIPANTS: {
      short: 'Up to 100 people can join one tasting',
      long: 'Flavatix supports large group tastings. Perfect for competitions, classroom tastings, or big parties.',
      example: 'Invite 50 wine enthusiasts to rate the same 10 wines',
      learnMore: '/help/group-tastings',
    },
  },

  // ========================================================================
  // FLAVOR WHEEL & ANALYSIS
  // ========================================================================
  FLAVOR_WHEEL: {
    WHAT_IS_IT: {
      short: 'Visual map of your flavor preferences',
      long: 'Your personalized flavor wheel appears after 3 tastings. It shows which flavors you prefer most across all tastings. Segments that are larger mean you noticed/preferred those flavors more.',
      example: 'If you notice "fruity" notes often, that segment is bigger',
      learnMore: '/help/flavor-wheels',
    },
    HOW_BUILT: {
      short: 'Generated from your taste selections in previous tastings',
      long: "The flavor wheel aggregates all the flavor descriptors you've selected in past tastings. More frequent selections = larger wheel segments.",
      example: 'Tasted 5 coffees, selected "nutty" 8 times → "nutty" is a big segment',
      learnMore: '/help/how-flavor-wheels-work',
    },
    SHARING: {
      short: 'Share your wheel to compare with friends',
      long: 'Your flavor wheel is private by default. You can share it to compare taste profiles with friends or post to community.',
      example: 'Share your coffee preferences with your espresso club',
      learnMore: '/help/sharing-wheels',
    },
  },

  // ========================================================================
  // REVIEWS & SOCIAL FEATURES
  // ========================================================================
  REVIEW: {
    PROSE_REVIEW: {
      short: 'Write a detailed tasting note about this item',
      long: 'Prose reviews let you describe what you tasted in your own words. Include aromas, flavors, finish, quality, and any other impressions.',
      example: 'Bright acidity, notes of tropical fruit, smooth finish, would recommend',
      learnMore: '/help/writing-reviews',
    },
    RATING_SCALE: {
      short: '1-10 scale: 1 = poor, 10 = exceptional',
      long: 'Your overall rating for this item. Be honest - ratings help determine group favorites and improve our recommendations.',
      example: '8/10 = excellent quality, minor flaws',
      learnMore: '/help/rating-scale',
    },
    VISIBILITY: {
      short: 'Choose who can see this review: Just me, Participants, or Public',
      long: 'Private: Only you see it. Participants: Everyone in this tasting sees it. Public: Anyone on Flavatix can see it.',
      example: 'Post publicly to help other wine lovers discover your favorite',
      learnMore: '/help/review-visibility',
    },
  },

  // ========================================================================
  // PROFILE & PERSONAL DATA
  // ========================================================================
  PROFILE: {
    EXPERTISE_LEVEL: {
      short: 'Tell others your experience with this flavor category',
      long: 'Beginner: Just starting out. Enthusiast: Regular taster. Expert: Deep knowledge and experience. This helps others know how to value your reviews.',
      example: 'Set to "Expert" for wine if you have formal sommelier training',
      learnMore: '/help/expertise-levels',
    },
    BIO: {
      short: 'Brief description of you and your taste interests (max 500 chars)',
      long: 'Tell others who you are and what you enjoy tasting. This appears on your public profile.',
      example: 'Coffee enthusiast, home roaster, always looking for single-origin beans',
      learnMore: '/help/profile-bio',
    },
    FAVORITE_CATEGORIES: {
      short: 'What flavor categories do you enjoy most?',
      long: 'Select up to 5 categories. These appear on your profile and help others find tasters with similar interests.',
      example: 'Wine, Coffee, Tea, Chocolate, Beer',
      learnMore: '/help/favorite-categories',
    },
  },

  // ========================================================================
  // ADVANCED FEATURES
  // ========================================================================
  ADVANCED: {
    CUSTOM_DESCRIPTORS: {
      short: 'Add your own flavor notes beyond the standard wheel',
      long: 'Beyond the pre-set flavor descriptors, you can add custom descriptors that matter to you. These appear in your tasting wheel.',
      example: 'Add "peppery" or "mineral" if those aren\'t in the standard category',
      learnMore: '/help/custom-descriptors',
    },
    TASTING_TEMPLATES: {
      short: 'Reuse setup from a previous tasting',
      long: 'Save time by using a template. Creates new tasting with same items, categories, and settings from a previous one.',
      example: 'Weekly coffee tasting uses same 5 roasts, same structure',
      learnMore: '/help/templates',
    },
    COMPARISON_VIEW: {
      short: 'Side-by-side comparison of multiple tastings',
      long: 'See how your palate has changed, or compare different versions of the same item across tastings.',
      example: 'Compare Ethiopian Yirgacheffe from 3 different roasters',
      learnMore: '/help/comparison-view',
    },
  },
} as const;

/**
 * Helper to get help text with fallback
 * @param category - Top-level category
 * @param key - Specific help text
 * @returns Help text template or undefined
 */
export function getHelpText(
  category: keyof typeof HELP_TEXTS,
  key: string
): HelpTextTemplate | undefined {
  const categoryTexts = HELP_TEXTS[category];
  if (categoryTexts && key in categoryTexts) {
    return categoryTexts[key as keyof typeof categoryTexts];
  }
  return undefined;
}

/**
 * Helper to get all help texts for a category
 * @param category - Top-level category
 * @returns All help texts in that category
 */
export function getCategoryHelpTexts(category: keyof typeof HELP_TEXTS) {
  return HELP_TEXTS[category];
}
