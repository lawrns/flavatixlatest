/**
 * Flavor Descriptor Extractor
 *
 * This service extracts and categorizes flavor/aroma descriptors from text.
 * Uses a hybrid approach: keyword matching + AI categorization
 */

export interface ExtractedDescriptor {
  text: string;
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
  category: string | null;
  subcategory: string | null;
  confidence: number;
  intensity?: number;
}

export interface DescriptorExtractionResult {
  descriptors: ExtractedDescriptor[];
  totalFound: number;
  extractionMethod: 'keyword' | 'ai' | 'hybrid';
}

// Comprehensive flavor taxonomy
const FLAVOR_TAXONOMY = {
  aroma: {
    Fruity: {
      subcategories: [
        'Citrus',
        'Berry',
        'Stone Fruit',
        'Tropical',
        'Dried Fruit',
        'Orchard',
        'Melon',
        'Other Fruits',
      ],
      keywords: {
        Citrus: [
          'lemon',
          'lime',
          'orange',
          'grapefruit',
          'bergamot',
          'mandarin',
          'pomelo',
          'yuzu',
          'kumquat',
        ],
        Berry: [
          'strawberry',
          'raspberry',
          'blackberry',
          'blueberry',
          'cranberry',
          'boysenberry',
          'gooseberry',
          'currant',
          'elderberry',
        ],
        'Stone Fruit': ['peach', 'apricot', 'nectarine', 'plum', 'cherry', 'mirabelle', 'loquat'],
        Tropical: [
          'mango',
          'pineapple',
          'passion fruit',
          'guava',
          'papaya',
          'lychee',
          'rambutan',
          'jackfruit',
          'durian',
          'dragon fruit',
          'starfruit',
          'banana',
          'coconut',
        ],
        'Dried Fruit': ['raisin', 'fig', 'date', 'prune', 'dried apple', 'candied orange peel'],
        Orchard: ['apple', 'pear', 'quince', 'medlar'],
        Melon: ['cantaloupe', 'honeydew', 'watermelon'],
        'Other Fruits': ['olive', 'tomato', 'persimmon', 'pomegranate', 'cranapple'],
      },
    },
    Floral: {
      subcategories: ['White Flowers', 'Rose', 'Violet', 'Herb Flowers', 'Exotic', 'Field Flowers'],
      keywords: {
        'White Flowers': [
          'jasmine',
          'orange blossom',
          'lily',
          'honeysuckle',
          'gardenia',
          'magnolia',
          'freesia',
          'tuberose',
        ],
        Rose: ['rose', 'peony', 'damask rose', 'wild rose'],
        Violet: ['violet', 'iris', 'lilac', 'wisteria'],
        'Herb Flowers': ['chamomile', 'lavender', 'sage blossom', 'thyme flower', 'basil flower'],
        Exotic: ['hibiscus', 'frangipani', 'ylang ylang', 'osmanthus'],
        'Field Flowers': ['dandelion', 'meadow flower', 'clover', 'heather', 'wildflower honey'],
      },
    },
    Spicy: {
      subcategories: ['Pungent', 'Sweet Spice', 'Herbal Spice', 'Exotic Spice'],
      keywords: {
        Pungent: [
          'black pepper',
          'white pepper',
          'pink peppercorn',
          'green peppercorn',
          'chili',
          'cayenne',
          'paprika',
          'wasabi',
          'ginger',
          'galangal',
          'mustard seed',
        ],
        'Sweet Spice': [
          'cinnamon',
          'clove',
          'nutmeg',
          'allspice',
          'anise',
          'fennel seed',
          'cardamom',
          'vanilla bean',
          'star anise',
          'licorice',
        ],
        'Herbal Spice': [
          'thyme',
          'rosemary',
          'oregano',
          'sage',
          'coriander seed',
          'cumin',
          'dill seed',
          'bay leaf',
          'tarragon',
          'savory',
          'fenugreek',
        ],
        'Exotic Spice': [
          'saffron',
          'sumac',
          'mace',
          'turmeric',
          'curry leaf',
          'caraway',
          "za'atar",
          'grains of paradise',
        ],
      },
    },
    Earthy: {
      subcategories: ['Forest', 'Mineral', 'Mushroom', 'Tobacco', 'Root', 'Organic'],
      keywords: {
        Forest: [
          'moss',
          'forest floor',
          'soil',
          'humus',
          'wet leaves',
          'truffle',
          'mushroom',
          'porcini',
          'morel',
          'chanterelle',
        ],
        Mineral: [
          'clay',
          'flint',
          'limestone',
          'chalk',
          'wet stone',
          'iron',
          'graphite',
          'petrichor',
        ],
        Mushroom: ['mushroom', 'truffle', 'porcini', 'morel', 'chanterelle'],
        Tobacco: ['tobacco leaf', 'pipe tobacco', 'cigar box', 'snuff'],
        Root: ['beetroot', 'carrot', 'burdock', 'ginseng', 'sweet potato'],
        Organic: ['hay', 'straw', 'barnyard', 'compost', 'earth dust'],
      },
    },
    Woody: {
      subcategories: ['Oak', 'Cedar', 'Resinous', 'Smoky', 'Aged Wood'],
      keywords: {
        Oak: [
          'oak',
          'cedar',
          'pine',
          'mahogany',
          'ebony',
          'sandalwood',
          'maple',
          'cherry wood',
          'walnut wood',
        ],
        Cedar: ['cedar', 'pine', 'sandalwood'],
        Resinous: ['resin', 'amber', 'balsam', 'frankincense', 'myrrh'],
        Smoky: ['smoke', 'charred wood', 'bonfire', 'campfire', 'toast', 'ash', 'tar'],
        'Aged Wood': ['old barrel', 'sawdust', 'pencil shavings', 'dry wood'],
      },
    },
    Sweet: {
      subcategories: ['Caramel', 'Chocolate', 'Honey', 'Vanilla', 'Confection', 'Syrup'],
      keywords: {
        Caramel: [
          'caramel',
          'toffee',
          'butterscotch',
          'molasses',
          'maple syrup',
          'agave nectar',
          'brown sugar',
          'demerara',
          'burnt sugar',
        ],
        Chocolate: ['milk chocolate', 'dark chocolate', 'cocoa nib', 'white chocolate', 'ganache'],
        Honey: ['honey', 'acacia honey', 'chestnut honey', 'bee pollen'],
        Vanilla: ['vanilla', 'custard', 'cream soda', 'marshmallow'],
        Confection: ['candy floss', 'nougat', 'fudge', 'praline', 'marzipan'],
        Syrup: ['simple syrup', 'golden syrup', 'treacle'],
      },
    },
    Nutty: {
      subcategories: ['Tree Nuts', 'Roasted', 'Seed', 'Nut Paste'],
      keywords: {
        'Tree Nuts': [
          'almond',
          'walnut',
          'hazelnut',
          'pecan',
          'cashew',
          'macadamia',
          'pistachio',
          'brazil nut',
        ],
        Roasted: [
          'toasted nuts',
          'roasted peanut',
          'roasted sesame',
          'roasted chestnut',
          'toasted coconut',
        ],
        Seed: ['sunflower seed', 'pumpkin seed', 'flaxseed', 'chia seed'],
        'Nut Paste': ['peanut butter', 'almond paste', 'hazelnut cream', 'tahini'],
      },
    },
  },

  flavor: {
    Sweet: {
      keywords: [
        'sucrose',
        'honey',
        'agave',
        'maple syrup',
        'brown sugar',
        'molasses',
        'toffee',
        'vanilla cream',
        'jammy',
        'candied fruit',
        'caramelized',
        'marshmallow',
        'malt',
        'milk chocolate',
        'white chocolate',
        'confectionery',
        'buttered toast',
      ],
    },
    Sour: {
      keywords: [
        'citric acid',
        'malic acid',
        'lactic acid',
        'acetic acid',
        'tartaric acid',
        'lemony',
        'vinegary',
        'yogurt tang',
        'sour plum',
        'fermented apple',
        'pickle brine',
        'tamarind',
        'gooseberry',
        'kumquat',
      ],
    },
    Bitter: {
      keywords: [
        'coffee',
        'espresso',
        'dark chocolate',
        'cocoa husk',
        'roasted malt',
        'quinine',
        'tonic',
        'wormwood',
        'gentian',
        'grapefruit pith',
        'dandelion greens',
        'chicory',
        'burnt sugar',
        'charcoal',
      ],
    },
    Salty: {
      keywords: [
        'sea salt',
        'rock salt',
        'brine',
        'saline',
        'soy sauce',
        'miso paste',
        'anchovy',
        'olive brine',
        'salted caramel',
        'mineral salt',
      ],
    },
    Umami: {
      keywords: [
        'broth',
        'stock',
        'parmesan',
        'aged cheese',
        'mushroom umami',
        'miso',
        'seaweed',
        'kombu',
        'fish sauce',
        'truffle salt',
        'tomato paste',
        'cured meat',
        'prosciutto',
        'beef bouillon',
        'soy protein',
        'fermented bean',
      ],
    },
    Spicy: {
      keywords: [
        'pepper heat',
        'chili burn',
        'ginger warmth',
        'clove bite',
        'wasabi pungency',
        'cinnamon heat',
        'paprika warmth',
        'curry spice',
        'cumin sharpness',
        'szechuan tingle',
        'black cardamom',
        'long pepper',
      ],
    },
  },

  texture: {
    Mouthfeel: {
      keywords: [
        'smooth',
        'silky',
        'velvety',
        'creamy',
        'buttery',
        'unctuous',
        'oily',
        'slick',
        'coating',
        'waxy',
        'powdery',
        'chalky',
        'gritty',
        'grainy',
        'sandy',
        'fibrous',
        'pasty',
        'chewy',
        'sticky',
        'tacky',
        'drying',
        'astringent',
        'puckering',
        'rough',
        'fizzy',
        'effervescent',
        'tingling',
        'carbonated',
        'crisp',
        'snappy',
      ],
    },
    Temperature: {
      keywords: [
        'icy',
        'cold',
        'chilled',
        'cool',
        'refreshing',
        'menthol',
        'cooling',
        'room temperature',
        'lukewarm',
        'warm',
        'toasty',
        'heated',
        'scorching',
        'fiery',
        'warming',
      ],
    },
    Viscosity: {
      keywords: [
        'thin',
        'watery',
        'light-bodied',
        'medium-bodied',
        'thick',
        'dense',
        'syrupy',
        'gooey',
        'molten',
        'gel-like',
        'creamy-thick',
        'elastic',
      ],
    },
    Structure: {
      keywords: [
        'balanced',
        'round',
        'angular',
        'linear',
        'broad',
        'tight',
        'expansive',
        'compact',
        'persistent',
        'long finish',
        'short finish',
        'layered',
      ],
    },
  },

  metaphor: {
    Mood: {
      keywords: [
        'joyful',
        'serene',
        'brooding',
        'elegant',
        'bold',
        'playful',
        'mysterious',
        'nostalgic',
        'romantic',
        'energetic',
        'meditative',
        'vibrant',
        'warmhearted',
        'turbulent',
        'refined',
        'luxurious',
        'wild',
        'comforting',
        'exotic',
        'sophisticated',
      ],
    },
    Place: {
      keywords: [
        'seaside',
        'forest',
        'library',
        'mountain',
        'vineyard',
        'desert',
        'jungle',
        'garden',
        'market',
        'bakery',
        'temple',
        'roastery',
        'cellar',
        'orchard',
        'meadow',
        'harbor',
        'countryside',
        'tropical island',
        'winery',
        'spice bazaar',
      ],
    },
    Temporal: {
      keywords: [
        'youthful',
        'mature',
        'aged',
        'ancient',
        'timeless',
        'spring',
        'summer',
        'autumn',
        'winter',
        'dawn',
        'noon',
        'twilight',
        'evening',
        'midnight',
        'harvest',
        'vintage',
        'seasonal',
        'transient',
        'eternal',
      ],
    },
    Cultural: {
      keywords: [
        'balsamic',
        'sherry-like',
        'port-like',
        'saké-like',
        'bourbon-esque',
        'espresso-toned',
        'tea-like',
        'cacao-rich',
        'Mediterranean',
        'Latin',
        'Asian',
        'Nordic',
        'Middle Eastern',
        'French patisserie',
        'Mexican cocina',
        'Japanese umami',
        'Italian espresso',
        'Caribbean rum',
        'Peruvian cacao',
        'Nordic berry',
      ],
    },
  },
};

