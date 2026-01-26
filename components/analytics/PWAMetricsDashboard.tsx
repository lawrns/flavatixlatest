/**
 * PWA Metrics Dashboard
 *
 * Displays key metrics for the Day 90 Capacitor decision:
 * - MAU/DAU tracking
 * - Mobile vs desktop traffic split
 * - PWA install rate
 * - User acquisition cost (CAC)
 * - Unit economics (LTV if monetization active)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { TrendingUp, Users, Download, DollarSign, Smartphone, Monitor } from 'lucide-react';

interface MetricsData {
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

interface PWAMetricsDashboardProps {
  timeRange?: 7 | 30 | 90;
  refreshInterval?: number; // in seconds
}

export const PWAMetricsDashboard: React.FC<PWAMetricsDashboardProps> = ({
  timeRange = 30,
  refreshInterval = 300, // 5 minutes default
}) => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/metrics?days=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const metricsData: MetricsData = await response.json();
      setData(metricsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      const interval = setInterval(loadMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, refreshInterval]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-2">Error loading metrics</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={loadMetrics}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            PWA Metrics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Key metrics for Day 90 Capacitor decision
            {lastUpdated && (
              <span className="ml-2 text-sm">
                (Updated {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DAU */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Daily Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.dau)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last {timeRange} days</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* MAU */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.mau)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last {timeRange} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Rate */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  PWA Install Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(data.pwaInstallRate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data.totalPWAInstalls)} total installs
                </p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* CAC */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Customer Acquisition Cost
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.cac)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per user</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Mobile vs Desktop Traffic" />
          <CardContent>
            <div className="space-y-4">
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mobile
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPercentage(data.mobilePercentage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.mobilePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data.platformSplit.mobile)} sessions
                </p>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Desktop
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPercentage(data.desktopPercentage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.desktopPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data.platformSplit.desktop)} sessions
                </p>
              </div>

              {/* Recommendation */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-blue-600 dark:text-blue-400">Insight:</strong>{' '}
                  {data.mobilePercentage > 70
                    ? 'High mobile usage suggests PWA approach is effective. Consider native conversion if engagement plateaus.'
                    : data.mobilePercentage < 30
                    ? 'Desktop-dominated usage. PWA benefits may be limited - focus on web experience optimization.'
                    : 'Balanced mobile/desktop usage. Continue monitoring PWA install rates for native decision.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader title={`Daily Active Users (Last ${timeRange} Days)`} />
          <CardContent>
            <div className="space-y-2">
              {data.dailyTrend.slice(-10).reverse().map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-20">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(day.dau / Math.max(...data.dailyTrend.map((d) => d.dau))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white w-12 text-right">
                    {day.dau}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Framework */}
      <Card>
        <CardHeader title="Day 90 Capacitor Decision Framework" />
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PWA Strength */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  Continue PWA If:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Install rate &gt; 15%</li>
                  <li>• Mobile &gt; 60%</li>
                  <li>• DAU growing &gt; 10% MoM</li>
                  <li>• CAC &lt; $5/user</li>
                </ul>
              </div>

              {/* Hybrid Consideration */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  Consider Hybrid If:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Install rate 5-15%</li>
                  <li>• Mobile 40-60%</li>
                  <li>• DAU flat/slow growth</li>
                  <li>• Need platform features</li>
                </ul>
              </div>

              {/* Go Native */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                  Go Native If:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Install rate &lt; 5%</li>
                  <li>• Desktop &gt; 60%</li>
                  <li>• DAU declining</li>
                  <li>• High LTV potential</li>
                </ul>
              </div>
            </div>

            {/* Current Assessment */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Current Assessment
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Based on current metrics, your app is{' '}
                <strong>
                  {data.pwaInstallRate > 15 && data.mobilePercentage > 60
                    ? 'READY TO SCALE AS PWA'
                    : data.pwaInstallRate > 5 && data.mobilePercentage > 40
                    ? 'A GOOD CANDIDATE FOR PWA'
                    : 'SHOWING MIXED SIGNALS - CONSIDER HYBRID'}
                </strong>
                . Monitor these metrics for 30 more days before making a final decision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAMetricsDashboard;
