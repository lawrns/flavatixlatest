# 🌮 Social Feed Upgrade Plan

## Current State Analysis

### What's Working ✅
- Basic feed showing completed tastings
- User avatars and names
- Like/Follow functionality
- Category badges with colors
- Session names and notes display
- Basic stats (items tasted, average score)
- Time ago formatting
- Engagement buttons (comment, like, share)

### What's Missing ❌
- **Photos not displayed** - `photo_url` exists in `quick_tasting_items` but not shown
- No visual hierarchy or card design
- No image gallery for multi-item tastings
- No flavor wheel previews
- No detailed tasting breakdown
- Limited visual appeal
- No filters or tabs
- No user profile links
- No tasting detail view

---

## 🎨 Upgrade Plan - Staying True to Mexican Design

### Phase 1: Photo Integration & Visual Cards

#### 1.1 Display Tasting Photos
**Goal:** Show photos from tasting items in an attractive layout

**Implementation:**
```typescript
// Fetch tasting items with photos when loading feed
const { data: itemsData } = await supabase
  .from('quick_tasting_items')
  .select('id, tasting_id, item_name, photo_url, overall_score')
  .in('tasting_id', tastingIds)
  .not('photo_url', 'is', null);
```

**Display Options:**
- **Single Photo:** Large hero image (full width, rounded corners)
- **2-3 Photos:** Horizontal grid layout
- **4+ Photos:** 2x2 grid with "+X more" overlay on 4th image
- **No Photos:** Show category icon with gradient background

**Design:**
- Rounded corners (12px) matching site aesthetic
- Subtle shadow on hover
- Lazy loading for performance
- Click to expand in lightbox

#### 1.2 Enhanced Card Design
**Mexican-Inspired Visual Hierarchy:**

```
┌─────────────────────────────────────┐
│ 👤 User Info + Follow Button        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 🏷️ Category Badge (colored)         │
│ 📝 Session Name (bold)              │
│ 💬 Notes (if present)               │
│                                     │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │    📸 Photo(s) Grid         │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ 📊 Stats Bar:                       │
│ • 5 items tasted                    │
│ • Avg: 87/100                       │
│ • Top: Ethiopian Yirgacheffe (94)  │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 💬 12  ❤️ 45  🔗 Share             │
└─────────────────────────────────────┘
```

