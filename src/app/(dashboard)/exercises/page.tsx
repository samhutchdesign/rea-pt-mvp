'use client';
import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ComponentType } from 'react';
import { Eye, Heart, Lightbulb, Plus, Scissors, Search, Smile, Stethoscope, Trophy, User, X, Zap } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { useScrollMemory, saveScrollPosition } from '@/hooks/use-scroll-memory';
import { mockExercises, mockExercisesFull } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { useDataState } from '@/lib/dataStateStore';
import { SignUpRequiredModal } from '@/components/ui/sign-up-required-modal';
import type { Exercise } from '@/lib/types';
import { MOVEMENT_TYPES, EFFORT_TYPES } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import { NativeSelect } from '@/components/ui/native-select';

type IconType = ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>;

const PAGE_SIZE = 24;

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

// ── Specialty horizontal scroll ───────────────────────────────────────────────

function SpecialtyScroll({ selectedId, onSelect, totalCount }: { selectedId: string; onSelect: (id: string) => void; totalCount: number }) {
  const isAllSelected = selectedId === 'all';
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 mb-6 scrollbar-hide">
      {/* All Exercises card */}
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={cx(
          'flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 w-[120px] border transition-colors',
          isAllSelected ? 'border-brand-600 bg-brand-50' : 'border-secondary bg-primary hover:bg-secondary cursor-pointer'
        )}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary_alt">
          <Zap size={16} className={isAllSelected ? 'text-brand-600' : 'text-tertiary'} />
        </div>
        <span className={cx('text-xs font-medium text-center leading-tight', isAllSelected ? 'text-brand-700' : 'text-primary')}>All Exercises</span>
        <span className={cx('text-[10px] font-medium', isAllSelected ? 'text-brand-600' : 'text-tertiary')}>{totalCount} exercises</span>
      </button>

      {SPECIALTIES.map((sp) => {
        const Icon = sp.icon;
        const isSelected = selectedId === sp.id;
        return (
          <button
            key={sp.id}
            type="button"
            onClick={() => onSelect(sp.id)}
            className={cx(
              'flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 w-[120px] border transition-colors',
              isSelected ? 'border-brand-600 bg-brand-50' : 'border-secondary bg-primary hover:bg-secondary cursor-pointer'
            )}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: sp.bg }}>
              <Icon size={16} color={sp.color} />
            </div>
            <span className={cx('text-xs font-medium text-center leading-tight', isSelected ? 'text-brand-700' : 'text-primary')}>{sp.name}</span>
            {sp.available
              ? <span className={cx('text-[10px] font-medium', isSelected ? 'text-brand-600' : 'text-tertiary')}>{sp.count} exercises</span>
              : <span className="text-[10px] text-quaternary">Coming soon</span>}
          </button>
        );
      })}
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

function FilterSearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-3">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-secondary bg-primary pl-7 pr-2 py-1.5 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ExercisesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const dataState = useDataState();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const viewMode = useViewMode();
  const exercises = viewMode === 'full' ? mockExercisesFull : mockExercises;
  const [selectedId, setSelectedId] = useState<string>(
    searchParams.get('specialty') ?? (initialCategory ? 'pelvic-health' : 'all')
  );
  const effectiveSelectedId = viewMode === 'mvp' ? 'pelvic-health' : selectedId;
  const isAllMode = effectiveSelectedId === 'all';
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>(
    searchParams.get('conds')?.split(',').filter(Boolean) ?? []
  );
  const [filterCategories, setFilterCategories] = useState<string[]>(
    searchParams.get('cats')?.split(',').filter(Boolean) ?? (initialCategory ? [initialCategory] : [])
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
  const [levelSearch, setLevelSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [movementSearch, setMovementSearch] = useState('');
  const [effortSearch, setEffortSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [visibleCount, setVisibleCount] = useState(() => Number(searchParams.get('show')) || PAGE_SIZE);

  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  useScrollMemory();

  const specialty = SPECIALTIES.find((s) => s.id === effectiveSelectedId) ?? null;
  const allModeFilterConfig: SpecialtyFilters = useMemo(() => ({
    conditionLabel: 'Condition',
    conditions: [...new Set(exercises.flatMap((e) => e.tags.condition.map(toTitleCase)))].sort(),
    categories: [...new Set(exercises.map((e) => toTitleCase(e.category)))].sort(),
  }), [exercises]);
  const filterConfig = isAllMode
    ? allModeFilterConfig
    : (effectiveSelectedId ? (viewMode === 'full' ? SPECIALTY_FILTER_CONFIG_FULL[effectiveSelectedId] : SPECIALTY_FILTER_CONFIG[effectiveSelectedId]) : null);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const selectSpecialty = (id: string) => { setSelectedId(id); setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setFilterMovementTypes([]); setFilterEffortTypes([]); setShowFavoritesOnly(false); };
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setFilterMovementTypes([]); setFilterEffortTypes([]); setShowFavoritesOnly(false); };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || filterMovementTypes.length > 0 || filterEffortTypes.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!isAllMode && !specialty?.available) return [];
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
  }, [isAllMode, specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly, favorites, exercises]);

  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) { isFirstFilterRender.current = false; return; }
    setVisibleCount(PAGE_SIZE);
  }, [isAllMode, specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly]);

  const levelClasses = (l: string) =>
    l === 'Beginner' ? 'bg-success-50 text-success-700' :
    l === 'Intermediate' ? 'bg-warning-50 text-warning-700' :
    'bg-error-50 text-error-700';


  const breadcrumbs = [{ label: 'Exercises' }];

  const filteredConditions = filterConfig
    ? (conditionSearch ? filterConfig.conditions.filter((c) => c.toLowerCase().includes(conditionSearch.toLowerCase())) : filterConfig.conditions)
    : [];
  const visibleConditions = conditionSearch
    ? filteredConditions
    : (showMoreConditions ? filteredConditions : filteredConditions.slice(0, 7));

  const filteredCategories = filterConfig
    ? (categorySearch ? filterConfig.categories.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase())) : filterConfig.categories)
    : [];
  const visibleCategories = categorySearch
    ? filteredCategories
    : (showMoreCategories ? filteredCategories : filteredCategories.slice(0, 7));

  const filteredLevels = levelSearch ? ALL_LEVELS.filter((l) => l.toLowerCase().includes(levelSearch.toLowerCase())) : ALL_LEVELS;
  const visibleLevels = levelSearch
    ? filteredLevels
    : (showMoreLevels ? filteredLevels : filteredLevels.slice(0, 7));

  const filteredEquipment = equipmentSearch ? ALL_EQUIPMENT.filter((eq) => eq.toLowerCase().includes(equipmentSearch.toLowerCase())) : ALL_EQUIPMENT;
  const visibleEquipment = equipmentSearch
    ? filteredEquipment
    : (showMoreEquipment ? filteredEquipment : filteredEquipment.slice(0, 7));

  const filteredMovementTypes = movementSearch ? MOVEMENT_TYPES.filter((m) => m.toLowerCase().includes(movementSearch.toLowerCase())) : MOVEMENT_TYPES;
  const visibleMovementTypes = movementSearch
    ? filteredMovementTypes
    : (showMoreMovementTypes ? filteredMovementTypes : filteredMovementTypes.slice(0, 7));

  const filteredEffortTypes = effortSearch ? EFFORT_TYPES.filter((e) => e.toLowerCase().includes(effortSearch.toLowerCase())) : EFFORT_TYPES;
  const visibleEffortTypes = effortSearch
    ? filteredEffortTypes
    : (showMoreEffortTypes ? filteredEffortTypes : filteredEffortTypes.slice(0, 7));

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div className="p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="m-0 text-xl font-semibold text-primary">Exercises</h2>
          <Button color="primary" size="sm" iconLeading={Plus} onPress={() => dataState === 'empty' ? setShowSignUpModal(true) : router.push('/exercises/new')}>Create New</Button>
        </div>

        {/* Specialty horizontal scroll */}
        {viewMode === 'full' && <SpecialtyScroll selectedId={effectiveSelectedId} onSelect={selectSpecialty} totalCount={exercises.length} />}

        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {(isAllMode || (specialty && specialty.available)) && (
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
                  <FilterSearchBox value={conditionSearch} onChange={setConditionSearch} placeholder="Search conditions…" />
                  {visibleConditions.map((c) => (
                    <CheckRow key={c} label={c} checked={filterConditions.includes(c)} onChange={() => toggleArr(filterConditions, c, setFilterConditions)} />
                  ))}
                  {!conditionSearch && filterConfig.conditions.length > 7 && (
                    <Button color="link-color" size="sm" onPress={() => setShowMoreConditions((v) => !v)}>
                      {showMoreConditions ? 'Show less' : `+${filterConfig.conditions.length - 7} more`}
                    </Button>
                  )}
                  {conditionSearch && filteredConditions.length === 0 && (
                    <p className="text-xs text-tertiary">No conditions found.</p>
                  )}
                </FilterSection>
              )}

              {/* Category */}
              {filterConfig && (
                <FilterSection title="Category" activeCount={filterCategories.length} onClear={() => setFilterCategories([])}>
                  <FilterSearchBox value={categorySearch} onChange={setCategorySearch} placeholder="Search categories…" />
                  {visibleCategories.map((c) => (
                    <CheckRow key={c} label={c} checked={filterCategories.includes(c)} onChange={() => toggleArr(filterCategories, c, setFilterCategories)} />
                  ))}
                  {!categorySearch && filteredCategories.length > 7 && (
                    <Button color="link-color" size="sm" onPress={() => setShowMoreCategories((v) => !v)}>
                      {showMoreCategories ? 'Show less' : `+${filteredCategories.length - 7} more`}
                    </Button>
                  )}
                  {categorySearch && filteredCategories.length === 0 && (
                    <p className="text-xs text-tertiary">No categories found.</p>
                  )}
                </FilterSection>
              )}

              {/* Level */}
              <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
                <FilterSearchBox value={levelSearch} onChange={setLevelSearch} placeholder="Search levels…" />
                {visibleLevels.map((l) => (
                  <CheckRow key={l} label={l} checked={filterLevels.includes(l)} onChange={() => toggleArr(filterLevels, l, setFilterLevels)} />
                ))}
                {!levelSearch && filteredLevels.length > 7 && (
                  <Button color="link-color" size="sm" onPress={() => setShowMoreLevels((v) => !v)}>
                    {showMoreLevels ? 'Show less' : `+${filteredLevels.length - 7} more`}
                  </Button>
                )}
                {levelSearch && filteredLevels.length === 0 && (
                  <p className="text-xs text-tertiary">No levels found.</p>
                )}
              </FilterSection>

              {/* Equipment */}
              <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
                <FilterSearchBox value={equipmentSearch} onChange={setEquipmentSearch} placeholder="Search equipment…" />
                {visibleEquipment.map((eq) => (
                  <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} onChange={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
                ))}
                {!equipmentSearch && filteredEquipment.length > 7 && (
                  <Button color="link-color" size="sm" onPress={() => setShowMoreEquipment((v) => !v)}>
                    {showMoreEquipment ? 'Show less' : `+${filteredEquipment.length - 7} more`}
                  </Button>
                )}
                {equipmentSearch && filteredEquipment.length === 0 && (
                  <p className="text-xs text-tertiary">No equipment found.</p>
                )}
              </FilterSection>

              {/* Movement Type */}
              <FilterSection title="Movement Type" activeCount={filterMovementTypes.length} onClear={() => setFilterMovementTypes([])}>
                <FilterSearchBox value={movementSearch} onChange={setMovementSearch} placeholder="Search movement types…" />
                {visibleMovementTypes.map((m) => (
                  <CheckRow key={m} label={m} checked={filterMovementTypes.includes(m)} onChange={() => toggleArr(filterMovementTypes, m, setFilterMovementTypes)} />
                ))}
                {!movementSearch && filteredMovementTypes.length > 7 && (
                  <Button color="link-color" size="sm" onPress={() => setShowMoreMovementTypes((v) => !v)}>
                    {showMoreMovementTypes ? 'Show less' : `+${filteredMovementTypes.length - 7} more`}
                  </Button>
                )}
                {movementSearch && filteredMovementTypes.length === 0 && (
                  <p className="text-xs text-tertiary">No movement types found.</p>
                )}
              </FilterSection>

              {/* Effort Type */}
              <FilterSection title="Effort Type" activeCount={filterEffortTypes.length} onClear={() => setFilterEffortTypes([])}>
                <FilterSearchBox value={effortSearch} onChange={setEffortSearch} placeholder="Search effort types…" />
                {visibleEffortTypes.map((e) => (
                  <CheckRow key={e} label={e} checked={filterEffortTypes.includes(e)} onChange={() => toggleArr(filterEffortTypes, e, setFilterEffortTypes)} />
                ))}
                {!effortSearch && filteredEffortTypes.length > 7 && (
                  <Button color="link-color" size="sm" onPress={() => setShowMoreEffortTypes((v) => !v)}>
                    {showMoreEffortTypes ? 'Show less' : `+${filteredEffortTypes.length - 7} more`}
                  </Button>
                )}
                {effortSearch && filteredEffortTypes.length === 0 && (
                  <p className="text-xs text-tertiary">No effort types found.</p>
                )}
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
                <NativeSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  wrapperClassName="w-40 shrink-0"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </NativeSelect>
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

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-tertiary mb-3">No exercises match your filters.</p>
                  <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {filtered.slice(0, visibleCount).map((ex) => (
                    <div
                      key={ex.id}
                      className="cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs hover:shadow-md transition-shadow"
                      onClick={() => {
                        const p = new URLSearchParams();
                        if (effectiveSelectedId !== 'all') p.set('specialty', effectiveSelectedId);
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
                        const back = encodeURIComponent(qs ? `/exercises?${qs}` : '/exercises');
                        saveScrollPosition();
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

              {filtered.length > visibleCount && (
                <div className="flex justify-center mt-6">
                  <Button color="secondary" size="md" onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                    See more
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
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

export default function ExercisesPage() {
  return <Suspense><ExercisesPageContent /></Suspense>;
}
