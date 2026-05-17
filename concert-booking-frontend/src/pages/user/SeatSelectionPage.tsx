import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Concert, TicketCategory, Ticket } from '../../types';
import { concertService } from '../../services/concertService';
import { ticketService } from '../../services/ticketService';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

interface SelectedTicket {
  ticketId: string;
  seatNumber: string;
  categoryName: string;
  price: number;
  color: string;
}

// Assign a stable color palette per category index
const CATEGORY_PALETTES = [
  { bg: '#7C3AED', light: '#EDE9FE', text: '#7C3AED', border: '#A78BFA', label: 'VIP', gradient: 'linear-gradient(135deg,#7C3AED,#A855F7)' },
  { bg: '#0891B2', light: '#CFFAFE', text: '#0891B2', border: '#67E8F9', label: 'Balcony', gradient: 'linear-gradient(135deg,#0891B2,#06B6D4)' },
  { bg: '#059669', light: '#D1FAE5', text: '#059669', border: '#6EE7B7', label: 'Standard', gradient: 'linear-gradient(135deg,#059669,#10B981)' },
  { bg: '#D97706', light: '#FEF3C7', text: '#D97706', border: '#FCD34D', label: 'Floor', gradient: 'linear-gradient(135deg,#D97706,#F59E0B)' },
];

const SEATS_PER_ROW = 15;

function chunkSeats(tickets: Ticket[], perRow: number): Ticket[][] {
  const rows: Ticket[][] = [];
  for (let i = 0; i < tickets.length; i += perRow) {
    rows.push(tickets.slice(i, i + perRow));
  }
  return rows;
}

