import React from 'react';
import Image from 'next/image';
import { Button } from './Button';

interface EmptyStateCardProps {
  image: string;
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
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Empty State Image */}
      <div className="w-full max-w-xs h-48 sm:h-64 mb-8 rounded-pane overflow-hidden">
        <Image
          src={image}
          alt={headline}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-h2 font-semibold text-fg dark:text-white">
          {headline}
        </h3>
        <p className="text-body text-fg-muted dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* CTA Buttons */}
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {cta && (
            <Button
              variant={cta.variant === 'secondary' ? 'secondary' : 'primary'}
              size="lg"
              onClick={cta.onClick}
            >
              {cta.label}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="secondary" size="lg" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyStateCard;
