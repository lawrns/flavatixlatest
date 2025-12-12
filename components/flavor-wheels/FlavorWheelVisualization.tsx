import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FlavorWheelData, WheelCategory } from '@/lib/flavorWheelGenerator';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Download, Share2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface FlavorWheelVisualizationProps {
  wheelData: FlavorWheelData;
  width?: number;
  height?: number;
  showLabels?: boolean;
  interactive?: boolean;
  onSegmentClick?: (category: string, subcategory?: string, descriptor?: string) => void;
}

interface WheelSegment {
  category: WheelCategory;
  subcategoryIndex?: number;
  descriptorIndex?: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  label: string;
  count: number;
}

/**
 * FlavorWheelVisualization
 * D3.js-based circular visualization for flavor wheels
 */
export const FlavorWheelVisualization: React.FC<FlavorWheelVisualizationProps> = ({
  wheelData,
  width = 600,
  height = 600,
  showLabels = true,
  interactive = true,
  onSegmentClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Export functionality
  const handleExport = (format: 'png' | 'svg') => {
    if (!svgRef.current) return;
    
    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `flavor-wheel-${Date.now()}.svg`;
      downloadLink.click();
      URL.revokeObjectURL(svgUrl);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `flavor-wheel-${Date.now()}.png`;
            downloadLink.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Flavor Wheel',
          text: `Check out my flavor wheel with ${wheelData.totalDescriptors} descriptors!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  // Color scale for categories
  const colorScale = d3.scaleOrdinal<string>()
    .domain(wheelData.categories.map(c => c.name))
    .range([
      '#ef4444', // Red - Fruity
      '#f59e0b', // Orange - Sweet
      '#eab308', // Yellow - Citrus
      '#10b981', // Green - Herbal
      '#059669', // Dark Green - Earthy
      '#3b82f6', // Blue - Floral
      '#8b5cf6', // Purple - Spicy
      '#d97706', // Brown - Woody/Nutty
      '#6b7280', // Gray - Mineral
      '#ec4899'  // Pink - Other
    ]);

  useEffect(() => {
    if (!svgRef.current || !wheelData || wheelData.categories.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Responsive margin and sizing
    const margin = Math.max(20, Math.min(40, width * 0.06)); // 6% of width, min 20px, max 40px
    const radius = (Math.min(width, height) / 2) - margin;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Responsive font sizes
    const baseFontSize = Math.max(8, Math.min(16, width * 0.025)); // Scale with wheel size
    const labelFontSize = Math.max(10, Math.min(14, width * 0.02));
    const centerFontSize = Math.max(12, Math.min(18, width * 0.03));

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Calculate total for pie layout
    const totalCount = d3.sum(wheelData.categories, d => d.count);

    // Create segments data
    const segments: WheelSegment[] = [];
    let currentAngle = -Math.PI / 2; // Start at top

    wheelData.categories.forEach(category => {
      const categoryAngle = (category.count / totalCount) * 2 * Math.PI;
      const categoryColor = colorScale(category.name);

      // Category ring (innermost)
      segments.push({
        category,
        startAngle: currentAngle,
        endAngle: currentAngle + categoryAngle,
        innerRadius: radius * 0.3,
        outerRadius: radius * 0.5,
        color: categoryColor,
        label: category.name,
        count: category.count
      });

      // Subcategory ring (middle)
      let subcategoryStartAngle = currentAngle;
      category.subcategories.forEach((subcategory, subIdx) => {
        const subcategoryAngle = (subcategory.count / category.count) * categoryAngle;

        segments.push({
          category,
          subcategoryIndex: subIdx,
          startAngle: subcategoryStartAngle,
          endAngle: subcategoryStartAngle + subcategoryAngle,
          innerRadius: radius * 0.5,
          outerRadius: radius * 0.7,
          color: d3.color(categoryColor)?.brighter(0.5 + subIdx * 0.2).toString() || categoryColor,
          label: subcategory.name,
          count: subcategory.count
        });

        // Descriptor ring (outermost)
        let descriptorStartAngle = subcategoryStartAngle;
        subcategory.descriptors.slice(0, 5).forEach((descriptor, descIdx) => {
          const descriptorAngle = (descriptor.count / subcategory.count) * subcategoryAngle;

          segments.push({
            category,
            subcategoryIndex: subIdx,
            descriptorIndex: descIdx,
            startAngle: descriptorStartAngle,
            endAngle: descriptorStartAngle + descriptorAngle,
            innerRadius: radius * 0.7,
            outerRadius: radius * 0.95,
            color: d3.color(categoryColor)?.brighter(1 + descIdx * 0.3).toString() || categoryColor,
            label: descriptor.text,
            count: descriptor.count
          });

          descriptorStartAngle += descriptorAngle;
        });

        subcategoryStartAngle += subcategoryAngle;
      });

      currentAngle += categoryAngle;
    });

    // Arc generator
    const arc = d3.arc<WheelSegment>()
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle);

    // Draw segments
    const segmentGroups = g.selectAll('.segment')
      .data(segments)
      .enter()
      .append('g')
      .attr('class', 'segment');

    segmentGroups.append('path')
      .attr('d', arc)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', interactive ? 'pointer' : 'default')
      .on('mouseover', function(event, d) {
        if (!interactive) return;

        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('stroke-width', 2);

        const segmentId = `${d.category.name}-${d.subcategoryIndex}-${d.descriptorIndex}`;
        setHoveredSegment(segmentId);

        const [mouseX, mouseY] = d3.pointer(event, svg.node());
        setTooltip({
          text: `${d.label} (${d.count})`,
          x: mouseX,
          y: mouseY
        });
      })
      .on('mouseout', function() {
        if (!interactive) return;

        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 1);

        setHoveredSegment(null);
        setTooltip(null);
      })
      .on('click', function(event, d) {
        if (!interactive || !onSegmentClick) return;

        const subcategory = d.subcategoryIndex !== undefined
          ? d.category.subcategories[d.subcategoryIndex]
          : undefined;

        const descriptor = subcategory && d.descriptorIndex !== undefined
          ? subcategory.descriptors[d.descriptorIndex]
          : undefined;

        onSegmentClick(
          d.category.name,
          subcategory?.name,
          descriptor?.text
        );
      });

    // Add labels outside the wheel (perpendicular to outer rim) with more space
    if (showLabels) {
      const categorySegments = segments.filter(s =>
        s.subcategoryIndex === undefined && s.descriptorIndex === undefined
      );

      segmentGroups.filter(d =>
        d.subcategoryIndex === undefined && d.descriptorIndex === undefined
      )
        .append('text')
        .attr('transform', d => {
          const midAngle = (d.startAngle + d.endAngle) / 2;
          const labelRadius = radius * 1.15; // Increased from 1.05 to 1.15 for more space
          const x = Math.cos(midAngle) * labelRadius;
          const y = Math.sin(midAngle) * labelRadius;
          // Rotate text perpendicular to the rim
          const rotationAngle = midAngle * 180 / Math.PI;
          const textRotation = rotationAngle > 90 && rotationAngle < 270 ? rotationAngle + 180 : rotationAngle;
          return `translate(${x},${y}) rotate(${textRotation})`;
        })
        .attr('text-anchor', d => {
          const midAngle = (d.startAngle + d.endAngle) / 2;
          const rotationAngle = midAngle * 180 / Math.PI;
          return rotationAngle > 90 && rotationAngle < 270 ? 'end' : 'start';
        })
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'currentColor')
        .attr('class', 'text-gray-700 dark:text-gray-300')
        .attr('font-size', `${labelFontSize}px`)
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text(d => d.label);
    }

    // Add center circle with proper light/dark mode colors
    g.append('circle')
      .attr('r', radius * 0.3)
      .attr('fill', 'white')
      .attr('class', 'dark:fill-zinc-800')
      .attr('stroke', 'var(--color-border-default)')
      .attr('stroke-width', 2);

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${centerFontSize}px`)
      .attr('font-weight', 'bold')
      .attr('fill', 'currentColor')
      .attr('class', 'text-gray-800 dark:text-gray-200')
      .text(wheelData.wheelType.toUpperCase());

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dy', '1.5em')
      .attr('font-size', `${baseFontSize}px`)
      .attr('fill', 'currentColor')
      .attr('class', 'text-gray-500 dark:text-gray-400')
      .text(`${wheelData.totalDescriptors} notes`);

  }, [wheelData, width, height, showLabels, interactive, onSegmentClick, colorScale]);

  // Set up zoom behavior after wheel is rendered
  useEffect(() => {
    if (!svgRef.current || !interactive) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    
    if (g.empty()) return;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4]) // Min 0.5x, max 4x zoom
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        setCurrentZoom(event.transform.k);
      });

    // Apply zoom to SVG
    svg.call(zoom);
    
    // Store zoom ref for external controls
    zoomRef.current = zoom;

    // Reset to initial state
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    return () => {
      svg.on('.zoom', null); // Clean up zoom listeners
    };
  }, [wheelData, width, height, interactive]);

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.67);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(width / 2, height / 2)
    );
  }, [width, height]);

  return (
    <div className="relative w-full">
      {/* Aspect-ratio container ensures the wheel stays square and scales responsively */}
      <div 
        ref={containerRef}
        className="w-full aspect-square max-w-[600px] mx-auto relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="flavor-wheel-svg w-full h-full block"
          style={{ touchAction: 'none' }} // Allow D3 to handle all touch events
          preserveAspectRatio="xMidYMid meet"
        />
        
        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white/90 dark:bg-zinc-800/90 rounded-lg shadow-md p-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCcw size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 font-medium">
          {Math.round(currentZoom * 100)}%
        </div>

        {tooltip && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-md text-sm pointer-events-none shadow-lg z-10"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
      
      {/* Enhanced Descriptor List with Actions */}
      {wheelData.categories.length > 0 && (
        <Card className="mt-6">
          <CardHeader 
            title={`Extracted Descriptors (${wheelData.totalDescriptors})`}
            action={
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('png')}
                  icon={<Download size={16} />}
                >
                  PNG
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('svg')}
                  icon={<Download size={16} />}
                >
                  SVG
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare()}
                  icon={<Share2 size={16} />}
                >
                  Share
                </Button>
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wheelData.categories.map(category => (
                <div key={category.name} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colorScale(category.name) }}
                    />
                    {category.name} ({category.count})
                  </div>
                  <div className="space-y-2">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.name} className="ml-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {subcategory.name} ({subcategory.count})
                        </div>
                        <div className="ml-2 space-y-1">
                          {subcategory.descriptors.slice(0, 3).map(descriptor => (
                            <button 
                              key={descriptor.text} 
                              type="button"
                              className="block w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 active:text-primary-600 cursor-pointer transition-colors py-1 min-h-[32px] touch-manipulation"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSegmentClick?.(category.name, subcategory.name, descriptor.text);
                              }}
                            >
                              • {descriptor.text} ({descriptor.count})
                            </button>
                          ))}
                          {subcategory.descriptors.length > 3 && (
                            <div className="text-xs text-gray-400 dark:text-gray-600 py-1">
                              +{subcategory.descriptors.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlavorWheelVisualization;
