import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart3, TrendingUp, Users, Star, Calendar, Filter } from 'lucide-react';

interface AnalyticsData {
  totalTastings: number;
  totalReviews: number;
  averageRating: number;
  totalUsers: number;
  tastingsThisMonth: number;
  reviewsThisMonth: number;
  topCategories: Array<{ name: string; count: number }>;
  monthlyTrend: Array<{ month: string; tastings: number; reviews: number }>;
}

interface AnalyticsDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userId, 
  isAdmin = false 
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [userId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockData: AnalyticsData = {
        totalTastings: 156,
        totalReviews: 89,
        averageRating: 4.2,
        totalUsers: isAdmin ? 1247 : 1,
        tastingsThisMonth: 23,
        reviewsThisMonth: 15,
        topCategories: [
          { name: 'Coffee', count: 45 },
          { name: 'Wine', count: 38 },
          { name: 'Beer', count: 32 },
          { name: 'Spirits', count: 28 },
          { name: 'Tea', count: 13 }
        ],
        monthlyTrend: [
          { month: 'Jan', tastings: 12, reviews: 8 },
          { month: 'Feb', tastings: 18, reviews: 12 },
          { month: 'Mar', tastings: 23, reviews: 15 },
          { month: 'Apr', tastings: 19, reviews: 11 },
          { month: 'May', tastings: 25, reviews: 18 },
          { month: 'Jun', tastings: 22, reviews: 14 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Platform overview and insights' : 'Your tasting insights'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tastings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.totalTastings}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.totalReviews}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.averageRating.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader title="Top Categories" />
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(category.count / data.topCategories[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                      {category.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader title="Monthly Activity" />
          <CardContent>
            <div className="space-y-3">
              {data.monthlyTrend.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {month.month}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(month.tastings / Math.max(...data.monthlyTrend.map(m => m.tastings))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                        {month.tastings}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(month.reviews / Math.max(...data.monthlyTrend.map(m => m.reviews))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                        {month.reviews}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Tastings</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
