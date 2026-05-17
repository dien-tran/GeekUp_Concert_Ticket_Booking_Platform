import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Concert } from '../../types';
import { ticketService } from '../../services/ticketService';
import { paymentService, bookingService } from '../../services/bookingService';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../constants/routes';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

interface SelectedTicket {
  ticketId: string;
  seatNumber: string;
  categoryName: string;
  price: number;
}

type CheckoutStep = 'review' | 'holding' | 'error' | 'success';

export const CheckoutConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // ── State from navigation ──
  const concertId = location.state?.concertId as string;
  const concert = location.state?.concert as Concert;
  const selectedTickets = location.state?.selectedTickets as SelectedTicket[];
  const ticketIds = location.state?.ticketIds as string[];
  const totalPriceFromNav = location.state?.totalPrice as number;

  // ── Local state ──
  const [step, setStep] = useState<CheckoutStep>('review');
  const [error, setError] = useState('');
  const [holdDurationMinutes] = useState(5);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState(0);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const redirectingRef = useRef(false);

  const totalPrice = totalPriceFromNav || selectedTickets?.reduce((s, t) => s + t.price, 0) || 0;
  const discountedTotal = Math.max(0, totalPrice - voucherDiscount);

  // ── Guard: missing state ──
  useEffect(() => {
    if (!concertId || !ticketIds?.length) {
      navigate(ROUTES.CONCERTS);
    }
  }, [concertId, ticketIds, navigate]);

  // ── Step 1: Hold tickets when entering checkout ──
  useEffect(() => {
    if (!concertId || !ticketIds?.length || step !== 'review') return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate(ROUTES.LOGIN, {
        state: { 
          fromCheckout: true, 
          checkoutState: location.state,
          message: 'Please sign in to continue your booking.'
        }
      });
      return;
    }

    // Hold the tickets
    setStep('holding');
    ticketService.holdTickets({
      ticketIds,
      concertId,
      userId,
      holdDuration: holdDurationMinutes,
    })
      .then(() => {
        setHoldSecondsRemaining(holdDurationMinutes * 60);
        setStep('review');
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message || err?.message || '';
        if (msg.toLowerCase().includes('not available') || msg.toLowerCase().includes('hold')) {
          setError('One or more seats are no longer available. Please select different seats.');
        } else if (msg.toLowerCase().includes('not existed') || msg.toLowerCase().includes('user')) {
          setError('Session expired. Please sign in again.');
        } else {
          setError(msg || 'Unable to hold seats. Please try again.');
        }
        setStep('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concertId]);

  // ── Countdown timer ──
  useEffect(() => {
    if (step !== 'review' || holdSecondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setHoldSecondsRemaining(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setError('Your seat hold has expired. Please select seats again.');
          setStep('error');
          setTimeout(() => navigate(ROUTES.CONCERTS), 3000);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [step, holdSecondsRemaining, navigate]);

  const minutes = Math.floor(holdSecondsRemaining / 60);
  const seconds = holdSecondsRemaining % 60;
  const isUrgent = holdSecondsRemaining > 0 && holdSecondsRemaining <= 60;
  const pct = holdDurationMinutes > 0 ? (holdSecondsRemaining / (holdDurationMinutes * 60)) * 100 : 0;
  const circumference = 2 * Math.PI * 52;

  // ── Voucher validation ──
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    try {
      const res = await voucherService.validateVoucher(voucherCode.trim());
      const voucher = res.data.result;
      // Calculate discount
      let discount = 0;
      if (voucher.discountType === 'PERCENTAGE') {
        discount = (totalPrice * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount) discount = Math.min(discount, voucher.maxDiscountAmount);
      } else {
        discount = voucher.discountValue;
      }
      setVoucherDiscount(discount);
      setVoucherApplied(true);
      setAppliedVoucherCode(voucherCode.trim());
      setVoucherError('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired voucher code.';
      setVoucherError(msg.includes('INVALID') ? 'Voucher not found, expired, or out of stock.' : msg);
      setVoucherApplied(false);
      setVoucherDiscount(0);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherApplied(false);
    setVoucherDiscount(0);
    setVoucherCode('');
    setAppliedVoucherCode('');
    setVoucherError('');
  };

  // ── Payment ──
  const handlePayment = async () => {
    if (!isLoggedIn) { setError('Please sign in to continue.'); return; }
    if (!concertId || !ticketIds?.length) { setError('Missing booking info.'); return; }

    setPaymentInProgress(true);
    setError('');
    try {
      const payRes = await paymentService.checkout({
        concertId,
        ticketIds,
        voucherCode: voucherApplied ? appliedVoucherCode : undefined,
      });

      const paymentUrl = payRes.data?.result?.url;
      if (!paymentUrl) throw new Error('Payment URL not available from server.');

      redirectingRef.current = true;
      clearInterval(timerRef.current!);
      window.location.href = paymentUrl; // Redirect to VNPay
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.toLowerCase().includes('hold') || msg.toLowerCase().includes('expired')) {
        setError('Seat hold has expired. Please go back and select seats again.');
        setTimeout(() => navigate(ROUTES.CONCERTS), 3000);
      } else if (msg.toLowerCase().includes('not available')) {
        setError('One or more seats are no longer available. Please select again.');
      } else {
        setError(msg || 'Payment failed. Please try again.');
      }
      setPaymentInProgress(false);
    }
  };

  const handleExit = useCallback(() => {
    setExitDialogOpen(false);
    clearInterval(timerRef.current!);
    navigate(-1);
  }, [navigate]);

  // ── Cleanup timer on unmount ──
  useEffect(() => () => clearInterval(timerRef.current!), []);

  // ── Render: Loading / Holding ──
  if (step === 'holding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Reserving your seats...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  // ── Render: Error ──
  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to Continue</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => navigate(ROUTES.CONCERTS)}>Browse Concerts</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Checkout Form ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] py-8">
      <div className="section-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <Badge variant="upcoming" size="md" dot>Checkout</Badge>
          <h1 className="text-3xl font-black text-gray-900 mt-3">Confirm Your Booking</h1>
          <p className="text-gray-500 mt-1">Review your seats and complete payment before your hold expires.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Countdown Ring */}
            {holdSecondsRemaining > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-primary/20 shadow-card p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none"
                        stroke={isUrgent ? '#EF4444' : '#7C3AED'} strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - pct / 100)}
                        className="transition-all duration-500" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black ${isUrgent ? 'text-red-500' : 'text-primary'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-400">remaining</span>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold mt-2 ${isUrgent ? 'text-red-500' : 'text-gray-600'}`}>
                    {isUrgent ? '⚠️ Hurry! Seats expire soon' : '🔒 Seats are reserved for you'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Concert Info */}
            {concert && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  Event Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Concert</p>
                    <p className="text-sm font-bold text-gray-800">{concert.title}</p>
                  </div>
                  {concert.startTime && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Date & Time</p>
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(concert.startTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {concert.duration && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-sm font-bold text-gray-800">{concert.duration} min</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Seats */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Your Seats ({selectedTickets?.length || 0})</h2>
              <div className="space-y-2">
                {selectedTickets?.map(ticket => (
                  <div key={ticket.ticketId} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${ticket.categoryName?.toUpperCase().includes('VIP') ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'}`}>
                        {ticket.seatNumber}
                      </span>
                      <span className="text-sm text-gray-600">{ticket.categoryName}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{currencyFormatter.format(ticket.price)}</span>
                  </div>
                ))}
              </div>

              {/* Voucher Input */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">Apply Voucher Code</p>
                {!voucherApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                      placeholder="Enter voucher code"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyVoucher}
                      loading={voucherLoading}
                      disabled={!voucherCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm font-semibold text-emerald-700">{appliedVoucherCode}</span>
                      <span className="text-xs text-emerald-600">— {currencyFormatter.format(voucherDiscount)} off</span>
                    </div>
                    <button onClick={handleRemoveVoucher} className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </div>
                )}
                {voucherError && <p className="text-xs text-red-500 mt-2">{voucherError}</p>}
              </div>

              {/* Price Total */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-700">{currencyFormatter.format(totalPrice)}</span>
                </div>
                {voucherApplied && voucherDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-semibold text-emerald-600">- {currencyFormatter.format(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-black text-primary">{currencyFormatter.format(discountedTotal)}</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && step === 'review' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">⚠️ {error}</div>
            )}

            {/* Pay Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handlePayment}
              loading={paymentInProgress}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            >
              {paymentInProgress ? 'Redirecting to payment...' : `Pay ${currencyFormatter.format(discountedTotal)}`}
            </Button>

            <button
              onClick={() => setExitDialogOpen(true)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Cancel and go back
            </button>
          </div>

          {/* Right: Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-primary/10 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Booking Info</h3>
              {[
                { icon: '🔒', title: 'Seats Reserved', desc: `Your seats are held for ${holdDurationMinutes} minutes.` },
                { icon: '⚡', title: 'Instant Confirmation', desc: 'E-ticket delivered right after payment.' },
                { icon: '📱', title: 'Digital Tickets', desc: 'Show your QR code at the venue — no printing needed.' },
                { icon: '💳', title: 'Secure Payment', desc: 'Powered by VNPay — Vietnam\'s trusted payment gateway.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold">Leave this page?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            Your seat reservation will be released and your selected seats may become unavailable. Are you sure you want to leave?
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <button onClick={() => setExitDialogOpen(false)}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            Stay on page
          </button>
          <button onClick={handleExit}
            className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
            Leave
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
