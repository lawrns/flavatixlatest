/**
 * Analytics Tracker for PWA Metrics
 *
 * Tracks key metrics for Day 90 Capacitor decision:
 * - MAU/DAU tracking
 * - Mobile vs desktop traffic split
 * - PWA install rate
 * - User acquisition cost (CAC)
 * - Unit economics (LTV if monetization active)
 */

import { logger } from '../logger';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface PWAInstallEvent {
  userId?: string;
  platform: string;
  userAgent: string;
  timestamp: number;
  source?: string; // Where the install came from (direct, campaign, etc.)
}

export interface PageViewEvent {
  userId?: string;
  path: string;
  referrer?: string;
  platform: string;
  userAgent: string;
  timestamp: number;
}

export interface UserSessionEvent {
  userId?: string;
  sessionId: string;
  platform: string;
  duration: number; // Session duration in seconds
  pagesViewed: number;
  timestamp: number;
}

class AnalyticsTracker {
  private isInitialized = false;
  private gaMeasurementId: string | null = null;
  private sessionId: string | null = null;
  private sessionStart: number | null = null;

  /**
   * Initialize analytics tracker
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    // Initialize Google Analytics if configured
    this.gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || null;

    // Generate session ID
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();

    // Track initial page view
    if (typeof window !== 'undefined') {
      this.trackPageView(window.location.pathname);
      this.setupPWAInstallTracking();
    }

    this.isInitialized = true;
    logger.debug('Analytics', 'Analytics tracker initialized');
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get platform information (mobile/desktop)
   */
  private getPlatform(): string {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );

