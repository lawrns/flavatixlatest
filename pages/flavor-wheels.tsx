import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/SimpleAuthContext';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';
import { FlavorWheelData } from '@/lib/flavorWheelGenerator';
import { Download, RefreshCw, Info, List } from 'lucide-react';
import ShareButton from '../components/sharing/ShareButton';
import BottomNavigation from '../components/navigation/BottomNavigation';
import FlavorWheelListView from '../components/flavor-wheels/FlavorWheelListView';
import { FlavorWheelPDFExporter } from '../lib/flavorWheelPDFExporter';

// Dynamically import to avoid SSR issues
const InspirationBox = dynamic(() => import('../components/ui/inspiration-box'), {
  ssr: false,
  loading: () => null
});

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
  const [exportingPDF, setExportingPDF] = useState(false);

  // Load predefined categories
  useEffect(() => {
    const loadPredefinedCategories = async () => {
      if (!user) return;
      
      try {
        const isMetaphor = wheelType === 'metaphor';
        const tableName = isMetaphor ? 'active_metaphor_categories' : 'active_flavor_categories';
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('display_order');

        if (error) throw error;
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
    if (!wheelData) return;
    
    setExportingPDF(true);
    try {
      await FlavorWheelPDFExporter.quickExport({
        categories: wheelData.categories,
        totalDescriptors: wheelData.totalDescriptors,
        wheelType: wheelType
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const loadWheel = useCallback(async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/flavor-wheels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          wheelType,
          scopeType,
          scopeFilter: scopeType === 'personal' ? { userId: user?.id } : {},
          forceRegenerate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate wheel');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate wheel');
      }

      setWheelData(data.wheelData);
      setCached(data.cached || false);

      if (data.wheelData.categories.length === 0) {
        setError('No flavor descriptors found. Add some tasting notes or reviews to generate your flavor wheel!');
      }

    } catch (err) {
      console.error('Error loading wheel:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flavor wheel');
    } finally {
      setLoading(false);
    }
  }, [user, wheelType, scopeType]);

  // Load wheel on mount and when filters change
  useEffect(() => {
    if (user) {
      loadWheel();
    }
  }, [user, wheelType, scopeType, loadWheel]);

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
    if (!wheelData) return;

    const dataStr = JSON.stringify(wheelData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `flavor-wheel-${wheelType}-${scopeType}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareWheel = async () => {
    if (!wheelData) throw new Error('No wheel data available');

    // Generate a shareable image URL (for now, use the current page)
    const shareUrl = `${window.location.origin}/flavor-wheels`;

    // Get top descriptors from wheel data
    const topDescriptors = wheelData.categories
      ?.flatMap(cat => cat.subcategories?.flatMap(sub => sub.descriptors?.map(d => d.text) || []) || [])
      .slice(0, 5)
      .join(', ') || 'amazing flavors';

    const shareText = `Check out my ${wheelType} taste profile on Flavatix! Top notes: ${topDescriptors} 🎨✨`;

    return {
      text: shareText,
      url: shareUrl,
      // In a real implementation, we'd generate an actual image of the wheel
      imageUrl: undefined
    };
  };

  const handleSegmentClick = (category: string, subcategory?: string, descriptor?: string) => {
    console.log('Clicked:', { category, subcategory, descriptor });
  };

  if (authLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 shadow-sm border-b border-orange-100 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Flavor Wheels</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Flavor wheels are AI-generated visualizations of your tasting notes.
                They analyze your reviews and tastings to reveal patterns in the flavors and aromas you experience.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wheel Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Wheel Type
              </label>
              <select
                value={wheelType}
                onChange={(e) => setWheelType(e.target.value as WheelType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="aroma">Aroma Wheel</option>
                <option value="flavor">Flavor Wheel</option>
                <option value="combined">Combined (Aroma + Flavor)</option>
                <option value="metaphor">Metaphor Wheel</option>
              </select>
            </div>

            {/* Scope Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Scope
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as ScopeType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="personal">My Flavor Wheel</option>
                <option value="universal">Universal (All Users)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleRegenerateWheel}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <ShareButton
                disabled={!wheelData || loading}
                onShare={handleShareWheel}
              />
              <button
                onClick={handleExportWheel}
                disabled={!wheelData || loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Cache Info */}
          {cached && !loading && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-300">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                Cached - Click "Regenerate" to update with latest data
              </span>
            </div>
          )}
        </div>

        {/* Wheel Visualization */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-8 mb-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Generating your flavor wheel...</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">{error}</p>
              <button
                onClick={() => router.push('/taste')}
                className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Start Tasting
              </button>
            </div>
          )}

          {wheelData && !loading && !error && wheelData.categories.length > 0 && (
            <div className="flex flex-col items-center overflow-hidden">
              {/* View Mode Toggle */}
              <div className="w-full flex justify-center mb-6">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Mobile View
                  </button>
                  <button
                    onClick={() => setViewMode('wheel')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'wheel'
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Wheel View
                  </button>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'list' ? (
                <FlavorWheelListView
                  wheelData={{
                    categories: wheelData.categories,
                    totalDescriptors: wheelData.totalDescriptors,
                    wheelType: wheelType
                  }}
                  predefinedCategories={predefinedCategories}
                  onExportPDF={handleExportPDF}
                  className="w-full"
                />
              ) : (
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
              )}

              {/* AI Badge */}
              {wheelData.aiMetadata?.hasAIDescriptors && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 rounded-full">
                  <span className="text-2xl">✨</span>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                      AI-Enhanced Flavor Wheel
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                      {wheelData.aiMetadata.aiExtractedCount} AI-extracted descriptors ({Math.round(wheelData.aiMetadata.percentageAI)}%)
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {wheelData.categories.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {wheelData.uniqueDescriptors}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Unique Descriptors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {wheelData.totalDescriptors}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Notes</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8 w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {wheelData.categories.map((category, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{
                        backgroundColor: d3.scaleOrdinal<string>()
                          .domain(wheelData.categories.map(c => c.name))
                          .range([
                            '#ef4444', '#f59e0b', '#eab308', '#10b981',
                            '#059669', '#3b82f6', '#8b5cf6', '#d97706',
                            '#6b7280', '#ec4899'
                          ])(category.name)
                      }}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{category.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-300">({category.count})</span>
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
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
