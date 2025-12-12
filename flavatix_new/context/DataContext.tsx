import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tasting, Review, FlavorWheelData, Activity, User } from '../types';
import { CURRENT_USER, RECENT_TASTINGS, RECENT_ACTIVITY, FLAVOR_WHEELS } from '../constants';

interface DataContextType {
  user: User;
  tastings: Tasting[];
  reviews: Review[];
  wheels: FlavorWheelData[];
  activities: Activity[];
  addTasting: (tasting: Omit<Tasting, 'id' | 'date' | 'timestamp'>) => void;
  addReview: (review: Omit<Review, 'id' | 'date' | 'timestamp'>) => void;
  addWheel: (wheel: Omit<FlavorWheelData, 'id'>) => void;
  updateUser: (updates: Partial<User>) => void;
  deleteTasting: (id: string) => void;
  deleteWheel: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'flavatix_data_v1';

// Initial mock data for Reviews not present in constants
const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    title: 'Blue Bottle Bella Donovan',
    rating: 4.5,
    text: 'A wonderful blend with notes of raspberry and chocolate.',
    category: 'Coffee',
    date: 'Oct 12',
    timestamp: Date.now() - 10000000,
  },
  {
    id: 'r2',
    title: 'Oaxaca Reserve Mezcal',
    rating: 4.8,
    text: 'Smoky, earthy, with a hint of citrus peel. Exceptional.',
    category: 'Other',
    date: 'Sep 25',
    timestamp: Date.now() - 20000000,
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [tastings, setTastings] = useState<Tasting[]>(RECENT_TASTINGS.map(t => ({...t, timestamp: Date.now()})));
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [wheels, setWheels] = useState<FlavorWheelData[]>(FLAVOR_WHEELS);
  const [activities, setActivities] = useState<Activity[]>(RECENT_ACTIVITY.map(a => ({...a, timestamp: Date.now()})));
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || CURRENT_USER);
        setTastings(parsed.tastings || RECENT_TASTINGS);
        setReviews(parsed.reviews || INITIAL_REVIEWS);
        setWheels(parsed.wheels || FLAVOR_WHEELS);
        setActivities(parsed.activities || RECENT_ACTIVITY);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isLoaded) return;
    const data = { user, tastings, reviews, wheels, activities };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [user, tastings, reviews, wheels, activities, isLoaded]);

  // Update user stats whenever lists change
  useEffect(() => {
    setUser(prev => ({
      ...prev,
      stats: {
        tastings: tastings.length,
        wheels: wheels.length,
        reviews: reviews.length,
      }
    }));
  }, [tastings.length, wheels.length, reviews.length]);

  const addActivity = (type: Activity['type'], title: string, subtitle: string, targetId?: string) => {
    const newActivity: Activity = {
      id: `a-${Date.now()}`,
      type,
      title,
      subtitle,
      targetId,
      date: 'Just now',
      timestamp: Date.now(),
      user: { name: user.name, avatar: user.avatar },
      image: user.avatar // Simplified for now
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const addTasting = (data: Omit<Tasting, 'id' | 'date' | 'timestamp'>) => {
    const newTasting: Tasting = {
      ...data,
      id: `t-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
    };
    setTastings(prev => [newTasting, ...prev]);
    addActivity('tasting', newTasting.title, `${newTasting.itemsTasted} item • ${newTasting.score.toFixed(1)}/5`, newTasting.id);
  };

  const addReview = (data: Omit<Review, 'id' | 'date' | 'timestamp'>) => {
    const newReview: Review = {
      ...data,
      id: `r-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
    };
    setReviews(prev => [newReview, ...prev]);
    addActivity('review', `Reviewed ${newReview.title}`, `${newReview.rating.toFixed(1)}/5 • ${newReview.category}`, newReview.id);
  };

  const addWheel = (data: Omit<FlavorWheelData, 'id'>) => {
    const newWheel: FlavorWheelData = {
      ...data,
      id: `w-${Date.now()}`,
      timestamp: Date.now(),
    };
    setWheels(prev => [newWheel, ...prev]);
    addActivity('wheel', `Created "${newWheel.name}"`, 'New Flavor Wheel', newWheel.id);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const deleteTasting = (id: string) => {
    setTastings(prev => prev.filter(t => t.id !== id));
  };

  const deleteWheel = (id: string) => {
    setWheels(prev => prev.filter(w => w.id !== id));
  };

  return (
    <DataContext.Provider value={{
      user,
      tastings,
      reviews,
      wheels,
      activities,
      addTasting,
      addReview,
      addWheel,
      updateUser,
      deleteTasting,
      deleteWheel
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
