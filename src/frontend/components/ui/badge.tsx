import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'crimson' | 'sky' | 'obsidian' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sky',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-blue-50 text-status-emerald border-blue-200/80',
    amber: 'bg-amber-50 text-status-amber border-amber-200/80',
    crimson: 'bg-rose-50 text-status-crimson border-rose-200/80',
    sky: 'bg-sky-50 text-brand-deep border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    obsidian: 'bg-slate-900 text-white border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

