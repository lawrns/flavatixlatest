import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Trigger entrance animation on card change
  useEffect(() => {
    if (prefersReducedMotion) return;
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex, prefersReducedMotion]);

  const card = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const progress = ((currentIndex + 1) / cards.length) * 100;

  // Handle swipe start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  // Handle swipe move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      return;
    }
    setTranslateX(e.clientX - startX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) {
      return;
    }
    setTranslateX(e.touches[0].clientX - startX);
  };

  // Handle swipe end
  const handleMouseUp = () => {
    handleSwipeEnd();
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  const handleSwipeEnd = () => {
    setIsDragging(false);

    // If swiped more than 50px, go to next card
    if (translateX < -50) {
      goToNext();
    }
    // If swiped more than 50px back, go to previous card
    else if (translateX > 50) {
      goToPrevious();
    }

    setTranslateX(0);
  };

  const goToNext = () => {
    if (isLastCard) {
      onComplete?.();
    } else {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onCardChange?.(newIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onCardChange?.(newIndex);
    }
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    onCardChange?.(index);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 relative overflow-hidden">
      {/* Header: Progress & Skip Button */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-0 mx-auto w-full max-w-md">
        {/* Progress Indicator */}
        <span className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {currentIndex + 1} of {cards.length}
        </span>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-500 hover:text-primary dark:hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 mt-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-500 transition-[width] duration-300 ease-spring"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-6 py-8 sm:py-12 mx-auto w-full max-w-md"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card Content */}
        <div
          className="transition-transform duration-300 ease-spring select-none w-full"
          style={{
            transform: isDragging ? `translateX(${translateX}px)` : 'translateX(0)',
          }}
        >
          <div className="flex flex-col items-center max-w-lg mx-auto">
            {/* Image: 4:5 aspect ratio, responsive sizing with entrance animation */}
            {/* Light/dark mode compatible with subtle background and shadow adjustments */}
            <div
              className={`w-full max-w-xs aspect-[4/5] rounded-2xl overflow-hidden shadow-xl mb-8 sm:mb-10 transition-all duration-500 ease-out bg-zinc-100 dark:bg-zinc-800 ring-1 ring-black/5 dark:ring-white/10 ${
                isAnimating && !prefersReducedMotion
                  ? 'opacity-0 translate-y-6 scale-95'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ transitionDelay: '0ms' }}
            >
              <Image
                src={card.image}
                alt={card.headline}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full object-cover dark:brightness-95 dark:contrast-105"
                draggable={false}
              />
            </div>

            {/* Heading: 28-32px mobile, 32-36px desktop with staggered animation */}
            <h2
              className={`text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white text-center mb-4 transition-all duration-500 ease-out ${
                isAnimating && !prefersReducedMotion
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              {card.headline}
            </h2>

            {/* Body Text: 16-18px with proper line height and staggered animation */}
            <p
              className={`text-base sm:text-lg text-zinc-600 dark:text-zinc-400 text-center leading-relaxed mb-8 sm:mb-12 max-w-md transition-all duration-500 ease-out ${
                isAnimating && !prefersReducedMotion
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {card.description}
            </p>

            {/* CTA Buttons */}
            {card.ctaVariant === 'split' ? (
              <div className="w-full space-y-3">
                <button
                  onClick={onComplete}
                  className="w-full h-12 bg-gradient-to-r from-primary to-orange-500 text-white rounded-lg font-semibold transition-spring hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Sign Up
                </button>
                <button
                  onClick={onComplete}
                  className="w-full h-12 bg-white dark:bg-zinc-800 text-primary border-2 border-primary dark:text-white rounded-lg font-semibold transition-spring hover:shadow-md active:scale-95"
                >
                  Log In
                </button>
              </div>
            ) : card.cta ? (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
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
                  : 'bg-zinc-300 dark:bg-zinc-600 w-2 h-2 hover:bg-zinc-400 dark:hover:bg-zinc-500'
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OnboardingCarousel;