/**
 * Extract descriptors using keyword matching
 */
export function extractDescriptorsKeywordBased(text: string): ExtractedDescriptor[] {
  const descriptors: ExtractedDescriptor[] = [];
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+|[,;.]+/).filter((w) => w.length > 2);

  // Check against taxonomy
  Object.entries(FLAVOR_TAXONOMY).forEach(([type, categories]) => {
    Object.entries(categories).forEach(([category, data]) => {
      // Handle both structures: nested keywords object or direct keywords array
      if (Array.isArray(data.keywords)) {
        // Direct array of keywords
        (data.keywords as string[]).forEach((keyword: string) => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(lowerText)) {
            const exists = descriptors.some((d) => d.text.toLowerCase() === keyword.toLowerCase());

            if (!exists) {
              descriptors.push({
                text: keyword,
                type: type as 'aroma' | 'flavor' | 'texture' | 'metaphor',
                category,
                subcategory: null,
                confidence: 0.85,
              });
            }
          }
        });
      } else if (typeof data.keywords === 'object') {
        // Nested keywords object with subcategories
        Object.entries(data.keywords).forEach(([subcategory, keywords]) => {
          (keywords as string[]).forEach((keyword: string) => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(lowerText)) {
              const exists = descriptors.some(
                (d) => d.text.toLowerCase() === keyword.toLowerCase()
              );

              if (!exists) {
                descriptors.push({
                  text: keyword,
                  type: type as 'aroma' | 'flavor' | 'texture' | 'metaphor',
                  category,
                  subcategory,
                  confidence: 0.85,
                });
              }
            }
          });
        });
      }
    });
  });

  return descriptors;
}

