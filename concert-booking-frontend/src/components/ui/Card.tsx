import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border transition-all duration-300',
        glass
          ? 'glass shadow-card'
          : 'bg-white border-gray-100 shadow-card',
        hover && 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Stat Card for admin dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string;
  bgClass?: string;
  trend?: { value: string; up: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  colorClass = 'text-primary',
  bgClass = 'bg-primary/10',
  trend,
}) => {
  return (
    <Card hover className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 -translate-y-4 translate-x-4">
        <div className={clsx('w-full h-full rounded-full', bgClass)} />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
          {trend && (
            <div className={clsx(
              'mt-2 flex items-center gap-1 text-xs font-medium',
              trend.up ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>{trend.up ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl flex-shrink-0', bgClass, colorClass)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
