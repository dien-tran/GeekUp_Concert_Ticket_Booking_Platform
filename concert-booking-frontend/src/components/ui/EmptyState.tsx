import React from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-primary/8 text-primary">
          <div className="w-12 h-12 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      {!icon && (
        <div className="mb-4 text-6xl opacity-20">🎵</div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};

// Loading Skeleton
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'text', count = 1 }) => {
  const variants = {
    text: 'h-4 rounded-md',
    card: 'h-64 rounded-2xl',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 rounded-xl',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx('skeleton w-full', variants[variant], className)}
        />
      ))}
    </>
  );
};

export const ConcertCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card animate-pulse">
    <div className="skeleton h-48 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-5 rounded w-3/4" />
      <div className="skeleton h-4 rounded w-1/2" />
      <div className="skeleton h-4 rounded w-2/3" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-8 rounded-xl flex-1" />
        <div className="skeleton h-8 rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 rounded" />
      </td>
    ))}
  </tr>
);
