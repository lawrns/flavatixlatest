/**
 * API Endpoint: /api/analytics/event
 *
 * Records custom analytics events
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
    const { eventName, properties, userId, platform, timestamp, sessionId } =
      req.body;

    // Validate required fields
    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Analytics: Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert event into analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        properties: properties || {},
        user_id: userId || null,
        platform: platform || 'unknown',
        session_id: sessionId || null,
        created_at: new Date(timestamp || Date.now()).toISOString(),
      });

    if (error) {
      console.error('Analytics: Failed to insert event', error);
      // Don't fail the request if analytics fails
      return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics: Unexpected error', error);
    // Don't expose internal errors
    return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
  }
}
