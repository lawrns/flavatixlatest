/**
 * API Endpoint: /api/analytics/event
 *
 * Records custom analytics events
 *
 * NOTE: Requires an RLS policy on analytics_events allowing anon inserts:
 *   CREATE POLICY "Allow anon analytics inserts" ON analytics_events
 *     FOR INSERT WITH CHECK (true);
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const eventSchema = z.object({
  eventName: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional().default({}),
  userId: z.string().uuid().optional().nullable(),
  platform: z.string().max(50).optional().default('unknown'),
  timestamp: z.number().optional(),
  sessionId: z.string().max(100).optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    const { eventName, properties, userId, platform, timestamp, sessionId } =
      parsed.data;

    // Get environment variables — use anon key, not service role
    // Service role bypasses all RLS; analytics inserts don't need elevated privileges
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ success: true, warning: 'Analytics unavailable' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
      // Don't fail the request if analytics fails
      return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
    }

    return res.status(200).json({ success: true });
  } catch {
    // Don't expose internal errors
    return res.status(200).json({ success: true, warning: 'Analytics logging failed' });
  }
}
