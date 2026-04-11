import React from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, LucideIcon } from 'lucide-react';

export interface ModeCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  delay?: number;
}

const ModeCard: React.FC<ModeCardProps> = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  description,
  href,
  badge,
}) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="surface-action-card group w-full text-left p-5"
    >
      <div className="flex items-center gap-4">
        {/* Icon badge */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgColor}
                      flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gemini-text-dark dark:text-zinc-50">
              {title}
            </h3>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gemini-text-gray dark:text-zinc-400 line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gemini-text-muted dark:text-zinc-500" />
        </div>
      </div>
    </button>
  );
};

export default ModeCard;
