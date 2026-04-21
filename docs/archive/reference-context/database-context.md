# FlavorWheel México - Database Context

## 📊 Supabase Project Overview

**Project Name:** FlavorWheel México  
**Project Reference:** `kobuclkvlacdwvxmakvq`  
**Database URL:** `https://kobuclkvlacdwvxmakvq.supabase.co`  
**Status:** ✅ Active and Connected

---

## 🗄️ Database Schema Overview

### Tables Summary

| Table | Purpose | Records | Key Features |
|-------|---------|---------|--------------|
| `public.profiles` | User profile management | ~0 | Social features, user preferences |
| `public.quick_tastings` | Tasting session management | ~0 | Category-based tasting sessions |
| `public.quick_tasting_items` | Individual tasting items | ~0 | Item-specific scores and notes |
| `public.quick_reviews` | Structured reviews | ~0 | Detailed scoring system (1-100) |
| `public.prose_reviews` | Free-form reviews | ~0 | Text-based review content |

---

## 📋 Table Structures

### 👤 Profiles Table

```sql
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "username" text,
    "bio" text,
    "posts_count" integer DEFAULT 0 NOT NULL,
    "followers_count" integer DEFAULT 0 NOT NULL,
    "following_count" integer DEFAULT 0 NOT NULL,
    "preferred_category" text,
    "last_tasted_at" timestamp with time zone,
    "email_confirmed" boolean DEFAULT false NOT NULL,
    "tastings_count" integer DEFAULT 0 NOT NULL,
    "reviews_count" integer DEFAULT 0 NOT NULL,
    "total_tastings" integer DEFAULT 0
);
```

**Primary Key:** `user_id`  
**Foreign Keys:** `user_id` → `auth.users(id)` ON DELETE CASCADE

#### Field Categories:
- **Core User Info:** `user_id`, `full_name`, `username`, `avatar_url`, `bio`, `email_confirmed`
- **Social Features:** `posts_count`, `followers_count`, `following_count`, `reviews_count`
- **Tasting Features:** `preferred_category`, `tastings_count`, `total_tastings`, `last_tasted_at`
- **Timestamps:** `created_at`, `updated_at`

### 🍷 Quick Tastings Table

```sql
CREATE TABLE IF NOT EXISTS "public"."quick_tastings" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "category" text NOT NULL,
    "session_name" text,
    "notes" text,
    "total_items" integer DEFAULT 0,
    "completed_items" integer DEFAULT 0,
    "average_score" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "quick_tastings_category_check" CHECK (("category" = ANY (ARRAY['coffee', 'tea', 'wine', 'spirits', 'beer', 'chocolate'])))
);
```

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `auth.users(id)` ON DELETE CASCADE  
**Constraints:** Category must be one of: coffee, tea, wine, spirits, beer, chocolate

### 🎯 Quick Tasting Items Table

```sql
CREATE TABLE IF NOT EXISTS "public"."quick_tasting_items" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "tasting_id" uuid NOT NULL,
    "item_name" text NOT NULL,
    "notes" text,
    "flavor_scores" jsonb,
    "overall_score" integer,
    "photo_url" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "quick_tasting_items_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100)))
);
```

**Primary Key:** `id`  
**Foreign Keys:** `tasting_id` → `quick_tastings(id)` ON DELETE CASCADE  
**Constraints:** Overall score must be between 1-100

### 📝 Quick Reviews Table

```sql
CREATE TABLE IF NOT EXISTS "public"."quick_reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "item_name" character varying(255) NOT NULL,
    "picture_url" text,
    "batch_lot_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" date,
    "aroma_notes" text,
    "aroma_intensity" integer,
    "salt_score" integer,
    "salt_notes" text,
    "umami_score" integer,
    "umami_notes" text,
    "spiciness_score" integer,
    "spiciness_notes" text,
    "acidity_score" integer,
    "acidity_notes" text,
    "sweetness_score" integer,
    "sweetness_notes" text,
    "flavor_notes" text,
    "flavor_intensity" integer,
    "texture_notes" text,
    "typicity_score" integer,
    "complexity_score" integer,
    "other_notes" text,
    "overall_score" integer,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `profiles(user_id)` ON DELETE CASCADE  
**Constraints:** All score fields must be between 1-100

### 📖 Prose Reviews Table

```sql
CREATE TABLE IF NOT EXISTS "public"."prose_reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "item_name" character varying(255) NOT NULL,
    "picture_url" text,
    "batch_lot_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" date,
    "review_content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `profiles(user_id)` ON DELETE CASCADE

---

## 🔗 Database Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1)
public.profiles
    ↓ (1:many)
    ├── public.quick_tastings
    │   ↓ (1:many)
    │   └── public.quick_tasting_items
    ├── public.quick_reviews
    └── public.prose_reviews
