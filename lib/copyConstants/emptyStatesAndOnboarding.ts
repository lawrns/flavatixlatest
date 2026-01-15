/**
 * EMPTY STATE & ONBOARDING COPY LIBRARY
 *
 * Friendly, encouraging messages for first-time users and empty states.
 *
 * Usage:
 *   import { EMPTY_STATES, ONBOARDING } from '@/lib/copyConstants/emptyStatesAndOnboarding';
 *   <EmptyState title={EMPTY_STATES.NO_TASTINGS.title} />
 */

// ============================================================================
// EMPTY STATES - When content areas are empty
// ============================================================================

export interface EmptyStateTemplate {
  title: string;
  description: string;
  icon?: string;
  primaryAction?: {
    text: string;
    description?: string;
  };
  secondaryAction?: {
    text: string;
    description?: string;
  };
  hint?: string;
}

export const EMPTY_STATES = {
  // Dashboard & main views
  NO_TASTINGS: {
    title: 'No tastings yet',
    description:
      'Create your first tasting to start exploring flavors. You can taste anything with flavor or aroma!',
    icon: '🎯',
    primaryAction: {
      text: 'Create Your First Tasting',
      description: 'Start with a simple tasting of 2-3 items',
    },
    secondaryAction: {
      text: 'Browse Public Tastings',
      description: 'See what others are tasting',
    },
    hint: 'Tip: Start with Study Mode to learn about flavor wheels.',
  },

  NO_FLAVOR_WHEELS: {
    title: 'Flavor wheel coming soon',
    description:
      'Your personalized flavor wheel appears after 3 tastings. It shows your unique flavor preferences across categories.',
    icon: '🌟',
    primaryAction: {
      text: 'Create Your First Tasting',
      description: '0 of 3 tastings needed',
    },
    secondaryAction: {
      text: 'Learn About Flavor Wheels',
      description: 'How they work and why they matter',
    },
    hint: 'Your wheel gets better with more tastings. Keep going!',
  },

  NO_PARTICIPANTS: {
    title: 'Invite others to join',
    description:
      "This tasting is set up and ready, but you're the only one tasting. Invite friends to make it fun!",
    icon: '👥',
    primaryAction: {
      text: 'Share Tasting Code',
      description: 'Copy and send this code to invite others',
    },
    secondaryAction: {
      text: 'Start Tasting Solo',
      description: 'Taste alone and see solo results',
    },
    hint: 'Share code: {CODE}. Friends can join from their phone.',
  },

  NO_REVIEWS: {
    title: 'No reviews yet',
    description:
      'Write the first review for this item. Help the Flavatix community discover great flavors.',
    icon: '✍️',
    primaryAction: {
      text: 'Write the First Review',
      description: 'Share what you think',
    },
    secondaryAction: {
      text: 'View Item Details',
      description: 'See what others said',
    },
    hint: 'Reviews are anonymous unless you choose to share.',
  },

  NO_TASTING_RESULTS: {
    title: 'No results yet',
    description: "Your tasting hasn't started, or all participants need to finish their responses.",
    icon: '📊',
    primaryAction: {
      text: 'Start Tasting',
      description: 'Begin the first round',
    },
    secondaryAction: {
      text: 'Check Participant Status',
      description: "See who's completed",
    },
    hint: 'Results appear once all participants submit.',
  },

  NO_FAVORITE_CATEGORIES: {
    title: 'Tell us your taste interests',
    description:
      'Select flavor categories you enjoy. This helps us recommend tastings and connect you with like-minded tasters.',
    icon: '❤️',
    primaryAction: {
      text: 'Add Favorite Categories',
      description: 'Coffee, Wine, Tea, Beer, Spirits, Chocolate, Olive Oil',
    },
    hint: 'You can change this anytime in your profile.',
  },

  NO_FOLLOWERS: {
    title: 'Start building your following',
    description:
      'Share your profile with friends and the community. Your reviews and flavor wheel help others discover great flavors.',
    icon: '⭐',
    primaryAction: {
      text: 'Share My Profile',
      description: 'Let others know about your taste',
    },
    secondaryAction: {
      text: 'Make Profile Public',
      description: 'Let others follow you',
    },
    hint: 'More tastings = more followers = more fun!',
  },

  SEARCH_NO_RESULTS: {
    title: 'No tastings match your search',
    description: 'Try different keywords, or browse all public tastings.',
    icon: '🔍',
    primaryAction: {
      text: 'Browse All Tastings',
      description: 'See everything the community is tasting',
    },
    hint: 'Popular searches: "Coffee", "Wine", "Tea", "Blind"',
  },
} as const;

