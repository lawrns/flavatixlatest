# Flavatix Database Documentation

## Table of Contents
1. [Overview](#overview)
2. [Schema Design](#schema-design)
3. [Core Tables](#core-tables)
4. [Relationships](#relationships)
5. [RLS Policies](#rls-policies)
6. [Indexes](#indexes)
7. [Migration Strategy](#migration-strategy)

---

## Overview

Flavatix uses PostgreSQL (via Supabase) with Row Level Security (RLS) for authorization. All tables have RLS enabled, ensuring users can only access their own data unless explicitly shared.

**Database Version:** PostgreSQL 15.x
**Hosted by:** Supabase
**Schema:** `public`

### Design Principles

1. **Security First:** RLS policies enforce access control at database level
2. **Normalization:** Data normalized to 3NF to reduce redundancy
3. **Performance:** Strategic indexes on frequently queried columns
4. **Flexibility:** JSONB columns for extensible data structures
5. **Audit Trail:** `created_at` and `updated_at` on all tables

---

## Schema Design

### Entity-Relationship Diagram

```
┌─────────────┐
│ auth.users  │ (Supabase Auth)
└──────┬──────┘
       │ 1:1
       ▼
┌─────────────┐
│  profiles   │
└──────┬──────┘
       │ 1:N
       ├─────────────┬──────────────┬───────────────┐
       ▼             ▼              ▼               ▼
┌───────────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐
│quick_     │  │prose_    │  │quick_      │  │flavor_    │
│tastings   │  │reviews   │  │reviews     │  │wheels     │
└─────┬─────┘  └──────────┘  └────────────┘  └─────┬─────┘
      │ 1:N                                         │ 1:N
      ▼                                             ▼
┌──────────────┐                            ┌──────────────┐
│quick_tasting_│                            │flavor_       │
│items         │                            │descriptors   │
└──────────────┘                            └──────────────┘

┌──────────────┐
│study_        │
│sessions      │
└──────┬───────┘
       │ 1:N
       ├──────────┬─────────────┬──────────────┐
       ▼          ▼             ▼              ▼
┌─────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐
│study_   │ │study_    │ │study_       │ │study_    │
│items    │ │categories│ │participants │ │responses │
└─────────┘ └──────────┘ └─────────────┘ └──────────┘
```

---

## Core Tables

### profiles

User profiles (1:1 with auth.users).

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  preferred_category TEXT,
  tastings_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_profiles_username` on `username` (for lookups)
- Primary key on `user_id`

**RLS Policies:**
- Everyone can view profiles (public read)
- Users can only update their own profile

---

### quick_tastings

Tasting sessions (quick, study, or competition mode).

```sql
CREATE TABLE quick_tastings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  session_name TEXT,
  notes TEXT,
  mode TEXT NOT NULL DEFAULT 'quick' CHECK (mode IN ('quick', 'study', 'competition')),
  study_approach TEXT CHECK (study_approach IN ('predefined', 'exploratory')),
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  average_score NUMERIC,
  rank_participants BOOLEAN DEFAULT false,
  is_blind_items BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_tastings_user_created` on `(user_id, created_at DESC)`
- `idx_tastings_category` on `category`
- `idx_tastings_mode` on `mode`

**RLS Policies:**
- Users can view/insert/update/delete only their own tastings

---

### quick_tasting_items

Individual items within a tasting session.

```sql
CREATE TABLE quick_tasting_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES quick_tastings(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_order INTEGER DEFAULT 0,
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 100),
  aroma TEXT,
  flavor TEXT,
  photo_url TEXT,
  notes TEXT,
  flavor_scores JSONB,
  study_category_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_items_tasting` on `tasting_id`
- `idx_items_order` on `(tasting_id, item_order)`

**RLS Policies:**
- Users can access items for tastings they own

**JSONB Structure:**

```json
// flavor_scores
{
  "sweetness": 75,
  "acidity": 60,
  "bitterness": 40
}

// study_category_data
{
  "category_id_1": {
    "scale_value": 8,
    "text_value": "Bright and citrusy"
  }
}
```

---

### flavor_descriptors

Extracted flavor descriptors from tastings/reviews.

```sql
CREATE TABLE flavor_descriptors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('quick_tasting', 'quick_review', 'prose_review')),
  source_id UUID NOT NULL,
  descriptor_text TEXT NOT NULL,
  descriptor_type TEXT NOT NULL CHECK (descriptor_type IN ('aroma', 'flavor', 'texture', 'metaphor')),
  category TEXT,
  subcategory TEXT,
  confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  item_name TEXT,
  item_category TEXT,
  ai_extracted BOOLEAN DEFAULT false,
  extraction_model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_type, source_id, descriptor_text, descriptor_type)
);
```

**Indexes:**
- `idx_descriptors_user_created` on `(user_id, created_at DESC)`
- `idx_descriptors_source` on `(source_type, source_id)`
- `idx_descriptors_text_search` (GIN) on `to_tsvector('english', descriptor_text)`

---

### flavor_wheels

Generated flavor wheel visualizations.

```sql
CREATE TABLE flavor_wheels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wheel_type TEXT NOT NULL CHECK (wheel_type IN ('aroma', 'flavor', 'combined', 'metaphor')),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('personal', 'universal', 'item', 'category', 'tasting')),
  scope_filter JSONB DEFAULT '{}',
  wheel_data JSONB NOT NULL,
  total_descriptors INTEGER DEFAULT 0,
  unique_descriptors INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_wheels_user_type_scope` on `(user_id, wheel_type, scope_type)`
- `idx_wheels_generated` on `generated_at DESC`

**wheel_data Structure:**

```json
{
  "categories": [
    {
      "name": "Fruity",
      "color": "#E4572E",
      "descriptors": [
        {
          "text": "Cherry",
          "count": 5,
          "intensity": 0.8,
          "sources": ["tasting-1", "tasting-2"]
        }
      ]
    }
  ]
}
```

---

### study_sessions

Collaborative study sessions with custom categories.

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_category TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
  session_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_study_sessions_code` on `session_code`
- `idx_study_sessions_host` on `host_id`

**RLS Policies:**
- Hosts can manage their sessions
- Participants can view sessions they've joined

---

### study_categories

Custom evaluation categories for study sessions.

```sql
CREATE TABLE study_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  has_text BOOLEAN DEFAULT false,
  has_scale BOOLEAN DEFAULT false,
  has_boolean BOOLEAN DEFAULT false,
  scale_max INTEGER DEFAULT 100 CHECK (scale_max BETWEEN 5 AND 100),
  rank_in_summary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);
```

**Indexes:**
- `idx_categories_session` on `session_id`
- `idx_categories_sort` on `(session_id, sort_order)`

---

### study_responses

Participant responses for study items.

```sql
CREATE TABLE study_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES study_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES study_participants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES study_categories(id) ON DELETE CASCADE,
  text_value TEXT,
  scale_value INTEGER CHECK (scale_value BETWEEN 0 AND 100),
  bool_value BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_responses_session_item` on `(session_id, item_id, participant_id, category_id)`

---

## Relationships

### One-to-One

```sql
auth.users (1) ←→ (1) profiles
```

**Explanation:** Each auth user has exactly one profile.

---

### One-to-Many

```sql
profiles (1) →  (N) quick_tastings
profiles (1) →  (N) quick_reviews
profiles (1) →  (N) prose_reviews
profiles (1) →  (N) flavor_wheels
profiles (1) →  (N) flavor_descriptors

quick_tastings (1) →  (N) quick_tasting_items
study_sessions (1) →  (N) study_items
study_sessions (1) →  (N) study_categories
study_sessions (1) →  (N) study_participants
```

---

### Many-to-Many

```sql
users (N) ←→ (N) users (via user_follows)
  - follower_id, following_id

users (N) ←→ (N) tastings (via tasting_likes)
  - user_id, tasting_id
```

---

## RLS Policies

### Policy Pattern: Users Own Their Data

**Example: quick_tastings**

```sql
-- SELECT policy
CREATE POLICY "Users can view own tastings"
ON quick_tastings FOR SELECT
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own tastings"
ON quick_tastings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own tastings"
ON quick_tastings FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own tastings"
ON quick_tastings FOR DELETE
USING (auth.uid() = user_id);
```

---

### Policy Pattern: Public Read, Own Write

**Example: profiles**

```sql
-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

### Policy Pattern: Collaborative Access

**Example: study_sessions**

```sql
-- Users can view sessions they host OR participate in
CREATE POLICY "Users can view sessions they access"
ON study_sessions FOR SELECT
USING (
  host_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM study_participants sp
    WHERE sp.session_id = study_sessions.id
    AND sp.user_id = auth.uid()
  )
);
```

---

## Indexes

### Index Strategy

**Primary Indexes:**
- All primary keys auto-indexed
- Foreign keys indexed for joins

**Query Optimization:**
```sql
-- User's tastings (most common query)
CREATE INDEX idx_tastings_user_created
ON quick_tastings(user_id, created_at DESC);

-- Search functionality
CREATE INDEX idx_descriptors_text_search
ON flavor_descriptors USING gin(to_tsvector('english', descriptor_text));

-- JSONB queries
CREATE INDEX idx_items_study_data
ON quick_tasting_items USING gin(study_category_data);
```

**Partial Indexes:**
```sql
-- Only index incomplete tastings
CREATE INDEX idx_tastings_incomplete
ON quick_tastings(created_at)
WHERE completed_at IS NULL;
```

---

## Migration Strategy

### Running Migrations

**Local Development:**
```bash
# Apply migration
node migrations/001_add_column.js

# Rollback
node migrations/001_add_column.js --rollback
```

**Production:**
1. Test migration in staging
2. Backup database
3. Apply during low-traffic window
4. Monitor for errors
5. Keep rollback script ready

---

### Migration Template

```javascript
// migrations/002_add_field.js
const { createClient } = require('@supabase/supabase-js');

async function up(supabase) {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE quick_tastings
      ADD COLUMN IF NOT EXISTS new_field TEXT;
    `
  });

  if (error) throw error;
  console.log('Migration 002: ✅ Complete');
}

async function down(supabase) {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE quick_tastings
      DROP COLUMN IF EXISTS new_field;
    `
  });

  if (error) throw error;
  console.log('Rollback 002: ✅ Complete');
}