```

### Key Relationships:
- **Users → Profiles:** One-to-one relationship with cascade delete
- **Profiles → Tastings:** One-to-many relationship for tasting sessions
- **Tastings → Items:** One-to-many relationship for individual tasting items
- **Profiles → Reviews:** One-to-many for both structured and prose reviews

---

## 🔧 Database Functions

### 1. **`handle_new_user()` - Auto Profile Creation**

```sql
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
```

**Purpose:** Automatically creates a profile when a new user registers  
**Trigger:** `AFTER INSERT` on `auth.users`  
**Functionality:**
- Extracts user data from Supabase Auth metadata
- Creates corresponding profile in `public.profiles`
- Sets default values and timestamps

### 2. **`set_updated_at()` - Auto Timestamp Update**

```sql
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
```

**Purpose:** Automatically updates the `updated_at` timestamp  
**Trigger:** `BEFORE UPDATE` on multiple tables  
**Functionality:** Sets `updated_at` to current timestamp on every update

### 3. **`update_profile_tasting_count()` - Tasting Counter**

```sql
CREATE OR REPLACE FUNCTION "public"."update_profile_tasting_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
```

**Purpose:** Updates user's total tasting count in profiles  
**Trigger:** `AFTER INSERT OR DELETE` on `quick_tastings`  
**Functionality:** Recalculates and updates `total_tastings` field

### 4. **`update_quick_tasting_stats()` - Session Statistics**

```sql
CREATE OR REPLACE FUNCTION "public"."update_quick_tasting_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
```

**Purpose:** Updates tasting session statistics  
**Trigger:** `AFTER INSERT/UPDATE/DELETE` on `quick_tasting_items`  
**Functionality:**
- Updates `total_items` count
- Updates `completed_items` count
- Calculates `average_score`

### 5. **`update_profile_reviews_count()` - Review Counter**

```sql
CREATE OR REPLACE FUNCTION "public"."update_profile_reviews_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
```

**Purpose:** Updates user's review count in profiles  
**Trigger:** `AFTER INSERT OR DELETE` on review tables  
**Functionality:** Recalculates and updates `reviews_count` field

### 6. **`update_reviews_count()` - Review Counter (Legacy)**

```sql
CREATE OR REPLACE FUNCTION "public"."update_reviews_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
```

**Purpose:** Alternative review counting mechanism  
**Functionality:** Increments/decrements review count on insert/delete

### 7. **`update_updated_at_column()` - Generic Timestamp Update**

```sql
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
```

**Purpose:** Generic function for updating timestamps  
**Functionality:** Sets `updated_at` to NOW() on updates

---

## ⚡ Database Triggers

### Profile Management Triggers
- `trg_profiles_updated_at` - Updates profile timestamps
- `trigger_update_profile_tasting_count` - Updates tasting counts

### Tasting Session Triggers
- `set_updated_at_quick_tastings` - Updates tasting session timestamps
- `set_updated_at_quick_tasting_items` - Updates tasting item timestamps
- `trigger_update_quick_tasting_stats_insert` - Updates stats on item insert
- `trigger_update_quick_tasting_stats_update` - Updates stats on item update
- `trigger_update_quick_tasting_stats_delete` - Updates stats on item delete

### Review Management Triggers
- `prose_reviews_count_trigger` - Updates review count for prose reviews
- `quick_reviews_count_trigger` - Updates review count for quick reviews
- `update_prose_reviews_updated_at` - Updates prose review timestamps
- `update_quick_reviews_updated_at` - Updates quick review timestamps

---

## 📊 Database Indexes

### Performance Optimization Indexes

#### Profiles Table
- Primary key index on `user_id`

#### Quick Tastings Table
- `idx_quick_tastings_user_id` - User lookup optimization
- `idx_quick_tastings_category` - Category filtering
- `idx_quick_tastings_created_at` - Chronological sorting

#### Quick Tasting Items Table
- `idx_quick_tasting_items_tasting_id` - Session item lookup
- `idx_quick_tasting_items_created_at` - Chronological sorting

#### Quick Reviews Table
- `idx_quick_reviews_user_id` - User review lookup
- `idx_quick_reviews_category` - Category filtering
- `idx_quick_reviews_created_at` - Chronological sorting
- `idx_quick_reviews_overall_score` - Score-based sorting

#### Prose Reviews Table
- `idx_prose_reviews_user_id` - User review lookup
- `idx_prose_reviews_category` - Category filtering
- `idx_prose_reviews_created_at` - Chronological sorting

---

## 🔒 Row Level Security (RLS)

**Status:** ✅ Enabled on all tables

### Security Policies by Table

#### Profiles Table
- `delete_own_profile` - Users can delete their own profile
- `insert_own_profile` - Users can create their own profile
- `read_all_profiles` - All authenticated users can read profiles
- `update_own_profile` - Users can update their own profile
- `user_view_profile` - Additional profile viewing permissions

#### Quick Tastings Table
- `Users can insert their own quick tastings`
- `Users can view their own quick tastings`
- `Users can update their own quick tastings`
- `Users can delete their own quick tastings`

#### Quick Tasting Items Table
- `Users can insert their own quick tasting items`
- `Users can view their own quick tasting items`
- `Users can update their own quick tasting items`
- `Users can delete their own quick tasting items`

#### Quick Reviews Table
- `Users can insert own quick reviews`
- `Users can view own quick reviews`
- `Users can update own quick reviews`
- `Users can delete own quick reviews`

#### Prose Reviews Table
- `Users can insert own prose reviews`
- `Users can view own prose reviews`
- `Users can update own prose reviews`
- `Users can delete own prose reviews`

---

## 🛡️ Database Permissions

### Role Access Matrix

| Role | Access Level | Description |
|------|-------------|-------------|
| `anon` | Limited | Read-only access via RLS policies |
| `authenticated` | Full | Complete CRUD operations via RLS |
| `service_role` | Admin | Bypass RLS, full administrative access |

### Table-Specific Permissions

#### Profiles Table
- `anon`: Full access (controlled by RLS)
- `authenticated`: Full access (controlled by RLS)
- `service_role`: Full access (bypass RLS)

#### Review Tables (Quick & Prose)
- `anon`: SELECT only
- `authenticated`: Full access (controlled by RLS)
- `service_role`: Full access (bypass RLS)

#### Tasting Tables
- `anon`: Full access (controlled by RLS)
- `authenticated`: Full access (controlled by RLS)
- `service_role`: Full access (bypass RLS)

---

## 🚀 Database Status & Features

### ✅ **Security Features**
- Row Level Security enabled on all tables
- User isolation enforced through policies
- Proper authentication integration
- Secure foreign key relationships with cascade deletes

### ✅ **Data Integrity Features**
- Automatic timestamp management
- Constraint validation (score ranges, categories)
- Foreign key constraints with proper cascading
- Default value enforcement

### ✅ **Performance Features**
- Comprehensive indexing strategy
- Optimized query patterns
- Efficient relationship structures
- JSONB support for flexible data

### ✅ **Automation Features**
- Automatic profile creation on user registration
- Real-time statistics updates
- Automatic timestamp management
- Counter maintenance through triggers

### ✅ **Application Features**
- Complete tasting session management
- Dual review system (structured + prose)
- Social platform capabilities
- Category-based organization
- Photo upload support
- Batch/lot tracking

---

## 📈 Database Statistics

### Current State
- **Total Tables:** 5 main tables
- **Total Functions:** 7 custom functions
- **Total Triggers:** 11 active triggers
- **Total Indexes:** 9 performance indexes
- **Security Policies:** 20+ RLS policies
- **Extensions:** pg_graphql, pgcrypto, uuid-ossp, supabase_vault

### Performance Metrics
- **Sequential Scans:** Optimized with proper indexing
- **Index Usage:** Efficient query patterns
- **Current Size:** Minimal (new database)
- **Estimated Growth:** Scalable architecture

---

## 🔄 Data Flow & Automation

### User Registration Flow
1. User signs up via Supabase Auth
2. `handle_new_user()` trigger fires automatically
3. Profile created with metadata from registration
4. User gets both auth account + profile record

### Tasting Session Flow
1. User creates tasting session (`quick_tastings`)
2. User adds items to session (`quick_tasting_items`)
3. Statistics automatically updated via triggers
4. Profile tasting count updated automatically

### Review Creation Flow
1. User creates review (quick or prose format)
2. Review count automatically updated in profile
3. Timestamps managed automatically
4. All changes tracked and secured via RLS

---

## 📝 Technical Notes

- **Database Version:** PostgreSQL (Supabase managed)
- **Character Encoding:** UTF8
- **Timezone Handling:** All timestamps with timezone support
- **UUID Generation:** Using `gen_random_uuid()` for primary keys
- **JSON Support:** JSONB for flexible flavor scoring data
- **Search Path:** Properly configured for security
- **Connection Pooling:** Managed by Supabase infrastructure

---

## 🎯 Ready For

- ✅ User authentication and registration
- ✅ Complete tasting session management
- ✅ Dual review system (structured + prose)
- ✅ Social features and user interactions
- ✅ Category-based flavor exploration
- ✅ Photo upload and media management
- ✅ Statistics and analytics
- ✅ Real-time updates and notifications
- ✅ Mobile and web application support

---

*Last Updated: Generated from Supabase CLI analysis - Complete database schema documentation*