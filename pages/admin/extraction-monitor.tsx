/**
 * Extraction Rate Monitoring Dashboard
 * Real-time view of descriptor extraction performance in production
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface ExtractionStats {
  period: string;
  totalItems: number;
  itemsWithContent: number;
  itemsExtracted: number;
  extractionRate: number;
  recentExtractions: Array<{
    date: string;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    total: number;
    extracted: number;
    rate: number;
  }>;
}

export default function ExtractionMonitor() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch extraction stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/extraction-stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, period]);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=/admin/extraction-monitor');
    }
  }, [user, router]);

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 95) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (rate >= 80) return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary-600" />
                Extraction Rate Monitor
              </h1>
              <p className="text-gray-500 mt-2">
                Real-time monitoring of flavor descriptor extraction performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={() => fetchStats()}
                className="p-2 rounded-lg bg-white border hover:bg-gray-50 transition-colors"
                title="Refresh now"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mt-4 flex gap-2">
            {['24h', '7d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p === '24h' ? 'Last 24 Hours' : p === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {loading && !stats ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        ) : stats ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Overall Extraction Rate</p>
                    <p className={`text-3xl font-bold mt-2 ${getStatusColor(stats.extractionRate)}`}>
                      {stats.extractionRate.toFixed(1)}%
                    </p>
                  </div>
                  {getStatusIcon(stats.extractionRate)}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {stats.itemsExtracted} / {stats.itemsWithContent} items extracted
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
                <p className="text-sm text-gray-600 mt-4">
                  {stats.itemsWithContent} with content
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-500">Items Extracted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.itemsExtracted}</p>
                <p className="text-sm text-gray-600 mt-4">
                  Successfully processed
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-500">Missing Extractions</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.itemsWithContent - stats.itemsExtracted}
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Require attention
                </p>
              </div>
            </div>

            {/* Status Alert */}
            {stats.extractionRate < 95 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Extraction Rate Below Target
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Current rate is {stats.extractionRate.toFixed(1)}%. Target is 95% or higher.
                      Check logs for extraction errors.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Trend Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Extraction Trend
              </h2>
              <div className="space-y-2">
                {stats.recentExtractions.map((item) => (
                  <div key={item.date} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary-600 flex items-center justify-end pr-2 text-white text-sm font-medium"
                          style={{
                            width: `${Math.min((item.count / Math.max(...stats.recentExtractions.map(e => e.count))) * 100, 100)}%`
                          }}
                        >
                          {item.count > 0 && item.count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Extraction Rate by Category
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Extracted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.byCategory.map((cat) => (
                      <tr key={cat.category}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {cat.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cat.total}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cat.extracted}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getStatusColor(cat.rate)}`}>
                            {cat.rate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cat.rate >= 95 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Healthy
                            </span>
                          ) : cat.rate >= 80 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Warning
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Critical
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                What to Monitor
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Target extraction rate: ≥95%</li>
                <li>• Alert threshold: &lt;80% requires investigation</li>
                <li>• Check category breakdowns for specific issues</li>
                <li>• Monitor trends over time for degradation</li>
                <li>• Verify batch extraction runs on session completion</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
