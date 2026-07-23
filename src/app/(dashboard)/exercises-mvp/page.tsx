'use client';
import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Heart, Search, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { mockExercises } from '@/lib/mock-data';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import type { Exercise } from '@/lib/types';
import { MOVEMENT_TYPES, EFFORT_TYPES } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import { NativeSelect } from '@/components/ui/native-select';

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence', uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder', 'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain', pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti', pgp: 'Pelvic Girdle Pain', pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

const ALL_CONDITIONS = [...new Set(mockExercises.flatMap((e) => e.tags.condition).map(toTitleCase))].sort();
const ALL_CATEGORIES = [...new Set(mockExercises.map((e) => e.category))].sort();

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-secondary">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm text-primary">{title}</span>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="p-0.5 text-quaternary hover:text-tertiary bg-transparent border-none cursor-pointer leading-none">
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
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-2 mb-2 cursor-pointer text-left bg-transparent border-none p-0"
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

function ExercisesPageContent() {
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
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreLevels, setShowMoreLevels] = useState(false);
  const [showMoreEquipment, setShowMoreEquipment] = useState(false);
  const [showMoreMovementTypes, setShowMoreMovementTypes] = useState(false);
  const [showMoreEffortTypes, setShowMoreEffortTypes] = useState(false);
  const [conditionSearch, setConditionSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setFilterMovementTypes([]); setFilterEffortTypes([]); setShowFavoritesOnly(false); };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || filterMovementTypes.length > 0 || filterEffortTypes.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    return mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.some((ec) => ec.toLowerCase().includes(c.toLowerCase())))) return false;
      if (filterCategories.length && !filterCategories.includes(ex.category)) return false;
      if (filterLevels.length && !filterLevels.includes(ex.level)) return false;
      if (filterEquipment.length && !filterEquipment.includes(toTitleCase(ex.equipment))) return false;
      if (filterMovementTypes.length && !filterMovementTypes.some((m) => ex.movementTypes.includes(m as (typeof MOVEMENT_TYPES)[number]))) return false;
      if (filterEffortTypes.length && !filterEffortTypes.some((e) => ex.effortTypes.includes(e as (typeof EFFORT_TYPES)[number]))) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly, favorites]);

  const levelClasses = (l: string) =>
    l === 'Beginner' ? 'bg-success-50 text-success-700' :
    l === 'Intermediate' ? 'bg-warning-50 text-warning-700' :
    'bg-error-50 text-error-700';

  const filteredConditions = conditionSearch
    ? ALL_CONDITIONS.filter((c) => c.toLowerCase().includes(conditionSearch.toLowerCase()))
    : ALL_CONDITIONS;
  const filteredCategories = categorySearch
    ? ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
    : ALL_CATEGORIES;
  const visibleConditions = conditionSearch
    ? filteredConditions
    : showMoreConditions ? ALL_CONDITIONS : ALL_CONDITIONS.slice(0, 7);
  const visibleCategories = categorySearch
    ? filteredCategories
    : showMoreCategories ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, 7);
  const visibleLevels = showMoreLevels ? ALL_LEVELS : ALL_LEVELS.slice(0, 7);
  const visibleEquipment = showMoreEquipment ? ALL_EQUIPMENT : ALL_EQUIPMENT.slice(0, 7);
  const visibleMovementTypes = showMoreMovementTypes ? MOVEMENT_TYPES : MOVEMENT_TYPES.slice(0, 7);
  const visibleEffortTypes = showMoreEffortTypes ? EFFORT_TYPES : EFFORT_TYPES.slice(0, 7);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Exercises' }]} />
      <div className="p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="m-0 text-xl font-semibold text-primary">Exercises</h2>
        </div>

        <div className="flex items-start">

          {/* Left filter panel */}
          <div className="w-56 shrink-0 pr-6 border-r border-secondary mr-7">

            <div className="flex justify-between items-center mb-5 pb-4 border-b border-secondary">
              <span className="font-semibold text-sm text-primary">Filters</span>
              {hasFilters && (
                <Button color="link-color" size="sm" onPress={clearFilters}>Clear all</Button>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-secondary">
              <CheckRow label="Favourites only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
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
                <CheckRow key={c} label={c} checked={filterConditions.includes(c)} onChange={() => toggleArr(filterConditions, c, setFilterConditions)} />
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
              {visibleCategories.map((c) => (
                <CheckRow key={c} label={c} checked={filterCategories.includes(c)} onChange={() => toggleArr(filterCategories, c, setFilterCategories)} />
              ))}
              {!categorySearch && ALL_CATEGORIES.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreCategories((v) => !v)}>
                  {showMoreCategories ? 'Show less' : `+${ALL_CATEGORIES.length - 7} more`}
                </Button>
              )}
              {categorySearch && filteredCategories.length === 0 && (
                <p className="text-xs text-tertiary">No categories found.</p>
              )}
            </FilterSection>

            <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
              {visibleLevels.map((l) => (
                <CheckRow key={l} label={l} checked={filterLevels.includes(l)} onChange={() => toggleArr(filterLevels, l, setFilterLevels)} />
              ))}
              {ALL_LEVELS.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreLevels((v) => !v)}>
                  {showMoreLevels ? 'Show less' : `+${ALL_LEVELS.length - 7} more`}
                </Button>
              )}
            </FilterSection>

            <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
              {visibleEquipment.map((eq) => (
                <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} onChange={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
              ))}
              {ALL_EQUIPMENT.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreEquipment((v) => !v)}>
                  {showMoreEquipment ? 'Show less' : `+${ALL_EQUIPMENT.length - 7} more`}
                </Button>
              )}
            </FilterSection>

            <FilterSection title="Movement Type" activeCount={filterMovementTypes.length} onClear={() => setFilterMovementTypes([])}>
              {visibleMovementTypes.map((m) => (
                <CheckRow key={m} label={m} checked={filterMovementTypes.includes(m)} onChange={() => toggleArr(filterMovementTypes, m, setFilterMovementTypes)} />
              ))}
              {MOVEMENT_TYPES.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreMovementTypes((v) => !v)}>
                  {showMoreMovementTypes ? 'Show less' : `+${MOVEMENT_TYPES.length - 7} more`}
                </Button>
              )}
            </FilterSection>

            <FilterSection title="Effort Type" activeCount={filterEffortTypes.length} onClear={() => setFilterEffortTypes([])}>
              {visibleEffortTypes.map((e) => (
                <CheckRow key={e} label={e} checked={filterEffortTypes.includes(e)} onChange={() => toggleArr(filterEffortTypes, e, setFilterEffortTypes)} />
              ))}
              {EFFORT_TYPES.length > 7 && (
                <Button color="link-color" size="sm" onPress={() => setShowMoreEffortTypes((v) => !v)}>
                  {showMoreEffortTypes ? 'Show less' : `+${EFFORT_TYPES.length - 7} more`}
                </Button>
              )}
            </FilterSection>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">

            <div className={cx('flex gap-2.5 items-center', hasFilters ? 'mb-2.5' : 'mb-4')}>
              <div className="flex-1">
                <Input
                  placeholder="Search exercises, SUI, OAB…"
                  value={search}
                  onChange={setSearch}
                  icon={Search}
                  size="sm"
                />
              </div>
              <NativeSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                wrapperClassName="w-40 shrink-0"
              >
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </NativeSelect>
            </div>

            {hasFilters && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {search && <FilterTag label={`"${search}"`} onRemove={() => setSearch('')} />}
                {showFavoritesOnly && <FilterTag label="Favourites only" onRemove={() => setShowFavoritesOnly(false)} />}
                {filterConditions.map((c) => (
                  <FilterTag key={c} label={c} onRemove={() => toggleArr(filterConditions, c, setFilterConditions)} />
                ))}
                {filterCategories.map((c) => (
                  <FilterTag key={c} label={c} onRemove={() => toggleArr(filterCategories, c, setFilterCategories)} />
                ))}
                {filterLevels.map((l) => (
                  <FilterTag key={l} label={l} onRemove={() => toggleArr(filterLevels, l, setFilterLevels)} />
                ))}
                {filterEquipment.map((eq) => (
                  <FilterTag key={eq} label={eq} onRemove={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
                ))}
                {filterMovementTypes.map((m) => (
                  <FilterTag key={m} label={m} onRemove={() => toggleArr(filterMovementTypes, m, setFilterMovementTypes)} />
                ))}
                {filterEffortTypes.map((e) => (
                  <FilterTag key={e} label={e} onRemove={() => toggleArr(filterEffortTypes, e, setFilterEffortTypes)} />
                ))}
              </div>
            )}

            <p className="block mb-4 text-xs text-tertiary">
              {filtered.length} exercise{filtered.length !== 1 ? 's' : ''} shown
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-tertiary mb-3">No exercises match your filters.</p>
                <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {filtered.map((ex) => (
                  <div
                    key={ex.id}
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
                      const qs = p.toString();
                      const back = encodeURIComponent(qs ? `/exercises-mvp?${qs}` : '/exercises-mvp');
                      router.push(`/exercises/${ex.id}?back=${back}`);
                    }}
                  >
                    <div className="relative h-32 overflow-hidden bg-brand-50">
                      <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} />
                      <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title={favorites.has(ex.id) ? 'Unfavourite' : 'Favourite'}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/85 hover:bg-white transition-colors"
                          onClick={() => toggleFavorite(ex.id)}
                        >
                          {favorites.has(ex.id)
                            ? <Heart size={14} className="text-pink-500" fill="currentColor" />
                            : <Heart size={14} className="text-tertiary" />}
                        </button>
                      </div>
                    </div>
                    <div className="px-3.5 py-3">
                      <p className="font-semibold text-sm text-primary leading-tight mb-2">{ex.name}</p>
                      <div className="flex gap-1 flex-wrap mb-2.5">
                        <span className={cx('text-xs rounded px-1.5 py-0.5 font-medium', levelClasses(ex.level))}>{ex.level}</span>
                        {ex.equipment !== 'None' && (
                          <span className="text-xs rounded px-1.5 py-0.5 bg-secondary text-secondary">{ex.equipment}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-tertiary">{ex.category}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title="Preview"
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors text-tertiary"
                            onClick={() => setPreviewExercise(ex)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
        onActionBlocked={dataState === 'empty' ? () => { setPreviewExercise(null); setShowSignUpModal(true); } : undefined}
      />
      <SignUpRequiredModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} action="create or assign exercises" />
    </>
  );
}

export default function ExercisesMvpPage() {
  return <Suspense><ExercisesPageContent /></Suspense>;
}