// ============================================================================
// ONBOARDING COPY - Guide new users through features
// ============================================================================

export interface OnboardingStep {
  title: string;
  description: string;
  action: string;
  tips?: readonly string[];
  example?: string;
}

export const ONBOARDING = {
  // New user flow
  NEW_USER: {
    STEP_1_WELCOME: {
      title: 'Welcome to Flavatix',
      description:
        "The world's most comprehensive tasting app. Taste anything, discover your flavor profile, connect with others.",
      action: 'Get Started',
      tips: [
        'Create an account to save your tastings',
        'Join public tastings to earn achievements',
        'Build your unique flavor wheel',
      ],
    },

    STEP_2_CREATE_ACCOUNT: {
      title: 'Create Your Account',
      description: 'Join thousands of tasters exploring flavors.',
      action: 'Create Account',
      tips: [
        'Use your real name so friends recognize you',
        'Your email is private and verified',
        'Password must be 8+ characters',
      ],
      example: 'Your profile will look like: "Sarah M. - Coffee Enthusiast"',
    },

    STEP_3_PICK_INTERESTS: {
      title: 'What do you like to taste?',
      description: 'Select 1-5 flavor categories. You can always change these.',
      action: 'Continue',
      tips: [
        'You can select multiple categories',
        'Each category has its own flavor wheel',
        'New categories added regularly',
      ],
    },

    STEP_4_FIRST_TASTING: {
      title: 'Create Your First Tasting',
      description: 'Try Study Mode - it guides you through a structured tasting.',
      action: 'Create Tasting',
      tips: [
        'Start with 2-3 items for your first tasting',
        'You can taste alone or invite friends',
        'Takes 5-10 minutes depending on how many items',
      ],
      example: 'Taste 3 coffees: Ethiopian, Colombian, Brazilian',
    },

    STEP_5_COMPLETE: {
      title: "You're all set!",
      description:
        "You've completed your first tasting. Share results, follow tasters, or create another tasting.",
      action: 'See Your Results',
      tips: [
        'Your flavor wheel improves after 3 tastings',
        'Share results with friends',
        'Post a review to help the community',
      ],
    },
  },

  // Feature introductions (shown on first use)
  FEATURE_INTRO: {
    BLIND_TASTING: {
      title: 'Blind Tasting',
      description:
        'In blind mode, item names are hidden until results are revealed. This removes bias and makes tasting more objective.',
      action: 'Got It',
      tips: [
        'Great for comparing similar items',
        'Perfect for competitions',
        'Results revealed after voting',
      ],
    },

    STUDY_MODE: {
      title: 'Study Mode',
      description:
        'Structured tasting with custom flavor categories. Each participant fills in a flavor profile for each item.',
      action: 'Learn More',
      tips: [
        'Best for learning about flavors',
        'Includes guided flavor wheel',
        'Good for groups of 2-20 people',
      ],
    },

    COMPETITION_MODE: {
      title: 'Competition Mode',
      description: 'Participants score items (1-10), then results are ranked by total score.',
      action: 'Start Competition',
      tips: [
        'Great for determining group favorites',
        'Results show rankings and scores',
        'Works with any flavor category',
      ],
    },

    FLAVOR_WHEEL: {
      title: 'Your Flavor Wheel',
      description:
        'A personalized visual map of your taste preferences. It shows which flavors you notice and prefer most.',
      action: 'Explore My Wheel',
      tips: [
        'Builds after 3 tastings',
        'Larger segments = flavors you prefer',
        'Unique to you and your palate',
      ],
      example: 'If you often notice "fruity" notes, that segment is bigger',
    },

    SHARING: {
      title: 'Share Your Flavor Wheel',
      description:
        'Compare taste profiles with friends, or post publicly to help others discover what you love.',
      action: 'Share Now',
      tips: [
        'Private = only you see it',
        'Participants = tasting members see it',
        'Public = anyone on Flavatix can see it',
      ],
    },
  },

  // Milestone announcements
  MILESTONE: {
    FIRST_TASTING: {
      title: '🎉 You completed your first tasting!',
      description: "Great work! You're 1 of 3 tastings away from your personalized flavor wheel.",
      action: 'Create Another Tasting',
      hint: 'Invite friends to make tastings more fun!',
    },

    THIRD_TASTING: {
      title: '🌟 Your flavor wheel is ready!',
      description: 'See your unique taste profile emerge. More tastings = more detailed wheel.',
      action: 'View My Wheel',
      hint: 'Share your wheel with friends to compare!',
    },

    FIRST_REVIEW: {
      title: '✍️ Great review!',
      description: 'Your review helps the Flavatix community discover amazing flavors.',
      action: 'Keep Exploring',
      hint: 'Each review makes your profile more valuable.',
    },

    FIRST_SHARE: {
      title: '📤 Share unlocked!',
      description: 'You can now share your results and flavor wheel.',
      action: 'Share Your Profile',
      hint: 'Help others discover your taste interests.',
    },
  },
} as const;