    return isMobile ? 'mobile' : 'desktop';
  }

  /**
   * Track a custom analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Analytics', 'Tracker not initialized');
      return;
    }

    const eventData = {
      eventName: event.eventName,
      properties: event.properties || {},
      userId: event.userId,
      platform: this.getPlatform(),
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
    };

    // Send to Google Analytics 4
    if (this.gaMeasurementId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventName, {
        ...eventData.properties,
        user_id: event.userId,
        platform: eventData.platform,
      });
    }

    // Send to backend for storage
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      logger.error('Analytics', 'Failed to send event to backend', error);
    }

    logger.debug('Analytics', `Tracked event: ${event.eventName}`, eventData);
  }

  /**
   * Track page view
   */
  async trackPageView(path: string, referrer?: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const pageViewData: PageViewEvent = {
      userId: this.getUserId(),
      path,
      referrer,
      platform: this.getPlatform(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
    };

    // Send to Google Analytics
    if (this.gaMeasurementId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.gaMeasurementId, {
        page_path: path,
        platform: pageViewData.platform,
      });
    }

    // Send to backend
    try {
      await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageViewData),
      });
    } catch (error) {
      logger.error('Analytics', 'Failed to track page view', error);
    }

    logger.debug('Analytics', `Page view tracked: ${path}`);
  }

  /**
   * Track PWA install event
   */
  async trackPWAInstall(source?: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const installData: PWAInstallEvent = {
      userId: this.getUserId(),
      platform: this.getPlatform(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
      source,
    };

    // Send to Google Analytics
    await this.trackEvent({
      eventName: 'pwa_installed',
      properties: {
        platform: installData.platform,
        source: source || 'direct',
      },
      userId: installData.userId,
    });

    // Send to backend
    try {
      await fetch('/api/analytics/pwa-install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(installData),
      });
    } catch (error) {
      logger.error('Analytics', 'Failed to track PWA install', error);
    }

    logger.info('Analytics', 'PWA installation tracked', installData as any);
  }

  /**
   * Track PWA install prompt shown
   */
  async trackPWAInstallPromptShown(): Promise<void> {
    await this.trackEvent({
      eventName: 'pwa_install_prompt_shown',
      properties: {
        platform: this.getPlatform(),
      },
    });
  }

  /**
   * Track PWA install prompt dismissed
   */
  async trackPWAInstallPromptDismissed(): Promise<void> {
    await this.trackEvent({
      eventName: 'pwa_install_prompt_dismissed',
      properties: {
        platform: this.getPlatform(),
      },
    });
  }

  /**
   * Track user acquisition source
   */
  async trackUserAcquisition(source: string, cost?: number): Promise<void> {
    await this.trackEvent({
      eventName: 'user_acquired',
      properties: {
        source,
        cost,
        platform: this.getPlatform(),
      },
    });
  }

  /**
   * Track session end
   */
  async trackSessionEnd(): Promise<void> {
    if (!this.sessionStart || !this.sessionId) {
      return;
    }

    const sessionData: UserSessionEvent = {
      userId: this.getUserId(),
      sessionId: this.sessionId,
      platform: this.getPlatform(),
      duration: Math.floor((Date.now() - this.sessionStart) / 1000),
      pagesViewed: 0, // This could be tracked separately
      timestamp: Date.now(),
    };

    try {
      await fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      logger.error('Analytics', 'Failed to track session end', error);
    }

    // Reset session
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
  }

  /**
   * Set up PWA install event listeners
   */
  private setupPWAInstallTracking(): void {
    // Track beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      logger.debug('Analytics', 'PWA install prompt can be shown');
      this.trackPWAInstallPromptShown();

      // Store the event for later use
      (window as any).deferredPrompt = event;
    });

    // Track appinstalled event
    window.addEventListener('appinstalled', () => {
      logger.info('Analytics', 'PWA was installed');
      this.trackPWAInstall();

      // Clear the deferred prompt
      delete (window as any).deferredPrompt;
    });

    // Track page visibility changes to detect when user returns to the app
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackPageView(window.location.pathname);
      }
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable delivery during page unload
      if (this.sessionStart && this.sessionId) {
        const sessionData: UserSessionEvent = {
          userId: this.getUserId(),
          sessionId: this.sessionId,
          platform: this.getPlatform(),
          duration: Math.floor((Date.now() - this.sessionStart) / 1000),
          pagesViewed: 0,
          timestamp: Date.now(),
        };

        const blob = new Blob([JSON.stringify(sessionData)], {
          type: 'application/json',
        });

        navigator.sendBeacon('/api/analytics/session', blob);
      }
    });
  }

  /**
   * Get current user ID from localStorage or auth
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      // Try to get user ID from localStorage (set by auth)
      const userId = localStorage.getItem('userId');
      if (userId) {
        return userId;
      }

      // Try to get from session storage
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        return sessionUserId;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Check if PWA is installed
   */
  isPWAInstalled(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Check if app was installed (iOS)
    const isInstalled = !!(window as any).deferredPrompt;

    return isStandalone || isInstalled;
  }

  /**
   * Get PWA install prompt (if available)
   */
  async getInstallPrompt(): Promise<any> {
    if (typeof window === 'undefined') {
      return null;
    }

    const prompt = (window as any).deferredPrompt;

    if (!prompt) {
      logger.debug('Analytics', 'No deferred prompt available');
      return null;
    }

    return prompt;
  }

  /**
   * Prompt user to install PWA
   */
  async promptInstall(): Promise<boolean> {
    const prompt = await this.getInstallPrompt();

    if (!prompt) {
      logger.warn('Analytics', 'Cannot prompt install - no deferred prompt');
      return false;
    }

    try {
      // Show the install prompt
      await prompt.prompt();

      // Wait for user to respond
      const { outcome } = await prompt.userChoice;

      if (outcome === 'accepted') {
        logger.info('Analytics', 'User accepted PWA install prompt');
        this.trackPWAInstall('prompt');
        return true;
      } else {
        logger.info('Analytics', 'User dismissed PWA install prompt');
        this.trackPWAInstallPromptDismissed();
        return false;
      }
    } catch (error) {
      logger.error('Analytics', 'Error prompting PWA install', error);
      return false;
    } finally {
      // Clear the deferred prompt
      delete (window as any).deferredPrompt;
    }
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      analyticsTracker.initialize();
    });
  } else {
    analyticsTracker.initialize();
  }
}
