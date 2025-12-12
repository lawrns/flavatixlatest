import React from 'react';
import { Icons } from './Icons';

// --- Card ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-bgCard rounded-card p-5 shadow-card ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-btn font-semibold text-[15px] py-3 px-6 transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary text-white shadow-sm hover:opacity-90 active:scale-[0.98]",
    secondary: "bg-bgCard text-textDark hover:bg-gray-200",
    outline: "border border-borderLight text-textDark bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent text-primary hover:bg-gray-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}
export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-iconGray">
          {icon}
        </div>
      )}
      <input 
        className={`w-full bg-bgCard rounded-input py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-textDark placeholder-textGray border border-transparent focus:border-primary focus:outline-none transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

// --- Badge ---
interface BadgeProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}
export const Badge: React.FC<BadgeProps> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active 
          ? 'bg-primary text-white' 
          : 'bg-bgCard text-textGray hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
};

// --- Category Icon Helper ---
export const CategoryIcon = ({ category }: { category: string }) => {
  const style = "w-5 h-5";
  switch(category) {
    case 'Wine': return <Icons.Wine className={`${style} text-purple-600`} />;
    case 'Coffee': return <Icons.Coffee className={`${style} text-amber-700`} />;
    case 'Chocolate': return <Icons.Chocolate className={`${style} text-amber-900`} />;
    default: return <Icons.Other className={`${style} text-gray-500`} />;
  }
};
