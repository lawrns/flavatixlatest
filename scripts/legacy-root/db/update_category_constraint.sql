-- Update category constraint to include 'other' category
-- Run this migration to allow 'other' as a valid category in quick_tastings

ALTER TABLE quick_tastings
DROP CONSTRAINT IF EXISTS quick_tastings_category_check;

ALTER TABLE quick_tastings
ADD CONSTRAINT quick_tastings_category_check
CHECK (category = ANY (ARRAY['coffee'::text, 'tea'::text, 'wine'::text, 'spirits'::text, 'beer'::text, 'chocolate'::text, 'other'::text]));