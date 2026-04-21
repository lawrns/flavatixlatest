import React from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ModeCardProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  delay?: number;
}

const ModeCard: React.FC<ModeCardProps> = ({
  icon: Icon,
  iconBgColor = 'bg-bg-inset',
  iconColor = 'text-fg-muted',
  title,
  description,
  href,
  badge,
  delay = 0,
}) => {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push(href)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group w-full text-left rounded-[1.5rem] border border-line/80 bg-white/90 p-5',
        'shadow-[0_12px_30px_-18px_rgba(0,0,0,0.18)] backdrop-blur-sm',
        'transition-colors hover:border-fg-muted/30 hover:bg-white'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
            iconBgColor
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-body font-semibold text-fg tracking-tight">
                {title}
              </h3>
              <p className="mt-1 text-body-sm text-fg-muted leading-relaxed">
                {description}
              </p>
            </div>
            {badge && (
              <span className="shrink-0 rounded-full border border-line bg-bg-inset px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">
                {badge}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-fg-muted transition-colors group-hover:text-fg">
            <span>Open</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default ModeCard;
