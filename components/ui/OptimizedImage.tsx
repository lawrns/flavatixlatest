/**
 * OptimizedImage Component
 * 
 * A wrapper around next/image that provides:
 * - Automatic fallback for broken images
 * - Loading states
 * - Blur placeholder support
 * - Avatar variant for user profile images
 */

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'fetchPriority'> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  variant?: 'default' | 'avatar' | 'thumbnail' | 'cover';
  showLoadingState?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}

// Default fallback images
const DEFAULT_FALLBACKS = {
  default: '/images/placeholder.png',
  avatar: '/images/default-avatar.png',
  thumbnail: '/images/placeholder-thumbnail.png',
  cover: '/images/placeholder-cover.png',
};

// Default blur placeholder
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AzXRtNsLvULe2uLqWOGSQK7hQSB+1qP8AHNi/oj/tKUqhbMwJB5P/2Q==';

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  fallbackComponent,
  variant = 'default',
  showLoadingState = true,
  className,
  fetchPriority,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // If error and fallback component provided, render it
  if (error && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Determine the source to use
  const imageSrc = error 
    ? (fallbackSrc || DEFAULT_FALLBACKS[variant]) 
    : src;

  // If no src at all, show fallback
  if (!imageSrc) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          className
        )}
        style={{ width: props.width, height: props.height }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {showLoadingState && loading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width: props.width, height: props.height }}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        fetchPriority={fetchPriority}
        className={cn(
          loading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        {...props}
      />
    </div>
  );
};

// Avatar variant with circular styling
export const Avatar: React.FC<Omit<OptimizedImageProps, 'variant'> & {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ size = 'md', className, ...props }) => {
  const sizes = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 80, height: 80 },
  };

  return (
    <OptimizedImage
      variant="avatar"
      className={cn('rounded-full overflow-hidden', className)}
      width={sizes[size].width}
      height={sizes[size].height}
      {...props}
    />
  );
};

// Thumbnail variant for item images
export const Thumbnail: React.FC<Omit<OptimizedImageProps, 'variant'>> = ({
  className,
  ...props
}) => {
  return (
    <OptimizedImage
      variant="thumbnail"
      className={cn('rounded-lg overflow-hidden', className)}
      {...props}
    />
  );
};

export default OptimizedImage;
