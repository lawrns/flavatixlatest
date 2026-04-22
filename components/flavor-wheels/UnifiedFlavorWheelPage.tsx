import React, { useEffect, useState, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { FlavorWheelVisualization } from './FlavorWheelVisualization';
import { Loader2 } from 'lucide-react';
import { resolveDescriptorCanonicalText } from '@/lib/flavorDescriptorNormalization';

interface UnifiedFlavorWheelPageProps {
  userId: string;
}

export const UnifiedFlavorWheelPage: React.FC<UnifiedFlavorWheelPageProps> = ({
  userId,
}) => {
  const [wheelData, setWheelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();
  const descriptorCandidates = useMemo(
    () =>
      wheelData?.categories?.flatMap((category: any) =>
        category.subcategories?.flatMap((subcategory: any) =>
          subcategory.descriptors?.map((descriptor: any) => descriptor.text) || []
        ) || []
      ) || [],
    [wheelData?.categories]
  );

  useEffect(() => {
    loadFlavorWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadFlavorWheel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      // Call generate API endpoint
      const response = await fetch('/api/flavor-wheels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          wheelType: 'combined',
          scopeType: 'personal',
          scopeFilter: { userId },
        }),
      });

      const result = await response.json();

      if (result.success && result.wheelData) {
        setWheelData(result.wheelData);
      } else {
        setError(result.error || 'Failed to generate flavor wheel');
      }
    } catch (err) {
      console.error('Failed to load flavor wheel:', err);
      setError('Failed to load flavor wheel');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-2">Generating your flavor wheel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-fg-muted">
        <p className="text-signal-danger">{error}</p>
        <button
          onClick={loadFlavorWheel}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!wheelData || wheelData.categories.length === 0) {
    return (
      <div className="text-center p-8 text-fg-muted">
        <p>No flavor data yet. Start tasting and we&apos;ll build your flavor wheel!</p>
      </div>
    );
  }

  const _descriptorLimit = 30;
  const totalDescriptors = wheelData.totalDescriptors || 0;
  const uniqueDescriptors = wheelData.uniqueDescriptors || 0;

  return (
    <div className="space-y-lg">
      <div className="text-center">
        <h2 className="text-h2 font-bold text-fg">
          Your Flavor Profile
        </h2>
        <p className="text-body text-fg-muted mt-sm">
          Based on {totalDescriptors} flavor notes across all your tastings
        </p>
      </div>

      {/* Main Flavor Wheel Visualization */}
      <div className="flex justify-center">
        <FlavorWheelVisualization
          wheelData={wheelData}
          width={600}
          height={600}
          showLabels={true}
          interactive={true}
        />
      </div>

      {/* Wheel Statistics */}
      <div className="grid grid-cols-3 gap-md text-center">
        <div className="bg-bg-inset rounded-soft p-md">
          <div className="text-h3 font-bold text-primary">
            {totalDescriptors}
          </div>
          <div className="text-body-sm text-fg-muted">Total Mentions</div>
        </div>
        <div className="bg-bg-inset rounded-soft p-md">
          <div className="text-h3 font-bold text-primary">
            {uniqueDescriptors}
          </div>
          <div className="text-body-sm text-fg-muted">Unique Descriptors</div>
        </div>
        <div className="bg-bg-inset rounded-soft p-md">
          <div className="text-h3 font-bold text-primary">
            {wheelData.categories.length}
          </div>
          <div className="text-body-sm text-fg-muted">Categories</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-sm">
        <h4 className="text-h5 font-semibold">Top Descriptors by Category</h4>
        {wheelData.categories.slice(0, 5).map((category: any) => (
          <details key={category.name} className="bg-bg-inset rounded-soft">
            <summary className="p-md cursor-pointer hover:bg-bg-surface transition-colors">
              <span className="font-semibold">{category.name}</span>
              <span className="text-fg-muted ml-2">
                ({category.count} mentions)
              </span>
            </summary>
            <div className="p-md pt-0 space-y-xs">
              {category.subcategories?.slice(0, 3).map((sub: any, idx: number) => (
                <div key={idx} className="pl-md">
                  <div className="font-medium text-sm">{sub.name}</div>
                  <div className="flex flex-wrap gap-xs mt-xs">
                    {sub.descriptors?.slice(0, 5).map((descriptor: any, dIdx: number) => (
                      <span
                        key={dIdx}
                        className="inline-flex items-center gap-xs bg-bg-surface px-sm py-xs rounded-full text-xs"
                      >
                        <span className="text-fg font-medium">
                          {resolveDescriptorCanonicalText(descriptor.text, descriptorCandidates)}
                        </span>
                        <span className="text-fg-subtle">({descriptor.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
