/**
 * FlavorPill Component
 * 
 * A small pill/chip for displaying flavor descriptors with category-based colors.
 * Used consistently across flavor wheels, tasting notes, and social posts.
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Flavor category colors aligned with design system
const FLAVOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fruity: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  sweet: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  nutty: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  spicy: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  floral: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  earthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  herbal: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  citrus: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  smoky: { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-300' },
  woody: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  malty: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  hoppy: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
  roasted: { bg: 'bg-stone-200', text: 'text-stone-700', border: 'border-stone-300' },
  sour: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  oak: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  // Default fallback
  default: { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' },
};

interface FlavorPillProps {
  /** The flavor name to display */
  flavor: string;
  /** Optional category for color theming (auto-detected from flavor if not provided) */
  category?: string;
  /** Intensity/score value (1-5) - affects opacity/saturation */
  intensity?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the pill is selected/active */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether to show remove button */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Detect flavor category from flavor name
 */
const detectCategory = (flavor: string): string => {
  const flavorLower = flavor.toLowerCase();
  
  // Check for category keywords
  if (/berry|citrus|tropical|apple|cherry|grape|peach|plum|orange|lemon|lime/.test(flavorLower)) return 'fruity';
  if (/chocolate|caramel|honey|vanilla|maple|sugar|molasses/.test(flavorLower)) return 'sweet';
  if (/almond|hazelnut|walnut|peanut|pecan/.test(flavorLower)) return 'nutty';
  if (/pepper|cinnamon|clove|ginger|nutmeg|cardamom/.test(flavorLower)) return 'spicy';
  if (/rose|jasmine|lavender|violet|floral|blossom/.test(flavorLower)) return 'floral';
  if (/earth|soil|mushroom|truffle|mineral|wet stone/.test(flavorLower)) return 'earthy';
  if (/mint|basil|thyme|oregano|sage|eucalyptus|tea/.test(flavorLower)) return 'herbal';
  if (/smoke|charcoal|peat|tobacco|ash/.test(flavorLower)) return 'smoky';
  if (/oak|cedar|pine|wood|toast/.test(flavorLower)) return 'woody';
  if (/malt|bread|biscuit|grain/.test(flavorLower)) return 'malty';
  if (/hop|pine|resin/.test(flavorLower)) return 'hoppy';
  if (/coffee|roast|burnt|char/.test(flavorLower)) return 'roasted';
  if (/sour|tart|acidic|vinegar/.test(flavorLower)) return 'sour';
  
  return 'default';
};

export const FlavorPill: React.FC<FlavorPillProps> = ({
  flavor,
  category,
  intensity,
  size = 'md',
  selected = false,
  onClick,
  removable = false,
  onRemove,
  className,
}) => {
  const detectedCategory = category || detectCategory(flavor);
  const colors = FLAVOR_COLORS[detectedCategory] || FLAVOR_COLORS.default;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const intensityOpacity = intensity 
    ? `opacity-${Math.min(100, 60 + intensity * 10)}` 
    : '';
  
  const isInteractive = !!onClick;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-200',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        intensityOpacity,
        selected && 'ring-2 ring-primary ring-offset-1',
        isInteractive && 'cursor-pointer hover:shadow-sm active:scale-95',
        className
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {flavor}
      {intensity && (
        <span className="opacity-60 text-xs font-normal">
          ({intensity})
        </span>
      )}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 h-4 w-4 rounded-full hover:bg-black/10 flex items-center justify-center"
          aria-label={`Remove ${flavor}`}
        >
          <span className="text-xs">×</span>
        </button>
      )}
    </span>
  );
};

export default FlavorPill;

/**
 * Export colors for use in other components
 */
export { FLAVOR_COLORS, detectCategory };
