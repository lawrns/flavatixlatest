import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FlavorWheelData, WheelCategory } from '@/lib/flavorWheelGenerator';

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
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

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

    // Add labels to category segments (innermost ring)
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
          const labelRadius = (d.innerRadius + d.outerRadius) / 2;
          const x = Math.cos(midAngle) * labelRadius;
          const y = Math.sin(midAngle) * labelRadius;
          return `translate(${x},${y}) rotate(${(midAngle * 180 / Math.PI) + 90})`;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', `${labelFontSize}px`)
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text(d => d.label);
    }

    // Add center circle
    g.append('circle')
      .attr('r', radius * 0.3)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 2);

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', `${centerFontSize}px`)
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text(wheelData.wheelType.toUpperCase());

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('dy', '1.5em')
      .attr('font-size', `${baseFontSize}px`)
      .attr('fill', '#6b7280')
      .text(`${wheelData.totalDescriptors} notes`);

  }, [wheelData, width, height, showLabels, interactive, onSegmentClick, colorScale]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="flavor-wheel-svg"
      />
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
  );
};

export default FlavorWheelVisualization;
