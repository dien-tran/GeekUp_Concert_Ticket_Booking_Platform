import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Concert } from '../../types';
import { concertService } from '../../services/concertService';
import { Badge, getConcertStatusBadgeVariant, getConcertStatusLabel } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

const getTrailerEmbedUrl = (trailerUrl: string | undefined): string | null => {
  if (!trailerUrl) return null;
  try {
    const parsed = new URL(trailerUrl);
    const host = parsed.hostname.replace('www.', '');
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace('/', '');
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') videoId = parsed.searchParams.get('v') || '';
      else if (parsed.pathname.startsWith('/shorts/')) videoId = parsed.pathname.split('/')[2] || '';
      else if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/')[2] || '';
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    return trailerUrl;
  } catch {
    return trailerUrl;
  }
};

export const ConcertDetailPage: React.FC = () => {
  const { concertId } = useParams<{ concertId: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    if (!concertId) return;
    concertService.getConcertById(concertId)
      .then(r => setConcert(r.data.result))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [concertId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading concert...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Concert Not Found</h2>
          <p className="text-gray-500 mb-6">The concert you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(ROUTES.CONCERTS)}>Browse Concerts</Button>
        </div>
      </div>
    );
  }

  const trailerEmbedUrl = getTrailerEmbedUrl(concert.trailerUrl);
  // Backend returns startTime and openDate; releaseDate is a mapped compat field
  const displayDate = concert.startTime || concert.openDate || concert.releaseDate;
  const eventDateLabel = displayDate
    ? new Date(displayDate).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'TBA';
  // posterUrl is the real backend field; imageUrl is the compat alias set by normalizeConcert
  const posterImage = concert.posterUrl || concert.imageUrl;

  const isLive = concert.status === 'NOW_SHOWING';
  const isEnded = concert.status === 'ENDED';

  // Navigate directly to seat selection — no intermediate showtime page needed
  const handleGetTickets = () => navigate(`/concerts/${concert.id}/seats`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8]">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-gradient-dark">
        {posterImage && (
          <img
            src={posterImage}
            alt={concert.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1E] via-[#0F0A1E]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0A1E]/80 to-transparent" />

        {/* Decorative orbs */}
        <div className="orb orb-primary w-64 h-64 top-0 right-0 opacity-20" />
        <div className="orb orb-secondary w-48 h-48 bottom-0 right-1/4 opacity-15" />

        <div className="absolute inset-0 flex items-end">
          <div className="section-container pb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant={getConcertStatusBadgeVariant(concert.status)} dot className="mb-3">
                {getConcertStatusLabel(concert.status)}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{concert.title}</h1>
              {concert.actors && (
                <p className="text-purple-200 text-sm">Performers: {concert.actors}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Poster + Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 mb-6">
                {posterImage ? (
                  <img src={posterImage} alt={concert.title} className="w-full object-cover aspect-[3/4]" />
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <svg className="w-24 h-24 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {!isEnded && (
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleGetTickets}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    }
                  >
                    {isLive ? 'Get Tickets Now' : 'Select Seats'}
                  </Button>
                )}
                {concert.trailerUrl && (
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={() => setTrailerOpen(true)}
                    leftIcon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    }
                  >
                    Watch Trailer
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              {/* Quick info grid */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Event Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                      label: 'Event Date',
                      value: eventDateLabel,
                    },
                    {
                      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      label: 'Duration',
                      value: concert.duration ? `${concert.duration} min` : 'TBA',
                    },
                    {
                      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
                      label: 'Category',
                      value: concert.categoryNames?.join(', ') || 'Concert',
                    },
                    {
                      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                      label: 'Status',
                      value: getConcertStatusLabel(concert.status),
                    },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="mt-0.5 text-primary">{item.icon}</div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performer/Director */}
              {(concert.director || concert.actors) && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Artists & Performers</h2>
                  {concert.director && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Organizer / Director</p>
                      <p className="text-sm font-semibold text-gray-800">{concert.director}</p>
                    </div>
                  )}
                  {concert.actors && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Performers</p>
                      <p className="text-sm font-semibold text-gray-800">{concert.actors}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {concert.description && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{concert.description}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trailer Dialog */}
      <Dialog open={trailerOpen} onClose={() => setTrailerOpen(false)} maxWidth="md" fullWidth>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Official Trailer — {concert.title}</h3>
          <IconButton onClick={() => setTrailerOpen(false)} size="small">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
          {trailerEmbedUrl ? (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={trailerOpen ? trailerEmbedUrl : undefined}
                title={`${concert.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">Trailer not available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