// Run migration
if (require.main === module) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Service role key
  );

  const isRollback = process.argv.includes('--rollback');

  (isRollback ? down : up)(supabase)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
```

---

## Query Best Practices

### 1. Select Only Needed Columns

```typescript
// ❌ Bad: Fetches all columns
const { data } = await supabase
  .from('quick_tastings')
  .select('*');

// ✅ Good: Only needed columns
const { data } = await supabase
  .from('quick_tastings')
  .select('id, session_name, created_at');
```

---

### 2. Use Pagination

```typescript
// ✅ Paginated query
const { data } = await supabase
  .from('quick_tastings')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 19); // First 20 items
```

---

### 3. Leverage Indexes

```typescript
// ✅ Uses idx_tastings_user_created
const { data } = await supabase
  .from('quick_tastings')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

### 4. JSONB Queries

```typescript
// Query nested JSONB
const { data } = await supabase
  .from('quick_tasting_items')
  .select('*')
  .filter('flavor_scores->sweetness', 'gt', 70);
```

---

## Backup Strategy

**Automated Backups:**
- Supabase auto-backups daily
- Point-in-time recovery available
- Retention: 7 days (free tier), 30 days (pro)

**Manual Backup:**
```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres -s dbname > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -a dbname > data.sql

# Full backup
pg_dump -h db.xxx.supabase.co -U postgres dbname > full_backup.sql
```

---

**Last Updated:** January 2026
**Schema Version:** 1.0
**Maintainer:** Development Team