/**
 * Enhanced extraction with intensity detection
 */
export function extractDescriptorsWithIntensity(
  text: string,
  intensityScore?: number
): ExtractedDescriptor[] {
  const descriptors = extractDescriptorsKeywordBased(text);

  // Intensity modifiers
  const intensityWords = {
    high: ['strong', 'intense', 'powerful', 'bold', 'pronounced', 'dominant'],
    medium: ['moderate', 'noticeable', 'present', 'apparent'],
    low: ['subtle', 'faint', 'delicate', 'hint of', 'whisper', 'trace'],
  };

  const lowerText = text.toLowerCase();

  descriptors.forEach((descriptor) => {
    // If numeric intensity provided, use it
    if (intensityScore) {
      descriptor.intensity = intensityScore;
    } else {
      // Infer from text
      const descriptorIndex = lowerText.indexOf(descriptor.text.toLowerCase());
      if (descriptorIndex === -1) {
        return;
      }

      // Look at surrounding words (30 chars before)
      const context = lowerText.substring(Math.max(0, descriptorIndex - 30), descriptorIndex);

      if (intensityWords.high.some((word) => context.includes(word))) {
        descriptor.intensity = 4;
      } else if (intensityWords.low.some((word) => context.includes(word))) {
        descriptor.intensity = 2;
      } else {
        descriptor.intensity = 3; // Default medium
      }
    }
  });

  return descriptors;
}

