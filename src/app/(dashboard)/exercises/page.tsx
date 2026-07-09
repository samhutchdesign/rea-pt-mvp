'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { ArrowLeft, Eye, Heart, Lightbulb, Plus, Scissors, Search, Smile, Stethoscope, Trophy, User, X, Zap } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockExercises, mockExercisesFull } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import type { Exercise } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';

type IconType = ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>;

const SPECIALTIES: {
  id: string; name: string; apta: string; description: string;
  icon: IconType; color: string; bg: string; available: boolean; count: number;
}[] = [
  { id: 'pelvic-health', name: 'Pelvic Health', apta: "Pelvic & Women's Health", description: 'Pelvic floor, incontinence, prolapse, pain with sex, postpartum & pregnancy', icon: Heart, color: '#6750A4', bg: '#EDE7F6', available: true, count: 266 },
  { id: 'orthopaedics', name: 'Orthopaedics', apta: 'Orthopaedics', description: 'Spine, hip, knee, shoulder, and extremity rehabilitation', icon: User, color: '#0277BD', bg: '#E1F5FE', available: false, count: 0 },
  { id: 'sports', name: 'Sports & Performance', apta: 'Sports', description: 'Return to sport, athletic performance, and injury prevention', icon: Trophy, color: '#2E7D32', bg: '#E8F5E9', available: false, count: 0 },
  { id: 'neurology', name: 'Neurological Rehab', apta: 'Neurology', description: "Stroke, MS, Parkinson's, and spinal cord conditions", icon: Lightbulb, color: '#E65100', bg: '#FFF3E0', available: false, count: 0 },
  { id: 'cardio', name: 'Cardio & Respiratory', apta: 'Cardiovascular & Pulmonary', description: 'Cardiac rehabilitation and pulmonary physiotherapy', icon: Heart, color: '#C62828', bg: '#FFEBEE', available: false, count: 0 },
  { id: 'oncology', name: 'Cancer Care', apta: 'Oncology', description: 'Lymphoedema, post-mastectomy, and cancer-related fatigue', icon: Stethoscope, color: '#6A1B9A', bg: '#F3E5F5', available: false, count: 0 },
  { id: 'geriatrics', name: 'Ageing & Geriatrics', apta: 'Geriatrics', description: 'Falls prevention, balance, mobility, and frailty', icon: User, color: '#1565C0', bg: '#E8EAF6', available: false, count: 0 },
  { id: 'paediatrics', name: 'Paediatrics', apta: 'Pediatrics', description: "Children's physiotherapy and developmental conditions", icon: Smile, color: '#F57F17', bg: '#FFF8E1', available: false, count: 0 },
  { id: 'vestibular', name: 'Vestibular & Balance', apta: 'Vestibular', description: 'BPPV, vertigo, and vestibular rehabilitation', icon: Zap, color: '#00695C', bg: '#E0F2F1', available: false, count: 0 },
  { id: 'wound', name: 'Wound & Skin', apta: 'Wound Management', description: 'Wound care, scar management, and skin rehabilitation', icon: Scissors, color: '#4E342E', bg: '#EFEBE9', available: false, count: 0 },
  { id: 'hand', name: 'Hand & Upper Limb', apta: 'Hands', description: 'Fine motor rehabilitation, hand therapy, and upper extremity', icon: User, color: '#37474F', bg: '#ECEFF1', available: false, count: 0 },
  { id: 'electrophysiology', name: 'Electrophysiology', apta: 'Clinical Electrophysiology', description: 'Pain science, neuromodulation, and electrophysiology', icon: Zap, color: '#880E4F', bg: '#FCE4EC', available: false, count: 0 },
];

type SpecialtyFilters = { conditionLabel: string; conditions: string[]; categories: string[] };

