import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Stack, Chip, Divider, LinearProgress, Avatar } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { adminBookingService, adminConcertService, adminUserService } from '../services/adminApi';
import { Booking, Concert } from '../types';

const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const fmtShort = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v);

const BRAND = 'linear-gradient(135deg,#7C3AED 0%,#DB2777 100%)';
const COLORS = ['#7C3AED','#DB2777','#0891B2','#059669','#D97706','#DC2626'];

const RevenueTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ px: 2, py: 1.5, borderRadius: 2, background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <Typography variant="body2" fontWeight={700}>{payload[0]?.payload?.fullLabel || payload[0]?.payload?.label}</Typography>
      <Typography variant="body2" sx={{ color: '#7C3AED', fontWeight: 700 }}>Revenue: {fmt.format(payload[0]?.value || 0)}</Typography>
    </Box>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; sub?: string; icon: React.ReactNode; gradient: string; iconBg: string }> =
  ({ title, value, sub, icon, gradient, iconBg }) => (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', background: '#fff', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(124,58,237,0.12)' } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: '#111827', fontSize: { xs: '1.6rem', md: '2rem' } }}>{value}</Typography>
            {sub && <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>{sub}</Typography>}
          </Box>
          <Avatar sx={{ width: 52, height: 52, background: iconBg, borderRadius: 2 }}>{icon}</Avatar>
        </Box>
        <Box sx={{ mt: 2, height: 3, borderRadius: 2, background: gradient, opacity: 0.3 }} />
      </CardContent>
    </Card>
  );

