// Webpack moduleId: 7093 (for crash tracing)
// SSR-safe flavor wheels page - D3 loaded dynamically via visualization component

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';
import { FlavorWheelData } from '@/lib/flavorWheelGenerator';
import { Download, RefreshCw, Info, List } from 'lucide-react';
import ShareButton from '../components/sharing/ShareButton';
import PageLayout from '../components/layout/PageLayout';
import Container from '../components/layout/Container';
import FlavorWheelListView from '../components/flavor-wheels/FlavorWheelListView';
import { FlavorWheelPDFExporter } from '../lib/flavorWheelPDFExporter';
import FlavorWheelErrorBoundary from '../components/flavor-wheels/FlavorWheelErrorBoundary';
import { BottomSheet, FlavorPill } from '@/components/ui';
import { FLAVOR_COLORS, STATUS_COLORS } from '@/lib/colors';
import { logger } from '@/lib/logger';

// Color palette for categories (matches D3 visualization)
// Uses hex values from centralized color system
const WHEEL_CATEGORY_COLORS = [
  FLAVOR_COLORS.fruity.hex, // Red - Fruity
  FLAVOR_COLORS.sweet.hex, // Yellow - Sweet
  FLAVOR_COLORS.citrus.hex, // Yellow - Citrus
  FLAVOR_COLORS.vegetal.hex, // Green - Herbal
  FLAVOR_COLORS.earthy.hex, // Dark Green - Earthy
  FLAVOR_COLORS.floral.hex, // Pink - Floral
  FLAVOR_COLORS.spicy.hex, // Red - Spicy
  FLAVOR_COLORS.nutty.hex, // Brown - Woody/Nutty
  FLAVOR_COLORS.mineral.hex, // Gray - Mineral
  FLAVOR_COLORS.other.hex, // Pink - Other
];

// Helper to get category color by index
const getCategoryColor = (index: number): string => {
  return WHEEL_CATEGORY_COLORS[index % WHEEL_CATEGORY_COLORS.length];
};

// Dynamically import to avoid SSR issues
const InspirationBox = dynamic(() => import('../components/ui/inspiration-box'), {
  ssr: false,
  loading: () => null,
});

// Import empty state component
import EmptyStateCard from '../components/ui/EmptyStateCard';

const FlavorWheelVisualization = dynamic(
  () => import('../components/flavor-wheels/FlavorWheelVisualization'),
  { ssr: false }
);

type WheelType = 'aroma' | 'flavor' | 'combined' | 'metaphor';
type ScopeType = 'personal' | 'universal';
type ViewMode = 'list' | 'wheel';

interface PredefinedCategory {
  id: string;
  name: string;
  display_order: number;
  color_hex: string;
}

