import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant =
  | 'available' | 'limited' | 'sold-out'
  | 'live' | 'upcoming' | 'ended'
  | 'confirmed' | 'pending' | 'cancelled'
  | 'active' | 'scheduled' | 'expired'
  | 'vip' | 'normal' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  available:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  limited:    'bg-amber-50 text-amber-700 border-amber-200',
  'sold-out': 'bg-red-50 text-red-700 border-red-200',
  live:       'bg-pink-50 text-pink-700 border-pink-200',
  upcoming:   'bg-violet-50 text-violet-700 border-violet-200',
  ended:      'bg-gray-50 text-gray-600 border-gray-200',
  confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
  active:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled:  'bg-blue-50 text-blue-700 border-blue-200',
  expired:    'bg-gray-50 text-gray-600 border-gray-200',
  vip:        'bg-violet-50 text-violet-700 border-violet-200',
  normal:     'bg-cyan-50 text-cyan-700 border-cyan-200',
  default:    'bg-gray-100 text-gray-600 border-gray-200',
};

const dotColors: Record<BadgeVariant, string> = {
  available:  'bg-emerald-500',
  limited:    'bg-amber-500',
  'sold-out': 'bg-red-500',
  live:       'bg-pink-500',
  upcoming:   'bg-violet-500',
  ended:      'bg-gray-400',
  confirmed:  'bg-emerald-500',
  pending:    'bg-amber-500',
  cancelled:  'bg-red-500',
  active:     'bg-emerald-500',
  scheduled:  'bg-blue-500',
  expired:    'bg-gray-400',
  vip:        'bg-violet-500',
  normal:     'bg-cyan-500',
  default:    'bg-gray-400',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  size = 'sm',
  dot = false,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 border rounded-full font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

// Status badge map for concert status
export const getConcertStatusBadgeVariant = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    NOW_SHOWING: 'live',
    COMING_SOON: 'upcoming',
    ENDED: 'ended',
  };
  return map[status] ?? 'default';
};

export const getConcertStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    NOW_SHOWING: 'Live Events',
    COMING_SOON: 'Upcoming',
    ENDED: 'Past',
  };
  return map[status] ?? status;
};

export const getBookingStatusBadgeVariant = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    CONFIRMED: 'confirmed',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? 'default';
};
