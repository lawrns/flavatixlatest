import { Tasting, User, Activity, FlavorWheelData } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'hen',
  handle: '@hen_tastes',
  avatar: 'https://picsum.photos/100/100',
  stats: {
    tastings: 8,
    wheels: 3,
    reviews: 24,
  },
};

export const RECENT_TASTINGS: Tasting[] = [
  {
    id: 't1',
    title: 'Ethiopian Yirgacheffe',
    category: 'Coffee',
    score: 4.8,
    date: 'Oct 15',
    timestamp: 1697328000000,
    itemsTasted: 1,
    notes: ['Floral', 'Citrus'],
  },
  {
    id: 't2',
    title: 'Pinot Noir Reserve',
    category: 'Wine',
    score: 4.2,
    date: 'Sep 30',
    timestamp: 1696032000000,
    itemsTasted: 1,
    notes: ['Berry', 'Oak'],
  },
  {
    id: 't3',
    title: 'Dark 70% Ecuador',
    category: 'Chocolate',
    score: 4.5,
    date: 'Sep 28',
    timestamp: 1695859200000,
    itemsTasted: 3,
  },
];

export const RECENT_ACTIVITY: Activity[] = [
  {
    id: 'a1',
    type: 'tasting',
    title: 'Quick Tasting',
    subtitle: '1 item • 4.8/5.0',
    date: '2h ago',
    timestamp: Date.now() - 7200000,
    image: 'https://picsum.photos/200/200?random=1',
    user: { name: 'hen', avatar: CURRENT_USER.avatar },
  },
  {
    id: 'a2',
    type: 'wheel',
    title: 'Created "Spicy Reds"',
    subtitle: 'New Flavor Wheel',
    date: '1d ago',
    timestamp: Date.now() - 86400000,
    image: 'https://picsum.photos/200/200?random=2',
    user: { name: 'hen', avatar: CURRENT_USER.avatar },
  },
  {
    id: 'a3',
    type: 'social',
    title: 'Joined "Summer Whites"',
    subtitle: 'Community Event',
    date: '3d ago',
    timestamp: Date.now() - 259200000,
    image: 'https://picsum.photos/200/200?random=3',
    user: { name: 'hen', avatar: CURRENT_USER.avatar },
  },
];

export const FLAVOR_WHEELS: FlavorWheelData[] = [
  {
    id: 'w1',
    name: 'Fruity Profile',
    description: 'Berries, citrus, and stone fruits.',
    data: [
      { label: 'Citrus', value: 80, color: '#FFD700' },
      { label: 'Berry', value: 60, color: '#C71585' },
      { label: 'Stone', value: 40, color: '#FFA07A' },
    ],
  },
  {
    id: 'w2',
    name: 'Earth & Oak',
    description: 'Deep notes for complex reds.',
    data: [
      { label: 'Oak', value: 90, color: '#8B4513' },
      { label: 'Earth', value: 70, color: '#556B2F' },
      { label: 'Spice', value: 50, color: '#A0522D' },
    ],
  },
];