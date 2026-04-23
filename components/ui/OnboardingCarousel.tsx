import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, Coffee, MessageCircle, Sparkles, Wine } from 'lucide-react';

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
  const Icon = currentIndex === 0 ? Sparkles : currentIndex === 1 ? Coffee : currentIndex === 2 ? MessageCircle : Wine;

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    onCardChange?.(index);
  };

  const goNext = () => {
    if (currentIndex === cards.length - 1) {
      onComplete?.();
      return;
    }
    goToCard(currentIndex + 1);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7f0e7] text-[#21170f] dark:bg-[#15120f] dark:text-white">
      <div className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-lg">
        <button
          onClick={() => (currentIndex > 0 ? goToCard(currentIndex - 1) : onComplete?.())}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-white/55 text-[#5b493d] backdrop-blur transition-colors hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b75633]/35 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/10"
          aria-label={currentIndex > 0 ? 'Previous slide' : 'Close intro'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1} of ${cards.length}`}
              onClick={() => goToCard(index)}
              className="flex h-11 min-w-[28px] items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-[#c66a42]' : 'w-1.5 bg-white/25'
                }`}
              />
            </button>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-[#7d6656] transition-colors hover:text-[#21170f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b75633]/35 dark:text-white/65 dark:hover:text-white"
        >
          Skip
        </button>
      </div>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-between px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:max-w-lg">
        <section className="min-h-0">
          <div className="relative mx-auto aspect-[0.86] max-h-[50vh] w-full overflow-hidden rounded-xl border border-black/10 bg-[#efe5d8] shadow-sm dark:border-white/10 dark:bg-[#221d18]">
            <Image
              src={card.id === 4 ? '/generated-images/concepts/flavatix-premium-mobile-workspace.png' : card.image}
              alt=""
              fill
              unoptimized
              priority={currentIndex === 0}
              sizes="(max-width: 640px) 90vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-black/35 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                <Icon className="h-3.5 w-3.5 text-[#d18458]" />
                {currentIndex === 0 ? 'Discover' : currentIndex === 1 ? 'Capture' : currentIndex === 2 ? 'Share' : 'Begin'}
              </div>
            </div>
          </div>

          <div className="pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a55233] dark:text-[#d18458]">
              Flavatix mobile
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-normal text-[#21170f] dark:text-white sm:text-5xl">
              {card.headline}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#6f5c4d] dark:text-white/66">
              {card.description}
            </p>
          </div>
        </section>

        <div className="mt-7 grid gap-3">
          <button
            onClick={goNext}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[#b75633] px-5 text-base font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b75633]/35"
          >
            {currentIndex === cards.length - 1 ? 'Continue to sign in' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onComplete}
            className="min-h-[48px] rounded-lg border border-black/10 bg-white/55 px-5 text-sm font-semibold text-[#6f5c4d] backdrop-blur transition-colors hover:bg-white/80 hover:text-[#21170f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b75633]/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/72 dark:hover:bg-white/[0.07] dark:hover:text-white"
          >
            I already have an account
          </button>
        </div>
      </main>
    </div>
  );
};

export default OnboardingCarousel;
