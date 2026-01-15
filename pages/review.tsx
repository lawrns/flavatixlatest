import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ClipboardList, Edit3, Clock, Share2, ChevronRight, HelpCircle, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Review mode card component with motion
interface ReviewModeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  onClick: () => void;
  delay?: number;
}

const ReviewModeCard: React.FC<ReviewModeCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-gemini-card dark:bg-zinc-800/90
                 rounded-[22px] p-5 transition-all duration-200 ease-out
                 shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                 hover:shadow-md active:scale-[0.98]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        {/* Icon Badge */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgColor} 
                      flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gemini-text-dark dark:text-zinc-50">
            {title}
          </h3>
          <p className="text-sm text-gemini-text-gray dark:text-zinc-400 line-clamp-1">
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

// Help modal component
const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">About Reviews</h2>

        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Structured Review
              </p>
              <p>
                Conduct an in-depth analysis with structured scoring (1-100) across 12
                characteristics including aroma, flavor, texture, and more.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Quick Note</p>
              <p>
                Write a free-form review in your own words. Descriptors from your text will be
                automatically added to your flavor wheels.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Review History</p>
              <p>Access all your completed reviews, prose reviews, and reviews in progress.</p>
            </div>
          </div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-zinc-600 dark:text-zinc-400 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const reviewOptions = [
    {
      title: 'Structured Review',
      description: 'Score aroma, flavor, mouthfeel and more.',
      icon: ClipboardList,
      iconBgColor: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary',
      path: '/review/create',
    },
    {
      title: 'Quick Note',
      description: 'Just write how it felt — no sliders.',
      icon: Edit3,
      iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-500',
      path: '/review/prose',
    },
    {
      title: 'Review History',
      description: 'Browse and search all your past notes.',
      icon: Clock,
      iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
      path: '/review/my-reviews',
    },
    {
      title: 'Export & Share',
      description: 'Create PDFs or share tasting links.',
      icon: Share2,
      iconBgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-500',
      path: '/review/my-reviews?action=export',
    },
  ];

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
      {/* Review Options */}
      <div className="flex flex-col gap-3 mt-2">
        {reviewOptions.map((option, index) => (
          <ReviewModeCard
            key={option.path}
            title={option.title}
            description={option.description}
            icon={option.icon}
            iconBgColor={option.iconBgColor}
            iconColor={option.iconColor}
            onClick={() => router.push(option.path)}
            delay={index * 50}
          />
        ))}
      </div>

      {/* Value proposition */}
      <div className="mt-8 p-4 rounded-[22px] bg-gemini-card dark:bg-zinc-800">
        <p className="text-sm text-center text-gemini-text-gray dark:text-zinc-400">
          Turn your tastings into structured reviews, quick impressions, or a personal archive.
        </p>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </PageLayout>
  );
};

export default ReviewPage;

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
