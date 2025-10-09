import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CategoryInput {
  name: string;
  hasText: boolean;
  hasScale: boolean;
  hasBoolean: boolean;
  scaleMax?: number;
  rankInSummary: boolean;
}

interface CreateStudySessionRequest {
  name: string;
  baseCategory: string;
  categories: CategoryInput[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, baseCategory, categories }: CreateStudySessionRequest = req.body;

    // Validation
    if (!name || !baseCategory || !categories || categories.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (name.length < 1 || name.length > 120) {
      return res.status(400).json({ error: 'Name must be between 1 and 120 characters' });
    }

    if (categories.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 categories allowed' });
    }

    // Validate each category
    for (const category of categories) {
      if (!category.name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      if (!category.hasText && !category.hasScale && !category.hasBoolean) {
        return res.status(400).json({ error: 'Each category must have at least one parameter type' });
      }
      if (category.hasScale) {
        const scaleMax = category.scaleMax || 100;
        if (scaleMax < 5 || scaleMax > 100) {
          return res.status(400).json({ error: 'Scale max must be between 5 and 100' });
        }
      }
    }

    // Normalize base category to lowercase for consistency
    const normalizedCategory = baseCategory.toLowerCase().replace(/\s+/g, '_');

    // Store categories as structured data in notes field
    const studyMetadata = {
      baseCategory,
      categories: categories.map((cat, index) => ({
        name: cat.name,
        hasText: cat.hasText,
        hasScale: cat.hasScale,
        hasBoolean: cat.hasBoolean,
        scaleMax: cat.hasScale ? (cat.scaleMax || 100) : null,
        rankInSummary: cat.rankInSummary,
        sortOrder: index
      })),
      studyMode: true
    };

    // Create study session in quick_tastings table
    const { data: session, error: sessionError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id: user.id,
        session_name: name,
        category: normalizedCategory === 'other' ? 'other' : normalizedCategory,
        custom_category_name: normalizedCategory === 'other' ? baseCategory : null,
        mode: 'study',
        study_approach: 'predefined',
        notes: JSON.stringify(studyMetadata),
        total_items: 0,
        completed_items: 0
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating study session:', sessionError);
      return res.status(500).json({ error: 'Failed to create study session', details: sessionError.message });
    }

    res.status(201).json({
      sessionId: session.id,
      session
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
