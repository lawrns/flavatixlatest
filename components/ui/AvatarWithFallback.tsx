/**
 * AvatarWithFallback Component
 * 
 * Displays user avatar with graceful fallback to initials when image fails to load
 */
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarWithFallbackProps {
  /** Image source URL */
  src?: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** Fallback text (usually initials) */
  fallback: string;
  /** Size in pixels */
  size?: number;
  /** Additional className */
  className?: string;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  fallback,
  size = 48,
  className,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !src || hasError;

  const sizeStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  const fontSize = size < 32 ? 'text-xs' : size < 48 ? 'text-sm' : size < 64 ? 'text-lg' : 'text-xl';

  if (showFallback) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary to-orange-500',
          'flex items-center justify-center text-white font-semibold',
          fontSize,
          className
        )}
        style={sizeStyle}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={sizeStyle}>
      {isLoading && (
        <div
          className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"
          style={sizeStyle}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-200'
        )}
        style={sizeStyle}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default AvatarWithFallback;
