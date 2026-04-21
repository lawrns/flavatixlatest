import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'completed' | 'inProgress' | 'draft';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  completed: cn(
    'bg-signal-good/10 text-signal-good',
    'dark:bg-signal-good/20 dark:text-signal-good'
  ),
  inProgress: cn(
    'bg-signal-warn/10 text-signal-warn',
    'dark:bg-signal-warn/20 dark:text-signal-warn'
  ),
  draft: cn(
    'bg-fg-subtle/10 text-fg-subtle',
    'dark:bg-fg-subtle/20 dark:text-fg-subtle'
  ),
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-sharp',
        'text-caption font-medium uppercase tracking-wider',
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
