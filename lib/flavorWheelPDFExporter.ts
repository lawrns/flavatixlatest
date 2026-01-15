// Lazy load heavy PDF generation libraries only when needed
let jsPDF: any = null;
let html2canvas: any = null;

async function loadPDFLibraries() {
  if (!jsPDF || !html2canvas) {
    [jsPDF, html2canvas] = await Promise.all([
      import('jspdf').then((m) => m.default),
      import('html2canvas').then((m) => m.default),
    ]);
  }
  return { jsPDF, html2canvas };
}

interface WheelData {
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
    color?: string;
    descriptors?: any[];
    subcategories?: Array<{
      name: string;
      count: number;
      descriptors: any[];
    }>;
  }>;
  totalDescriptors: number;
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor';
}

interface PDFOptions {
  title?: string;
  includeStats?: boolean;
  includeDescriptors?: boolean;
  paperSize?: 'letter' | 'a4';
}

export class FlavorWheelPDFExporter {
  private static readonly PAPER_SIZES = {
    letter: { width: 8.5, height: 11 }, // inches
    a4: { width: 8.27, height: 11.69 }, // inches
  };

  /**
   * Creates a hidden D3.js wheel element for PDF generation
   */
  private static createHiddenWheelElement(wheelData: WheelData): HTMLElement {
    const container = document.createElement('div');
    container.id = 'pdf-wheel-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '792px'; // 8.5 inches at 96 DPI
    container.style.height = '1056px'; // 11 inches at 96 DPI
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.boxSizing = 'border-box';

    // Add title
    const title = document.createElement('h1');
    title.style.textAlign = 'center';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '20px';
    title.style.color = '#1F2937';
    title.textContent =
      wheelData.wheelType === 'combined'
        ? 'Flavor & Aroma Wheel'
        : wheelData.wheelType === 'metaphor'
          ? 'Metaphor Wheel'
          : `${wheelData.wheelType.charAt(0).toUpperCase() + wheelData.wheelType.slice(1)} Wheel`;
    container.appendChild(title);

    // Add stats
    const stats = document.createElement('div');
    stats.style.textAlign = 'center';
    stats.style.fontSize = '14px';
    stats.style.marginBottom = '30px';
    stats.style.color = '#6B7280';
    stats.innerHTML = `Total Descriptors: ${wheelData.totalDescriptors} | Categories: ${wheelData.categories.length}`;
    container.appendChild(stats);

    // Create wheel container (will be populated by D3.js)
    const wheelContainer = document.createElement('div');
    wheelContainer.id = 'pdf-wheel-svg';
    wheelContainer.style.width = '100%';
    wheelContainer.style.height = '600px'; // Leave space for descriptors
    wheelContainer.style.display = 'flex';
    wheelContainer.style.justifyContent = 'center';
    wheelContainer.style.alignItems = 'center';
    container.appendChild(wheelContainer);

    // Add descriptors section
    const descriptorsSection = document.createElement('div');
    descriptorsSection.style.marginTop = '30px';
    descriptorsSection.style.fontSize = '12px';
    descriptorsSection.style.color = '#374151';

    wheelData.categories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '15px';

      const categoryTitle = document.createElement('h3');
      categoryTitle.style.fontSize = '14px';
      categoryTitle.style.fontWeight = 'bold';
      categoryTitle.style.marginBottom = '5px';
      categoryTitle.style.color = category.color || '#6B7280';
      categoryTitle.innerHTML = `${category.name} (${category.count} descriptors, ${category.percentage.toFixed(1)}%)`;
      categoryDiv.appendChild(categoryTitle);

      if (category.descriptors && category.descriptors.length > 0) {
        const descriptorsList = document.createElement('div');
        descriptorsList.style.display = 'flex';
        descriptorsList.style.flexWrap = 'wrap';
        descriptorsList.style.gap = '5px';

        category.descriptors.slice(0, 10).forEach((descriptor) => {
          const descriptorSpan = document.createElement('span');
          descriptorSpan.style.backgroundColor = '#F3F4F6';
          descriptorSpan.style.padding = '2px 6px';
          descriptorSpan.style.borderRadius = '3px';
          descriptorSpan.style.fontSize = '11px';
          descriptorSpan.textContent = descriptor.text || descriptor.name || '';
          descriptorsList.appendChild(descriptorSpan);
        });

        if (category.descriptors.length > 10) {
          const moreSpan = document.createElement('span');
          moreSpan.style.fontSize = '11px';
          moreSpan.style.color = '#6B7280';
          moreSpan.textContent = `... and ${category.descriptors.length - 10} more`;
          descriptorsList.appendChild(moreSpan);
        }

        categoryDiv.appendChild(descriptorsList);
      }

      descriptorsSection.appendChild(categoryDiv);
    });

    container.appendChild(descriptorsSection);

    // Add to document temporarily
    document.body.appendChild(container);

    return container;
  }

  /**
   * Renders the D3.js wheel in the hidden container
   */
  private static async renderWheelInContainer(wheelData: WheelData): Promise<void> {
    // Import the existing D3.js wheel rendering logic
    // This would need to be adapted from the existing FlavorWheelVisualization component
    // For now, we'll create a simple placeholder

    const wheelContainer = document.getElementById('pdf-wheel-svg');
    if (!wheelContainer) {
      return;
    }

    // Create a simple SVG representation for now
    // In production, this would use the actual D3.js rendering logic
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '500');
    svg.setAttribute('height', '500');
    svg.setAttribute('viewBox', '0 0 500 500');

    // Create a simple circular representation
    const centerX = 250;
    const centerY = 250;
    const radius = 200;

    // Draw wheel segments
    wheelData.categories.forEach((category, index) => {
      const angle = (category.percentage / 100) * 2 * Math.PI;
      const startAngle = wheelData.categories
        .slice(0, index)
        .reduce((sum, cat) => sum + (cat.percentage / 100) * 2 * Math.PI, 0);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(startAngle + angle);
      const y2 = centerY + radius * Math.sin(startAngle + angle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      path.setAttribute('d', pathData);
      path.setAttribute('fill', category.color || '#6B7280');
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '2');

      svg.appendChild(path);

      // Add category label
      const labelAngle = startAngle + angle / 2;
      const labelX = centerX + radius * 0.7 * Math.cos(labelAngle);
      const labelY = centerY + radius * 0.7 * Math.sin(labelAngle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX.toString());
      text.setAttribute('y', labelY.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = category.name;

      svg.appendChild(text);
    });

    wheelContainer.appendChild(svg);
  }

  /**
   * Exports the flavor wheel as a PDF
   */
  static async exportToPDF(wheelData: WheelData, options: PDFOptions = {}): Promise<void> {
    const {
      title = 'Flavor Wheel',
      includeStats = true,
      includeDescriptors = true,
      paperSize = 'letter',
    } = options;

    try {
      // Lazy load PDF libraries only when export is triggered
      const libs = await loadPDFLibraries();
      const PDFDoc = libs.jsPDF;
      const canvasLib = libs.html2canvas;

      // Create hidden wheel element
      const container = this.createHiddenWheelElement(wheelData);

      // Render the wheel
      await this.renderWheelInContainer(wheelData);

      // Wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Capture the container as canvas
      const canvas = await canvasLib(container, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove the hidden container
      document.body.removeChild(container);

      // Create PDF
      const pdfSize = this.PAPER_SIZES[paperSize];
      const pdf = new PDFDoc({
        orientation: 'portrait',
        unit: 'in',
        format: paperSize,
      });

      // Calculate dimensions to fit the wheel on the page
      const pageWidth = pdfSize.width;
      const pageHeight = pdfSize.height;
      const margin = 0.5; // 0.5 inch margins
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Calculate image dimensions to maintain aspect ratio
      const imgAspectRatio = canvas.height / canvas.width;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth * imgAspectRatio;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight / imgAspectRatio;
      }

      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      // Save the PDF
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Quick export with default options
   */
  static async quickExport(wheelData: WheelData): Promise<void> {
    return this.exportToPDF(wheelData, {
      title:
        wheelData.wheelType === 'combined'
          ? 'Flavor & Aroma Wheel'
          : wheelData.wheelType === 'metaphor'
            ? 'Metaphor Wheel'
            : `${wheelData.wheelType.charAt(0).toUpperCase() + wheelData.wheelType.slice(1)} Wheel`,
      includeStats: true,
      includeDescriptors: true,
      paperSize: 'letter',
    });
  }
}
