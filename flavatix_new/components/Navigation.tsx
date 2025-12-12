import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { NavItem } from '../types';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Home', path: '/', icon: Icons.Home },
    { label: 'Tastings', path: '/tastings', icon: Icons.Tastings },
    { label: 'Wheels', path: '/wheels', icon: Icons.Wheels },
    { label: 'Reviews', path: '/reviews', icon: Icons.Reviews },
    { label: 'Profile', path: '/profile', icon: Icons.Profile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-[60px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center w-12 gap-1 group"
            >
              <div className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-iconGray group-hover:text-gray-600'}`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-iconGray'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for mobile */}
      <div className="h-4 w-full bg-white"></div>
    </div>
  );
};

export const FloatingActionButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Logic to hide FAB on pages where it might obstruct or isn't needed
  const hidePaths = ['/create', '/quick-tasting', '/create-wheel', '/reviews'];
  if (hidePaths.some(path => location.pathname.includes(path))) return null;

  return (
    <button
      onClick={() => navigate('/quick-tasting')}
      className="fixed bottom-24 right-6 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform z-40 hover:bg-red-700"
      aria-label="Quick Tasting"
    >
      <Icons.Plus size={24} strokeWidth={3} />
    </button>
  );
};