export const AdminDashboard: React.FC = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filter, setFilter] = useState<'DAY' | 'WEEK' | 'CONCERT'>('DAY');

  useEffect(() => {
    Promise.all([
      adminConcertService.getConcerts(),
      adminBookingService.getAllBookings(),
      adminUserService.getAllUsers(),
    ]).then(([c, b, u]) => {
      setConcerts(c.data.result ?? []);
      setBookings(b.data.result ?? []);
      setTotalUsers((u.data.result ?? []).length);
    }).catch(console.error);
  }, []);

  const confirmed = useMemo(() => bookings.filter(b => b.status === 'CONFIRMED'), [bookings]);
  const pending = useMemo(() => bookings.filter(b => b.status === 'PENDING'), [bookings]);
  const totalTickets = useMemo(() => confirmed.reduce((s, b) => s + (b.seatCodes?.length || b.ticketIds?.length || 0), 0), [confirmed]);
  const totalRevenue = useMemo(() => confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0), [confirmed]);

  // Per-concert stats
  const concertStats = useMemo(() => {
    const concertMap = new Map(concerts.map(c => [c.id, c.title]));
    const map = new Map<string, { title: string; bookings: number; tickets: number; revenue: number }>();
    confirmed.forEach(b => {
      const id = b.concertId || 'unknown';
      const title = concertMap.get(id) || `Concert #${id.slice(0, 8)}`;
      const prev = map.get(id) || { title, bookings: 0, tickets: 0, revenue: 0 };
      map.set(id, {
        title,
        bookings: prev.bookings + 1,
        tickets: prev.tickets + (b.seatCodes?.length || b.ticketIds?.length || 0),
        revenue: prev.revenue + (b.totalPrice || 0),
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [confirmed, concerts]);

  // Chart data
  const chartData = useMemo(() => {
    if (filter === 'CONCERT') {
      return concertStats.slice(0, 8).map(c => ({
        label: c.title.length > 16 ? c.title.slice(0, 16) + '…' : c.title,
        fullLabel: c.title,
        revenue: c.revenue,
      }));
    }
    const buckets = new Map<string, number>();
    const now = new Date();
    if (filter === 'DAY') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        buckets.set(key, 0);
      }
      confirmed.forEach(b => {
        const d = new Date(b.bookingTime);
        const key = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        if (buckets.has(key)) buckets.set(key, (buckets.get(key)||0) + (b.totalPrice||0));
      });
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i * 7);
        const key = `W${getWeek(d)}`;
        buckets.set(key, 0);
      }
      confirmed.forEach(b => {
        const key = `W${getWeek(new Date(b.bookingTime))}`;
        if (buckets.has(key)) buckets.set(key, (buckets.get(key)||0) + (b.totalPrice||0));
      });
    }
    return Array.from(buckets.entries()).map(([label, revenue]) => ({ label, fullLabel: label, revenue }));
  }, [filter, confirmed, concertStats]);

  const maxRevenue = Math.max(...concertStats.map(c => c.revenue), 1);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#111827' }}>Overview Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>Revenue & ticket statistics by concert</Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Concerts" value={concerts.length}
            sub={`${concerts.filter(c => c.status === 'NOW_SHOWING').length} now showing`}
            icon={<MusicNoteIcon sx={{ color: '#7C3AED', fontSize: 28 }} />}
            gradient={BRAND} iconBg="rgba(124,58,237,0.12)" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Bookings" value={bookings.length}
            sub={`${pending.length} pending`}
            icon={<EventAvailableIcon sx={{ color: '#DB2777', fontSize: 28 }} />}
            gradient="linear-gradient(135deg,#DB2777,#F472B6)" iconBg="rgba(219,39,119,0.12)" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Confirmed Tickets" value={totalTickets}
            sub={`${confirmed.length} confirmed bookings`}
            icon={<ConfirmationNumberIcon sx={{ color: '#059669', fontSize: 28 }} />}
            gradient="linear-gradient(135deg,#059669,#10B981)" iconBg="rgba(5,150,105,0.12)" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Revenue" value={fmt.format(totalRevenue)}
            sub="From confirmed bookings"
            icon={<TrendingUpIcon sx={{ color: '#D97706', fontSize: 28 }} />}
            gradient="linear-gradient(135deg,#D97706,#F59E0B)" iconBg="rgba(217,119,6,0.12)" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue chart */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827' }}>Revenue Chart</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Filter: {filter === 'DAY' ? 'Last 30 days' : filter === 'WEEK' ? 'Last 12 weeks' : 'By concert'}</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {(['DAY','WEEK','CONCERT'] as const).map(f => (
                  <Chip key={f} label={f === 'DAY' ? 'Daily' : f === 'WEEK' ? 'Weekly' : 'Concert'}
                    onClick={() => setFilter(f)} size="small"
                    sx={{ fontWeight: 700, cursor: 'pointer',
                      background: filter === f ? BRAND : 'transparent',
                      color: filter === f ? '#fff' : '#6B7280',
                      border: filter === f ? 'none' : '1px solid #E5E7EB',
                    }} />
                ))}
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 320 }}>
              {chartData.every(d => d.revenue === 0) ? (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: 40 }}>📊</Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No revenue data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: filter === 'CONCERT' ? 60 : 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} interval={filter === 'DAY' ? 4 : 0}
                      angle={filter === 'CONCERT' ? -30 : 0} textAnchor={filter === 'CONCERT' ? 'end' : 'middle'}
                      height={filter === 'CONCERT' ? 70 : 30} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v: number) => fmtShort(v)} width={72} />
                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                    <Bar dataKey="revenue" radius={[6,6,0,0]} maxBarSize={52}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Per-concert breakdown */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827' }}>Revenue by Concert</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Top {Math.min(concertStats.length, 6)} concerts</Typography>
              </Box>
              <Chip label={`${concertStats.length} concerts`} size="small" sx={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', fontWeight: 700 }} />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {concertStats.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 36, mb: 1 }}>🎵</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Chưa có đơn đặt vé nào được xác nhận</Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {concertStats.slice(0, 6).map((c, i) => {
                  const pct = Math.round((c.revenue / maxRevenue) * 100);
                  return (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.8 }}>
                        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            {c.bookings} bookings · {c.tickets} tickets
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={800} sx={{ color: COLORS[i % COLORS.length], flexShrink: 0 }}>
                          {fmt.format(c.revenue)}
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 6, borderRadius: 3, backgroundColor: '#F3F4F6',
                          '& .MuiLinearProgress-bar': { borderRadius: 3, background: COLORS[i % COLORS.length] } }} />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Bookings status summary */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827', mb: 2 }}>Booking Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'Confirmed', count: confirmed.length, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
              { label: 'Pending', count: pending.length, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
              { label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length, color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
            ].map(s => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, background: s.bg, mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: s.color }}>{s.label}</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: s.color }}>{s.count}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* User & platform info */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827', mb: 2 }}>Platform Overview</Typography>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'Total Users', value: totalUsers, icon: <PeopleIcon sx={{ fontSize: 20, color: '#7C3AED' }} />, bg: 'rgba(124,58,237,0.08)' },
              { label: 'Now Showing', value: concerts.filter(c => c.status === 'NOW_SHOWING').length, icon: <MusicNoteIcon sx={{ fontSize: 20, color: '#DB2777' }} />, bg: 'rgba(219,39,119,0.08)' },
              { label: 'Coming Soon', value: concerts.filter(c => c.status === 'COMING_SOON').length, icon: <EventAvailableIcon sx={{ fontSize: 20, color: '#0891B2' }} />, bg: 'rgba(8,145,178,0.08)' },
            ].map(s => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, background: s.bg, mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {s.icon}
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#374151' }}>{s.label}</Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#111827' }}>{s.value}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Top concerts quick table */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111827', mb: 2 }}>Top Performing Concerts</Typography>
            <Divider sx={{ mb: 2 }} />
            {concertStats.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No data available</Typography>
              </Box>
            ) : concertStats.slice(0, 4).map((c, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 800, background: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{c.tickets} tickets · {fmt.format(c.revenue)}</Typography>
                </Box>
              </Stack>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

function getWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
