import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { 
  ClipboardList, 
  Edit3, 
  Clock, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  X
} from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';

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
  delay = 0
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/60 
                 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out
                 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30
                 active:scale-[0.98] active:shadow-lg
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
                 opacity-100"
    >
      <div className="flex items-start gap-4">
        {/* Icon Badge */}
        <div 
          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full ${iconBgColor} 
                      flex items-center justify-center transition-transform duration-300
                      group-hover:scale-110`}
        >
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 self-center">
          <ChevronRight 
            className="w-5 h-5 text-zinc-400 dark:text-zinc-500 transition-transform duration-300
                       group-hover:translate-x-1 group-hover:text-primary" 
          />
        </div>
      </div>
    </button>
  );
};

// Help modal component
const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          About Reviews
        </h2>

        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Structured Review</p>
              <p>Conduct an in-depth analysis with structured scoring (1-100) across 12 characteristics including aroma, flavor, texture, and more.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Quick Note</p>
              <p>Write a free-form review in your own words. Descriptors from your text will be automatically added to your flavor wheels.</p>
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
      path: '/review/create'
    },
    {
      title: 'Quick Note',
      description: 'Just write how it felt — no sliders.',
      icon: Edit3,
      iconBgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-500',
      path: '/review/prose'
    },
    {
      title: 'Review History',
      description: 'Browse and search all your past notes.',
      icon: Clock,
      iconBgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
      path: '/review/my-reviews'
    },
    {
      title: 'Export & Share',
      description: 'Create PDFs or share tasting links.',
      icon: Share2,
      iconBgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-500',
      path: '/review/my-reviews?action=export'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-safe">
      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          {/* Back button with underline animation */}
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 
                       mb-4 transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-0.5" />
            <span className="relative">
              Back to dashboard
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </span>
          </button>

          {/* Hero header with flavor dots motif */}
          <div className="relative">
            {/* Decorative flavor dots */}
            <div className="absolute -top-2 -left-2 flex gap-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Reviews
                </h1>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
                  Capture what you tasted — structured or freeform.
                </p>
              </div>

              {/* Help button */}
              <button
                onClick={() => setShowHelp(true)}
                className="flex-shrink-0 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 
                           transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Help"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Subtle gradient underline */}
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-amber-500 to-blue-500 opacity-70" />
          </div>
        </div>

        {/* Review Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
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
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-amber-500/5 to-blue-500/5 
                        border border-zinc-200/50 dark:border-zinc-700/50">
          <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
            Turn your tastings into structured reviews, quick impressions, or a personal archive.
          </p>
        </div>
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ReviewPage;


// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
