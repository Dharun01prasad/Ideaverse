import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

const sizes: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusColors: Record<string, string> = {
  online: 'bg-emerald-400 border-white',
  offline: 'bg-surface-300 border-white',
  busy: 'bg-danger-500 border-white',
};

const gradients = [
  'from-primary-400 to-violet-400',
  'from-accent-400 to-primary-400',
  'from-violet-400 to-pink-400',
  'from-emerald-400 to-accent-400',
  'from-amber-400 to-orange-400',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getGradient(name: string): string {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', status, className = '' }) => {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-surface-100`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-semibold ring-2 ring-surface-100`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${statusColors[status]}`}
        />
      )}
    </div>
  );
};
