-- FlavorWheel Upgrade Migration: Study vs Competition Mode Implementation
-- Run this against your PostgreSQL database

-- Step 1: Add new columns to quick_tastings table
ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'study' CHECK (mode IN ('study', 'competition', 'quick'));

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS rank_participants BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS ranking_type TEXT NULL;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_participants BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_items BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS is_blind_attributes BOOLEAN DEFAULT false;

ALTER TABLE quick_tastings
ADD COLUMN IF NOT EXISTS study_approach TEXT CHECK (study_approach IN ('predefined', 'collaborative'));

-- Step 2: Add new columns to quick_tasting_items table
ALTER TABLE quick_tasting_items
ADD COLUMN IF NOT EXISTS correct_answers JSONB NULL;

ALTER TABLE quick_tasting_items
ADD COLUMN IF NOT EXISTS include_in_ranking BOOLEAN DEFAULT false;

-- Step 3: Create tasting_participants table
CREATE TABLE IF NOT EXISTS tasting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasting_id UUID NOT NULL REFERENCES quick_tastings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'participant', 'both')),
    score INTEGER NULL,
    rank INTEGER NULL,
    can_moderate BOOLEAN DEFAULT false,
    can_add_items BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tasting_id, user_id)
);

-- Create tasting_item_suggestions table for Collaborative Study Mode
CREATE TABLE IF NOT EXISTS tasting_item_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES tasting_participants(id) ON DELETE CASCADE,
    suggested_item_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasting_participants_tasting_id ON tasting_participants(tasting_id);
CREATE INDEX IF NOT EXISTS idx_tasting_participants_user_id ON tasting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tasting_item_suggestions_participant_id ON tasting_item_suggestions(participant_id);
CREATE INDEX IF NOT EXISTS idx_tasting_item_suggestions_status ON tasting_item_suggestions(status);

-- Step 5: Enable RLS on new table
ALTER TABLE tasting_participants ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for tasting_participants
CREATE POLICY "Users can view participants of tastings they can access" ON tasting_participants FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert participants for tastings they own" ON tasting_participants FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update participants for tastings they own" ON tasting_participants FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete participants for tastings they own" ON tasting_participants FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM quick_tastings qt
        WHERE qt.id = tasting_participants.tasting_id
        AND qt.user_id = auth.uid()
    )
);

-- Enable RLS on tasting_item_suggestions
ALTER TABLE tasting_item_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasting_item_suggestions
CREATE POLICY "Users can view suggestions for tastings they participate in" ON tasting_item_suggestions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tasting_participants tp
        WHERE tp.id = tasting_item_suggestions.participant_id
        AND tp.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM tasting_participants tp
        JOIN quick_tastings qt ON qt.id = tp.tasting_id
        WHERE tp.id = tasting_item_suggestions.participant_id
        AND qt.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create suggestions for tastings they participate in" ON tasting_item_suggestions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasting_participants tp
        WHERE tp.id = tasting_item_suggestions.participant_id
        AND tp.user_id = auth.uid()
        AND tp.can_add_items = true
    )
);

CREATE POLICY "Hosts can moderate suggestions for their tastings" ON tasting_item_suggestions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM tasting_participants tp
        JOIN quick_tastings qt ON qt.id = tp.tasting_id
        WHERE tp.id = tasting_item_suggestions.participant_id
        AND qt.user_id = auth.uid()
        AND tp.can_moderate = true
    )
);

-- Step 7: Grant permissions
GRANT ALL ON TABLE tasting_participants TO anon;
GRANT ALL ON TABLE tasting_participants TO authenticated;
GRANT ALL ON TABLE tasting_participants TO service_role;

GRANT ALL ON TABLE tasting_item_suggestions TO anon;
GRANT ALL ON TABLE tasting_item_suggestions TO authenticated;
GRANT ALL ON TABLE tasting_item_suggestions TO service_role;

