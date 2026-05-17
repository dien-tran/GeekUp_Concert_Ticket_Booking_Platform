import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Concert } from '../../types';
import { concertService } from '../../services/concertService';
import { ConcertCard } from '../../components/concert/ConcertCard';
import { ConcertCardSkeleton } from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants/routes';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState<Concert[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const [liveRes, upcomingRes] = await Promise.all([
          concertService.getConcertsByStatus('NOW_SHOWING'),
          concertService.getConcertsByStatus('COMING_SOON'),
        ]);
        setLiveEvents(liveRes.data.result || []);
        setUpcomingEvents(upcomingRes.data.result || []);
      } catch {
        // fallback: fetch all
        try {
          const all = await concertService.getConcerts();
          const concerts = all.data.result || [];
          setLiveEvents(concerts.filter(c => c.status === 'NOW_SHOWING'));
          setUpcomingEvents(concerts.filter(c => c.status === 'COMING_SOON'));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchConcerts();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Booking',
      desc: 'Reserve your seats in seconds. No waiting, no hassle — just great music.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Seats',
      desc: 'Your seats are held exclusively for you during checkout — no double-booking.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'All Events',
      desc: 'Music, festivals, theater, sports — every live experience in one place.',
    },
  ];

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] pt-16 pb-24">
        {/* Decorative orbs */}
        <div className="orb orb-primary w-96 h-96 -top-24 -right-24 animate-float" />
        <div className="orb orb-secondary w-64 h-64 bottom-0 left-1/4 animate-float-slow" />
        <div className="orb orb-accent w-72 h-72 top-1/2 right-1/3 animate-float-delayed" />

        <div className="section-container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Concerts & Events — Book Now
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
              Your Ticket to Every
              <span className="block text-gradient-primary">Live Experience</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              Discover concerts, festivals, and shows near you. Pick your seats,
              grab your ticket, and make memories that last forever.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(ROUTES.CONCERTS)}
                className="btn-gradient text-white px-8 py-4 rounded-2xl text-base font-bold shadow-glow-primary hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Browse Concerts
                <svg className="inline ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate(ROUTES.MY_BOOKINGS)}
                className="px-8 py-4 rounded-2xl text-base font-bold border-2 border-primary/30 text-primary hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto"
              >
                My Bookings
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeInUp} className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { value: `${(liveEvents.length + upcomingEvents.length) || '10'}+`, label: 'Live Events' },
                { value: '500+', label: 'Happy Fans' },
                { value: '24/7', label: 'Support' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Events */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-sm font-medium text-pink-600 uppercase tracking-wider">Happening Now</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900">Live Events</h2>
            </div>
            <button
              onClick={() => navigate(ROUTES.CONCERTS)}
              className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ConcertCardSkeleton key={i} />)}
            </div>
          ) : liveEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🎵</div>
              <p className="font-medium">No live events right now</p>
              <p className="text-sm mt-1">Check back soon for exciting shows</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveEvents.slice(0, 8).map(concert => (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <ConcertCard concert={concert} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      {(loading || upcomingEvents.length > 0) && (
        <section className="py-16 bg-gradient-to-br from-[#F8F7FF] to-white">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-sm font-medium text-violet-600 uppercase tracking-wider">Coming Soon</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Upcoming Events</h2>
              </div>
              <button onClick={() => navigate(ROUTES.CONCERTS)} className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                View all <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <ConcertCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingEvents.slice(0, 8).map(concert => (
                  <motion.div key={concert.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <ConcertCard concert={concert} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Why ShowPass?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">The simplest way to book live event tickets — designed for fans, built for speed.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:shadow-card transition-all duration-300"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-primary text-white mb-5 shadow-md">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-dark relative overflow-hidden">
        <div className="orb orb-primary w-96 h-96 -top-24 -left-24 opacity-30" />
        <div className="orb orb-secondary w-64 h-64 -bottom-16 right-16 opacity-20" />
        <div className="section-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">Ready to Experience Live Music?</h2>
            <p className="text-purple-200 mb-8 max-w-lg mx-auto">Join thousands of fans who book with ShowPass every day.</p>
            <button
              onClick={() => navigate(ROUTES.CONCERTS)}
              className="btn-gradient px-10 py-4 rounded-2xl text-base font-bold text-white shadow-glow-primary hover:shadow-xl transition-all duration-300"
            >
              Find Concerts Near You
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
