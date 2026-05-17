import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Concert, Showtime } from '../../types';
import { concertService } from '../../services/concertService';
import { showtimeService } from '../../services/showtimeService';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants/routes';

const DISPLAY_TZ = 'Asia/Ho_Chi_Minh';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    timeZone: DISPLAY_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('en-US', {
    timeZone: DISPLAY_TZ,
    hour: '2-digit',
    minute: '2-digit',
  });

const groupByDate = (showtimes: Showtime[]) => {
  const groups: Record<string, Showtime[]> = {};
  showtimes.forEach(st => {
    const date = formatDate(st.startTime);
    if (!groups[date]) groups[date] = [];
    groups[date].push(st);
  });
  return groups;
};

export const ConcertShowtimesPage: React.FC = () => {
  const { concertId } = useParams<{ concertId: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      if (!concertId) return;
      const [concertRes, showtimesRes] = await Promise.all([
        concertService.getConcertById(concertId),
        showtimeService.getAllShowtimes(),
      ]);
      setConcert(concertRes.data.result);
      // Filter showtimes for this concert (backend field is still "concertId" / "movieId")
      const all = showtimesRes.data.result || [];
      const filtered = all.filter(
        (st: any) => (st.concertId === concertId || st.movieId === concertId) && st.status === 'ACTIVE'
      );
      setShowtimes(filtered);
    } catch {
      setError('Unable to load showtimes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concertId]);

  const handleSelectShowtime = (showtimeId: string) => {
    navigate(ROUTES.SEAT_SELECTION(concertId!, showtimeId));
  };

  const groupedShowtimes = groupByDate(showtimes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-container py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Concert
          </button>
          {concert && (
            <div className="flex items-center gap-4">
              {concert.imageUrl && (
                <img src={concert.imageUrl} alt={concert.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Select Showtime</p>
                <h1 className="text-2xl font-black text-gray-900">{concert.title}</h1>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-container py-8 max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchData} className="mt-3 text-sm text-red-500 underline">Try again</button>
          </div>
        ) : Object.keys(groupedShowtimes).length === 0 ? (
          <EmptyState
            title="No showtimes available"
            description="There are currently no scheduled shows for this concert. Check back soon!"
            action={
              <button onClick={() => navigate(-1)} className="btn-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
                Go Back
              </button>
            }
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedShowtimes).map(([date, dateShowtimes]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                    {date}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {dateShowtimes.map(showtime => {
                    const start = formatTime(showtime.startTime);
                    const end = showtime.endTime ? formatTime(showtime.endTime) : '';
                    const available = showtime.availableSeats;
                    const total = showtime.totalSeats;
                    const pct = total && available != null ? (available / total) * 100 : null;
                    const isLimited = pct !== null && pct < 20;
                    const isSoldOut = available === 0;

                    return (
                      <div
                        key={showtime.id}
                        className={clsx(
                          'bg-white rounded-2xl border p-5 transition-all duration-300',
                          isSoldOut
                            ? 'border-gray-100 opacity-60'
                            : 'border-gray-100 hover:border-primary/30 hover:shadow-card cursor-pointer group'
                        )}
                        onClick={isSoldOut ? undefined : () => handleSelectShowtime(showtime.id)}
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{start}</p>
                              <p className="text-gray-400 text-xs">Ends {end}</p>
                            </div>
                          </div>

                          {/* Venue */}
                          {showtime.venueName && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                              </svg>
                              {showtime.venueName}
                            </div>
                          )}

                          {/* Availability */}
                          <div className="flex items-center gap-3">
                            {available != null && (
                              <div className="text-right">
                                <p className={clsx('text-sm font-semibold', isSoldOut ? 'text-red-500' : isLimited ? 'text-amber-500' : 'text-emerald-600')}>
                                  {isSoldOut ? 'Sold Out' : isLimited ? `${available} left` : `${available} seats`}
                                </p>
                                {pct !== null && (
                                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                                    <div
                                      className={clsx('h-full rounded-full transition-all', isSoldOut ? 'bg-red-400' : isLimited ? 'bg-amber-400' : 'bg-emerald-400')}
                                      style={{ width: `${Math.min(100 - pct, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            {isSoldOut ? (
                              <Badge variant="sold-out">Sold Out</Badge>
                            ) : (
                              <button className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200">
                                Select Seats
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
