import React from 'react';
import { useRouter } from 'next/router';
import { LucideIcon } from 'lucide-react';

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
  title,
  description,
  href,
  badge,
}) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full text-left p-4 rounded-soft bg-bg-surface hover:bg-bg-hover transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-fg-muted flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-body-sm font-medium text-fg">
              {title}
            </h3>
            {badge && (
              <span className="text-caption text-fg-muted">
                {badge}
              </span>
            )}
          </div>
          <p className="text-caption text-fg-subtle line-clamp-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ModeCard;
