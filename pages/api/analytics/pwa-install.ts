/**
 * API Endpoint: /api/analytics/pwa-install
 *
 * Records PWA installation events
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
    const { userId, platform, userAgent, timestamp, source } = req.body;

    // Validate required fields
    if (!platform) {
      return res.status(400).json({ error: 'platform is required' });
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

    // Insert PWA install event
    const { error } = await supabase
      .from('analytics_pwa_installs')
      .insert({
        user_id: userId || null,
        platform,
        user_agent: userAgent || 'unknown',
        source: source || 'direct',
        created_at: new Date(timestamp || Date.now()).toISOString(),
      });

    if (error) {
      console.error('Analytics: Failed to insert PWA install', error);
      return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
    }

    // Also track as a custom event
    await supabase.from('analytics_events').insert({
      event_name: 'pwa_installed',
      properties: {
        platform,
        source: source || 'direct',
        userAgent,
      },
      user_id: userId || null,
      platform,
      created_at: new Date(timestamp || Date.now()).toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics: Unexpected error', error);
    return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
  }
}
