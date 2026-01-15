import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'flavatix_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'flavatix_cookie_preferences';

export const CookieConsent: React.FC = () => {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);

    // Apply cookie preferences
    if (!prefs.analytics) {
      // Disable analytics cookies
      document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    if (!prefs.marketing) {
      // Disable marketing cookies
      document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Reload to apply changes
    window.location.reload();
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={() => !showDetails && setShowBanner(false)}
      />

      {/* Banner */}
      <div className="relative w-full max-w-6xl mb-6 mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 pointer-events-auto overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Cookie Preferences
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  We value your privacy
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          {!showDetails ? (
            <>
              <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                We use cookies and similar technologies to enhance your experience, analyze site
                usage, and personalize content. By clicking &quot;Accept All&quot;, you consent to
                our use of cookies.{' '}
                <button
                  onClick={() => router.push('/privacy')}
                  className="text-primary hover:underline font-medium"
                >
                  Learn more
                </button>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Customize
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Detailed Cookie Settings */}
              <div className="space-y-6 mb-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Necessary Cookies
                      </h4>
                      <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Essential for the website to function. These cookies enable core functionality
                      such as authentication, security, and session management. The website cannot
                      function properly without these cookies.
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                      Examples: Session cookies, CSRF tokens, authentication tokens
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-5 h-5 rounded cursor-not-allowed opacity-50"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Help us understand how visitors interact with our website by collecting and
                      reporting information anonymously. This helps us improve our service and user
                      experience.
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                      Examples: Google Analytics (_ga, _gid), Sentry performance monitoring
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Used to track visitors across websites to display relevant advertisements and
                      marketing campaigns. These cookies help us measure the effectiveness of our
                      marketing efforts.
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                      Examples: Facebook Pixel (_fbp), advertising IDs
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Cookie Policy Link */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  For more information about how we use cookies and your choices, please read our{' '}
                  <button
                    onClick={() => router.push('/privacy#cookies')}
                    className="text-primary hover:underline font-medium"
                  >
                    Cookie Policy
                  </button>{' '}
                  and{' '}
                  <button
                    onClick={() => router.push('/privacy')}
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
