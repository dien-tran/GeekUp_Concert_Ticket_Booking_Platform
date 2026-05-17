import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Booking, Concert } from '../../types';
import { bookingService } from '../../services/bookingService';
import { concertService } from '../../services/concertService';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../types/booking';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [concertsMap, setConcertsMap] = useState<Record<string, Concert>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN + '?redirect=/my-bookings');
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingService.getMyBookings();
      const data = (res.data.result || []) as Booking[];
      setBookings(data);

      // Enrich with concert titles
      const uniqueConcertIds = Array.from(new Set(data.map((b: any) => b.concertId).filter(Boolean)));
      const concertResults = await Promise.allSettled(
        uniqueConcertIds.map(id => concertService.getConcertById(id))
      );
      const map: Record<string, Concert> = {};
      concertResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          map[uniqueConcertIds[i]] = result.value.data.result;
        }
      });
      setConcertsMap(map);
    } catch (err: any) {
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] py-8">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">My Account</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">View and manage all your concert tickets.</p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-600">{error}</div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6">Start by exploring concerts and grabbing your tickets!</p>
            <Button onClick={() => navigate(ROUTES.CONCERTS)}>Browse Concerts</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking, i) => {
              const concert = concertsMap[booking.concertId];
              const statusLabel = BOOKING_STATUS_LABELS[booking.status] || booking.status;
              const statusClasses = BOOKING_STATUS_COLORS[booking.status] || 'text-gray-600 bg-gray-50 border-gray-200';
              const isQrExpanded = expandedQr === booking.bookingId;

              return (
                <motion.div
                  key={booking.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden"
                >
                  {/* Top stripe */}
                  <div className={`h-1.5 w-full ${booking.status === 'CONFIRMED' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : booking.status === 'CANCELLED' ? 'bg-red-300' : 'bg-amber-300'}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-gray-900 truncate">
                          {concert?.title || `Booking #${booking.bookingId.slice(0, 8)}`}
                        </h2>
                        {concert?.startTime && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(concert.startTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full border text-xs font-bold ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Seat Codes */}
                    {booking.seatCodes?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Seats</p>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.seatCodes.map(code => (
                            <span key={code} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary">
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Booked on</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                          {booking.bookingTime ? new Date(booking.bookingTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tickets</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{booking.ticketIds?.length || booking.seatCodes?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Amount</p>
                        <p className="text-sm font-bold text-primary mt-0.5">{currencyFormatter.format(booking.totalPrice)}</p>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    {booking.status === 'CONFIRMED' && booking.qrToken && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedQr(isQrExpanded ? null : booking.bookingId)}
                          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          {isQrExpanded ? 'Hide' : 'Show'} Entry QR Code
                          <svg className={`w-3 h-3 transition-transform ${isQrExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isQrExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 flex flex-col items-center">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 inline-block">
                              <QRCodeSVG
                                value={booking.qrToken}
                                size={200}
                                level="H"
                                includeMargin
                                imageSettings={{
                                  src: '/logo192.png',
                                  height: 32,
                                  width: 32,
                                  excavate: true,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                              Show this QR code at the venue entrance
                              {booking.qrStatus && (
                                <span className={`ml-1 font-semibold ${booking.qrStatus === 'ACTIVE' ? 'text-emerald-600' : booking.qrStatus === 'USED' ? 'text-gray-400' : 'text-red-500'}`}>
                                  · {booking.qrStatus}
                                </span>
                              )}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.CONCERT_DETAIL(booking.concertId))}
                      >
                        View Concert
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
