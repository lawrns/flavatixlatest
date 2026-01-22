/**
 * API Endpoint: /api/analytics/session
 *
 * Records user session data for MAU/DAU calculation
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
    const { userId, sessionId, platform, duration, pagesViewed, timestamp } =
      req.body;

    // Validate required fields
    if (!sessionId || !platform) {
      return res.status(400).json({ error: 'sessionId and platform are required' });
    }

    if (duration === undefined || duration === null) {
      return res.status(400).json({ error: 'duration is required' });
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Analytics: Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert session data
    const { error } = await supabase
      .from('analytics_sessions')
      .insert({
        user_id: userId || null,
        session_id: sessionId,
        platform,
        duration,
        pages_viewed: pagesViewed || 0,
        created_at: new Date(timestamp || Date.now()).toISOString(),
      });

    if (error) {
      console.error('Analytics: Failed to insert session', error);
      return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics: Unexpected error', error);
    return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
  }
}
