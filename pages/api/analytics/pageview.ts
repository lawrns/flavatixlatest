/**
 * API Endpoint: /api/analytics/pageview
 *
 * Records page view events
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, path, referrer, platform, userAgent, timestamp } = req.body;

    // Validate required fields
    if (!path) {
      return res.status(400).json({ error: 'path is required' });
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ success: true, warning: 'Analytics unavailable' });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert page view
    const { error } = await supabase
      .from('analytics_page_views')
      .insert({
        user_id: userId || null,
        path,
        referrer: referrer || null,
        platform: platform || 'unknown',
        user_agent: userAgent || 'unknown',
        created_at: new Date(timestamp || Date.now()).toISOString(),
      });

    if (error) {
      return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
  }
}
