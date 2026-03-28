import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 cursor-pointer select-none';

  const variants: Record<string, string> = {
    primary: 'bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.98]',
    secondary: 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm hover:bg-slate-700 hover:border-slate-600 active:scale-[0.98]',
    ghost: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md active:scale-[0.98]',
    accent: 'bg-primary-600 text-white shadow-md hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.98]',
  };

  const sizes: Record<string, string> = {
    sm: 'text-sm px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