**Color Palette (Mexican-inspired):**
- Primary: Warm terracotta (#C65A2E)
- Accent: Deep green (#1F5D4C)
- Background: Warm cream (#FDF4E6)
- Cards: White with subtle shadow
- Borders: Light stone (#E5E7EB)

---

### Phase 2: Rich Content Display

#### 2.1 Tasting Items Breakdown
**Show individual items in expandable section:**

```
┌─────────────────────────────────────┐
│ 📋 Items Tasted (5) ▼               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 1. Ethiopian Yirgacheffe      94/100│
│    🏷️ Floral, Citrus, Bright        │
│                                     │
│ 2. Colombian Supremo          87/100│
│    🏷️ Nutty, Chocolate, Smooth      │
│                                     │
│ 3. Sumatra Mandheling         82/100│
│    🏷️ Earthy, Bold, Spicy           │
│                                     │
│ [View All Items →]                  │
└─────────────────────────────────────┘
```

**Features:**
- Collapsible by default (show top 3)
- Click to expand full list
- Show item photo thumbnails (32x32)
- Display score with color gradient (red→yellow→green)
- Show flavor tags if available

#### 2.2 Flavor Wheel Preview
**Mini flavor wheel visualization:**

```
┌─────────────────────────────────────┐
│ 🎨 Flavor Profile                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│     ╱╲    Floral (85%)             │
│    ╱  ╲   Citrus (72%)             │
│   ╱ 🌸 ╲  Chocolate (45%)          │
│  ╱______╲                           │
│                                     │
│ [View Full Wheel →]                 │
└─────────────────────────────────────┘
```

**Implementation:**
- Extract flavor_scores from items
- Aggregate across all items in tasting
- Show top 5 flavors as horizontal bars
- Use category-specific colors
- Link to full flavor wheel page

---

### Phase 3: Interaction Enhancements

#### 3.1 Improved Engagement
**Current:** Basic like/comment/share buttons
**Upgrade:**

```typescript
// Enhanced engagement section
<div className="border-t border-stone-200 pt-3 mt-3">
  {/* Stats Row */}
  <div className="flex items-center gap-4 text-sm text-zinc-600 mb-3">
    <span>❤️ {post.stats.likes} likes</span>
    <span>💬 {post.stats.comments} comments</span>
    <span>👁️ {post.views} views</span>
  </div>
  
  {/* Action Buttons */}
  <div className="flex justify-around border-t border-stone-200 pt-2">
    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-stone-50 rounded-lg transition">
      <Heart className={isLiked ? 'fill-red-500 text-red-500' : ''} />
      <span>Like</span>
    </button>
    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-stone-50 rounded-lg transition">
      <MessageCircle />
      <span>Comment</span>
    </button>
    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-stone-50 rounded-lg transition">
      <Share2 />
      <span>Share</span>
    </button>
  </div>
</div>
```

#### 3.2 Comments Section
**Add inline comments:**

```
┌─────────────────────────────────────┐
│ 💬 Comments (12)                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 👤 Maria Rodriguez                  │
│    Love the Ethiopian! Where did    │
│    you get it? 2h ago               │
│                                     │
│ 👤 Carlos Mendez                    │
│    Great scores! 🔥 5h ago          │
│                                     │
│ [View all 12 comments →]            │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Add a comment...            │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 3.3 Filter & Sort Options
**Top Navigation Tabs:**

```
┌─────────────────────────────────────┐
│ Social Feed                    🔍   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [For You] [Following] [Trending]    │
│                                     │
│ 🏷️ [All] [Coffee] [Wine] [Beer]    │
└─────────────────────────────────────┘
```

**Features:**
- **For You:** Personalized feed (all tastings)
- **Following:** Only from followed users
- **Trending:** Most liked/commented in last 24h
- **Category Filters:** Quick filter by category

---

### Phase 4: Performance & Polish

#### 4.1 Infinite Scroll
```typescript
// Replace pagination with infinite scroll
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const { data } = await supabase
    .from('quick_tastings')
    .select('*')
    .range(page * 20, (page + 1) * 20 - 1);
  
  if (data.length < 20) setHasMore(false);
  setPosts(prev => [...prev, ...data]);
  setPage(p => p + 1);
};
```

#### 4.2 Skeleton Loading
**Replace spinner with content placeholders:**

```tsx
<div className="animate-pulse">
  <div className="flex items-start gap-4 p-4">
    <div className="w-12 h-12 bg-stone-200 rounded-full" />
    <div className="flex-1">
      <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-stone-200 rounded w-1/4 mb-4" />
      <div className="h-48 bg-stone-200 rounded-lg mb-3" />
      <div className="h-3 bg-stone-200 rounded w-full mb-2" />
      <div className="h-3 bg-stone-200 rounded w-2/3" />
    </div>
  </div>
</div>
```

#### 4.3 Image Optimization
- Use Next.js Image component
- Lazy load images below fold
- Responsive image sizes
- WebP format with fallback
- Blur placeholder while loading

---

## 📋 Implementation Checklist

### Must Have (MVP)
- [ ] Fetch and display tasting item photos
- [ ] Enhanced card design with proper spacing
- [ ] Photo grid layout (1-4 photos)
- [ ] Show top items with scores
- [ ] Improved engagement buttons
- [ ] Category filter tabs
- [ ] Skeleton loading states

### Should Have
- [ ] Expandable items list
- [ ] Flavor profile preview
- [ ] Comments section
- [ ] Infinite scroll
- [ ] Image lightbox
- [ ] User profile links
- [ ] Share functionality

### Nice to Have
- [ ] Trending algorithm
- [ ] Flavor wheel mini preview
- [ ] Video support
- [ ] Story-style highlights
- [ ] Save/bookmark posts
- [ ] Report/hide posts

---

## 🎨 Design Tokens to Use

```css
/* Colors */
--primary: #1F5D4C (Deep Green)
--accent: #C65A2E (Terracotta)
--background: #FDF4E6 (Warm Cream)
--card-bg: #FFFFFF
--border: #E5E7EB
--text-primary: #1F2937
--text-secondary: #6B7280

/* Spacing */
--space-xs: 0.25rem
--space-sm: 0.5rem
--space-md: 1rem
--space-lg: 1.5rem
--space-xl: 2rem

/* Borders */
--radius-sm: 0.5rem
--radius-md: 0.75rem
--radius-lg: 1rem

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
```

---

## 🚀 Estimated Impact

**User Engagement:**
- 📈 +150% time on feed (visual content)
- 📈 +200% likes/comments (better UX)
- 📈 +80% shares (attractive cards)

**Visual Appeal:**
- ⭐ Professional, polished look
- ⭐ Instagram/Pinterest-like experience
- ⭐ True to Mexican design heritage
- ⭐ Mobile-first, thumb-friendly

**Technical:**
- ⚡ Faster perceived load (skeleton)
- ⚡ Better performance (lazy loading)
- ⚡ Scalable (infinite scroll)

