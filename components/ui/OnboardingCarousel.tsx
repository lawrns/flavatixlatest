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
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 relative overflow-hidden">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 flex items-center justify-center overflow-hidden px-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card Image */}
        <div
          className="transition-transform duration-300 ease-spring select-none"
          style={{
            transform: isDragging
              ? `translateX(${translateX}px)`
              : 'translateX(0)',
          }}
        >
          <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
            {/* Image */}
            <div className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={card.image}
                alt={card.headline}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4 px-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                {card.headline}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* CTA Buttons */}
            {card.ctaVariant === 'split' ? (
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={onComplete}
                  className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-3 px-4 rounded-lg font-semibold transition-spring hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Sign Up
                </button>
                <button
                  onClick={onComplete}
                  className="w-full bg-white dark:bg-zinc-800 text-primary border-2 border-primary dark:text-white py-3 px-4 rounded-lg font-semibold transition-spring hover:shadow-md active:scale-95"
                >
                  Log In
                </button>
              </div>
            ) : card.cta ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
                {card.cta}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center gap-4 pb-6">
        {/* Dots */}
        <div className="flex gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`h-2 transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-zinc-300 dark:bg-zinc-600 w-2 hover:bg-zinc-400 dark:hover:bg-zinc-500'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        {/* Text Indicator */}
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
      >
        Skip
      </button>
    </div>
  );
};

export default OnboardingCarousel;
