-- Add study_category_data column to quick_tasting_items table
-- This will store JSON data for custom study mode category responses

ALTER TABLE "public"."quick_tasting_items" 
ADD COLUMN IF NOT EXISTS "study_category_data" "jsonb";

-- Add comment to document the purpose of this column
COMMENT ON COLUMN "public"."quick_tasting_items"."study_category_data" IS 'JSON data storing responses for custom study mode categories (text, scale, boolean inputs)';

-- Create index for better query performance on study category data
CREATE INDEX IF NOT EXISTS "idx_quick_tasting_items_study_category_data" 
ON "public"."quick_tasting_items" USING GIN ("study_category_data");
