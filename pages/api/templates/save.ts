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

interface SaveTemplateRequest {
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

    const { name, baseCategory, categories }: SaveTemplateRequest = req.body;

    // Validation
    if (!name || !baseCategory || !categories || categories.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize categories structure
    const normalizedCategories = categories.map((cat, index) => ({
      name: cat.name,
      hasText: cat.hasText,
      hasScale: cat.hasScale,
      hasBoolean: cat.hasBoolean,
      scaleMax: cat.hasScale ? (cat.scaleMax || 100) : null,
      rankInSummary: cat.rankInSummary,
      sortOrder: index
    }));

    const { data, error } = await supabase
      .from('study_templates')
      .insert({
        user_id: user.id,
        name,
        base_category: baseCategory,
        categories: JSON.stringify(normalizedCategories)
      })
      .select()
      .single();

    if (error) {
      console.error('[Template Save API] Error saving template:', error);
      return res.status(500).json({ error: 'Failed to save template', details: error.message });
    }

    res.status(201).json({
      message: 'Template saved successfully',
      templateId: data.id,
      template: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
