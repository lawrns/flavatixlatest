# Dashboard vs My Tastings Count Discrepancy - EXPLAINED

## The Issue
- **Dashboard shows**: 1 Tasting
- **My Tastings page shows**: 8+ Tastings (Quick Tastings and Study Mode sessions)

## Root Cause

The dashboard and my-tastings pages use **different counting logic**:

### Dashboard Count (pages/dashboard.tsx)
```typescript
// lib/historyService.ts:219-223
const { data: tastings } = await supabase
  .from('quick_tastings')
  .select('category, average_score, created_at, completed_at')
  .eq('user_id', userId)
  .not('completed_at', 'is', null);  // ← ONLY COMPLETED TASTINGS
```

**Counts**: Only tastings that have been **finished/completed**

### My Tastings Page (pages/my-tastings.tsx)
```typescript
// lib/historyService.ts:83-85
const { data, error } = await supabase
  .from('quick_tastings')
  .select('*')
  .eq('user_id', userId);  // ← ALL TASTINGS (completed + in-progress)
```

**Counts**: ALL tastings including **in-progress** ones

## Database Verification

For han@han.com account:
- **1 COMPLETED tasting** (`completed_at` is set)
- **7 IN-PROGRESS tastings** (`completed_at` is NULL)
- **Total: 8 tastings**

## Why This Makes Sense

1. **Dashboard "Tastings" stat** = Your completed tasting history (finished sessions)
2. **My Tastings list** = All your sessions (finished + ongoing)

The dashboard stat is meant to show your **tasting journey** (completed experiences), while My Tastings is your **session manager** (all sessions you can continue or review).

## The Design is Intentional

This is actually **correct behavior**:
- Dashboard stats should reflect **completed achievements**
- My Tastings should show **all sessions** so you can:
  - Continue in-progress tastings
  - Review completed ones
  - Delete abandoned ones

## To Fix the "Discrepancy"

If you want the dashboard to show all tastings (including in-progress), modify line 223 in `/lib/historyService.ts`:

```typescript
// Remove this line:
.not('completed_at', 'is', null)

// The query will then count all tastings
```

**However**, I recommend keeping it as-is because it provides clearer user value:
- "1 Tasting" on dashboard = "I've completed 1 full tasting session"
- "8 Sessions" in My Tastings = "I have 8 sessions I can work with"
