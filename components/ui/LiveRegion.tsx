/**
 * LiveRegion Component
 *
 * Provides accessible announcements for screen readers.
 * Uses aria-live regions to announce dynamic content changes.
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

type Politeness = 'polite' | 'assertive' | 'off';

interface _Announcement {
  id: string;
  message: string;
  politeness: Politeness;
  timestamp: number;
}

interface LiveRegionContextValue {
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: Politeness) => void;
  /** Announce a polite message (non-interrupting) */
  announcePolite: (message: string) => void;
  /** Announce an assertive message (interrupting) */
  announceAssertive: (message: string) => void;
  /** Clear all announcements */
  clearAnnouncements: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null);

/**
 * Hook to access the live region announcer
 */
export function useLiveRegion(): LiveRegionContextValue {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface LiveRegionProviderProps {
  children: React.ReactNode;
  /** Delay before clearing announcements (ms) */
  clearDelay?: number;
}

export const LiveRegionProvider: React.FC<LiveRegionProviderProps> = ({
  children,
  clearDelay = 5000,
}) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique ID for announcements
  const _generateId = () => `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const announce = useCallback(
    (message: string, politeness: Politeness = 'polite') => {
      if (!message) {
        return;
      }

      // Clear any pending timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      if (politeness === 'assertive') {
        setAssertiveMessage(message);
        setPoliteMessage('');
      } else if (politeness === 'polite') {
        setPoliteMessage(message);
        setAssertiveMessage('');
      }

      // Auto-clear after delay
      clearTimeoutRef.current = setTimeout(() => {
        setPoliteMessage('');
        setAssertiveMessage('');
      }, clearDelay);
    },
    [clearDelay]
  );

  const announcePolite = useCallback(
    (message: string) => {
      announce(message, 'polite');
    },
    [announce]
  );

  const announceAssertive = useCallback(
    (message: string) => {
      announce(message, 'assertive');
    },
    [announce]
  );

  const clearAnnouncements = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    setPoliteMessage('');
    setAssertiveMessage('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const value: LiveRegionContextValue = {
    announce,
    announcePolite,
    announceAssertive,
    clearAnnouncements,
  };

  return (
    <LiveRegionContext.Provider value={value}>
      {children}

      {/* Polite live region - for non-urgent updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>

      {/* Assertive live region - for urgent updates */}
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
};

// ============================================================================
// STANDALONE COMPONENT
// ============================================================================

interface LiveRegionProps {
  /** The message to announce */
  message?: string;
  /** Politeness level */
  politeness?: Politeness;
  /** Whether to clear the message after announcing */
  clearAfter?: number;
  /** Additional class names */
  className?: string;
  /** Children to render (will be announced) */
  children?: React.ReactNode;
}

/**
 * Standalone LiveRegion component for simple use cases
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter,
  className,
  children,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || '');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);

      if (clearAfter) {
        const timeout = setTimeout(() => {
          setCurrentMessage('');
        }, clearAfter);
        return () => clearTimeout(timeout);
      }
    }
  }, [message, clearAfter]);

  const content = children || currentMessage;

  if (politeness === 'assertive') {
    return (
      <div role="alert" aria-live="assertive" aria-atomic="true" className={className || 'sr-only'}>
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={className || 'sr-only'}>
      {content}
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Loading announcement component
 */
export const LoadingAnnouncement: React.FC<{
  isLoading: boolean;
  loadingMessage?: string;
  loadedMessage?: string;
}> = ({ isLoading, loadingMessage = 'Loading...', loadedMessage = 'Content loaded' }) => {
  const [announced, setAnnounced] = useState(false);

  useEffect(() => {
    if (!isLoading && !announced) {
      setAnnounced(true);
    }
    if (isLoading) {
      setAnnounced(false);
    }
  }, [isLoading, announced]);

  return (
    <LiveRegion politeness="polite">
      {isLoading ? loadingMessage : announced ? '' : loadedMessage}
    </LiveRegion>
  );
};

/**
 * Error announcement component
 */
export const ErrorAnnouncement: React.FC<{
  error?: string | null;
}> = ({ error }) => {
  if (!error) {
    return null;
  }

  return <LiveRegion politeness="assertive">Error: {error}</LiveRegion>;
};

/**
 * Success announcement component
 */
export const SuccessAnnouncement: React.FC<{
  message?: string | null;
  clearAfter?: number;
}> = ({ message, clearAfter = 3000 }) => {
  if (!message) {
    return null;
  }

  return (
    <LiveRegion politeness="polite" clearAfter={clearAfter}>
      {message}
    </LiveRegion>
  );
};

export default LiveRegion;
