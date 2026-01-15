import React from 'react';

interface EmptyStateCardProps {
  image?: string | React.ReactNode;
  headline: string;
  description: string;
  cta?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryCta?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  image,
  headline,
  description,
  cta,
  secondaryCta,
}) => {
  const isReactComponent = React.isValidElement(image);
  const isString = typeof image === 'string';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Empty State Image/Icon */}
      {image && (
        <div className="w-full max-w-xs h-48 sm:h-64 mb-8 flex items-center justify-center">
          {isReactComponent ? (
            <div className="w-32 h-32 sm:w-40 sm:h-40 text-zinc-400 dark:text-zinc-500">
              {image}
            </div>
          ) : isString ? (
            <img
              src={image}
              alt={headline}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : null}
        </div>
      )}

      {/* Text Content */}
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          {headline}
        </h3>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* CTA Buttons */}
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {cta && (
            <button
              onClick={cta.onClick}
              className={`px-6 py-3 rounded-lg font-semibold transition-spring ${
                cta.variant === 'secondary'
                  ? 'bg-white dark:bg-zinc-800 text-primary border-2 border-primary hover:shadow-md active:scale-95'
                  : 'bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {cta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              onClick={secondaryCta.onClick}
              className="px-6 py-3 rounded-lg font-semibold bg-white dark:bg-zinc-800 text-primary border-2 border-primary hover:shadow-md transition-spring active:scale-95"
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyStateCard;