export default function FlavorWheelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wheelType, setWheelType] = useState<WheelType>('aroma');
  const [scopeType, setScopeType] = useState<ScopeType>('personal');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [wheelData, setWheelData] = useState<FlavorWheelData | null>(null);
  const [predefinedCategories, setPredefinedCategories] = useState<PredefinedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [wheelSize, setWheelSize] = useState(700);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<{
    category: string;
    subcategory?: string;
    descriptor?: string;
  } | null>(null);

  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [sources, setSources] = useState<
    Array<{
      source_type: 'quick_tasting' | 'quick_review' | 'prose_review';
      source_id: string;
      descriptor_text: string;
      item_name: string | null;
      item_category: string | null;
      created_at: string;
      confidence_score: number | null;
    }>
  >([]);
  const [autoRegenerating, setAutoRegenerating] = useState(false);
  const [_exportingPDF, setExportingPDF] = useState(false);

  // Load predefined categories
  useEffect(() => {
    const loadPredefinedCategories = async () => {
      if (!user) {
        return;
      }

      try {
        const isMetaphor = wheelType === 'metaphor';
        const tableName = isMetaphor ? 'active_metaphor_categories' : 'active_flavor_categories';

        const { data, error } = await supabase.from(tableName).select('*').order('display_order');

        if (error) {
          throw error;
        }
        setPredefinedCategories(data || []);
      } catch (error) {
        console.error('Error loading predefined categories:', error);
      }
    };

    loadPredefinedCategories();
  }, [user, wheelType]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleExportPDF = async () => {
    if (!wheelData) {
      return;
    }

    setExportingPDF(true);
    try {
      await FlavorWheelPDFExporter.quickExport({
        categories: wheelData.categories,
        totalDescriptors: wheelData.totalDescriptors,
        wheelType: wheelType,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const loadWheel = useCallback(
    async (forceRegenerate = false) => {
      setLoading(true);
      setError(null);

      try {
        // Get the current session token
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch('/api/flavor-wheels/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            wheelType,
            scopeType,
            scopeFilter: scopeType === 'personal' ? { userId: user?.id } : {},
            forceRegenerate,
          }),
        });

        const data = await response.json();

        logger.debug('FlavorWheel', 'API Response', {
          success: data.success,
          haswheelData: !!data.wheelData,
          categoriesLength: data.wheelData?.categories?.length,
          cached: data.cached,
          wheelType,
          scopeType
        });

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate wheel');
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate wheel');
        }

        setWheelData(data.wheelData);
        setCached(data.cached || false);

        if (data.wheelData?.categories?.length === 0) {
          setError(
            'No flavor descriptors found. Add some tasting notes or reviews to generate your flavor wheel!'
          );
        }
      } catch (err) {
        console.error('Error loading wheel:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flavor wheel');
      } finally {
        setLoading(false);
      }
    },
    [user, wheelType, scopeType]
  );

  // Load wheel on mount and when filters change
  useEffect(() => {
    if (user) {
      loadWheel();
    }
  }, [user, wheelType, scopeType, loadWheel]);

  // Auto-regenerate if wheel data is stale (new descriptors added since generation)
  useEffect(() => {
    const checkAndAutoRegenerate = async () => {
      // Only check if we have cached wheel data and user is logged in
      if (!wheelData || !cached || !user || loading || autoRegenerating) {
        return;
      }

      // Skip if wheel has no generatedAt timestamp
      if (!wheelData.generatedAt) {
        return;
      }

      try {
        // Query for any descriptors created after the wheel was generated
        let query = supabase
          .from('flavor_descriptors')
          .select('created_at', { count: 'exact', head: true })
          .gt('created_at', new Date(wheelData.generatedAt).toISOString());

        // Apply scope filter for personal wheels
        if (scopeType === 'personal') {
          query = query.eq('user_id', user.id);
        }

        // Filter by descriptor type
        if (wheelType === 'combined') {
          query = query.in('descriptor_type', ['aroma', 'flavor']);
        } else {
          query = query.eq('descriptor_type', wheelType);
        }

        const { count } = await query;

        // If there are new descriptors, auto-regenerate
        if (count && count > 0) {
          setAutoRegenerating(true);
          await loadWheel(true); // Force regenerate
          setAutoRegenerating(false);
        }
      } catch (error) {
        console.error('Error checking wheel staleness:', error);
        setAutoRegenerating(false);
      }
    };

    checkAndAutoRegenerate();
  }, [wheelData, cached, user, scopeType, wheelType, loading, autoRegenerating, loadWheel]);

  // Handle window resize for responsive wheel
  useEffect(() => {
    const updateWheelSize = () => {
      // Calculate responsive size based on screen width
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Account for header, controls, padding, and bottom navigation
      const availableWidth = screenWidth - 64; // 32px padding on each side
      const availableHeight = screenHeight - 300; // Account for header, controls, and bottom nav

      // Use the smaller dimension to ensure it fits both width and height
      const maxSize = Math.min(availableWidth, availableHeight, 600);

      // Minimum size for usability
      const minSize = 280;

      const newSize = Math.max(minSize, maxSize);
      setWheelSize(newSize);
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);
    return () => window.removeEventListener('resize', updateWheelSize);
  }, []);

  const handleRegenerateWheel = () => {
    loadWheel(true);
  };

  const handleExportWheel = () => {
    if (!wheelData) {
      return;
    }

    const dataStr = JSON.stringify(wheelData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `flavor-wheel-${wheelType}-${scopeType}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareWheel = async () => {
    if (!wheelData) {
      throw new Error('No wheel data available');
    }

    // Generate a shareable image URL (for now, use the current page)
    const shareUrl = `${window.location.origin}/flavor-wheels`;

    // Get top descriptors from wheel data
    const topDescriptors =
      wheelData.categories
        ?.flatMap(
          (cat) =>
            cat.subcategories?.flatMap((sub) => sub.descriptors?.map((d) => d.text) || []) || []
        )
        .slice(0, 5)
        .join(', ') || 'amazing flavors';

    const shareText = `Check out my ${wheelType} taste profile on Flavatix! Top notes: ${topDescriptors}`;

    return {
      text: shareText,
      url: shareUrl,
      // In a real implementation, we'd generate an actual image of the wheel
      imageUrl: undefined,
    };
  };

  const handleSegmentClick = (category: string, subcategory?: string, descriptor?: string) => {
    setSelectedSegment({ category, subcategory, descriptor });
    setIsDetailOpen(true);
  };

  const selectedCategory = useMemo(() => {
    if (!selectedSegment) {
      return undefined;
    }
    return wheelData?.categories?.find((c) => c.name === selectedSegment.category);
  }, [selectedSegment, wheelData]);

  const selectedSubcategory = useMemo(() => {
    if (!selectedSegment?.subcategory) {
      return undefined;
    }
    return selectedCategory?.subcategories?.find((s) => s.name === selectedSegment.subcategory);
  }, [selectedSegment, selectedCategory]);

  const selectedDescriptor = useMemo(() => {
    if (!selectedSegment?.descriptor) {
      return undefined;
    }
    return selectedSubcategory?.descriptors?.find((d) => d.text === selectedSegment.descriptor);
  }, [selectedSegment, selectedSubcategory]);

  // Get top descriptors, deduplicating by descriptor text to avoid showing same note multiple times
  const topDescriptorChips = useMemo(() => {
    if (!wheelData?.categories) {
      return [];
    }

    const allDescriptors = wheelData.categories
      .flatMap(
        (cat) =>
          cat.subcategories?.flatMap(
            (sub) =>
              sub.descriptors?.map((d) => ({
                category: cat.name,
                subcategory: sub.name,
                descriptor: d.text,
                count: d.count,
              })) || []
          ) || []
      )
      .sort((a, b) => b.count - a.count);

    // Deduplicate by descriptor text, keeping highest count version
    const seen = new Set<string>();
    const unique: typeof allDescriptors = [];
    for (const chip of allDescriptors) {
      const key = chip.descriptor.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(chip);
      }
    }

    return unique.slice(0, 8);
  }, [wheelData?.categories]);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        return;
      }
      if (!isDetailOpen) {
        return;
      }
      if (!selectedSegment?.descriptor) {
        setSources([]);
        setSourcesError(null);
        setSourcesLoading(false);
        return;
      }

      setSourcesLoading(true);
      setSourcesError(null);

      try {
        let query = supabase
          .from('flavor_descriptors')
          .select(
            'source_type, source_id, descriptor_text, item_name, item_category, created_at, confidence_score'
          )
          .eq('user_id', user.id)
          .eq('category', selectedSegment.category)
          .ilike('descriptor_text', selectedSegment.descriptor)
          .order('created_at', { ascending: false })
          .limit(12);

        query = selectedSegment.subcategory
          ? query.eq('subcategory', selectedSegment.subcategory)
          : query.is('subcategory', null);

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setSources((data || []) as any);
      } catch (e: any) {
        setSources([]);
        setSourcesError(e?.message || 'Failed to load related items');
      } finally {
        setSourcesLoading(false);
      }
    };

    run();
  }, [isDetailOpen, selectedSegment, user]);

  if (authLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 font-sans text-gemini-text-dark dark:text-zinc-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gemini-text-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      title="Flavor Wheels"
      subtitle="Explore & create flavor profiles"
      showBack
      backUrl="/dashboard"
      containerSize="md"
    >
      {/* Wide content area for controls and visualization */}
      <Container size="4xl" className="mt-2">
        {/* Info Banner */}
        <div
          className={`${STATUS_COLORS.info.bg} border-l-4 ${STATUS_COLORS.info.border} p-4 mb-6 rounded-r-[14px]`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className={`h-5 w-5 ${STATUS_COLORS.info.text}`} />
            </div>
            <div className="ml-3">
              <p className={`text-sm ${STATUS_COLORS.info.text}`}>
                Flavor wheels are AI-generated visualizations of your tasting notes. They analyze
                your reviews and tastings to reveal patterns in the flavors and aromas you
                experience.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 mb-6">
          {/* Selectors row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Wheel Type Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                Wheel Type
              </label>
              <select
                value={wheelType}
                onChange={(e) => setWheelType(e.target.value as WheelType)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-[14px] bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="aroma">Aroma Wheel</option>
                <option value="flavor">Flavor Wheel</option>
                <option value="combined">Combined (Aroma + Flavor)</option>
                <option value="metaphor">Metaphor Wheel</option>
              </select>
            </div>

            {/* Scope Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                Scope
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as ScopeType)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-[14px] bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="personal">My Flavor Wheel</option>
                <option value="universal">Universal (All Users)</option>
              </select>
            </div>
          </div>

          {/* Actions row - wraps on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRegenerateWheel}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-[14px] hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[120px]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            <ShareButton
              disabled={!wheelData || loading}
              onShare={handleShareWheel}
              className="flex-1 sm:flex-none min-w-[100px]"
            />
            <button
              onClick={handleExportWheel}
              disabled={!wheelData || loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gemini-border dark:border-zinc-600 text-gemini-text-gray dark:text-zinc-200 rounded-[14px] hover:bg-white dark:hover:bg-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors min-w-[100px]"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Cache Info - only show if not auto-regenerating */}
          {cached && !loading && !autoRegenerating && (
            <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-[14px] ${STATUS_COLORS.success.bg} ${STATUS_COLORS.success.text}`}
              >
                Up to date
              </span>
            </div>
          )}
        </div>

        {/* Wheel Visualization */}
        <div className="bg-white dark:bg-zinc-800 rounded-[22px] shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 sm:p-8 mb-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
              <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                {autoRegenerating ? 'Updating with new data...' : 'Generating your flavor wheel...'}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                {autoRegenerating ? 'New tasting data detected' : 'This may take a moment'}
              </p>
            </div>
          )}

          {error && !loading && (
            <EmptyStateCard
              image="/generated-images/empty-flavor-wheel.webp"
              headline="Your flavor wheel is waiting to be born"
              description={error}
              cta={{
                label: 'Start Tasting to Generate',
                onClick: () => router.push('/taste'),
                variant: 'primary',
              }}
            />
          )}

          {wheelData && !loading && !error && wheelData.categories.length > 0 && (
            <div className="flex flex-col items-center overflow-hidden">
              {/* Top descriptors chips */}
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gemini-text-dark dark:text-zinc-100">
                    Top notes
                  </h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:opacity-80 transition-opacity"
                    onClick={() => setViewMode('list')}
                  >
                    View all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(topDescriptorChips || []).map((chip) => (
                    <FlavorPill
                      key={`${chip.category}-${chip.subcategory}-${chip.descriptor}`}
                      flavor={chip.descriptor}
                      size="sm"
                      onClick={() =>
                        handleSegmentClick(chip.category, chip.subcategory, chip.descriptor)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="w-full flex justify-center mb-6">
                <div className="inline-flex rounded-[14px] border border-gemini-border dark:border-zinc-700 bg-gemini-card dark:bg-zinc-800 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'text-gemini-text-gray dark:text-zinc-400 hover:text-gemini-text-dark dark:hover:text-zinc-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('wheel')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                      viewMode === 'wheel'
                        ? 'bg-primary text-white'
                        : 'text-gemini-text-gray dark:text-zinc-400 hover:text-gemini-text-dark dark:hover:text-zinc-200'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Wheel
                  </button>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'list' ? (
                <FlavorWheelListView
                  wheelData={{
                    categories: wheelData.categories,
                    totalDescriptors: wheelData.totalDescriptors,
                    wheelType: wheelType,
                  }}
                  predefinedCategories={predefinedCategories}
                  onExportPDF={handleExportPDF}
                  className="w-full"
                />
              ) : (
                <FlavorWheelErrorBoundary onRetry={() => loadWheel(true)}>
                  <div className="w-full flex justify-center items-center min-h-[300px]">
                    <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
                      <FlavorWheelVisualization
                        wheelData={wheelData}
                        width={wheelSize}
                        height={wheelSize}
                        showLabels={true}
                        interactive={true}
                        onSegmentClick={handleSegmentClick}
                      />
                    </div>
                  </div>
                </FlavorWheelErrorBoundary>
              )}

              {/* Segment detail bottom sheet */}
              <BottomSheet
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={
                  selectedSegment?.descriptor ||
                  selectedSegment?.subcategory ||
                  selectedSegment?.category ||
                  'Details'
                }
                ariaDescription="Details for the selected flavor wheel segment"
              >
                {!selectedSegment ? (
                  <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                    Select a segment to see details.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gemini-text-muted dark:text-zinc-500">
                        Category
                      </p>
                      <p className="text-sm font-semibold text-gemini-text-dark dark:text-zinc-100">
                        {selectedSegment.category}
                      </p>
                      {selectedSegment.subcategory ? (
                        <>
                          <p className="text-xs font-medium text-gemini-text-muted dark:text-zinc-500 mt-2">
                            Subcategory
                          </p>
                          <p className="text-sm font-semibold text-gemini-text-dark dark:text-zinc-100">
                            {selectedSegment.subcategory}
                          </p>
                        </>
                      ) : null}
                    </div>

                    {selectedDescriptor ? (
                      <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800 p-4">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-semibold text-gemini-text-dark dark:text-zinc-100">
                            Mentions
                          </p>
                          <p className="text-sm font-bold text-primary tabular-nums">
                            {selectedDescriptor.count}
                          </p>
                        </div>
                        <p className="text-xs text-gemini-text-gray dark:text-zinc-400 mt-1">
                          Avg intensity: {selectedDescriptor.avgIntensity}
                        </p>
                      </div>
                    ) : null}

                    {selectedSubcategory ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gemini-text-muted dark:text-zinc-500">
                          Top descriptors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSubcategory.descriptors.slice(0, 12).map((d) => (
                            <FlavorPill
                              key={d.text}
                              flavor={d.text}
                              size="sm"
                              onClick={() =>
                                handleSegmentClick(
                                  selectedSegment.category,
                                  selectedSubcategory.name,
                                  d.text
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ) : selectedCategory ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gemini-text-muted dark:text-zinc-500">
                          Subcategories
                        </p>
                        <div className="space-y-2">
                          {selectedCategory.subcategories.slice(0, 10).map((s) => (
                            <button
                              key={s.name}
                              type="button"
                              className="w-full text-left rounded-[14px] bg-gemini-card dark:bg-zinc-800 px-4 py-3 hover:shadow-sm active:scale-[0.98] transition"
                              onClick={() => handleSegmentClick(selectedSegment.category, s.name)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gemini-text-dark dark:text-zinc-100">
                                  {s.name}
                                </span>
                                <span className="text-xs font-semibold text-gemini-text-gray dark:text-zinc-400 tabular-nums">
                                  {s.count}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedSegment.descriptor ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gemini-text-muted dark:text-zinc-500">
                          Contributing items
                        </p>

                        {sourcesLoading ? (
                          <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800 p-4">
                            <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                              Loading…
                            </p>
                          </div>
                        ) : sourcesError ? (
                          <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800 p-4">
                            <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                              {sourcesError}
                            </p>
                          </div>
                        ) : sources.length === 0 ? (
                          <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800 p-4">
                            <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                              No linked items found yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {sources.map((s) => {
                              const href =
                                s.source_type === 'quick_tasting'
                                  ? `/tasting-summary/${s.source_id}`
                                  : s.source_type === 'prose_review'
                                    ? `/review/summary/${s.source_id}?type=prose`
                                    : `/review/summary/${s.source_id}`;

                              const label =
                                s.source_type === 'quick_tasting'
                                  ? 'Quick tasting'
                                  : s.source_type === 'prose_review'
                                    ? 'Prose review'
                                    : 'Structured review';

                              return (
                                <button
                                  key={`${s.source_type}:${s.source_id}`}
                                  type="button"
                                  className="w-full text-left rounded-[14px] bg-gemini-card dark:bg-zinc-800 px-4 py-3 hover:shadow-sm active:scale-[0.98] transition"
                                  onClick={() => {
                                    setIsDetailOpen(false);
                                    router.push(href);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gemini-text-dark dark:text-zinc-100 truncate">
                                        {s.item_name || label}
                                      </p>
                                      <p className="text-xs text-gemini-text-gray dark:text-zinc-400 truncate">
                                        {label}
                                      </p>
                                    </div>
                                    <span className="text-xs text-gemini-text-muted dark:text-zinc-500 tabular-nums">
                                      {new Date(s.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-[22px] bg-gemini-card dark:bg-zinc-800 p-4">
                        <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
                          Select a specific descriptor to see which tastings or reviews contributed.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="w-full rounded-[14px] bg-primary text-white py-3 font-semibold active:scale-[0.98] transition"
                      onClick={() => {
                        setIsDetailOpen(false);
                        router.push('/history');
                      }}
                    >
                      View related tastings
                    </button>
                  </div>
                )}
              </BottomSheet>

              {/* AI Badge */}
              {wheelData.aiMetadata?.hasAIDescriptors && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 rounded-full">
                  <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">
                    auto_awesome
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                      AI-Enhanced Flavor Wheel
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      {wheelData.aiMetadata.aiExtractedCount} AI-extracted descriptors (
                      {Math.round(wheelData.aiMetadata.percentageAI)}%)
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center w-full max-w-md sm:max-w-none">
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-[22px] p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-400">
                    {wheelData.categories.length}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Categories</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-[22px] p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-400">
                    {wheelData.uniqueDescriptors}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    Unique Descriptors
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-[22px] p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-400">
                    {wheelData.totalDescriptors}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">Total Notes</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8 w-full">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  Categories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {wheelData.categories.map((category, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getCategoryColor(idx) }}
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-200">
                        {category.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        ({category.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspiration Box */}
        <div className="mt-8">
          <InspirationBox />
        </div>
      </Container>
    </PageLayout>
  );
}
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
