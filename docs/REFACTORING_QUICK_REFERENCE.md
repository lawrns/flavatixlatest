# Code Quality Refactoring - Quick Reference

## Overview

This refactoring improves code quality through:
- Component decomposition (1,000+ LOC → focused <300 LOC components)
- Type safety (eliminated `any` types)
- Repository pattern (better testability)
- Typed error handling

## 🆕 New Utilities

### 1. Error Handling

```typescript
import { DatabaseError, ValidationError, getUserMessage } from '@/lib/errors';

// Throw typed errors
throw new DatabaseError('Failed to load items', { tastingId });

// Handle errors
catch (error) {
  const message = getUserMessage(error);
  toast.error(message);
  logger.error('Module', 'Operation failed', error);
}
```

### 2. Repository Pattern

```typescript
import { TastingRepositoryFactory } from '@/lib/repository/TastingRepository';

// Create repository
const repository = TastingRepositoryFactory.createTastingItemRepository(supabase);

// Use repository methods
const items = await repository.findByTastingId(tastingId);
const item = await repository.create({ tasting_id: tastingId, item_name: 'Item 1' });
await repository.update(itemId, { overall_score: 85 });
await repository.delete(itemId);
```

## 📦 New Components

### QuickTastingSession Sub-Components

```typescript
// Setup phase
import { TastingSetupPhase } from '@/components/quick-tasting/TastingSetupPhase';

// Active tasting phase
import { TastingActivePhase } from '@/components/quick-tasting/TastingActivePhase';

// Item management
import { useItemManager } from '@/components/quick-tasting/ItemManager';

// Permissions
import { usePermissionsGuard } from '@/components/quick-tasting/PermissionsGuard';
```

### ReviewForm Sub-Components

```typescript
// Item information section
import { ReviewFormItemInfo } from '@/components/review/ReviewFormItemInfo';

// Characteristics section
import { ReviewFormCharacteristics } from '@/components/review/ReviewFormCharacteristics';

// Complete refactored form
import ReviewForm from '@/components/review/ReviewFormRefactored';
```

## 🔧 Updated Types

### Database Types (No More `any`!)

```typescript
// Before
flavor_scores: any | null

// After
flavor_scores: Record<string, number> | null

// Before
molecules: any

// After
molecules: Array<{ name: string; cas?: string; concentration?: string }>
```

## 💡 Best Practices

### 1. Use Repository Pattern for Database Operations

❌ **Don't:**
```typescript
const { data } = await supabase.from('quick_tastings').select('*');
```

✅ **Do:**
```typescript
const repository = TastingRepositoryFactory.createQuickTastingRepository(supabase);
const tastings = await repository.findAll();
```

### 2. Use Typed Errors

❌ **Don't:**
```typescript
throw new Error('Database error');
```

✅ **Do:**
```typescript
throw new DatabaseError('Failed to fetch tastings', { userId });
```

### 3. Break Down Large Components

❌ **Don't:**
```typescript
// 1,000+ LOC component
const MyComponent = () => {
  // Too much logic here
};
```

✅ **Do:**
```typescript
// Use composition
const MyComponent = () => (
  <>
    <SetupPhase />
    <ActivePhase />
    <ItemManager />
  </>
);
```

### 4. Avoid `any` Types

❌ **Don't:**
```typescript
const data: any = {};
```

✅ **Do:**
```typescript
const data: Record<string, unknown> = {};
// Or better: define explicit interface
interface MyData {
  id: string;
  name: string;
}
const data: MyData = { id: '1', name: 'Item' };
```

## 📁 File Locations

### New Infrastructure
- `/lib/errors.ts` - Error classes
- `/lib/repository/BaseRepository.ts` - Base repository
- `/lib/repository/TastingRepository.ts` - Tasting repositories

### New Components
- `/components/quick-tasting/TastingSetupPhase.tsx`
- `/components/quick-tasting/TastingActivePhase.tsx`
- `/components/quick-tasting/ItemManager.tsx`
- `/components/quick-tasting/PermissionsGuard.tsx`
- `/components/review/ReviewFormItemInfo.tsx`
- `/components/review/ReviewFormCharacteristics.tsx`
- `/components/review/ReviewFormRefactored.tsx`

### Documentation
- `/docs/CODE_QUALITY_REFACTORING_SUMMARY.md` - Full details
- `/docs/REFACTORING_QUICK_REFERENCE.md` - This file

## 🚀 Migration Checklist

When updating existing code:

- [ ] Replace direct Supabase calls with repository methods
- [ ] Replace generic `Error` with typed errors
- [ ] Add proper TypeScript types (no `any`)
- [ ] Break down components >300 LOC
- [ ] Use logger instead of console.log
- [ ] Handle errors with typed error checking
- [ ] Update tests to mock repositories

## ❓ FAQs

**Q: Do I need to update existing components immediately?**
A: No. The refactored components are backward compatible. Update gradually.

**Q: What about tests?**
A: Repository pattern makes testing easier with dependency injection. Mock the repository instead of Supabase.

**Q: Can I still use the old QuickTastingSession component?**
A: Yes! It's unchanged. The sub-components are for new development or future refactoring.

**Q: How do I add new error types?**
A: Extend `AppError` in `/lib/errors.ts` with your specific error class.

**Q: Where should business logic go?**
A: Business logic → Services/Repositories. Components → UI only.

## 📊 Metrics

- **Components refactored:** 2 (QuickTastingSession, ReviewForm)
- **Sub-components created:** 7
- **LOC per component:** <300 (down from 1,000+)
- **Any types eliminated:** Critical database schemas cleaned
- **New utilities:** Error handling, Repository pattern
- **Linter status:** ✅ Clean (0 errors)
- **Tests status:** ✅ No regressions

---

For complete details, see: `/docs/CODE_QUALITY_REFACTORING_SUMMARY.md`
