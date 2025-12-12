import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  stats: {
    tastings: number;
    wheels: number;
    reviews: number;
  };
}

export interface Tasting {
  id: string;
  title: string;
  category: 'Wine' | 'Coffee' | 'Chocolate' | 'Other';
  score: number;
  date: string;
  timestamp: number;
  itemsTasted: number;
  image?: string;
  notes?: string[];
  description?: string;
}

export interface Review {
  id: string;
  title: string;
  rating: number;
  text: string;
  date: string;
  timestamp: number;
  category: string;
}

export interface Activity {
  id: string;
  type: 'tasting' | 'wheel' | 'review' | 'social';
  title: string;
  subtitle: string;
  targetId?: string;
  date: string;
  timestamp: number;
  image?: string;
  user: {
    name: string;
    avatar: string;
  };
}

export interface FlavorWheelData {
  id: string;
  name: string;
  description: string;
  data: { label: string; value: number; color: string }[];
  timestamp?: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}
