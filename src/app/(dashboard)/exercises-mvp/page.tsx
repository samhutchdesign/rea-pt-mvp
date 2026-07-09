'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { mockExercises } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import type { Exercise } from '@/lib/types';
import { cx } from '@/utils/cx';
import { ArrowLeft, Eye, Heart, Lightbulb, Plus, Scissors, Search, Smile, Stethoscope, Trophy, User, X, Zap } from 'lucide-react';

type IconType = ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>;

const SPECIALTIES: {
  id: string; name: string; apta: string; description: string;
  icon: IconType; color: string; bg: string; available: boolean; count: number;
}[] = [
  { id: 'pelvic-health', name: 'Pelvic Health', apta: "Pelvic & Women's Health", description: 'Pelvic floor, incontinence, prolapse, pain with sex, postpartum & pregnancy', icon: Heart, color: '#6750A4', bg: '#EDE7F6', available: true, count: 50 },
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

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence', uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder', 'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain', pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti', pgp: 'Pelvic Girdle Pain', pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

const GROUP_NAMES: Record<string, string> = {
  'pelvic-floor': 'Pelvic Floor',
  'core-breathing': 'Core Breathing',
  'breathing': 'Breathing',
  'transversus': 'Transversus',
  'deadbug': 'Deadbug',
  'pelvic-tilt': 'Pelvic Tilt',
  'plank': 'Plank',
  'glute-bridge': 'Glute Bridge',
  'childs-pose': "Child's Pose",
  'squat': 'Squat',
  'bowel': 'Bowel',
  'csection-massage': 'C-Section Massage',
  'perineal-massage': 'Perineal Massage',
};

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

// ── Specialty landing ─────────────────────────────────────────────────────────

function SpecialtyGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="mb-6 text-sm text-secondary">Select a specialty to browse exercises.</p>
      <div className="grid grid-cols-3 gap-4">
        {SPECIALTIES.map((sp) => {
          const Icon = sp.icon;
          return (
            <div
              key={sp.id}
              onClick={() => onSelect(sp.id)}
              className="cursor-pointer rounded-lg border bg-primary p-5 transition-all hover:shadow-sm"
              style={{ borderColor: sp.available ? sp.color + '44' : '#E0E0E0' }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: sp.bg }}>
                  <Icon size={20} color={sp.color} />
                </div>
                {sp.available
                  ? <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: sp.bg, color: sp.color }}>{`${sp.count} exercises`}</span>
                  : <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] text-quaternary">Coming soon</span>}
              </div>
              <p className="mb-1 text-sm font-semibold text-primary">{sp.name}</p>
              <p className="text-xs leading-snug text-secondary">{sp.description}</p>
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
    <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-secondary py-20" style={{ background: sp.bg + '44' }}>
      <div className="mb-4 flex h-15 w-15 items-center justify-center rounded-full" style={{ background: sp.bg }}>
        <Icon size={28} color={sp.color} />
      </div>
      <h3 className="mt-0 mb-1 text-lg font-semibold text-primary">{sp.name}</h3>
      <p className="mb-4 max-w-sm text-center text-sm text-secondary">{sp.description}</p>
      <span className="mb-2 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: sp.bg, color: sp.color }}>Coming Soon</span>
      <p className="text-xs text-tertiary">APTA: {sp.apta}</p>
    </div>
  );
}

