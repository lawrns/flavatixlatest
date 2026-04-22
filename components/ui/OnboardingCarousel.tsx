import React, { useState } from 'react';

interface OnboardingCard {
  id: number;
  image: string;
  headline: string;
  description: string;
  cta?: string;
  ctaVariant?: 'primary' | 'split';
}

interface OnboardingCarouselProps {
  cards: OnboardingCard[];
  onCardChange?: (cardIndex: number) => void;
  onComplete?: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  cards,
  onCardChange,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const card = cards[currentIndex];

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    onCardChange?.(index);
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg relative overflow-hidden">
      {/* Header: Progress & Skip Button */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-0 mx-auto w-full max-w-md">
        {/* Progress Indicator */}
        <span className="text-xs sm:text-sm font-medium text-fg-muted">
          {currentIndex + 1} of {cards.length}
        </span>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="text-xs sm:text-sm font-medium text-fg-muted hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-line dark:bg-zinc-700 mt-4">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Carousel Container */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-6 py-8 sm:py-12 mx-auto w-full max-w-md">
        {/* Card Content */}
        <div className="w-full">
          <div className="flex flex-col items-center max-w-lg mx-auto">
            {/* Image placeholder */}
            <div className="w-full max-w-xs aspect-[4/5] rounded-pane bg-bg-inset dark:bg-zinc-800 flex items-center justify-center mb-8 sm:mb-10">
              <span className="material-symbols-outlined text-6xl text-fg-subtle">
                {card.id === 1 ? 'explore' : card.id === 2 ? 'local_dining' : card.id === 3 ? 'group' : 'play_circle'}
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-fg text-center mb-4">
              {card.headline}
            </h2>

            {/* Body Text */}
            <p className="text-base sm:text-lg text-fg-muted text-center leading-relaxed mb-8 sm:mb-12 max-w-md">
              {card.description}
            </p>

            {/* CTA Buttons */}
            {card.ctaVariant === 'split' ? (
              <div className="w-full space-y-3">
                <button
                  onClick={onComplete}
                  className="w-full h-12 bg-primary text-white rounded-soft font-semibold hover:opacity-90"
                >
                  Sign Up
                </button>
                <button
                  onClick={onComplete}
                  className="w-full h-12 bg-bg-surface text-primary border-2 border-primary dark:text-fg rounded-soft font-semibold hover:bg-bg-hover"
                >
                  Log In
                </button>
              </div>
            ) : card.cta ? (
              <p className="text-xs sm:text-sm text-fg-muted">
                {card.cta}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dot Navigation with 44px minimum touch targets (WCAG 2.5.5 Level AAA) */}
      <nav
        role="tablist"
        aria-label="Onboarding slides"
        className="flex items-center justify-center gap-0 pb-6 px-4 sm:px-6 mx-auto w-full max-w-md"
      >
        {cards.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to slide ${index + 1} of ${cards.length}`}
            onClick={() => goToCard(index)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            {/* Visual dot indicator */}
            <span
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary w-8 h-2'
                  : 'bg-zinc-300 dark:bg-zinc-600 w-2 h-2 hover:bg-zinc-400 dark:hover:bg-bg-inset'
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OnboardingCarousel;
