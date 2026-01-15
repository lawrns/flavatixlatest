import React, { useState, useRef, useEffect } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!isDragging) return;
    setTranslateX(e.clientX - startX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
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
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
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
          className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-300 ease-spring"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-6 py-8 sm:py-12"
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
            transform: isDragging
              ? `translateX(${translateX}px)`
              : 'translateX(0)',
          }}
        >
          <div className="flex flex-col items-center max-w-lg mx-auto">
            {/* Image: 4:5 aspect ratio, responsive sizing */}
            <div className="w-full max-w-xs aspect-[4/5] rounded-2xl overflow-hidden shadow-xl mb-8 sm:mb-10">
              <img
                src={card.image}
                alt={card.headline}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Heading: 28-32px mobile, 32-36px desktop */}
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white text-center mb-4">
              {card.headline}
            </h2>

            {/* Body Text: 16-18px with proper line height */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 text-center leading-relaxed mb-8 sm:mb-12 max-w-md">
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

      {/* Dot Navigation (secondary, optional) */}
      <div className="flex items-center justify-center gap-1.5 pb-6 px-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-zinc-300 dark:bg-zinc-600 w-1.5 hover:bg-zinc-400 dark:hover:bg-zinc-500'
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingCarousel;
