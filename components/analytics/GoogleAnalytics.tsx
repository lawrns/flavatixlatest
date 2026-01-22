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

      function gtag(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      }

      (window as any).gtag = gtag;

      // Initialize GA4
      gtag('js', new Date());
      gtag('config', measurementId, {
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
