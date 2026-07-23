'use client';
import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import { NativeSelect } from '@/components/ui/native-select';
import { mockPrograms, mockExercises } from '@/lib/mock-data';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import { MOVEMENT_TYPES, EFFORT_TYPES } from '@/lib/types';
import { Heart, Plus, Search, X } from 'lucide-react';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { useScrollMemory, saveScrollPosition } from '@/hooks/use-scroll-memory';

const PAGE_SIZE = 24;

const ALL_CONDITIONS = [...new Set(mockExercises.flatMap((e) => e.tags.condition).map(toTitleCase))].sort();
const ALL_CATEGORIES = [...new Set(mockExercises.map((e) => e.category))].sort();
const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
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

function CheckRow({ label, checked, onChange, inactive }: { label: string; checked: boolean; onChange: () => void; inactive?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cx(
        'flex w-full items-center gap-2 mb-2 text-left bg-transparent border-none p-0',
        inactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      )}
    >
      <span className={cx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
        checked ? 'bg-brand-600 border-brand-600' : 'border-secondary bg-primary'
      )}>
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-primary leading-tight">{label}</span>
    </button>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 border border-brand-200">
      <span>{label}</span>
      <button type="button" onClick={onRemove} className="text-brand-400 hover:text-brand-600 bg-transparent border-none cursor-pointer p-0 leading-none">
        <X size={10} />
      </button>
    </span>
  );
}

function ProgramsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataState = useDataState();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>(
    searchParams.get('conds')?.split(',').filter(Boolean) ?? []
  );
  const [filterCategories, setFilterCategories] = useState<string[]>(
    searchParams.get('cats')?.split(',').filter(Boolean) ?? []
  );
  const [filterLevels, setFilterLevels] = useState<string[]>(
    searchParams.get('levels')?.split(',').filter(Boolean) ?? []
  );
  const [filterEquipment, setFilterEquipment] = useState<string[]>(
    searchParams.get('equip')?.split(',').filter(Boolean) ?? []
  );
  const [filterMovementTypes, setFilterMovementTypes] = useState<string[]>(
    searchParams.get('mvt')?.split(',').filter(Boolean) ?? []
  );
  const [filterEffortTypes, setFilterEffortTypes] = useState<string[]>(
    searchParams.get('eft')?.split(',').filter(Boolean) ?? []
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('fav') === '1');
  const [conditionSearch, setConditionSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));
  const [visibleCount, setVisibleCount] = useState(() => Number(searchParams.get('show')) || PAGE_SIZE);

  useScrollMemory();

  const filtersInactive = dataState === 'empty';
  const guardFilter = (fn: () => void) => { if (filtersInactive) { setShowSignUpModal(true); return; } fn(); };

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setFilterMovementTypes([]); setFilterEffortTypes([]); setShowFavoritesOnly(false); };
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || filterMovementTypes.length > 0 || filterEffortTypes.length > 0 || showFavoritesOnly;

  const filteredConditions = conditionSearch
    ? ALL_CONDITIONS.filter((c) => c.toLowerCase().includes(conditionSearch.toLowerCase()))
    : ALL_CONDITIONS;
  const filteredCategories = categorySearch
    ? ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
    : ALL_CATEGORIES;
  const visibleConditions = conditionSearch
    ? filteredConditions
    : showMoreConditions ? ALL_CONDITIONS : ALL_CONDITIONS.slice(0, 7);

  const filtered = useMemo(() => {
    return mockPrograms.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterConditions.length || filterCategories.length || filterLevels.length || filterEquipment.length || filterMovementTypes.length || filterEffortTypes.length) {
        const exs = p.exercises.map((pe) => mockExercises.find((e) => e.id === pe.exerciseId)).filter(Boolean);
        if (filterConditions.length && !filterConditions.some((c) => exs.some((ex) => ex!.tags.condition.some((ec) => toTitleCase(ec) === c)))) return false;
        if (filterCategories.length && !filterCategories.some((c) => exs.some((ex) => ex!.category === c))) return false;
        if (filterLevels.length && !filterLevels.some((l) => exs.some((ex) => ex!.level === l))) return false;
        if (filterEquipment.length && !filterEquipment.some((eq) => exs.some((ex) => toTitleCase(ex!.equipment) === eq))) return false;
        if (filterMovementTypes.length && !filterMovementTypes.some((m) => exs.some((ex) => ex!.movementTypes.includes(m as (typeof MOVEMENT_TYPES)[number])))) return false;
        if (filterEffortTypes.length && !filterEffortTypes.some((e) => exs.some((ex) => ex!.effortTypes.includes(e as (typeof EFFORT_TYPES)[number])))) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Exercises') return b.exercises.length - a.exercises.length;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [search, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly, favorites]);

  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) { isFirstFilterRender.current = false; return; }
    setVisibleCount(PAGE_SIZE);
  }, [search, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <div className="px-8 py-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary m-0">Programs</h2>
          <Button color="primary" size="md" iconLeading={Plus} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : router.push('/programs/new')}>
            Create New Program
          </Button>
        </div>

        <div className="flex gap-0 items-start">

          {/* Left filter panel */}
          <div className="w-56 shrink-0 pr-6 border-r border-secondary mr-7">

            <div className="flex justify-between items-center mb-5 pb-4 border-b border-secondary">
              <span className="font-semibold text-sm text-primary">Filters</span>
              {hasFilters && (
                <Button color="link-color" size="sm" onPress={clearFilters}>Clear all</Button>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-secondary">
              <CheckRow label="Favourites only" checked={showFavoritesOnly} inactive={filtersInactive} onChange={() => guardFilter(() => setShowFavoritesOnly((v) => !v))} />
            </div>

            <FilterSection title="Condition" activeCount={filterConditions.length} onClear={() => setFilterConditions([])}>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search conditions…"
                  value={conditionSearch}
                  onChange={(e) => setConditionSearch(e.target.value)}
                  className="w-full rounded-lg border border-secondary bg-primary pl-7 pr-2 py-1.5 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
                />
              </div>
              {visibleConditions.map((c) => (
                <CheckRow key={c} label={c} checked={filterConditions.includes(c)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterConditions, c, setFilterConditions))} />
              ))}
              {!conditionSearch && ALL_CONDITIONS.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreConditions((v) => !v)}>
                  {showMoreConditions ? 'Show less' : `+${ALL_CONDITIONS.length - 7} more`}
                </Button>
              )}
              {conditionSearch && filteredConditions.length === 0 && (
                <p className="text-xs text-tertiary">No conditions found.</p>
              )}
            </FilterSection>

            <FilterSection title="Category" activeCount={filterCategories.length} onClear={() => setFilterCategories([])}>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search categories…"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full rounded-lg border border-secondary bg-primary pl-7 pr-2 py-1.5 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
                />
              </div>
              {filteredCategories.map((c) => (
                <CheckRow key={c} label={c} checked={filterCategories.includes(c)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterCategories, c, setFilterCategories))} />
              ))}
              {categorySearch && filteredCategories.length === 0 && (
                <p className="text-xs text-tertiary">No categories found.</p>
              )}
            </FilterSection>

            <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
              {ALL_LEVELS.map((l) => (
                <CheckRow key={l} label={l} checked={filterLevels.includes(l)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterLevels, l, setFilterLevels))} />
              ))}
            </FilterSection>

            <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
              {ALL_EQUIPMENT.map((eq) => (
                <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterEquipment, eq, setFilterEquipment))} />
              ))}
            </FilterSection>

            <FilterSection title="Movement Type" activeCount={filterMovementTypes.length} onClear={() => setFilterMovementTypes([])}>
              {MOVEMENT_TYPES.map((m) => (
                <CheckRow key={m} label={m} checked={filterMovementTypes.includes(m)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterMovementTypes, m, setFilterMovementTypes))} />
              ))}
            </FilterSection>

            <FilterSection title="Effort Type" activeCount={filterEffortTypes.length} onClear={() => setFilterEffortTypes([])}>
              {EFFORT_TYPES.map((e) => (
                <CheckRow key={e} label={e} checked={filterEffortTypes.includes(e)} inactive={filtersInactive} onChange={() => guardFilter(() => toggleArr(filterEffortTypes, e, setFilterEffortTypes))} />
              ))}
            </FilterSection>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">

            <div className={cx('flex gap-2.5 items-center', hasFilters ? 'mb-2.5' : 'mb-4')}>
              <div className="flex-1">
                <Input
                  placeholder="Search programs…"
                  value={search}
                  onChange={(v) => guardFilter(() => setSearch(v))}
                  onFocus={() => { if (filtersInactive) setShowSignUpModal(true); }}
                  icon={Search}
                  size="sm"
                  inputClassName={filtersInactive ? 'cursor-not-allowed opacity-50' : undefined}
                />
              </div>
              <NativeSelect
                value={sortBy}
                onChange={(e) => guardFilter(() => setSortBy(e.target.value))}
                onMouseDown={(e) => { if (filtersInactive) { e.preventDefault(); setShowSignUpModal(true); } }}
                wrapperClassName="w-40 shrink-0"
                className={filtersInactive ? 'cursor-not-allowed opacity-50' : undefined}
              >
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </NativeSelect>
            </div>

            {hasFilters && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {search && <FilterTag label={`"${search}"`} onRemove={() => setSearch('')} />}
                {showFavoritesOnly && <FilterTag label="Favourites only" onRemove={() => setShowFavoritesOnly(false)} />}
                {filterConditions.map((c) => <FilterTag key={c} label={c} onRemove={() => toggleArr(filterConditions, c, setFilterConditions)} />)}
                {filterCategories.map((c) => <FilterTag key={c} label={c} onRemove={() => toggleArr(filterCategories, c, setFilterCategories)} />)}
                {filterLevels.map((l) => <FilterTag key={l} label={l} onRemove={() => toggleArr(filterLevels, l, setFilterLevels)} />)}
                {filterEquipment.map((eq) => <FilterTag key={eq} label={eq} onRemove={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />)}
                {filterMovementTypes.map((m) => <FilterTag key={m} label={m} onRemove={() => toggleArr(filterMovementTypes, m, setFilterMovementTypes)} />)}
                {filterEffortTypes.map((e) => <FilterTag key={e} label={e} onRemove={() => toggleArr(filterEffortTypes, e, setFilterEffortTypes)} />)}
              </div>
            )}

            <span className="block mb-4 text-xs text-tertiary">
              {filtered.length} of {mockPrograms.length} programs
            </span>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="block text-secondary mb-3">No programs match your filters.</span>
                <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {filtered.slice(0, visibleCount).map((prog) => {
                  const firstEx = mockExercises.find((e) => e.id === prog.exercises[0]?.exerciseId);
                  return (
                  <div
                    key={prog.id}
                    className="cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-md transition-shadow"
                    onClick={() => {
                      const p = new URLSearchParams();
                      if (search) p.set('q', search);
                      if (filterCategories.length) p.set('cats', filterCategories.join(','));
                      if (filterConditions.length) p.set('conds', filterConditions.join(','));
                      if (filterLevels.length) p.set('levels', filterLevels.join(','));
                      if (filterEquipment.length) p.set('equip', filterEquipment.join(','));
                      if (filterMovementTypes.length) p.set('mvt', filterMovementTypes.join(','));
                      if (filterEffortTypes.length) p.set('eft', filterEffortTypes.join(','));
                      if (showFavoritesOnly) p.set('fav', '1');
                      if (sortBy !== 'A → Z') p.set('sort', sortBy);
                      if (visibleCount !== PAGE_SIZE) p.set('show', String(visibleCount));
                      const qs = p.toString();
                      const back = encodeURIComponent(qs ? `/programs?${qs}` : '/programs');
                      saveScrollPosition();
                      router.push(`/programs/${prog.id}?back=${back}`);
                    }}
                  >
                    <div className="relative h-28 overflow-hidden bg-brand-50">
                      <ExerciseThumbnail src={firstEx?.imageUrl} alt={prog.name} iconSize={32} />
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
                  );
                })}
              </div>
            )}

            {filtered.length > visibleCount && (
              <div className="flex justify-center mt-6">
                <Button
                  color="secondary"
                  size="md"
                  className={filtersInactive ? 'cursor-not-allowed opacity-50' : undefined}
                  onPress={() => guardFilter(() => setVisibleCount((v) => v + PAGE_SIZE))}
                >
                  See more
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SignUpRequiredModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} action="create or edit programs" />
    </>
  );
}

export default function ProgramsPage() {
  return <Suspense><ProgramsPageContent /></Suspense>;
}
