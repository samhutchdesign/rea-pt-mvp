'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { mockPrograms } from '@/lib/mock-data';
import { Heart, Plus, Search, X, Zap } from 'lucide-react';

const ALL_TAGS = ['Pelvic Floor', 'Postpartum', 'Incontinence', 'Pelvic Pain', 'Beginner', 'Intermediate', 'Relaxation'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Exercises', 'Newest Added'];

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-secondary">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-primary">{title}</span>
        {activeCount > 0 && (
          <button onClick={onClear} className="p-0.5 text-quaternary hover:text-tertiary cursor-pointer bg-transparent border-0 leading-none flex">
            <X size={13} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={onChange}>
      <div className={cx(
        'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
        checked ? 'bg-brand-600 border-brand-600' : 'border-secondary bg-primary',
      )}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-secondary">{label}</span>
    </div>
  );
}

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleTag = (t: string) => setFilterTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const clearFilters = () => { setSearch(''); setFilterTags([]); setShowFavoritesOnly(false); };
  const hasFilters = !!search || filterTags.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    return mockPrograms.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterTags.length && !filterTags.some((t) => p.tags.includes(t))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Exercises') return b.exercises.length - a.exercises.length;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [search, sortBy, filterTags, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <div className="px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary m-0">Programs</h2>
          <Button color="primary" size="md" iconLeading={Plus} onPress={() => router.push('/programs/new')}>
            Create New Program
          </Button>
        </div>

        <div className="flex gap-0 items-start">

          {/* Left filter panel */}
          <div className="w-56 shrink-0 pr-6 border-r border-secondary mr-7">

            {/* Panel header */}
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-secondary">
              <span className="text-sm font-semibold text-primary">Filters</span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-700 cursor-pointer bg-transparent border-0 p-0 font-medium hover:opacity-80"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Favourites */}
            <div className="mb-5 pb-5 border-b border-secondary">
              <CheckRow label="Favourites only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
            </div>

            {/* Tags */}
            <FilterSection title="Tags" activeCount={filterTags.length} onClear={() => setFilterTags([])}>
              {ALL_TAGS.map((t) => (
                <CheckRow key={t} label={t} checked={filterTags.includes(t)} onChange={() => toggleTag(t)} />
              ))}
            </FilterSection>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex gap-2.5 mb-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search programs…"
                  value={search}
                  onChange={setSearch}
                  icon={Search}
                  size="sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 bg-primary min-w-[150px]"
              >
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <span className="block mb-4 text-xs text-tertiary">
              {filtered.length} of {mockPrograms.length} programs
            </span>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="block text-secondary mb-3">No programs match your filters.</span>
                <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map((prog) => (
                  <div
                    key={prog.id}
                    className="cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/programs/${prog.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex h-28 items-center justify-center bg-brand-50">
                      <Zap size={32} className="text-brand-600" />
                      <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          title={favorites.has(prog.id) ? 'Unfavourite' : 'Favourite'}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-white/85 border-0 cursor-pointer hover:bg-white transition-colors"
                          onClick={() => toggleFavorite(prog.id)}
                        >
                          {favorites.has(prog.id)
                            ? <Heart size={14} className="text-pink-500" fill="#E91E63" />
                            : <Heart size={14} className="text-tertiary" />}
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
                        {prog.exercises.length} exercises
                      </span>
                    </div>

                    {/* Info */}
                    <div className="px-3.5 py-3">
                      <span className="block mb-1 text-sm font-semibold text-primary leading-snug">{prog.name}</span>
                      <span className="block text-xs text-secondary mb-2.5 leading-snug">{prog.description}</span>
                      <div className="flex gap-1 flex-wrap">
                        {prog.tags.map((t) => (
                          <span key={t} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
