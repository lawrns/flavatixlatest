/**
 * Google Analytics 4 Integration
 *
 * Adds GA4 tracking script to the application
 */

import { useEffect } from 'react';
import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  useEffect(() => {
    // Initialize gtag
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      (window as any).dataLayer = (window as any).dataLayer || [];

      // Use function expression instead of arrow to support 'arguments' in ES5
      (window as any).gtag = function gtag() {
        (window as any).dataLayer.push(arguments);
      };

      // Initialize GA4
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', measurementId, {
        send_page_view: false, // We'll handle page views manually
      });
    }
  }, [measurementId]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            custom_map: {
              'platform': 'platform',
              'session_id': 'session_id'
            }
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
