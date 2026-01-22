/**
 * Loading Components
 *
 * Reusable loading states and skeleton loaders.
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-hemplifier-accent border-t-hemplifier-text rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 bg-hemplifier-light/80 dark:bg-hemplifier-dark/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-hemplifier-muted dark:text-hemplifier-stone font-light">
          {message}
        </p>
      </div>
    </div>
  );
};

// Skeleton Components
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-hemplifier-accent/50 dark:bg-hemplifier-text/10 rounded ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group">
      <Skeleton className="aspect-[3/4] w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="group">
      <Skeleton className="aspect-video w-full mb-4" />
      <Skeleton className="h-3 w-1/4 mb-2" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-px w-full mb-8" />
      <Skeleton className="h-8 w-1/4 mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 mb-4 p-4 border border-hemplifier-accent/30 rounded">
          <Skeleton className="w-16 h-16" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-hemplifier-accent rounded-full" />
          <div className="absolute inset-0 border-4 border-hemplifier-text border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-serif text-hemplifier-text dark:text-hemplifier-light mb-2">
          Hemplifier
        </h2>
        <p className="text-sm text-hemplifier-muted dark:text-hemplifier-stone font-light tracking-wider">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