export const SeatSelectionPage: React.FC = () => {
  const { concertId } = useParams<{ concertId: string }>();
  const navigate = useNavigate();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  useEffect(() => {
    if (!concertId) return;
    setLoading(true);
    setError('');
    Promise.all([
      concertService.getConcertById(concertId),
      ticketService.getTicketsByConcert(concertId),
    ])
      .then(([concertRes, ticketRes]) => {
        setConcert(concertRes.data.result);
        // Sort: VIP/Balcony first (closest to stage), Standard/Floor last
        const cats = (ticketRes.data.result || []) as TicketCategory[];
        const sorted = [...cats].sort((a, b) => {
          const rank = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes('vip')) return 0;
            if (n.includes('balcony') || n.includes('premium')) return 1;
            if (n.includes('standard') || n.includes('standar')) return 2;
            return 3;
          };
          return rank(a.name) - rank(b.name);
        });
        setCategories(sorted);
      })
      .catch(() => setError('Unable to load ticket information. Please try again.'))
      .finally(() => setLoading(false));
  }, [concertId]);

  const handleToggleSeat = useCallback((ticket: Ticket, category: TicketCategory, palette: typeof CATEGORY_PALETTES[0]) => {
    if (ticket.status?.toUpperCase() !== 'AVAILABLE') return;
    setSelectedTickets(prev => {
      const idx = prev.findIndex(t => t.ticketId === ticket.id);
      if (idx >= 0) return prev.filter(t => t.ticketId !== ticket.id);
      return [...prev, {
        ticketId: ticket.id,
        seatNumber: ticket.seatNumber,
        categoryName: category.name,
        price: category.price,
        color: palette.bg,
      }];
    });
  }, []);

  const totalPrice = useMemo(() => selectedTickets.reduce((s, t) => s + t.price, 0), [selectedTickets]);

  const handleProceed = () => {
    if (selectedTickets.length === 0) { setError('Vui lòng chọn ít nhất một ghế.'); return; }
    setError('');
    navigate(ROUTES.CHECKOUT, {
      state: { concertId, concert, selectedTickets, ticketIds: selectedTickets.map(t => t.ticketId), totalPrice },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  if (error && !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F8F7FF 0%, #ffffff 50%, #FDF2F8 100%)' }}>
      {/* Sticky header */}
      <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 64, zIndex: 30 }}>
        <div className="section-container py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7C3AED')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Quay lại
            </button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>{concert?.title || 'Chọn ghế'}</h1>
              {concert?.startTime && (
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                  {new Date(concert.startTime).toLocaleString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

          {/* LEFT: Venue map */}
          <div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, fontSize: 12 }}>
              {[
                { color: '#D1FAE5', border: '#6EE7B7', label: 'Còn trống' },
                { color: '#FEF3C7', border: '#FCD34D', label: 'Đang giữ' },
                { color: '#FEE2E2', border: '#FCA5A5', label: 'Đã bán' },
                { color: '#A78BFA', border: '#7C3AED', label: 'Đã chọn' },
              ].map(({ color, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: color, border: `2px solid ${border}`, display: 'inline-block' }} />
                  {label}
                </div>
              ))}
              {categories.map((cat, i) => {
                const p = CATEGORY_PALETTES[i % CATEGORY_PALETTES.length];
                return (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: p.bg, display: 'inline-block' }} />
                    {cat.name}
                  </div>
                );
              })}
            </div>

            {/* ====== STAGE ====== */}
            <div style={{ position: 'relative', marginBottom: 40, textAlign: 'center' }}>
              {/* Perspective glow */}
              <div style={{
                width: '70%', margin: '0 auto',
                height: 48,
                background: 'linear-gradient(180deg, rgba(168,85,247,0.5) 0%, rgba(168,85,247,0.1) 100%)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                boxShadow: '0 -8px 40px rgba(168,85,247,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: 6, textTransform: 'uppercase' }}> STAGE</span>
              </div>
              {/* Stage floor */}
              <div style={{
                width: '80%', margin: '-2px auto 0',
                height: 8,
                background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.7),transparent)',
                borderRadius: 8,
                boxShadow: '0 0 24px rgba(168,85,247,0.8)',
              }} />
            </div>

            {/* ====== SEAT ZONES (VIP top → Standard bottom) ====== */}
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                <p style={{ fontWeight: 600, color: '#9CA3AF' }}>Chưa có ghế nào cho buổi diễn này</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>Vui lòng thử lại sau</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {categories.map((category, catIdx) => {
                  const palette = CATEGORY_PALETTES[catIdx % CATEGORY_PALETTES.length];
                  const rows = chunkSeats(category.tickets || [], SEATS_PER_ROW);
                  const available = category.availableQuantity ?? (category.totalQuantity - (category.soldQuantity ?? 0));

                  return (
                    <div key={category.id}>
                      {/* Zone label strip */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 12, padding: '6px 12px',
                        background: `${palette.bg}22`,
                        borderLeft: `3px solid ${palette.bg}`,
                        borderRadius: '0 8px 8px 0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: palette.bg, boxShadow: `0 0 8px ${palette.bg}` }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: palette.bg }}>
                            {category.name.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 12, color: '#374151' }}>
                            — {currencyFormatter.format(category.price)} / ghế
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: available > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                          {available} còn trống / {category.totalQuantity} ghế
                        </span>
                      </div>

                      {/* Seat rows */}
                      {!category.tickets || category.tickets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#6B7280', fontSize: 13 }}>
                          Chưa có ghế — Admin cần nhấn "Generate Seats"
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                          {rows.map((row, rowIdx) => (
                            <div key={rowIdx} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              {/* Row letter label */}
                              <span style={{ width: 20, fontSize: 10, color: '#9CA3AF', alignSelf: 'center', textAlign: 'right', marginRight: 4, fontWeight: 600 }}>
                                {String.fromCharCode(65 + rowIdx)}
                              </span>
                              {row.map(ticket => {
                                const isSelected = selectedTickets.some(t => t.ticketId === ticket.id);
                                const status = ticket.status?.toUpperCase();
                                const isAvailable = status === 'AVAILABLE';
                                const isHold = status === 'HOLD';
                                const isBooked = status === 'BOOKED';
                                const isHovered = hoveredSeat === ticket.id;

                                let bg = palette.bg + '33';
                                let border = palette.border;
                                let textColor = palette.text;
                                let cursor = 'pointer';
                                let opacity = 1;
                                let boxShadow = 'none';

                                if (isSelected) {
                                  bg = '#7C3AED';
                                  border = '#5B21B6';
                                  textColor = 'white';
                                  boxShadow = '0 0 12px rgba(124,58,237,0.7)';
                                } else if (isHold) {
                                  bg = '#FEF3C7'; border = '#FCD34D'; textColor = '#92400E'; cursor = 'not-allowed'; opacity = 0.7;
                                } else if (isBooked) {
                                  bg = '#FEE2E2'; border = '#FCA5A5'; textColor = '#991B1B'; cursor = 'not-allowed'; opacity = 0.5;
                                } else if (!isAvailable) {
                                  bg = '#1F2937'; border = '#374151'; textColor = '#6B7280'; cursor = 'not-allowed'; opacity = 0.4;
                                } else if (isHovered && isAvailable) {
                                  bg = palette.bg;
                                  textColor = 'white';
                                  boxShadow = `0 0 10px ${palette.bg}99`;
                                }

                                // Extract just the seat number suffix (e.g. "001" from "VIP-001")
                                const parts = ticket.seatNumber?.split('-');
                                const shortNum = parts?.[parts.length - 1] || ticket.seatNumber;

                                return (
                                  <motion.button
                                    key={ticket.id}
                                    whileTap={isAvailable ? { scale: 0.88 } : {}}
                                    style={{
                                      width: 28,
                                      height: 24,
                                      borderRadius: 5,
                                      border: `1.5px solid ${border}`,
                                      background: bg,
                                      color: textColor,
                                      fontSize: 9,
                                      fontWeight: 700,
                                      cursor,
                                      opacity,
                                      boxShadow,
                                      transition: 'all 0.12s ease',
                                      position: 'relative',
                                    }}
                                    title={`${ticket.seatNumber} — ${ticket.status} — ${currencyFormatter.format(category.price)}`}
                                    onMouseEnter={() => isAvailable && setHoveredSeat(ticket.id)}
                                    onMouseLeave={() => setHoveredSeat(null)}
                                    onClick={() => handleToggleSeat(ticket, category, palette)}
                                  >
                                    {shortNum}
                                  </motion.button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Venue floor label */}
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{
                display: 'inline-block',
                padding: '8px 32px',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 24,
                fontSize: 11,
                color: '#9CA3AF',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}>
                Sảnh chính / Floor
              </div>
            </div>
          </div>

          {/* RIGHT: Booking summary */}
          <div style={{ position: 'sticky', top: 96 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              {/* Summary header */}
              <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#7C3AED,#DB2777)', }}>
                <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0 }}>Tóm tắt đặt vé</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
                  {selectedTickets.length} ghế đã chọn
                </p>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {concert && (
                  <div>
                    <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Buổi diễn</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{concert.title}</p>
                  </div>
                )}

                {/* Category legend in summary */}
                <div>
                  <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Hạng vé</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {categories.map((cat, i) => {
                      const p = CATEGORY_PALETTES[i % CATEGORY_PALETTES.length];
                      return (
                        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.bg, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#374151' }}>{cat.name}</span>
                          </div>
                          <span style={{ fontSize: 12, color: p.bg, fontWeight: 700 }}>{currencyFormatter.format(cat.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected seats */}
                <div>
                  <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Ghế đã chọn</p>
                  <AnimatePresence>
                    {selectedTickets.length === 0 ? (
                      <div style={{ border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Chưa chọn ghế nào</p>
                        <p style={{ fontSize: 11, color: '#6B7280', margin: '4px 0 0' }}>Nhấn vào ghế trống bên trái</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedTickets.map(t => (
                          <motion.div
                            key={t.ticketId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '3px 8px',
                              borderRadius: 8,
                              background: t.color + '33',
                              border: `1px solid ${t.color}66`,
                            }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{t.seatNumber}</span>
                            <button
                              onClick={() => setSelectedTickets(prev => prev.filter(x => x.ticketId !== t.ticketId))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', lineHeight: 1 }}
                            >×</button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price breakdown */}
                {selectedTickets.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12 }}>
                    {selectedTickets.map(t => (
                      <div key={t.ticketId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>{t.seatNumber}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{currencyFormatter.format(t.price)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>Tổng cộng</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#A78BFA' }}>{currencyFormatter.format(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#FCA5A5' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleProceed}
                  disabled={selectedTickets.length === 0}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    border: 'none',
                    background: selectedTickets.length === 0
                      ? 'rgba(255,255,255,0.08)'
                      : 'linear-gradient(135deg,#7C3AED,#DB2777)',
                    color: selectedTickets.length === 0 ? '#6B7280' : 'white',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: selectedTickets.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedTickets.length > 0 ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
                  }}
                >
                  {selectedTickets.length === 0 ? 'Chọn ghế để tiếp tục' : `Tiến hành thanh toán →`}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
