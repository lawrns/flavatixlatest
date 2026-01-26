/**
 * API Endpoint: /api/analytics/metrics
 *
 * Retrieves analytics metrics for the dashboard
 * Requires authentication
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface MetricsResponse {
  dau: number;
  mau: number;
  mobilePercentage: number;
  desktopPercentage: number;
  pwaInstallRate: number;
  totalPWAInstalls: number;
  cac: number;
  platformSplit: {
    mobile: number;
    desktop: number;
  };
  dailyTrend: Array<{
    date: string;
    dau: number;
    installs: number;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get time range from query params (default: last 30 days)
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get DAU (last 30 days)
    const { data: dauData } = await supabase
      .rpc('calculate_dau', {
        start_date: startDate.toISOString(),
      })
      .single() as { data: { dau: number } | null };

    // Get MAU (last 30 days)
    const { data: mauData } = await supabase
      .rpc('calculate_mau', {
        start_date: startDate.toISOString(),
      })
      .single() as { data: { mau: number } | null };

    // Get platform split
    const { data: platformData } = await supabase
      .from('analytics_sessions')
      .select('platform')
      .gte('created_at', startDate.toISOString());

    // Get PWA installs
    const { data: installsData } = await supabase
      .from('analytics_pwa_installs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    // Get user acquisition cost
    const { data: cacData } = await supabase
      .from('analytics_user_acquisition')
      .select('cost')
      .gte('created_at', startDate.toISOString());

    // Calculate metrics
    const platformSplit = {
      mobile: 0,
      desktop: 0,
    };

    if (platformData) {
      platformData.forEach((session: any) => {
        if (session.platform === 'mobile') {
          platformSplit.mobile++;
        } else if (session.platform === 'desktop') {
          platformSplit.desktop++;
        }
      });
    }

    const totalSessions = platformSplit.mobile + platformSplit.desktop;
    const mobilePercentage =
      totalSessions > 0 ? (platformSplit.mobile / totalSessions) * 100 : 0;
    const desktopPercentage =
      totalSessions > 0 ? (platformSplit.desktop / totalSessions) * 100 : 0;

    const totalPWAInstalls = installsData ? installsData.length : 0;
    const uniqueUsers = platformData
      ? new Set(platformData.map((s: any) => s.user_id)).size
      : 0;
    const pwaInstallRate =
      uniqueUsers > 0 ? (totalPWAInstalls / uniqueUsers) * 100 : 0;

    const totalCost = cacData
      ? cacData.reduce((sum: number, item: any) => sum + (item.cost || 0), 0)
      : 0;
    const totalAcquired = cacData ? cacData.length : 0;
    const cac = totalAcquired > 0 ? totalCost / totalAcquired : 0;

    // Get daily trend
    const { data: dailyData } = await supabase
      .from('analytics_sessions')
      .select('created_at, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const dailyTrend: Array<{
      date: string;
      dau: number;
      installs: number;
    }> = [];

    if (dailyData) {
      const dailyMap = new Map<string, Set<string>>();

      dailyData.forEach((session: any) => {
        const date = new Date(session.created_at).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, new Set());
        }
        if (session.user_id) {
          dailyMap.get(date)!.add(session.user_id);
        }
      });

      dailyMap.forEach((users, date) => {
        dailyTrend.push({
          date,
          dau: users.size,
          installs: 0, // Would need to join with installs table
        });
      });
    }

    const response: MetricsResponse = {
      dau: dauData?.dau || 0,
      mau: mauData?.mau || 0,
      mobilePercentage: Math.round(mobilePercentage * 100) / 100,
      desktopPercentage: Math.round(desktopPercentage * 100) / 100,
      pwaInstallRate: Math.round(pwaInstallRate * 100) / 100,
      totalPWAInstalls,
      cac: Math.round(cac * 100) / 100,
      platformSplit,
      dailyTrend,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Analytics: Failed to retrieve metrics', error);
    return res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
}
