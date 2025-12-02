/**
 * Flavor Wheel Data
 * 
 * Contains flavor profile configurations for different beverage categories.
 * Each category has a set of flavor groups with associated colors and angles
 * for visual representation on the wheel.
 */

export interface FlavorCategory {
  name: string;
  flavors: string[];
  color: string;
  angle: number;
}

export const flavorProfiles: Record<string, FlavorCategory[]> = {
  coffee: [
    {
      name: 'Fruity',
      flavors: ['Berry', 'Citrus', 'Stone Fruit', 'Tropical'],
      color: '#ef4444',
      angle: 0
    },
    {
      name: 'Sweet',
      flavors: ['Chocolate', 'Caramel', 'Vanilla', 'Honey'],
      color: '#f59e0b',
      angle: 45
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Hazelnut', 'Walnut', 'Peanut'],
      color: '#d97706',
      angle: 90
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Clove', 'Pepper', 'Cardamom'],
      color: '#ea580c',
      angle: 135
    },
    {
      name: 'Floral',
      flavors: ['Jasmine', 'Rose', 'Lavender', 'Hibiscus'],
      color: '#ec4899',
      angle: 180
    },
    {
      name: 'Earthy',
      flavors: ['Woody', 'Tobacco', 'Cedar', 'Mushroom'],
      color: '#059669',
      angle: 225
    },
    {
      name: 'Herbal',
      flavors: ['Mint', 'Basil', 'Thyme', 'Oregano'],
      color: '#10b981',
      angle: 270
    },
    {
      name: 'Citrus',
      flavors: ['Lemon', 'Orange', 'Lime', 'Grapefruit'],
      color: '#eab308',
      angle: 315
    }
  ],
  wine: [
    {
      name: 'Fruity',
      flavors: ['Red Berry', 'Black Berry', 'Citrus', 'Stone Fruit'],
      color: '#ef4444',
      angle: 0
    },
    {
      name: 'Floral',
      flavors: ['Violet', 'Rose', 'Elderflower', 'Acacia'],
      color: '#ec4899',
      angle: 60
    },
    {
      name: 'Herbal',
      flavors: ['Mint', 'Eucalyptus', 'Thyme', 'Sage'],
      color: '#10b981',
      angle: 120
    },
    {
      name: 'Earthy',
      flavors: ['Mineral', 'Wet Stone', 'Forest Floor', 'Truffle'],
      color: '#6b7280',
      angle: 180
    },
    {
      name: 'Spicy',
      flavors: ['Black Pepper', 'White Pepper', 'Clove', 'Cinnamon'],
      color: '#ea580c',
      angle: 240
    },
    {
      name: 'Oak',
      flavors: ['Vanilla', 'Toast', 'Smoke', 'Cedar'],
      color: '#d97706',
      angle: 300
    }
  ],
  whiskey: [
    {
      name: 'Sweet',
      flavors: ['Honey', 'Caramel', 'Vanilla', 'Maple'],
      color: '#f59e0b',
      angle: 0
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Pear', 'Orange', 'Cherry'],
      color: '#ef4444',
      angle: 60
    },
    {
      name: 'Spicy',
      flavors: ['Cinnamon', 'Nutmeg', 'Pepper', 'Ginger'],
      color: '#ea580c',
      angle: 120
    },
    {
      name: 'Smoky',
      flavors: ['Peat', 'Charcoal', 'Tobacco', 'Leather'],
      color: '#4b5563',
      angle: 180
    },
    {
      name: 'Nutty',
      flavors: ['Almond', 'Walnut', 'Pecan', 'Hazelnut'],
      color: '#d97706',
      angle: 240
    },
    {
      name: 'Woody',
      flavors: ['Oak', 'Cedar', 'Pine', 'Birch'],
      color: '#059669',
      angle: 300
    }
  ],
  beer: [
    {
      name: 'Malty',
      flavors: ['Bread', 'Biscuit', 'Caramel', 'Chocolate'],
      color: '#d97706',
      angle: 0
    },
    {
      name: 'Hoppy',
      flavors: ['Citrus', 'Pine', 'Floral', 'Herbal'],
      color: '#10b981',
      angle: 60
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Banana', 'Berry', 'Tropical'],
      color: '#ef4444',
      angle: 120
    },
    {
      name: 'Spicy',
      flavors: ['Pepper', 'Clove', 'Coriander', 'Ginger'],
      color: '#ea580c',
      angle: 180
    },
    {
      name: 'Roasted',
      flavors: ['Coffee', 'Chocolate', 'Burnt', 'Smoky'],
      color: '#4b5563',
      angle: 240
    },
    {
      name: 'Sour',
      flavors: ['Tart', 'Acidic', 'Vinegar', 'Lactic'],
      color: '#eab308',
      angle: 300
    }
  ],
  // Default/generic profile for other categories
  spirits: [
    {
      name: 'Sweet',
      flavors: ['Honey', 'Caramel', 'Vanilla', 'Maple'],
      color: '#f59e0b',
      angle: 0
    },
    {
      name: 'Fruity',
      flavors: ['Apple', 'Citrus', 'Berry', 'Stone Fruit'],
      color: '#ef4444',
      angle: 60
    },
    {
      name: 'Spicy',
      flavors: ['Pepper', 'Cinnamon', 'Ginger', 'Clove'],
      color: '#ea580c',
      angle: 120
    },
    {
      name: 'Herbal',
      flavors: ['Mint', 'Anise', 'Juniper', 'Thyme'],
      color: '#10b981',
      angle: 180
    },
    {
      name: 'Earthy',
      flavors: ['Oak', 'Smoke', 'Leather', 'Tobacco'],
      color: '#059669',
      angle: 240
    },
    {
      name: 'Floral',
      flavors: ['Rose', 'Lavender', 'Orange Blossom', 'Elderflower'],
      color: '#ec4899',
      angle: 300
    }
  ]
};

/**
 * Get flavor profile for a category, falling back to coffee if not found
 */
export const getFlavorProfile = (category: string): FlavorCategory[] => {
  return flavorProfiles[category.toLowerCase()] || flavorProfiles.coffee;
};

/**
 * Hex to RGB converter for color manipulation
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 }; // fallback blue
};

/**
 * Create SVG path for a wheel segment
 */
export const createWheelSegment = (
  startAngle: number, 
  endAngle: number, 
  radius: number, 
  innerRadius: number
): string => {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  const x1 = Math.cos(startAngleRad) * radius;
  const y1 = Math.sin(startAngleRad) * radius;
  const x2 = Math.cos(endAngleRad) * radius;
  const y2 = Math.sin(endAngleRad) * radius;
  
  const x3 = Math.cos(endAngleRad) * innerRadius;
  const y3 = Math.sin(endAngleRad) * innerRadius;
  const x4 = Math.cos(startAngleRad) * innerRadius;
  const y4 = Math.sin(startAngleRad) * innerRadius;
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return `M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
};
