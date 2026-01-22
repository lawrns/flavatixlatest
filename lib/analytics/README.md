# Analytics Dashboard Guide

## Quick Start

The PWA Analytics Dashboard provides real-time metrics for making the Day 90 Capacitor decision.

### Setup

1. **Apply Database Migration**
   ```bash
   # In Supabase SQL Editor, run:
   # migrations/add_analytics_tables.sql
   ```

2. **Configure Environment** (.env.local)
   ```bash
   # Optional: Google Analytics 4
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Viewing the Dashboard

Create an admin route to view the dashboard:

```tsx
// pages/admin/analytics.tsx
import { PWAMetricsDashboard } from '@/components/analytics/PWAMetricsDashboard';
import { withAuth } from '@/lib/auth'; // Your auth wrapper

function AnalyticsPage() {
  return <PWAMetricsDashboard timeRange={30} refreshInterval={300} />;
}

export default withAuth(AnalyticsPage);
```

## Dashboard Metrics

### Key Metrics

1. **Daily Active Users (DAU)**
   - Definition: Unique users engaging with the app daily
   - Good: Growing week-over-week
   - Target: > 1000 DAU for sustainable PWA

2. **Monthly Active Users (MAU)**
   - Definition: Unique users engaging with the app monthly
   - Good: MAU/DAU ratio > 3 indicates strong retention
   - Target: 20-30% MAU/DAU ratio for healthy app

3. **PWA Install Rate**
   - Definition: % of unique users who install PWA
   - Calculation: (Installs / Unique Users) × 100
   - Target: > 15% indicates strong PWA fit

4. **Customer Acquisition Cost (CAC)**
   - Definition: Average cost to acquire one user
   - Calculation: Total Spend / New Users
   - Target: < $5 for PWA, < $10 for native

### Platform Split

Shows mobile vs desktop usage:
- **Mobile > 60%**: PWA is effective
- **Desktop > 60%**: Consider web optimization instead
- **Balanced (40-60%)**: Continue monitoring

### Daily Trend

Visual representation of DAU over time:
- Look for upward trends
- Identify seasonal patterns
- Detect sudden drops (potential issues)

## Decision Framework

### 🟢 Continue PWA If

- PWA install rate > **15%**
- Mobile traffic > **60%**
- DAU growing > **10% MoM**
- CAC < **$5/user**
- Retention > **40%** after 30 days

**Action**: Scale PWA, optimize install prompt, invest in organic growth

### 🟡 Consider Hybrid If

- PWA install rate **5-15%**
- Mobile traffic **40-60%**
- DAU flat or slow growth
- Need platform features (push notifications, offline sync)
- CAC **$5-10/user**

**Action**: Build Capacitor wrapper for core features, keep PWA as fallback

### 🔴 Go Native If

- PWA install rate < **5%**
- Desktop traffic > **60%**
- DAU declining
- High LTV potential justifies investment
- Need App Store presence

**Action**: Build full native app with Capacitor

## Using the Analytics Tracker

### Import and Initialize

```typescript
import { analyticsTracker } from '@/lib/analytics/tracker';

// Auto-initialized on app load in _app.tsx
```

### Track Events

```typescript
// Custom event
await analyticsTracker.trackEvent({
  eventName: 'flavor_wheel_created',
  properties: {
    category: 'coffee',
    descriptorsCount: 12,
  },
});

// Page view
await analyticsTracker.trackPageView('/flavor-wheel');

// PWA install
await analyticsTracker.trackPWAInstall('campaign');

// User acquisition
await analyticsTracker.trackUserAcquisition('organic', 0);

// Check if PWA installed
const isInstalled = analyticsTracker.isPWAInstalled();

// Prompt PWA install
const installed = await analyticsTracker.promptInstall();
```

## Querying Data

### Via Supabase SQL Editor

```sql
-- Daily Active Users (last 7 days)
SELECT * FROM analytics_daily_active_users
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- PWA Install Rate (last 30 days)
SELECT * FROM analytics_pwa_install_rate
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- Platform Split
SELECT
  platform,
  COUNT(*) AS sessions,
  COUNT(DISTINCT user_id) AS unique_users
FROM analytics_sessions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY platform;
```

### Via API

```bash
# Get metrics
curl https://your-app.com/api/analytics/metrics?days=30

# Response
{
  "dau": 1234,
  "mau": 5678,
  "mobilePercentage": 72.5,
  "desktopPercentage": 27.5,
  "pwaInstallRate": 15.3,
  "totalPWAInstalls": 234,
  "cac": 3.45
}
```

## Custom Metrics

### Adding Custom Events

```typescript
// Track flavor wheel creation
await analyticsTracker.trackEvent({
  eventName: 'flavor_wheel_created',
  properties: {
    category: wheelData.category,
    descriptorsCount: wheelData.descriptors.length,
    hasNotes: !!wheelData.notes,
  },
});

// Track tasting session
await analyticsTracker.trackEvent({
  eventName: 'tasting_session_completed',
  properties: {
    durationMinutes: session.duration,
    itemsTasted: session.items.length,
    ratingGiven: session.rating !== null,
  },
});
```

### Creating Custom Views

```sql
-- Example: Flavor Wheel Creation Rate
CREATE OR REPLACE VIEW analytics_flavor_wheel_rate AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS wheels_created,
  COUNT(DISTINCT user_id) AS unique_creators
FROM analytics_events
WHERE event_name = 'flavor_wheel_created'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Monitoring Checklist

### Daily
- [ ] Check DAU is within expected range
- [ ] Monitor error rate in Sentry
- [ ] Verify PWA install events are recording

### Weekly
- [ ] Review platform split changes
- [ ] Analyze top traffic sources
- [ ] Check session duration trends

### Monthly
- [ ] Calculate MAU and retention
- [ ] Review CAC by channel
- [ ] Update Day 90 decision matrix
- [ ] Compare with competitors

## Troubleshooting

### No Data Showing

1. Check database migration was applied
2. Verify Supabase credentials in `.env.local`
3. Check browser console for errors
4. Confirm analytics tracker is initialized

### PWA Installs Not Tracking

1. Verify PWA is installable (DevTools → Application)
2. Check service worker is registered
3. Test on actual mobile device
4. Verify `appinstalled` event listener is working

### GA4 Not Showing Data

1. Confirm `NEXT_PUBLIC_GA_ID` is set correctly
2. Check GA4 property is receiving data
3. Wait 24-48 hours for data processing
4. Verify no ad blockers are interfering

## Best Practices

1. **Privacy First**
   - Don't track PII (personally identifiable information)
   - Anonymize user IDs
   - Respect cookie consent

2. **Performance**
   - Analytics shouldn't block UI
   - Use non-blocking requests
   - Batch events when possible

3. **Accuracy**
   - Validate event properties
   - Handle errors gracefully
   - Don't fail the app if analytics fails

4. **Actionability**
   - Track metrics that inform decisions
   - Avoid vanity metrics
   - Focus on trends, not absolute numbers

## Resources

- [Full Documentation](./ANALYTICS_IMPLEMENTATION.md)
- [Google Analytics 4 Docs](https://support.google.com/analytics)
- [Supabase Analytics Guide](https://supabase.com/docs/guides/platform/analytics)
- [PWA Best Practices](https://web.dev/pwa/)

## Support

For issues:
1. Check [ANALYTICS_IMPLEMENTATION.md](./ANALYTICS_IMPLEMENTATION.md)
2. Review Supabase logs
3. Check Sentry for errors
4. Open GitHub issue
