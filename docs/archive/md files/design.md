{
  "designSystem": {
    "colors": {
      "primary": {
        "50": "#fef7ee",
        "100": "#fdedd3",
        "200": "#fbd7a5",
        "300": "#f8bc6d",
        "400": "#f59e0b",
        "500": "#d97706",
        "600": "#b45309",
        "700": "#92400e",
        "800": "#78350f",
        "900": "#451a03"
      },
      "secondary": {
        "50": "#ecfdf5",
        "100": "#d1fae5",
        "200": "#a7f3d0",
        "300": "#6ee7b7",
        "400": "#34d399",
        "500": "#10b981",
        "600": "#059669",
        "700": "#047857",
        "800": "#065f46",
        "900": "#064e3b"
      },
      "accent": {
        "50": "#fef2f2",
        "100": "#fee2e2",
        "200": "#fecaca",
        "300": "#fca5a5",
        "400": "#f87171",
        "500": "#ef4444",
        "600": "#dc2626",
        "700": "#b91c1c",
        "800": "#991b1b",
        "900": "#7f1d1d"
      },
      "neutral": {
        "50": "#fafafa",
        "100": "#f5f5f5",
        "200": "#e5e5e5",
        "300": "#d4d4d4",
        "400": "#a3a3a3",
        "500": "#737373",
        "600": "#525252",
        "700": "#404040",
        "800": "#262626",
        "900": "#171717"
      },
      "semantic": {
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6"
      }
    },
    "typography": {
      "headings": {
        "fontFamily": "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "fontWeight": "700",
        "lineHeight": "1.2",
        "sizes": {
          "h1": "2.25rem",
          "h2": "1.875rem",
          "h3": "1.5rem",
          "h4": "1.25rem",
          "h5": "1.125rem",
          "h6": "1rem"
        }
      },
      "body": {
        "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "fontWeight": "400",
        "lineHeight": "1.5",
        "sizes": {
          "large": "1.125rem",
          "base": "1rem",
          "small": "0.875rem",
          "xs": "0.75rem"
        }
      },
      "button": {
        "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "fontWeight": "600",
        "fontSize": "1rem",
        "lineHeight": "1.25"
      }
    },
    "spacing": {
      "0": "0px",
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "20px",
      "6": "24px",
      "8": "32px",
      "10": "40px",
      "12": "48px",
      "16": "64px",
      "20": "80px",
      "24": "96px",
      "32": "128px"
    },
    "borderRadius": {
      "none": "0px",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "2xl": "24px",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  },
  "components": {
    "button": {
      "primary": {
        "backgroundColor": "var(--color-primary-600)",
        "color": "white",
        "padding": "12px 24px",
        "borderRadius": "var(--border-radius-lg)",
        "fontWeight": "600",
        "minHeight": "44px",
        "border": "none",
        "cursor": "pointer",
        "transition": "all 0.2s ease",
        "hover": {
          "backgroundColor": "var(--color-primary-700)",
          "transform": "translateY(-1px)",
          "boxShadow": "var(--shadow-md)"
        },
        "active": {
          "transform": "translateY(0)",
          "boxShadow": "var(--shadow-sm)"
        },
        "disabled": {
          "backgroundColor": "var(--color-neutral-300)",
          "cursor": "not-allowed",
          "transform": "none"
        }
      },
      "secondary": {
        "backgroundColor": "transparent",
        "color": "var(--color-primary-600)",
        "border": "2px solid var(--color-primary-600)",
        "padding": "10px 22px",
        "borderRadius": "var(--border-radius-lg)",
        "fontWeight": "600",
        "minHeight": "44px",
        "cursor": "pointer",
        "transition": "all 0.2s ease",
        "hover": {
          "backgroundColor": "var(--color-primary-50)",
          "transform": "translateY(-1px)"
        }
      }
    },
    "card": {
      "backgroundColor": "white",
      "borderRadius": "var(--border-radius-xl)",
      "boxShadow": "var(--shadow-md)",
      "padding": "var(--spacing-6)",
      "border": "1px solid var(--color-neutral-200)",
      "transition": "all 0.2s ease",
      "hover": {
        "boxShadow": "var(--shadow-lg)",
        "transform": "translateY(-2px)"
      }
    },
    "input": {
      "backgroundColor": "var(--color-neutral-50)",
      "border": "2px solid var(--color-neutral-300)",
      "borderRadius": "var(--border-radius-lg)",
      "padding": "12px 16px",
      "fontSize": "16px",
      "minHeight": "44px",
      "transition": "all 0.2s ease",
      "focus": {
        "borderColor": "var(--color-primary-500)",
        "boxShadow": "0 0 0 3px rgba(217, 119, 6, 0.1)",
        "outline": "none"
      },
      "error": {
        "borderColor": "var(--color-error)",
        "boxShadow": "0 0 0 3px rgba(239, 68, 68, 0.1)"
      }
    }
  },
  "implementation": {
    "cssVariables": {
      "--color-primary-50": "#fef7ee",
      "--color-primary-100": "#fdedd3",
      "--color-primary-200": "#fbd7a5",
      "--color-primary-300": "#f8bc6d",
      "--color-primary-400": "#f59e0b",
      "--color-primary-500": "#d97706",
      "--color-primary-600": "#b45309",
      "--color-primary-700": "#92400e",
      "--color-primary-800": "#78350f",
      "--color-primary-900": "#451a03",
      "--color-secondary-50": "#ecfdf5",
      "--color-secondary-100": "#d1fae5",
      "--color-secondary-200": "#a7f3d0",
      "--color-secondary-300": "#6ee7b7",
      "--color-secondary-400": "#34d399",
      "--color-secondary-500": "#10b981",
      "--color-secondary-600": "#059669",
      "--color-secondary-700": "#047857",
      "--color-secondary-800": "#065f46",
      "--color-secondary-900": "#064e3b",
      "--color-neutral-50": "#fafafa",
      "--color-neutral-100": "#f5f5f5",
      "--color-neutral-200": "#e5e5e5",
      "--color-neutral-300": "#d4d4d4",
      "--color-neutral-400": "#a3a3a3",
      "--color-neutral-500": "#737373",
      "--color-neutral-600": "#525252",
      "--color-neutral-700": "#404040",
      "--color-neutral-800": "#262626",
      "--color-neutral-900": "#171717",
      "--color-success": "#10b981",
      "--color-warning": "#f59e0b",
      "--color-error": "#ef4444",
      "--color-info": "#3b82f6",
      "--font-family-primary": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-heading": "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--spacing-1": "4px",
      "--spacing-2": "8px",
      "--spacing-3": "12px",
      "--spacing-4": "16px",
      "--spacing-5": "20px",
      "--spacing-6": "24px",
      "--spacing-8": "32px",
      "--spacing-10": "40px",
      "--spacing-12": "48px",
      "--spacing-16": "64px",
      "--spacing-20": "80px",
      "--border-radius-sm": "4px",
      "--border-radius-md": "8px",
      "--border-radius-lg": "12px",
      "--border-radius-xl": "16px",
      "--border-radius-2xl": "24px",
      "--border-radius-full": "9999px",
      "--shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      "--shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    "migrationSteps": [
      "1. Update styles/design-tokens.css with new CSS custom properties",
      "2. Replace all hardcoded color values with CSS variables",
      "3. Update typography classes to use new font families and weights",
      "4. Implement new button component styles with hover and focus states",
      "5. Update card components with new border radius and shadow values",
      "6. Ensure all form inputs use new styling with proper focus states",
      "7. Replace all emoji usage with Lucide React icons",
      "8. Update spacing throughout the application using new spacing scale",
      "9. Implement mobile-first responsive design with touch-friendly targets (44px minimum)",
      "10. Add proper hover and focus states for better accessibility",
      "11. Test color contrast ratios to ensure WCAG compliance",
      "12. Update Tailwind config to include new design tokens"
    ],
    "iconMigration": {
      "library": "lucide-react",
      "installation": "npm install lucide-react",
      "usage": "import { IconName } from 'lucide-react'",
      "commonReplacements": {
        "🏠": "Home",
        "👤": "User",
        "⚙️": "Settings",
        "📷": "Camera",
        "❤️": "Heart",
        "⭐": "Star",
        "📊": "BarChart3",
        "🔍": "Search",
        "➕": "Plus",
        "✏️": "Edit",
        "🗑️": "Trash2",
        "💾": "Save",
        "📤": "Upload",
        "📥": "Download",
        "✅": "Check",
        "❌": "X",
        "⚠️": "AlertTriangle",
        "ℹ️": "Info",
        "🔙": "ArrowLeft",
        "🔜": "ArrowRight",
        "🔝": "ArrowUp",
        "🔽": "ArrowDown"
      }
    },
    "uxImprovements": {
      "mobileOptimization": {
        "touchTargets": "Minimum 44px height and width for all interactive elements",
        "spacing": "Increased padding and margins for better thumb navigation",
        "typography": "Larger font sizes for better readability on mobile devices",
        "navigation": "Bottom navigation bar for easy thumb access"
      },
      "accessibility": {
        "colorContrast": "Ensure minimum 4.5:1 contrast ratio for all text",
        "focusStates": "Clear focus indicators for keyboard navigation",
        "ariaLabels": "Proper ARIA labels for screen readers",
        "semanticHTML": "Use semantic HTML elements for better structure"
      },
      "interactionDesign": {
        "hoverStates": "Subtle hover effects with transform and shadow changes",
        "loadingStates": "Clear loading indicators for async operations",
        "errorStates": "Helpful error messages with recovery suggestions",
        "successFeedback": "Clear success indicators for completed actions"
      },
      "visualHierarchy": {
        "typography": "Clear heading hierarchy with consistent sizing",
        "spacing": "Consistent spacing scale for visual rhythm",
        "colorUsage": "Strategic use of color to guide user attention",
        "whitespace": "Generous whitespace for better content breathing room"
      }
    },
    "performanceOptimizations": {
      "cssOptimization": "Use CSS custom properties for better performance and maintainability",
      "iconOptimization": "Tree-shake Lucide icons to include only used icons",
      "responsiveImages": "Implement responsive image loading with proper sizing",
      "animationPerformance": "Use transform and opacity for smooth animations"
    }
  }
}