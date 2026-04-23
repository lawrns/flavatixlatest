import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './Button';

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const HeroPanel: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: Action[];
  media?: React.ReactNode;
  className?: string;
}> = ({ eyebrow, title, description, children, actions, media, className }) => (
  <section
    className={cn(
      'overflow-hidden rounded-soft border border-line bg-bg-surface shadow-sm',
      'relative isolate',
      className
    )}
  >
    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.08fr_0.92fr] lg:p-6">
      <div className="min-w-0 space-y-4">
        {eyebrow && (
          <p className="text-caption font-semibold uppercase tracking-[0.24em] text-fg-subtle">
            {eyebrow}
          </p>
        )}
        <div className="space-y-3">
          <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-normal text-fg sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-2xl text-body-sm leading-relaxed text-fg-muted">{description}</p>
          )}
        </div>
        {children}
        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                size="sm"
                className="w-full sm:w-auto"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {media && <div className="min-w-0">{media}</div>}
    </div>
  </section>
);

export const ContextHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ eyebrow, title, subtitle, meta, actions, className }) => (
  <div
    className={cn(
      'flex flex-col gap-4 border-b border-line bg-bg-surface/95 py-5',
      'lg:flex-row lg:items-end lg:justify-between',
      className
    )}
  >
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.24em] text-fg-subtle">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold leading-tight tracking-normal text-fg sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-fg-muted">{subtitle}</p>
      )}
      {meta && <div className="mt-4 flex flex-wrap gap-2">{meta}</div>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const AnalyticsStrip: React.FC<{
  items: Array<{ label: string; value: React.ReactNode; hint?: string }>;
  className?: string;
}> = ({ items, className }) => (
  <div className={cn('grid gap-2 sm:grid-cols-2 lg:grid-cols-4', className)}>
    {items.map((item) => (
      <div key={item.label} className="rounded-soft border border-line bg-bg-surface px-3 py-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
          {item.label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold leading-none tracking-normal text-fg">
          {item.value}
        </p>
        {item.hint && <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{item.hint}</p>}
      </div>
    ))}
  </div>
);

export const ArchiveToolbar: React.FC<{
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ search, onSearchChange, searchPlaceholder = 'Search', children, actions, className }) => (
  <div
    className={cn('rounded-pane border border-line bg-bg-surface p-3 shadow-sm sm:p-4', className)}
  >
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {onSearchChange && (
        <label className="min-w-0 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            value={search || ''}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-soft border border-line bg-bg px-4 py-3 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </label>
      )}
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  </div>
);

export const FilterBar: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-2 rounded-pane border border-line bg-bg-surface p-3 shadow-sm',
      className
    )}
  >
    {children}
  </div>
);

export const ResumeWorkCard: React.FC<{
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, meta, action, className }) => (
  <article className={cn('rounded-soft border border-line bg-bg-surface p-4 shadow-sm', className)}>
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
      Resume
    </p>
    <h3 className="mt-2 text-lg font-semibold tracking-normal text-fg">{title}</h3>
    {description && <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>}
    {meta && <div className="mt-4">{meta}</div>}
    {action && <div className="mt-5">{action}</div>}
  </article>
);

export const ComparisonCard: React.FC<{
  title: string;
  leftLabel: string;
  rightLabel: string;
  children?: React.ReactNode;
}> = ({ title, leftLabel, rightLabel, children }) => (
  <article className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm">
    <h3 className="text-lg font-semibold tracking-normal text-fg">{title}</h3>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {[leftLabel, rightLabel].map((label) => (
        <div key={label} className="rounded-soft border border-line bg-bg p-4">
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            {label}
          </p>
        </div>
      ))}
    </div>
    {children && <div className="mt-4">{children}</div>}
  </article>
);

export const SocialComposerCard: React.FC<{
  title?: string;
  description?: string;
  action?: React.ReactNode;
}> = ({
  title = 'Share a tasting',
  description = 'Completed tasting records make the strongest posts.',
  action,
}) => (
  <section className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm">
    <h3 className="text-lg font-semibold tracking-normal text-fg">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </section>
);

export const FilterRail: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <aside
    className={cn(
      'rounded-soft border border-line bg-bg-surface p-4 shadow-sm lg:sticky lg:top-24',
      className
    )}
  >
    {title && (
      <h2 className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
        {title}
      </h2>
    )}
    <div className="space-y-4">{children}</div>
  </aside>
);

export const DescriptorChipSet: React.FC<{
  items: Array<string | { label: string; value?: React.ReactNode; tone?: string }>;
  className?: string;
}> = ({ items, className }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {items.map((item) => {
      const label = typeof item === 'string' ? item : item.label;
      const value = typeof item === 'string' ? null : item.value;
      return (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-medium text-fg-muted"
        >
          <span>{label}</span>
          {value && <span className="text-fg-subtle">{value}</span>}
        </span>
      );
    })}
  </div>
);

export const StickyActionBar: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      'sticky bottom-20 z-30 rounded-pane border border-line bg-bg-surface/95 p-3 shadow-md backdrop-blur',
      'sm:bottom-4',
      className
    )}
  >
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  </div>
);

export const InsightRail: React.FC<{
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, eyebrow, children, className }) => (
  <aside className={cn('rounded-soft border border-line bg-bg-surface p-4 shadow-sm', className)}>
    {eyebrow && (
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
        {eyebrow}
      </p>
    )}
    <h2 className="mt-1 text-lg font-semibold tracking-normal text-fg">{title}</h2>
    <div className="mt-4 space-y-3">{children}</div>
  </aside>
);

export const SessionPreviewCard: React.FC<{
  title: string;
  subtitle?: string;
  image?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, image, meta, action, className }) => (
  <article
    className={cn(
      'overflow-hidden rounded-pane border border-line bg-bg-surface shadow-sm',
      className
    )}
  >
    {image && (
      <div className="relative aspect-[16/9] bg-bg-inset">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 420px, 100vw"
        />
      </div>
    )}
    <div className="p-4">
      <h3 className="text-lg font-semibold tracking-normal text-fg">{title}</h3>
      {subtitle && <p className="mt-1 text-sm leading-relaxed text-fg-muted">{subtitle}</p>}
      {meta && <div className="mt-4">{meta}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  </article>
);

export const PublicProfileHero: React.FC<{
  avatar?: React.ReactNode;
  name: string;
  handle?: string;
  bio?: string;
  stats?: Array<{ label: string; value: React.ReactNode }>;
  actions?: React.ReactNode;
}> = ({ avatar, name, handle, bio, stats, actions }) => (
  <section className="rounded-pane border border-line bg-bg-surface p-6 shadow-sm sm:p-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {avatar}
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-semibold tracking-normal text-fg">{name}</h1>
          {handle && <p className="mt-1 text-sm text-fg-muted">{handle}</p>}
          {bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{bio}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
    {stats && stats.length > 0 && (
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-soft border border-line bg-bg p-4">
            <p className="text-2xl font-semibold text-fg">{stat.value}</p>
            <p className="mt-1 text-caption uppercase tracking-[0.18em] text-fg-subtle">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
);

export const SettingsSectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ title, description, children, danger }) => (
  <section
    className={cn(
      'rounded-pane border bg-bg-surface p-5 shadow-sm',
      danger ? 'border-signal-danger/30' : 'border-line'
    )}
  >
    <div className="mb-5">
      <h2
        className={cn(
          'text-h3 font-semibold tracking-normal',
          danger ? 'text-signal-danger' : 'text-fg'
        )}
      >
        {title}
      </h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>}
    </div>
    {children}
  </section>
);