/**
 * Extract descriptors from structured review data
 */
export function extractFromStructuredReview(reviewData: {
  aroma_notes?: string;
  flavor_notes?: string;
  texture_notes?: string;
  other_notes?: string;
  aroma_intensity?: number;
  flavor_intensity?: number;
}): ExtractedDescriptor[] {
  const allDescriptors: ExtractedDescriptor[] = [];

  // Extract from aroma notes
  if (reviewData.aroma_notes) {
    const aromaDescriptors = extractDescriptorsWithIntensity(
      reviewData.aroma_notes,
      reviewData.aroma_intensity
    );
    aromaDescriptors.forEach((d) => {
      d.type = 'aroma';
      allDescriptors.push(d);
    });
  }

  // Extract from flavor notes
  if (reviewData.flavor_notes) {
    const flavorDescriptors = extractDescriptorsWithIntensity(
      reviewData.flavor_notes,
      reviewData.flavor_intensity
    );
    flavorDescriptors.forEach((d) => {
      d.type = 'flavor';
      allDescriptors.push(d);
    });
  }

  // Extract from texture notes
  if (reviewData.texture_notes) {
    const textureDescriptors = extractDescriptorsKeywordBased(reviewData.texture_notes);
    textureDescriptors.forEach((d) => {
      d.type = 'texture';
      allDescriptors.push(d);
    });
  }

  // Extract metaphors from other notes
  if (reviewData.other_notes) {
    const metaphorDescriptors = extractDescriptorsKeywordBased(reviewData.other_notes);
    metaphorDescriptors.forEach((d) => {
      if (d.type === 'metaphor') {
        allDescriptors.push(d);
      }
    });
  }

  // Remove duplicates
  const uniqueDescriptors = allDescriptors.filter(
    (descriptor, index, self) =>
      index ===
      self.findIndex(
        (d) => d.text.toLowerCase() === descriptor.text.toLowerCase() && d.type === descriptor.type
      )
  );

  return uniqueDescriptors;
}

/**
 * Main extraction function
 */
export function extractFlavorDescriptors(
  text: string,
  options?: {
    type?: 'aroma' | 'flavor' | 'texture' | 'metaphor';
    intensity?: number;
  }
): DescriptorExtractionResult {
  const descriptors = extractDescriptorsWithIntensity(text, options?.intensity);

  // Filter by type if specified
  const filteredDescriptors = options?.type
    ? descriptors.filter((d) => d.type === options.type)
    : descriptors;

  return {
    descriptors: filteredDescriptors,
    totalFound: filteredDescriptors.length,
    extractionMethod: 'keyword',
  };
}

/**
 * Get all available categories for a given type
 */
export function getAvailableCategories(
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor'
): string[] {
  return Object.keys(FLAVOR_TAXONOMY[type] || {});
}

/**
 * Get subcategories for a given category
 */
export function getSubcategories(
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor',
  category: string
): string[] {
  const categoryData = (FLAVOR_TAXONOMY[type] as any)?.[category];
  return categoryData?.subcategories || [];
}
