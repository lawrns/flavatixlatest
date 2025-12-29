import dynamic from 'next/dynamic';
import React from 'react';

// Re-export the props interface for consumers
export type { FlavorWheelVisualizationProps } from './FlavorWheelVisualizationInner';

/**
 * Loading skeleton for the flavor wheel while D3 loads
 */
const FlavorWheelSkeleton: React.FC = () => (
  <div className="relative w-full">
    <div className="w-full aspect-square max-w-[600px] mx-auto relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800">
      {/* Animated pulse skeleton for the wheel */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-[280px] h-[280px] rounded-full border-[40px] border-gray-200 dark:border-zinc-700 animate-pulse" />
          {/* Middle ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border-[30px] border-gray-300 dark:border-zinc-600 animate-pulse" />
          {/* Inner ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border-[25px] border-gray-200 dark:border-zinc-700 animate-pulse" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
      {/* Loading text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400">
        Loading visualization...
      </div>
    </div>
  </div>
);

/**
 * FlavorWheelVisualization
 *
 * Dynamically loaded D3.js visualization component.
 * D3 (~80KB) is only loaded when this component is rendered,
 * not included in the initial bundle.
 */
export const FlavorWheelVisualization = dynamic(
  () => import('./FlavorWheelVisualizationInner').then(mod => mod.FlavorWheelVisualization),
  {
    loading: () => <FlavorWheelSkeleton />,
    ssr: false
  }
);

export default FlavorWheelVisualization;
