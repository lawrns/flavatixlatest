# Production Testing Guide - Extraction Rate Monitoring

## Setup Complete ✅

### Files Created:
1. `/pages/api/admin/extraction-stats.ts` - API endpoint for stats
2. `/pages/admin/extraction-monitor.tsx` - Real-time dashboard
3. `/NETLIFY_SETUP.md` - Environment configuration guide

## Step 1: Configure Netlify (Manual)

Run these commands in your terminal:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to project
cd /Users/lukatenbosch/Downloads/flavatixlatest

# Link your site
netlify link

# Set OpenAI API Key (replace with your actual key)
netlify env:set OPENAI_API_KEY "your-openai-api-key-here"

# Verify
netlify env:list

# Deploy
netlify deploy --prod
```

## Step 2: Access Monitoring Dashboard

Once deployed, visit:
```
https://your-site.netlify.app/admin/extraction-monitor
```

### Dashboard Features:
- ✅ Real-time extraction rate (updates every 30s)
- ✅ Total items vs items with content
- ✅ Items successfully extracted
- ✅ Missing extractions count
- ✅ Extraction trend over time
- ✅ Breakdown by category
- ✅ Status alerts when rate < 95%

## Step 3: Production Test Scenarios

### Test Case 1: New Quick Tasting
**Expected Behavior:**
1. Create a quick tasting with 3 items
2. Add aroma, flavor, and notes to each item
3. Complete the session
4. **Expected:** All 3 items should have descriptors extracted
5. **Verify:** Extraction rate should be 100%

**How to Verify:**
```sql
-- Check if descriptors were created
SELECT COUNT(*)
FROM flavor_descriptors
WHERE source_type = 'quick_tasting'
AND created_at > NOW() - INTERVAL '5 minutes';
```

### Test Case 2: Monitor Dashboard
**Steps:**
1. Visit `/admin/extraction-monitor`
2. Select "Last 24 Hours"
3. Check overall extraction rate
4. Verify it shows ≥95% (green status)

**Expected Metrics:**
- Overall Rate: 95-100%
- Status: "Healthy" (green)
- No items in "Missing Extractions"

### Test Case 3: Real-Time Updates
**Steps:**
1. Keep monitoring dashboard open
2. Create a new tasting in another tab
3. Add items with content
4. Complete the session
5. Wait 30 seconds
6. Dashboard should update automatically

### Test Case 4: Category Breakdown
**Verify:**
- Each category (coffee, wine, beer, etc.) shows ≥95% rate
- No category shows "Critical" (red) status
- Trend chart shows consistent extraction

## Step 4: Alert Thresholds

### Status Indicators:
- 🟢 **Healthy** (≥95%): Everything working as expected
- 🟡 **Warning** (80-94%): Some issues, investigate logs
- 🔴 **Critical** (<80%): Immediate attention required

### Common Issues:

#### Issue 1: Rate Below 95%
**Possible Causes:**
- OpenAI API key not set or invalid
- Rate limiting on OpenAI API
- Network connectivity issues
- Auth token expiration

**Debug Steps:**
1. Check Netlify environment variables
2. Review server logs for API errors
3. Test API key with curl:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Issue 2: No Extractions at All
**Possible Causes:**
- Extraction function not being called
- Database connection issues
- RLS policies blocking writes

**Debug Steps:**
1. Check browser console for errors
2. Verify `extractDescriptors()` is called on save
3. Check Supabase logs for failed inserts

#### Issue 3: Category-Specific Issues
**If one category has low rate:**
- Check if category-specific logic is working
- Verify descriptor extraction for that category
- Look for category-specific error patterns

## Step 5: Performance Monitoring

### Key Metrics to Track:

```javascript
{
  "target_extraction_rate": "95%+",
  "acceptable_latency": "< 2 seconds per item",
  "batch_size": "All items on session completion",
  "retry_policy": "3 attempts with exponential backoff"
}
```

### API Endpoint for Automated Monitoring:

```bash
# Get stats programmatically
curl https://your-site.netlify.app/api/admin/extraction-stats?period=24h

# Response format:
{
  "period": "24h",
  "totalItems": 50,
  "itemsWithContent": 45,
  "itemsExtracted": 44,
  "extractionRate": 97.78,
  "recentExtractions": [...],
  "byCategory": [...]
}
```

### Set Up Alerts (Optional):

1. **Netlify Functions + Slack/Email:**
```javascript
// Create /netlify/functions/extraction-alert.js
// Run hourly, check rate < 95%, send alert
```

2. **External Monitoring:**
- UptimeRobot: Ping API endpoint every 5 minutes
- Datadog: Track extraction_rate metric
- Sentry: Alert on extraction errors

## Step 6: Success Criteria

✅ **Production Ready When:**
- [ ] Netlify environment variables set
- [ ] Dashboard accessible at `/admin/extraction-monitor`
- [ ] Overall extraction rate ≥95% for 24 hours
- [ ] All categories show healthy status
- [ ] Auto-refresh working (30s intervals)
- [ ] Test tastings extract successfully
- [ ] Trend chart shows consistent data

## Step 7: Ongoing Maintenance

### Daily:
- Check dashboard for any red/yellow status
- Verify extraction rate stays ≥95%

### Weekly:
- Review 7-day trends for degradation
- Check category breakdowns for issues
- Monitor OpenAI API usage/costs

### Monthly:
- Analyze 30-day trends
- Optimize slow categories
- Update extraction logic if needed

## Troubleshooting Commands

```bash
# View recent logs
netlify logs --prod

# Check build logs
netlify build --dry

# Test locally with production env
netlify dev --context production

# Clear cache and rebuild
netlify build --clear-cache

# Force redeploy
git commit --allow-empty -m "Force redeploy"
git push origin main
```

## Emergency Rollback

If extraction rate drops critically:

```bash
# Rollback to previous deployment
netlify rollback

# Or rollback to specific deploy
netlify rollback --deploy-id <deploy-id>
```

## Contact & Support

- Dashboard: `/admin/extraction-monitor`
- API Stats: `/api/admin/extraction-stats`
- Logs: Netlify dashboard > Functions tab
- Database: Supabase dashboard > Logs

---

## Quick Start Checklist

1. [ ] Set OPENAI_API_KEY in Netlify
2. [ ] Deploy to production
3. [ ] Access monitoring dashboard
4. [ ] Run Test Case 1 (create tasting)
5. [ ] Verify 100% extraction rate
6. [ ] Monitor for 24 hours
7. [ ] Celebrate! 🎉