import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Concert } from '../../types';
import { Badge, getConcertStatusBadgeVariant, getConcertStatusLabel } from '../ui/Badge';
import { ROUTES } from '../../constants/routes';

interface ConcertCardProps {
  concert: Concert;
  className?: string;
}

export const ConcertCard: React.FC<ConcertCardProps> = ({ concert, className }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => navigate(ROUTES.CONCERT_DETAIL(concert.id));
  const handleBookNow = () => navigate(ROUTES.CONCERT_SHOWTIMES(concert.id));

  const releaseDate = concert.releaseDate
    ? new Date(concert.releaseDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  const isSoldOut = concert.status === 'ENDED';

  return (
    <div className={clsx(
      'group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card',
      'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover',
      className
    )}>
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
        {concert.imageUrl ? (
          <img
            src={concert.imageUrl}
            alt={concert.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={getConcertStatusBadgeVariant(concert.status)} dot>
            {getConcertStatusLabel(concert.status)}
          </Badge>
        </div>

        {/* Category badge */}
        {concert.categoryNames && concert.categoryNames.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/40 text-white rounded-lg backdrop-blur-sm">
              {concert.categoryNames[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {concert.title}
        </h3>

        {/* Artist/Performers */}
        {concert.actors && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {concert.actors}
          </p>
        )}

        {/* Date */}
        {releaseDate && (
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {releaseDate}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
          >
            Details
          </button>
          <button
            onClick={isSoldOut ? undefined : handleBookNow}
            disabled={isSoldOut}
            className={clsx(
              'flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200',
              isSoldOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-gradient text-white'
            )}
          >
            {isSoldOut ? 'Ended' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
