-- Add custom_category_name column to quick_tastings table
-- This allows users to specify a custom name when selecting "Other" category

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS custom_category_name TEXT NULL;