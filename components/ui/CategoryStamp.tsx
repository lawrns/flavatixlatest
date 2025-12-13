import React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_PACKS, normalizeCategoryId } from '@/lib/categoryPacks';

export interface CategoryStampProps {
  category: string;
  size?: 'sm' | 'md';
  className?: string;
  labelOverride?: string;
}

const CategoryStamp: React.FC<CategoryStampProps> = ({
  category,
  size = 'md',
  className,
  labelOverride,
}) => {
  const normalized = normalizeCategoryId(category);
  const pack = normalized ? CATEGORY_PACKS[normalized] : null;

  const sizeClasses = {
    sm: {
      wrap: 'px-2 py-1 text-xs gap-1.5',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      wrap: 'px-3 py-1.5 text-sm gap-2',
      icon: 'h-4 w-4',
    },
  } as const;

  const label = labelOverride || pack?.shortLabel || category;
  const Icon = pack?.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeClasses[size].wrap,
        pack?.tint.bg || 'bg-zinc-100',
        pack?.tint.text || 'text-zinc-700',
        pack?.tint.border || 'border-zinc-200',
        className
      )}
    >
      {Icon ? <Icon className={cn(sizeClasses[size].icon)} aria-hidden="true" /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
};

export default CategoryStamp;