// ============================================================================
// PROGRESSIVE DISCLOSURE TIPS
// ============================================================================

export const PROGRESSIVE_DISCLOSURE = {
  // Context-sensitive help that appears on hover/click
  BLIND_MODE_TOGGLE: {
    title: 'What is Blind Tasting?',
    description: 'Item names are hidden until results are revealed. Great for unbiased tastings.',
    learnMore: '/help/blind-tasting',
  },

  CATEGORY_PICKER: {
    title: 'Flavor Categories',
    description:
      "Choose the type of item you're tasting. Each category has its own flavor descriptors.",
    learnMore: '/help/categories',
  },

  DESCRIPTOR_SELECTION: {
    title: 'Flavor Descriptors',
    description: 'Select the aromas and flavors you notice. You can choose multiple for each item.',
    learnMore: '/help/descriptors',
  },

  TYPICITY_SCALE: {
    title: "What's Typicity?",
    description: '1 = unusual, tastes different. 10 = tastes exactly as expected.',
    learnMore: '/help/typicity',
  },

  REVIEW_VISIBILITY: {
    title: 'Who sees your review?',
    description:
      'Private = only you. Participants = everyone in this tasting. Public = anyone on Flavatix.',
    learnMore: '/help/review-visibility',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format empty state with dynamic data
 * @param template - Empty state template
 * @param data - Dynamic data to inject ({CODE}, {COUNT}, etc.)
 * @returns Formatted empty state
 */
export function formatEmptyState(
  template: EmptyStateTemplate,
  data?: Record<string, string | number>
): EmptyStateTemplate {
  if (!data) {
    return template;
  }

  const format = (text: string | undefined) => {
    if (!text) {
      return undefined;
    }
    return Object.entries(data).reduce(
      (str, [key, value]) => str.replace(`{${key}}`, String(value)),
      text
    );
  };

  return {
    ...template,
    title: format(template.title) || template.title,
    description: format(template.description) || template.description,
    primaryAction: template.primaryAction
      ? {
          text: format(template.primaryAction.text) || template.primaryAction.text,
          description:
            format(template.primaryAction.description) || template.primaryAction.description,
        }
      : undefined,
    hint: format(template.hint) || template.hint,
  };
}

/**
 * Get onboarding step progress text
 * @param current - Current step number
 * @param total - Total steps
 * @returns Progress text (e.g., "Step 2 of 5")
 */
export function getProgressText(current: number, total: number): string {
  return `Step ${current} of ${total}`;
}

/**
 * Get next onboarding step
 * @param currentStep - Current step number
 * @returns Next step or null if complete
 */
export function getNextStep(currentStep: number): OnboardingStep | null {
  const steps = Object.values(ONBOARDING.NEW_USER);
  return steps[currentStep] || null;
}