const SPECIALTY_FILTER_CONFIG: Record<string, SpecialtyFilters> = {
  'pelvic-health': {
    conditionLabel: 'Condition',
    conditions: [
      'Urinary Incontinence', 'Urge Urinary Incontinence', 'Mixed Urinary Incontinence',
      'Overactive Bladder', 'Bladder Pain Syndrome',
      'Dyspareunia', 'Vaginismus', 'Vulvodynia', 'Vestibulodynia', 'Pudendal Neuralgia', 'Coccydynia',
      'Pelvic Organ Prolapse', 'Cystocele', 'Rectocele',
      'Constipation', 'Fecal Incontinence', 'Dyssynergic Defecation',
      'Postpartum Recovery', 'Pregnancy', 'Diastasis Recti', 'C-Section Recovery',
      'Low Back Pain', 'Pelvic Girdle Pain',
    ],
    categories: [
      'Pelvic Floor Muscle Training', 'Core / Transversus', 'Glute / Hip Strength',
      'Hip & Pelvic Mobility', 'Functional / Lower Extremity', 'Bowel & Anorectal',
      'Scar Tissue & Post-Surgical', 'Pelvic Pain & Hypertonic', 'Bladder Retraining',
    ],
  },
};

const ALL_CATEGORIES_FULL = [...new Set(mockExercisesFull.map((e) => e.category))].sort();

const SPECIALTY_FILTER_CONFIG_FULL: Record<string, SpecialtyFilters> = {
  'pelvic-health': {
    conditionLabel: 'Condition',
    conditions: [
      'Stress Urinary Incontinence', 'Urge Urinary Incontinence', 'Mixed Urinary Incontinence',
      'Overactive Bladder', 'Pelvic Organ Prolapse', 'Diastasis Recti', 'Postpartum Recovery',
      'Pregnancy', 'Pelvic Girdle Pain', 'Labour Preparation',
      'Dyspareunia', 'Vaginismus', 'Hypertonic Pelvic Floor', 'Chronic Pelvic Pain', 'Endometriosis',
      'Post-Prostatectomy Incontinence', 'Erectile Dysfunction', 'Male Pelvic Pain',
      'Low Back Pain', 'Sacroiliac Joint Dysfunction',
      'Constipation', 'Fecal Incontinence',
      'C-Section Recovery', 'Gender-Affirming',
    ],
    categories: ALL_CATEGORIES_FULL,
  },
};

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence', uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder', 'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain', pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti', pgp: 'Pelvic Girdle Pain', pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

// ── Specialty landing ─────────────────────────────────────────────────────────

function SpecialtyGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="block mb-6 text-sm text-tertiary">Select a specialty to browse exercises.</p>
      <div className="grid grid-cols-3 gap-4">
        {SPECIALTIES.map((sp) => {
          const Icon = sp.icon;
          return (
            <div
              key={sp.id}
              onClick={() => onSelect(sp.id)}
              className="rounded-lg bg-primary p-5 cursor-pointer transition-shadow hover:shadow-md"
              style={{ border: `1px solid ${sp.available ? sp.color + '44' : '#E0E0E0'}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sp.bg }}>
                  <Icon size={20} color={sp.color} />
                </div>
                {sp.available
                  ? <span className="rounded px-2 py-0.5 font-semibold text-xs" style={{ background: sp.bg, color: sp.color }}>{`${sp.count} exercises`}</span>
                  : <span className="rounded px-2 py-0.5 text-xs text-quaternary bg-secondary_alt">Coming soon</span>}
              </div>
              <p className="block font-semibold text-sm text-primary mb-1">{sp.name}</p>
              <p className="block text-xs text-tertiary leading-snug">{sp.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComingSoonState({ sp }: { sp: typeof SPECIALTIES[0] }) {
  const Icon = sp.icon;
  return (
    <div
      className="flex flex-col items-center py-20 rounded-lg border-2 border-dashed border-secondary"
      style={{ background: sp.bg + '44' }}
    >
      <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4" style={{ background: sp.bg }}>
        <Icon size={28} color={sp.color} />
      </div>
      <h3 className="mt-0 mb-1 text-lg font-semibold text-primary">{sp.name}</h3>
      <p className="max-w-sm text-center text-sm text-secondary mb-4">{sp.description}</p>
      <span className="rounded px-2 py-0.5 font-semibold text-xs mb-2" style={{ background: sp.bg, color: sp.color }}>Coming Soon</span>
      <p className="text-xs text-tertiary">APTA: {sp.apta}</p>
    </div>
  );
}

// ── Filter panel section ──────────────────────────────────────────────────────

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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const viewMode = useViewMode();
  const exercises = viewMode === 'full' ? mockExercisesFull : mockExercises;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = viewMode === 'mvp' ? 'pelvic-health' : selectedId;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));

  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const specialty = SPECIALTIES.find((s) => s.id === effectiveSelectedId) ?? null;
  const filterConfig = effectiveSelectedId
    ? (viewMode === 'full' ? SPECIALTY_FILTER_CONFIG_FULL[effectiveSelectedId] : SPECIALTY_FILTER_CONFIG[effectiveSelectedId])
    : null;

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const goBack = () => { setSelectedId(null); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const selectSpecialty = (id: string) => { setSelectedId(id); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!specialty?.available) return [];
    return exercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.some((ec) => ec.toLowerCase().includes(c.toLowerCase())))) return false;
      if (filterCategories.length && !filterCategories.includes(ex.category)) return false;
      if (filterLevels.length && !filterLevels.includes(ex.level)) return false;
      if (filterEquipment.length && !filterEquipment.includes(ex.equipment)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, showFavoritesOnly, favorites, exercises]);

  const levelClasses = (l: string) =>
    l === 'Beginner' ? 'bg-success-50 text-success-700' :
    l === 'Intermediate' ? 'bg-warning-50 text-warning-700' :
    'bg-error-50 text-error-700';

  type DisplayItem =
    | { kind: 'single'; ex: Exercise }
    | { kind: 'group'; groupId: string; groupName: string; representative: Exercise; totalCount: number };

  const displayItems = useMemo((): DisplayItem[] => {
    const seenGroups = new Set<string>();
    const items: DisplayItem[] = [];
    for (const ex of filtered) {
      if (!ex.variationGroup) {
        items.push({ kind: 'single', ex });
      } else if (!seenGroups.has(ex.variationGroup)) {
        seenGroups.add(ex.variationGroup);
        const totalCount = exercises.filter((e) => e.variationGroup === ex.variationGroup).length;
        const gName = ex.defaultName ?? ex.name.split(':')[0].trim();
        items.push({ kind: 'group', groupId: ex.variationGroup, groupName: gName, representative: ex, totalCount });
      }
    }
    return items;
  }, [filtered, exercises]);

  const breadcrumbs = specialty ? [{ label: 'All Exercises' }, { label: specialty.name }] : [{ label: 'All Exercises' }];

  const visibleConditions = filterConfig
    ? (showMoreConditions ? filterConfig.conditions : filterConfig.conditions.slice(0, 7))
    : [];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div className="p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {specialty && viewMode === 'full' && (
              <Button color="tertiary" size="sm" iconLeading={ArrowLeft} onPress={goBack} />
            )}
            <div>
              <h2 className="m-0 text-xl font-semibold text-primary">
                {viewMode === 'mvp' ? 'Exercises' : (specialty ? specialty.name : 'Exercises')}
              </h2>
              {specialty && viewMode === 'full' && <p className="text-xs text-tertiary mt-0 mb-0">{specialty.apta}</p>}
            </div>
          </div>
          <Button color="primary" size="sm" iconLeading={Plus} onPress={() => router.push('/exercises/new')}>Create New</Button>
        </div>

        {!specialty && viewMode === 'full' && <SpecialtyGrid onSelect={selectSpecialty} />}
        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {specialty && specialty.available && (
          <div className="flex items-start">

            {/* ── Left filter panel ── */}
            <div className="w-56 shrink-0 pr-6 border-r border-secondary mr-7">

              {/* Panel header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-secondary">
                <span className="font-semibold text-sm text-primary">Filters</span>
                {hasFilters && (
                  <Button color="link-color" size="sm" onPress={clearFilters}>Clear all</Button>
                )}
              </div>

              {/* Favourites */}
              <div className="mb-5 pb-5 border-b border-secondary">
                <CheckRow label="Favourites only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
              </div>

              {/* Condition */}
              {filterConfig && (
                <FilterSection title={filterConfig.conditionLabel} activeCount={filterConditions.length} onClear={() => setFilterConditions([])}>
                  {visibleConditions.map((c) => (
                    <CheckRow key={c} label={c} checked={filterConditions.includes(c)} onChange={() => toggleArr(filterConditions, c, setFilterConditions)} />
                  ))}
                  {filterConfig.conditions.length > 7 && (
                    <Button color="link-color" size="sm" onPress={() => setShowMoreConditions((v) => !v)}>
                      {showMoreConditions ? 'Show less' : `+${filterConfig.conditions.length - 7} more`}
                    </Button>
                  )}
                </FilterSection>
              )}

              {/* Category */}
              {filterConfig && (
                <FilterSection title="Category" activeCount={filterCategories.length} onClear={() => setFilterCategories([])}>
                  {filterConfig.categories.map((c) => (
                    <CheckRow key={c} label={c} checked={filterCategories.includes(c)} onChange={() => toggleArr(filterCategories, c, setFilterCategories)} />
                  ))}
                </FilterSection>
              )}

              {/* Level */}
              <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
                {ALL_LEVELS.map((l) => (
                  <CheckRow key={l} label={l} checked={filterLevels.includes(l)} onChange={() => toggleArr(filterLevels, l, setFilterLevels)} />
                ))}
              </FilterSection>

              {/* Equipment */}
              <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
                {ALL_EQUIPMENT.map((eq) => (
                  <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} onChange={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
                ))}
              </FilterSection>
            </div>

            {/* ── Right content ── */}
            <div className="flex-1 min-w-0">

              {/* Top bar */}
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Active filter tags */}
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
                </div>
              )}

              <p className="block mb-4 text-xs text-tertiary">
                {filtered.length} exercise{filtered.length !== 1 ? 's' : ''} · {displayItems.length} card{displayItems.length !== 1 ? 's' : ''} shown
              </p>

              {/* Grid */}
              {displayItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-tertiary mb-3">No exercises match your filters.</p>
                  <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {displayItems.map((item) => {
                    if (item.kind === 'single') {
                      const ex = item.ex;
                      return (
                        <div
                          key={ex.id}
                          className="cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-md transition-shadow"
                          onClick={() => router.push(`/exercises/${ex.id}`)}
                        >
                          <div className="relative h-32 flex items-center justify-center bg-brand-50">
                            <Zap size={36} className="text-brand-600" />
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
                      );
                    }

                    // Group card
                    const { representative: rep, groupName: gName, totalCount } = item;
                    return (
                      <div
                        key={item.groupId}
                        className="cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/exercises/${rep.id}`)}
                      >
                        {/* Stacked thumbnail effect */}
                        <div className="relative h-32 flex items-center justify-center bg-brand-50">
                          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 28px)', height: '100%', background: '#DDD6F3', borderRadius: '6px 6px 0 0', zIndex: 0 }} />
                          <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 16px)', height: '100%', background: '#E8E2F8', borderRadius: '6px 6px 0 0', zIndex: 1 }} />
                          <div className="relative flex items-center justify-center w-full h-full" style={{ zIndex: 2 }}>
                            <Zap size={36} className="text-brand-600" />
                          </div>
                          <span className="absolute bottom-2 left-2 rounded px-1.5 py-0.5 bg-brand-600 text-white text-xs font-semibold" style={{ zIndex: 3 }}>
                            {totalCount} variations
                          </span>
                          <div className="absolute top-2 right-2" style={{ zIndex: 4 }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              title={favorites.has(rep.id) ? 'Unfavourite' : 'Favourite'}
                              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/85 hover:bg-white transition-colors"
                              onClick={() => toggleFavorite(rep.id)}
                            >
                              {favorites.has(rep.id)
                                ? <Heart size={14} className="text-pink-500" fill="currentColor" />
                                : <Heart size={14} className="text-tertiary" />}
                            </button>
                          </div>
                        </div>
                        <div className="px-3.5 py-3">
                          <p className="font-semibold text-sm text-primary leading-tight mb-2">{gName}</p>
                          <div className="flex gap-1 flex-wrap mb-2.5">
                            <span className="text-xs rounded px-1.5 py-0.5 bg-secondary text-secondary">{rep.category}</span>
                          </div>
                          <span className="text-xs text-tertiary">Select a variation on the detail page</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
