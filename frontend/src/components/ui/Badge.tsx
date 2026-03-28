import React from 'react';

type BadgeVariant = 'pending' | 'confirmed' | 'live' | 'completed' | 'rejected' | 'info' | 'warning';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  confirmed: 'bg-primary-600/10 text-accent border-primary-600/20',
  live: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-main border-main text-muted',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  info: 'bg-primary-600/10 text-accent border-primary-600/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const dotColors: Record<BadgeVariant, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-primary-500',
  live: 'bg-emerald-500 animate-pulse',
  completed: 'bg-muted',
  rejected: 'bg-red-500',
  info: 'bg-accent',
  warning: 'bg-amber-500',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, dot = true, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1 h-1 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
