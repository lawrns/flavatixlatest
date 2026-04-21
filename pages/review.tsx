import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ClipboardList, Edit3, Clock, Share2, HelpCircle, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ModeCard from '@/components/ui/ModeCard';

const primaryOptions = [
  {
    title: 'Structured Review',
    description: 'Score aroma, flavor, mouthfeel and more.',
    icon: ClipboardList,
    iconBgColor: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    href: '/review/create',
  },
  {
    title: 'Quick Note',
    description: 'Just write how it felt — no sliders.',
    icon: Edit3,
    iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-500',
    href: '/review/prose',
  },
];

const secondaryOptions = [
  {
    title: 'Review History',
    description: 'Browse and search all your past notes.',
    icon: Clock,
    iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-500',
    href: '/review/my-reviews',
  },
  {
    title: 'Export & Share',
    description: 'Create PDFs or share tasting links.',
    icon: Share2,
    iconBgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-500',
    href: '/review/my-reviews?action=export',
  },
];

const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 " onClick={onClose} />
      <div className="relative bg-bg-surface dark:bg-zinc-800 rounded-pane shadow-lg max-w-md w-full p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-inset dark:hover:bg-zinc-700 transition-colors"
          aria-label="Close help"
        >
          <X className="w-5 h-5 text-fg-subtle" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">About Reviews</h2>

        <div className="space-y-4 text-sm text-fg-muted dark:text-fg-subtle">
          {[
            {
              icon: ClipboardList,
              bg: 'bg-primary/10',
              fg: 'text-primary',
              title: 'Structured Review',
              body: 'Conduct an in-depth analysis with structured scoring (1-100) across 12 characteristics including aroma, flavor, texture, and more.',
            },
            {
              icon: Edit3,
              bg: 'bg-amber-500/10',
              fg: 'text-amber-600',
              title: 'Quick Note',
              body: 'Write a free-form review in your own words. Descriptors from your text will be automatically added to your flavor wheels.',
            },
            {
              icon: Clock,
              bg: 'bg-blue-500/10',
              fg: 'text-blue-600',
              title: 'Review History',
              body: 'Access all your completed reviews, prose reviews, and reviews in progress.',
            },
          ].map(({ icon: Icon, bg, fg, title, body }) => (
            <div key={title} className="flex gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${fg}`} />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  const helpButton = (
    <button
      onClick={() => setShowHelp(true)}
      className="flex-shrink-0 p-2 rounded-full hover:bg-gemini-card dark:hover:bg-zinc-800
                 transition-colors text-gemini-text-muted hover:text-gemini-text-gray"
      aria-label="Help"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );

  return (
    <PageLayout
      title="Reviews"
      subtitle="Capture what you tasted — structured or freeform."
      showBack
      backUrl="/dashboard"
      headerRight={helpButton}
    >
      {/* Primary actions */}
      <div className="flex flex-col gap-3 mt-2">
        {primaryOptions.map((opt) => (
          <ModeCard key={opt.href} {...opt} />
        ))}
      </div>

      {/* Secondary actions */}
      <div className="mt-4">
        <p className="text-xs font-medium text-gemini-text-gray dark:text-fg-subtle mb-2 px-1">
          More options
        </p>
        <div className="flex flex-col gap-3">
          {secondaryOptions.map((opt) => (
            <ModeCard key={opt.href} {...opt} />
          ))}
        </div>
      </div>

      {/* Value proposition */}
      <div className="mt-8 p-4 surface-inset">
        <p className="text-sm text-center text-gemini-text-gray dark:text-fg-subtle">
          Turn your tastings into structured reviews, quick impressions, or a personal archive.
        </p>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </PageLayout>
  );
};

export default ReviewPage;

export async function getServerSideProps() {
  return { props: {} };
}
