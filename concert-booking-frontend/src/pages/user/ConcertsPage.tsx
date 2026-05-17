import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Concert, Category } from '../../types';
import { concertService, categoryService } from '../../services/concertService';
import { useCategory } from '../../context/CategoryContext';
import { useSearch } from '../../context/SearchContext';
import { ConcertCard } from '../../components/concert/ConcertCard';
import { ConcertCardSkeleton, EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/FormInputs';

type StatusFilter = 'ALL' | 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All Events' },
  { key: 'NOW_SHOWING', label: 'Live Events' },
  { key: 'COMING_SOON', label: 'Upcoming' },
  { key: 'ENDED', label: 'Past' },
];

export const ConcertsPage: React.FC = () => {
  const { selectedCategoryId, setSelectedCategory } = useCategory();
  const { searchKeyword, setSearchKeyword } = useSearch();

  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [localSearch, setLocalSearch] = useState(searchKeyword || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [concertsRes, categoriesRes] = await Promise.all([
          concertService.getConcerts(),
          categoryService.getCategories(),
        ]);
        setAllConcerts(concertsRes.data.result || []);
        setCategories(categoriesRes.data.result || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => { setLocalSearch(searchKeyword || ''); }, [searchKeyword]);

  const filtered = allConcerts.filter(c => {
    const matchStatus = activeStatus === 'ALL' || c.status === activeStatus;
    const matchCategory = !selectedCategoryId ||
      c.categoryIds?.includes(selectedCategoryId) ||
      c.categoryNames?.some(n => n === categories.find(cat => cat.id === selectedCategoryId)?.name);
    const kw = localSearch.trim().toLowerCase();
    const matchSearch = !kw ||
      c.title.toLowerCase().includes(kw) ||
      (c.actors || '').toLowerCase().includes(kw) ||
      (c.description || '').toLowerCase().includes(kw);
    return matchStatus && matchCategory && matchSearch;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(localSearch || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-container py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-gray-900 mb-1">Browse Concerts</h1>
            <p className="text-gray-500 text-sm">Discover live music, festivals, and events near you</p>
          </motion.div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* Status tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl flex-shrink-0 overflow-x-auto w-full sm:w-auto">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                  activeStatus === tab.key
                    ? 'bg-white text-primary shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category filter
          <select
            value={selectedCategoryId || ''}
            onChange={e => {
              const cat = categories.find(c => c.id === e.target.value);
              setSelectedCategory(e.target.value || null, cat?.name || null);
            }}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select> */}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-xs">
            <SearchInput
              placeholder="Search concerts, artists..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onClear={() => { setLocalSearch(''); setSearchKeyword(null); }}
            />
          </form>

          {/* Results count */}
          {!loading && (
            <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">
              {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        {/* Active filters */}
        {(selectedCategoryId || localSearch) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-gray-500">Filters:</span>
            {localSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                "{localSearch}"
                <button onClick={() => { setLocalSearch(''); setSearchKeyword(null); }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {selectedCategoryId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                {categories.find(c => c.id === selectedCategoryId)?.name}
                <button onClick={() => setSelectedCategory(null, null)}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ConcertCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No concerts found"
            description="Try adjusting your filters or search terms to discover more events."
            action={
              <button
                onClick={() => { setActiveStatus('ALL'); setSelectedCategory(null, null); setLocalSearch(''); setSearchKeyword(null); }}
                className="btn-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map(concert => (
              <motion.div
                key={concert.id}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              >
                <ConcertCard concert={concert} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
