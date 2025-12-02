# Comments System Setup Instructions

## Database Migration Required

Before the comments system will work, you need to run the SQL migration to create the necessary database tables.

### Steps to Apply Migration:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your FlavorWheel project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `migrations/add_comments_system.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

### What the Migration Creates:

#### Tables:
- **`tasting_comments`** - Stores all comments with threading support
  - `id` (uuid, primary key)
  - `tasting_id` (uuid, foreign key to quick_tastings)
  - `user_id` (uuid, foreign key to auth.users)
  - `parent_comment_id` (uuid, nullable, for replies)
  - `comment_text` (text)
  - `created_at`, `updated_at`, `deleted_at` (timestamps)

- **`comment_likes`** - Stores likes on comments
  - `id` (uuid, primary key)
  - `comment_id` (uuid, foreign key to tasting_comments)
  - `user_id` (uuid, foreign key to auth.users)
  - `created_at` (timestamp)

#### Indexes:
- Performance indexes on all foreign keys and frequently queried columns

#### Row Level Security (RLS):
- Anyone can read non-deleted comments
- Users can only insert/update/delete their own comments
- Users can like/unlike any comment

### After Migration:

Once the migration is complete, the comments system will be fully functional:
- ✅ Click "Comment" button on any tasting post
- ✅ View all comments in a modal
- ✅ Post new comments
- ✅ Reply to comments (threaded)
- ✅ Like comments
- ✅ Real-time comment counts

### Temporary Workaround:

If you want to test the build without running the migration first, you can temporarily comment out the CommentsModal import and usage in `pages/social.tsx`. However, the full feature requires the database tables to be created.

