/**
 * ScoreRing Component
 *
 * Circular progress indicator for displaying scores with color gradients.
 * Features smooth animations and responsive sizing.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { getScoreHex } from '@/lib/colors';

interface ScoreRingProps {
  /** Score value (0-100) */
  score: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show score number in center */
  showValue?: boolean;
  /** Show label below score */
  label?: string;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Additional className */
  className?: string;
}

const sizeConfig = {
  sm: { size: 48, stroke: 4, fontSize: 'text-sm', labelSize: 'text-xs' },
  md: { size: 64, stroke: 5, fontSize: 'text-lg', labelSize: 'text-xs' },
  lg: { size: 80, stroke: 6, fontSize: 'text-xl', labelSize: 'text-sm' },
  xl: { size: 120, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-sm' },
};

/**
 * Get color based on score value (0-100 scale)
 * Uses centralized color system from lib/colors.ts
 */
const getScoreColor = (score: number): string => {
  // Convert 0-100 scale to 0-10 scale for the centralized function
  return getScoreHex(score / 10);
};

/**
 * Get score label
 */
const getScoreLabel = (score: number): string => {
  if (score >= 90) {
    return 'Exceptional';
  }
  if (score >= 80) {
    return 'Excellent';
  }
  if (score >= 70) {
    return 'Very Good';
  }
  if (score >= 60) {
    return 'Good';
  }
  if (score >= 50) {
    return 'Average';
  }
  if (score >= 40) {
    return 'Below Avg';
  }
  return 'Poor';
};

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  showValue = true,
  label,
  animationDuration = 1000,
  className,
}) => {
  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (normalizedScore / 100) * circumference;
  const color = getScoreColor(normalizedScore);

  const [animatedOffset, setAnimatedOffset] = React.useState(circumference);

  React.useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => {
      setAnimatedOffset(offset);
    }, 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={config.size} height={config.size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-zinc-200 dark:text-zinc-700"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={`url(#scoreGradient-${score})`}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />

        {/* Glow effect */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            opacity: 0.2,
            filter: 'blur(4px)',
          }}
        />
      </svg>

      {/* Center content */}
      {showValue && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(0deg)' }}
        >
          <span className={cn('font-bold tabular-nums', config.fontSize)} style={{ color }}>
            {Math.round(normalizedScore)}
          </span>
          {size !== 'sm' && (
            <span className={cn('text-zinc-500 dark:text-zinc-400 -mt-1', config.labelSize)}>
              / 100
            </span>
          )}
        </div>
      )}

      {/* Label */}
      {label && (
        <span className={cn('mt-2 text-zinc-600 dark:text-zinc-400 font-medium', config.labelSize)}>
          {label}
        </span>
      )}
    </div>
  );
};

/**
 * Compact inline score badge
 */
export const ScoreBadge: React.FC<{
  score: number;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ score, size = 'md', className }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span className="font-bold tabular-nums">{Math.round(score)}</span>
      <span className="font-medium opacity-80">{label}</span>
    </div>
  );
};

export default ScoreRing;
