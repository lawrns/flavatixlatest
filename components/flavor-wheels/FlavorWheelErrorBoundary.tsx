// Webpack moduleId: 7093 (for crash tracing)
// This error boundary wraps flavor wheel components to gracefully handle D3/DOM crashes

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * FlavorWheelErrorBoundary
 * Catches errors in flavor wheel components (D3/SVG/DOM operations)
 * and provides a graceful fallback UI instead of crashing the page.
 */
class FlavorWheelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('[FlavorWheel Error]', error.message);
    console.error('[FlavorWheel Stack]', errorInfo.componentStack);

    // In production, send to error tracking
    if (process.env.NODE_ENV === 'production') {
      // TODO(observability): Integrate Sentry for FlavorWheel errors.
      // Import * as Sentry from '@sentry/nextjs' and call:
      // Sentry.captureException(error, { tags: { component: 'FlavorWheel' }, extra: { componentStack } })
      console.error('[FlavorWheel Production Error]', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
            We couldn&apos;t draw this flavor wheel
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            Something went wrong while rendering the visualization.
            Try reloading or editing your tasting notes.
          </p>

          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-xs text-gray-500 dark:text-gray-400 max-w-md">
              <summary className="cursor-pointer font-medium mb-2">
                Error Details (Dev Only)
              </summary>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto text-left">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default FlavorWheelErrorBoundary;
