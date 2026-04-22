import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { Coffee, Wine, Beer, Utensils, Star, PieChart } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  flavor_scores?: Record<string, number>;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  aroma?: string;
  flavor?: string;
}

interface QuickTastingSummaryProps {
  session: QuickTasting;
  onStartNewSession: () => void;
}

const QuickTastingSummary: React.FC<QuickTastingSummaryProps> = ({
  session,
  onStartNewSession,
}) => {
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const router = useRouter();

  const loadTastingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .select('*')
        .eq('tasting_id', session.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      setItems(data || []);
    } catch (error) {
      console.error('Error loading tasting items:', error);
      toast.error('Failed to load tasting items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTastingItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const getCategoryLabel = (category: string): string =>
    category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const calculateAverageScore = (): number => {
    const scoredItems = items.filter(
      (item) => item.overall_score !== null && item.overall_score !== undefined
    );
    if (scoredItems.length === 0) {
      return 0;
    }

    const total = scoredItems.reduce((sum, item) => sum + (item.overall_score || 0), 0);
    return Math.round((total / scoredItems.length) * 10) / 10;
  };

  const getTopFlavors = (): Array<{ flavor: string; count: number; avgScore: number }> => {
    const flavorMap = new Map<string, { count: number; totalScore: number }>();

    items.forEach((item) => {
      if (item.flavor_scores) {
        Object.entries(item.flavor_scores).forEach(([flavor, score]) => {
          const existing = flavorMap.get(flavor) || { count: 0, totalScore: 0 };
          flavorMap.set(flavor, {
            count: existing.count + 1,
            totalScore: existing.totalScore + score,
          });
        });
      }
    });

    return Array.from(flavorMap.entries())
      .map(([flavor, data]) => ({
        flavor,
        count: data.count,
        avgScore: Math.round((data.totalScore / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 32, className: 'text-primary-600' };
    switch (category) {
      case 'coffee':
      case 'tea':
        return <Coffee {...iconProps} />;
      case 'wine':
        return <Wine {...iconProps} />;
      case 'beer':
        return <Beer {...iconProps} />;
      case 'whiskey':
      case 'chocolate':
      default:
        return <Utensils {...iconProps} />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const averageScore = calculateAverageScore();
  const topFlavors = getTopFlavors();
  const categoryLabel = getCategoryLabel(session.category);
  const sessionTitle = session.session_name || `${categoryLabel} Tasting`;
  const completedItems = items.filter(
    (item) => item.overall_score !== null && item.overall_score !== undefined
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-lg text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-fg-muted">Loading tasting summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 tablet:space-y-8 px-sm tablet:px-0">
      {/* Session Header */}
      <div className="card p-md">
        <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-md mb-sm">
          <div className="flex items-center space-x-sm min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 tablet:w-16 tablet:h-16">
              {getCategoryIcon(session.category)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-h3 tablet:text-h2 font-bold text-fg truncate">
                {sessionTitle}
              </h2>
              <p className="text-fg-muted text-small tablet:text-base">
                {categoryLabel} Tasting Session
              </p>
              <p className="text-small text-fg-muted">
                Completed on {formatDate(session.completed_at || session.updated_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full tablet:w-auto">
            <button
              onClick={() => router.push('/flavor-wheels')}
              className="btn-secondary w-full tablet:w-auto flex-shrink-0 flex items-center justify-center gap-2"
            >
              <PieChart size={18} />
              Generate Flavor Wheel
            </button>
            <button
              onClick={onStartNewSession}
              className="btn-primary w-full tablet:w-auto flex-shrink-0"
            >
              Start New Session
            </button>
          </div>
        </div>

        {/* Session Notes */}
        {session.notes && (
          <div className="mt-sm p-sm bg-bg-inset rounded-soft">
            <h3 className="text-small font-medium text-fg-muted mb-xs">
              Other Notes
            </h3>
            <p className="text-fg">{session.notes}</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-sm tablet:gap-md">
        <div className="card p-sm tablet:p-md text-center overflow-hidden">
          <div className="text-3xl tablet:text-4xl desktop:text-h1 font-bold text-primary mb-xs break-words">
            {items.length}
          </div>
          <div className="text-fg-muted text-small tablet:text-base">Total Items</div>
        </div>
        <div className="card p-sm tablet:p-md text-center overflow-hidden">
          <div className="text-3xl tablet:text-4xl desktop:text-h1 font-bold text-signal-good mb-xs break-words">
            {completedItems.length}
          </div>
          <div className="text-fg-muted text-small tablet:text-base">Items Scored</div>
        </div>
        <div className="card p-sm tablet:p-md text-center overflow-hidden">
          <div className="text-3xl tablet:text-4xl desktop:text-h1 font-bold text-signal-warn mb-xs break-words whitespace-nowrap">
            {averageScore > 0 ? (
              <span className="inline-block">
                <span className="tabular-nums">{averageScore}</span>
                <span className="text-xl tablet:text-2xl">/100</span>
              </span>
            ) : (
              'N/A'
            )}
          </div>
          <div className="text-fg-muted text-small tablet:text-base">Average Score</div>
        </div>
      </div>

      {/* Top Flavors */}
      {topFlavors.length > 0 && (
        <div className="card p-sm tablet:p-md">
        <h3 className="text-h4 font-semibold text-fg mb-sm">
            Top Flavors
          </h3>
          <div className="space-y-sm">
            {topFlavors.map((flavor, index) => (
              <div key={flavor.flavor} className="flex items-center justify-between gap-sm min-w-0">
                <div className="flex items-center space-x-sm min-w-0 flex-1">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-small font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="font-medium text-fg truncate">{flavor.flavor}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-small font-medium text-fg whitespace-nowrap">
                    {flavor.avgScore}/100 avg
                  </div>
                  <div className="text-caption text-fg-muted">
                    {flavor.count} item{flavor.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="card p-sm tablet:p-md">
        <h3 className="text-h4 font-semibold text-fg mb-sm">Tasted Items</h3>
        {items.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No items in this tasting yet"
            description="Once items are added, you'll see their notes, scores, and flavor profiles here."
            action={{ label: 'Start a New Tasting', onClick: onStartNewSession }}
            secondaryAction={{ label: 'Back to Taste', onClick: () => router.push('/taste') }}
          />
        ) : (
          <div className="space-y-sm">
            {items.map((item) => (
              <div key={item.id} className="border border-line rounded-pane overflow-hidden">
                <div
                  className="p-sm bg-bg-inset cursor-pointer hover:bg-bg-surface transition-colors"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  <div className="flex items-center justify-between gap-sm min-w-0">
                    <div className="flex items-center space-x-sm min-w-0 flex-1">
                      <h4 className="font-medium text-fg truncate">{item.item_name}</h4>
                      {item.overall_score && (
                        <div className="flex items-center space-x-xs flex-shrink-0">
                          <Star className="w-4 h-4 text-signal-warn fill-current" />
                          <span className="text-small font-medium text-fg whitespace-nowrap">
                            {item.overall_score}/100
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-xs flex-shrink-0">
                      {item.photo_url && (
                        <span className="text-small text-fg-muted">📸</span>
                      )}
                      <span className="text-fg-muted">
                        {expandedItem === item.id ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedItem === item.id && (
                  <div className="p-sm border-t border-line bg-bg-inset">
                    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-md">
                      {/* Photo */}
                      {item.photo_url && (
                        <div>
                          <h5 className="text-small font-medium text-fg-muted mb-xs">
                            Photo
                          </h5>
                          <Image
                            src={item.photo_url}
                            alt={item.item_name}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-48 object-cover rounded-pane"
                          />
                        </div>
                      )}

                      {/* Aroma */}
                      {item.aroma && (
                        <div>
                          <h5 className="text-small font-medium text-fg-muted mb-xs">
                            Aroma
                          </h5>
                          <p className="text-fg text-small leading-relaxed">
                            {item.aroma}
                          </p>
                        </div>
                      )}

                      {/* Flavor */}
                      {item.flavor && (
                        <div>
                          <h5 className="text-small font-medium text-fg-muted mb-xs">
                            Flavor
                          </h5>
                          <p className="text-fg text-small leading-relaxed">
                            {item.flavor}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div>
                          <h5 className="text-small font-medium text-fg-muted mb-xs">
                            Notes
                          </h5>
                          <p className="text-fg text-small leading-relaxed">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Flavor Scores */}
                    {item.flavor_scores && Object.keys(item.flavor_scores).length > 0 && (
                      <div className="mt-sm">
                        <h5 className="text-small font-medium text-fg-muted mb-xs">
                          Flavor Profile
                        </h5>
                        <div className="flex flex-wrap gap-xs">
                          {Object.entries(item.flavor_scores).map(([flavor, score]) => (
                            <div
                              key={flavor}
                              className="px-sm py-xs bg-primary/10 text-primary rounded-full text-small font-medium"
                            >
                              {flavor} ({score}/100)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTastingSummary;
