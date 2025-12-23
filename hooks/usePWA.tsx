/**
 * PWA Hook for Service Worker registration and offline functionality
 */

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface PWAState {
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    canInstall: false,
    registration: null
  });

  // Check if app is installed
  useEffect(() => {
    if ('standalone' in navigator) {
      setState(prev => ({
        ...prev,
        isInstalled: (navigator as any).standalone
      }));
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState(prev => ({
        ...prev,
        isInstalled: true
      }));
    }
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      toast.success('Back online! Syncing data...', 3000);
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
      toast.info('You are offline. Changes will sync when reconnected.', 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      setState(prev => ({ ...prev, registration }));

      console.log('ServiceWorker registered successfully:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState(prev => ({ ...prev, isUpdateAvailable: true }));

            // Duration 0 means no auto-dismiss, use a long duration instead
            toast.info('A new version is available!', 30000);
          }
        });
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'sync-complete') {
          handleSyncComplete(event.data.results);
        }
      });

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  };

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt = e;
      setState(prev => ({ ...prev, canInstall: true }));

      // Show install banner after 30 seconds
      setTimeout(() => {
        if (!state.isInstalled && deferredPrompt) {
          toast.info('Add Flavatix to your home screen for offline access!', 10000);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, [state.isInstalled]);

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
        toast.success('Flavatix installed successfully!', 5000);
      } else {
        console.log('User dismissed the install prompt');
      }

      deferredPrompt = null;
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install app');
    }
  }, []);

  // Update app
  const updateApp = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'skip-waiting' });
      window.location.reload();
    }
  }, [state.registration]);

  // Handle sync completion
  const handleSyncComplete = (results: any[]) => {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status !== 'success').length;

    if (successful > 0 && failed === 0) {
      toast.success(`${successful} offline changes synced successfully!`, 5000);
    } else if (successful > 0 && failed > 0) {
      toast.warn(`${successful} changes synced, ${failed} failed. Will retry later.`, 7000);
    } else if (failed > 0) {
      toast.error(`Failed to sync ${failed} changes. Will retry when connection improves.`, 7000);
    }
  };

  // Clear cache
  const clearCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'clear-cache' });
      toast.success('Cache cleared successfully');
    }
  }, []);

  // Get storage estimate
  const getStorageEstimate = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
      };
    }
    return null;
  }, []);

  return {
    ...state,
    installApp,
    updateApp,
    clearCache,
    getStorageEstimate
  };
}

/**
 * PWA Install Banner Component
 */
export function PWAInstallBanner() {
  const { canInstall, installApp } = usePWA();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-primary-500">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Install Flavatix
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Install our app for offline access and a native experience
            </p>
            <div className="mt-3 flex space-x-3">
              <button
                onClick={installApp}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Install Now
              </button>
              <button
                onClick={() => {/* Dismiss logic */}}
                className="text-sm font-medium text-gray-500 hover:text-gray-400"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Offline indicator component
 */
export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      <span className="inline-flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        You are offline - Changes will sync when reconnected
      </span>
    </div>
  );
}