// ── Filter panel section ──────────────────────────────────────────────────────

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-secondary">
      <div className="mb-3 flex justify-between items-center">
        <span className="text-sm font-semibold text-primary">{title}</span>
        {activeCount > 0 && (
          <button onClick={onClear} className="flex items-center p-0.5 text-quaternary hover:text-secondary transition-colors">
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
    <div className="mb-2 flex cursor-pointer items-center gap-2" onClick={onChange}>
      <div className={cx(
        'h-4 w-4 shrink-0 rounded border transition-colors',
        checked ? 'border-brand-600 bg-brand-600' : 'border-secondary bg-primary'
      )}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="h-full w-full p-0.5">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-xs leading-snug text-primary">{label}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const viewMode = useViewMode();
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
  const filterConfig = effectiveSelectedId ? SPECIALTY_FILTER_CONFIG[effectiveSelectedId] : null;

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const goBack = () => { setSelectedId(null); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const selectSpecialty = (id: string) => { setSelectedId(id); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setShowFavoritesOnly(false); };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!specialty?.available) return [];
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
      if (filterEquipment.length && !filterEquipment.includes(ex.equipment)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, showFavoritesOnly, favorites]);

  const levelColor = (l: string) => l === 'Beginner' ? { bg: '#E8F5E9', color: '#2E7D32' } : l === 'Intermediate' ? { bg: '#FFF8E1', color: '#F57F17' } : { bg: '#FFF3E0', color: '#E65100' };

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
        const totalCount = mockExercises.filter((e) => e.variationGroup === ex.variationGroup).length;
        items.push({ kind: 'group', groupId: ex.variationGroup, groupName: GROUP_NAMES[ex.variationGroup] ?? ex.variationGroup, representative: ex, totalCount });
      }
    }
    return items;
  }, [filtered]);

  const breadcrumbs = specialty ? [{ label: 'All Exercises' }, { label: specialty.name }] : [{ label: 'All Exercises' }];

  const visibleConditions = filterConfig
    ? (showMoreConditions ? filterConfig.conditions : filterConfig.conditions.slice(0, 7))
    : [];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div className="p-8">

        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {specialty && viewMode === 'full' && (
              <button onClick={goBack} className="flex items-center justify-center h-8 w-8 rounded-lg text-secondary hover:bg-secondary transition-colors">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="m-0 text-2xl font-bold text-primary">{viewMode === 'mvp' ? 'Exercises' : (specialty ? specialty.name : 'Exercises')}</h2>
              {specialty && viewMode === 'full' && <p className="text-xs text-secondary">{specialty.apta}</p>}
            </div>
          </div>
          <Button color="primary" size="sm" iconLeading={Plus} onPress={() => router.push('/exercises/new')}>Create New</Button>
        </div>

        {!specialty && viewMode === 'full' && <SpecialtyGrid onSelect={selectSpecialty} />}
        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {specialty && specialty.available && (
          <div className="flex gap-0 items-start">

            {/* ── Left filter panel ── */}
            <div className="w-[232px] shrink-0 pr-6 border-r border-secondary mr-7">

              {/* Panel header */}
              <div className="mb-5 pb-4 border-b border-secondary flex justify-between items-center">
                <span className="text-sm font-semibold text-primary">Filters</span>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-brand-700 hover:text-brand-600 px-1">Clear all</button>
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
                    <button onClick={() => setShowMoreConditions((v) => !v)} className="mt-1 text-xs text-brand-700 hover:text-brand-600">
                      {showMoreConditions ? 'Show less' : `+${filterConfig.conditions.length - 7} more`}
                    </button>
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
              <div className="mb-4 flex gap-2.5 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search exercises, SUI, OAB…"
                    value={search}
                    onChange={(val) => setSearch(val)}
                    icon={Search}
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                >
                  {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <p className="mb-4 text-xs text-secondary">
                {filtered.length} exercise{filtered.length !== 1 ? 's' : ''} · {displayItems.length} card{displayItems.length !== 1 ? 's' : ''} shown
              </p>

              {/* Grid */}
              {displayItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="mb-3 text-sm text-secondary">No exercises match your filters.</p>
                  <Button color="secondary" size="xs" onPress={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {displayItems.map((item) => {
                    if (item.kind === 'single') {
                      const ex = item.ex;
                      const lc = levelColor(ex.level);
                      return (
                        <div
                          key={ex.id}
                          className="cursor-pointer rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-sm transition-shadow overflow-hidden"
                          onClick={() => router.push(`/exercises/${ex.id}`)}
                        >
                          <div className="relative flex h-[130px] items-center justify-center bg-[#EDE7F6]">
                            <Zap size={36} color="#6750A4" />
                            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                title={favorites.has(ex.id) ? 'Unfavourite' : 'Favourite'}
                                onClick={() => toggleFavorite(ex.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/85 hover:bg-white transition-colors"
                              >
                                {favorites.has(ex.id)
                                  ? <Heart size={14} style={{ color: '#E91E63' }} fill="#E91E63" />
                                  : <Heart size={14} className="text-secondary" />}
                              </button>
                            </div>
                          </div>
                          <div className="px-3.5 pt-3 pb-3.5">
                            <p className="mb-2 text-xs font-semibold leading-snug text-primary">{ex.name}</p>
                            <div className="mb-2.5 flex flex-wrap gap-1">
                              <span className="rounded-md px-2 py-0.5 text-[11px]" style={{ background: lc.bg, color: lc.color }}>{ex.level}</span>
                              {ex.equipment !== 'None' && <span className="rounded-md border border-secondary px-2 py-0.5 text-[11px] text-secondary">{ex.equipment}</span>}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] text-secondary">{ex.category}</span>
                              <div onClick={(e) => e.stopPropagation()}>
                                <button
                                  title="Preview"
                                  onClick={() => setPreviewExercise(ex)}
                                  className="flex h-7 w-7 items-center justify-center rounded text-secondary hover:bg-secondary hover:text-primary transition-colors"
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
                        className="cursor-pointer rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-sm transition-shadow overflow-hidden"
                        onClick={() => router.push(`/exercises/${rep.id}`)}
                      >
                        {/* Stacked thumbnail effect */}
                        <div className="relative flex h-[130px] items-center justify-center bg-[#EDE7F6]">
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-full w-[calc(100%-28px)] rounded-t-md bg-[#DDD6F3] z-0" />
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-full w-[calc(100%-16px)] rounded-t-md bg-[#E8E2F8] z-[1]" />
                          <div className="relative z-[2] flex h-full w-full items-center justify-center">
                            <Zap size={36} color="#6750A4" />
                          </div>
                          <span className="absolute bottom-2 left-2 z-[3] rounded-md bg-[#6750A4] px-2 py-0.5 text-[11px] font-semibold text-white">
                            {totalCount} variations
                          </span>
                          <div className="absolute top-2 right-2 z-[4]" onClick={(e) => e.stopPropagation()}>
                            <button
                              title={favorites.has(rep.id) ? 'Unfavourite' : 'Favourite'}
                              onClick={() => toggleFavorite(rep.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/85 hover:bg-white transition-colors"
                            >
                              {favorites.has(rep.id)
                                ? <Heart size={14} style={{ color: '#E91E63' }} fill="#E91E63" />
                                : <Heart size={14} className="text-secondary" />}
                            </button>
                          </div>
                        </div>
                        <div className="px-3.5 pt-3 pb-3.5">
                          <p className="mb-2 text-xs font-semibold leading-snug text-primary">{gName}</p>
                          <div className="mb-2.5 flex flex-wrap gap-1">
                            <span className="rounded-md border border-secondary px-2 py-0.5 text-[11px] text-secondary">{rep.category}</span>
                          </div>
                          <p className="text-[11px] text-secondary">Select a variation on the detail page</p>
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
