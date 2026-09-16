'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { mockExercises, mockPrograms } from '@/lib/mock-data';
import type { Exercise, Program } from '@/lib/types';
import { MOVEMENT_TYPES, EFFORT_TYPES } from '@/lib/types';
import { useCurrentIdentity } from '@/lib/locationScope';
import { getUsageCountByEmployee } from '@/lib/usageStats';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Heart, Plus, Search, X } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import { ExerciseThumbnail } from '@/components/ui/exercise-thumbnail';
import { ProgramStepper } from '@/components/programs/ProgramStepper';
import { ExerciseEditTable } from '@/components/programs/ExerciseEditTable';
import { ProgramOverviewList } from '@/components/programs/ProgramOverviewList';
import { ProgramImageUpload } from '@/components/programs/ProgramImageUpload';
import { type ProgramRow, PROGRAM_BUILDER_STEPS } from '@/components/programs/programBuilder';

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence', uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder', 'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain', pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti', pgp: 'Pelvic Girdle Pain', pfmt: 'Pelvic Floor Muscle Training',
};

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Your Most Used', 'Newest Added'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

const ALL_CONDITIONS = [...new Set(mockExercises.flatMap((e) => e.tags.condition).map(toTitleCase))].sort();
const ALL_CATEGORIES = [...new Set(mockExercises.map((e) => e.category))].sort();

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-5 pb-5 border-b border-secondary">
      <div className="flex justify-between items-center mb-3">
        <span className="font-display text-base font-medium text-primary tracking-[0.1px]">{title}</span>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button type="button" onClick={onClear} className="p-0.5 text-quaternary hover:text-tertiary bg-transparent border-none cursor-pointer leading-none">
              <X size={13} strokeWidth={1.25} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse' : 'Expand'}
            className="p-0.5 text-primary bg-transparent border-none cursor-pointer leading-none"
          >
            {open ? <ChevronUp size={18} strokeWidth={1.25} /> : <ChevronDown size={18} strokeWidth={1.25} />}
          </button>
        </div>
      </div>
      {open && children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-3 mb-3 cursor-pointer text-left bg-transparent border-none p-0"
    >
      <span className={cx(
        'flex size-6 shrink-0 items-center justify-center rounded border',
        checked ? 'bg-brand-600 border-brand-600' : 'border-secondary bg-secondary_alt'
      )}>
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-base text-primary leading-tight">{label}</span>
    </button>
  );
}

function FilterSearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-3">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" strokeWidth={1.25} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-secondary bg-primary pl-7 pr-2 py-1.5 text-xs text-primary outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
      />
    </div>
  );
}

function NewProgramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentIdentity = useCurrentIdentity();
  const editId = searchParams.get('edit');
  const duplicateId = searchParams.get('duplicate');
  const editingProgram = useMemo(() => (editId ? mockPrograms.find((p) => p.id === editId) ?? null : null), [editId]);
  const duplicateSource = useMemo(() => (duplicateId ? mockPrograms.find((p) => p.id === duplicateId) ?? null : null), [duplicateId]);
  const prefillSource = editingProgram ?? duplicateSource;

  const [step, setStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(prefillSource ? 2 : 0);
  const [programName, setProgramName] = useState(
    editingProgram ? editingProgram.name : duplicateSource ? `${duplicateSource.name} (Copy)` : ''
  );
  const [description, setDescription] = useState(prefillSource?.description ?? '');
  const [frequency, setFrequency] = useState(prefillSource?.frequency ?? FREQUENCIES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(prefillSource?.imageUrl ?? null);

  const goToStep = (target: number) => {
    setStep(target);
    setMaxReachedStep((prev) => Math.max(prev, target));
  };

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [filterMovementTypes, setFilterMovementTypes] = useState<string[]>([]);
  const [filterEffortTypes, setFilterEffortTypes] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [conditionSearch, setConditionSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreLevels, setShowMoreLevels] = useState(false);
  const [showMoreEquipment, setShowMoreEquipment] = useState(false);
  const [showMoreMovementTypes, setShowMoreMovementTypes] = useState(false);
  const [showMoreEffortTypes, setShowMoreEffortTypes] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));

  const [programRows, setProgramRows] = useState<ProgramRow[]>(
    () => prefillSource?.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps, holdSecs: e.holdSecs, cue: e.cue ?? '' })) ?? []
  );
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const next = [...programRows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setProgramRows(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const clearFilters = () => { setSearch(''); setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); setFilterMovementTypes([]); setFilterEffortTypes([]); setShowFavoritesOnly(false); };

  const addExercise = (ex: Exercise) => {
    if (programRows.some((r) => r.exerciseId === ex.id)) return;
    setProgramRows((prev) => [...prev, {
      exerciseId: ex.id, sets: ex.defaultSets, reps: ex.defaultReps, holdSecs: ex.defaultHoldSecs, cue: '',
      restSecs: ex.defaultRestSecs, speedSecs: ex.defaultSpeedSecs, loops: ex.defaultLoops,
      startingPosition: ex.defaultStartingPosition, holdIntensityPct: ex.defaultHoldIntensityPct,
      stages: ex.defaultStages, stagePauseSecs: ex.defaultStagePauseSecs, frequency: ex.defaultFrequency,
      step1Sets: ex.defaultStep1Sets, step1Reps: ex.defaultStep1Reps, step1SpeedSecs: ex.defaultStep1SpeedSecs,
      step1HoldSecs: ex.defaultStep1HoldSecs, step1RestSecs: ex.defaultStep1RestSecs, step1IntensityPct: ex.defaultStep1IntensityPct,
      step2Sets: ex.defaultStep2Sets, step2Reps: ex.defaultStep2Reps, step2SpeedSecs: ex.defaultStep2SpeedSecs, step2RestSecs: ex.defaultStep2RestSecs,
      transitionRestSecs: ex.defaultTransitionRestSecs, comboSets: ex.defaultComboSets,
    }]);
  };
  const removeExercise = (exId: string) => setProgramRows((prev) => prev.filter((r) => r.exerciseId !== exId));
  const toggleInProgram = (ex: Exercise) => {
    if (programRows.some((r) => r.exerciseId === ex.id)) removeExercise(ex.id);
    else addExercise(ex);
  };
  const updateRow = (exId: string, field: keyof ProgramRow, value: number | string) =>
    setProgramRows((prev) => prev.map((r) => r.exerciseId === exId ? { ...r, [field]: value } : r));

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || filterMovementTypes.length > 0 || filterEffortTypes.length > 0 || showFavoritesOnly;

  const yourUsage = useMemo(() => getUsageCountByEmployee(currentIdentity.id), [currentIdentity.id]);

  const filteredExercises = useMemo(() => {
    return mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.description.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      const matchesCondition = filterConditions.length > 0 && filterConditions.some((c) => ex.tags.condition.some((ec) => ec.toLowerCase().includes(c.toLowerCase())));
      const matchesCategory = filterCategories.length > 0 && filterCategories.includes(ex.category);
      const matchesLevel = filterLevels.length > 0 && filterLevels.includes(ex.level);
      const matchesEquipment = filterEquipment.length > 0 && filterEquipment.includes(toTitleCase(ex.equipment));
      const matchesMovementType = filterMovementTypes.length > 0 && filterMovementTypes.some((m) => ex.movementTypes.includes(m as (typeof MOVEMENT_TYPES)[number]));
      const matchesEffortType = filterEffortTypes.length > 0 && filterEffortTypes.some((e) => ex.effortTypes.includes(e as (typeof EFFORT_TYPES)[number]));
      const hasTagFilters = filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || filterMovementTypes.length > 0 || filterEffortTypes.length > 0;
      // Tag facets OR together (match any checked box across any group); Search and Favorites stay separate narrowing filters above.
      if (hasTagFilters && !(matchesCondition || matchesCategory || matchesLevel || matchesEquipment || matchesMovementType || matchesEffortType)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Your Most Used') return (yourUsage[b.id] ?? 0) - (yourUsage[a.id] ?? 0);
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, filterMovementTypes, filterEffortTypes, showFavoritesOnly, favorites, yourUsage]);

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

  const handleSave = () => {
    const exercises = programRows.map((r) => ({ ...r, adherence: 0 }));
    if (editingProgram) {
      const idx = mockPrograms.findIndex((p) => p.id === editingProgram.id);
      if (idx !== -1) {
        mockPrograms[idx] = {
          ...mockPrograms[idx],
          name: programName.trim() || 'New program',
          description: description.trim(),
          frequency,
          exercises,
          imageUrl: imageUrl ?? undefined,
        };
      }
      toast.success('Program updated');
      router.push(`/programs/${editingProgram.id}`);
      return;
    }
    const newProgram: Program = {
      id: `prog_${Date.now()}`,
      name: programName.trim() || 'New program',
      description: description.trim(),
      frequency,
      exercises,
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString().slice(0, 10),
      userCreated: true,
      createdByEmpId: currentIdentity.id,
      imageUrl: imageUrl ?? undefined,
    };
    mockPrograms.push(newProgram);
    toast.success('Program created');
    router.push(`/programs/${newProgram.id}`);
  };

  return (
    <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] bg-primary flex flex-col overflow-hidden">

      {/* Full-screen header */}
      <div className="flex flex-col items-center gap-7 border-b border-secondary px-10 pt-4 pb-9 shrink-0">
        <div className="relative flex items-center justify-between w-full">
          {step === 0 ? (
            <Button color="secondary" size="lg" onPress={() => router.push('/programs')}>Cancel</Button>
          ) : (
            <Button color="tertiary" size="lg" iconLeading={(p) => <ArrowLeft {...p} strokeWidth={1.25} />} onPress={() => goToStep(step - 1)}>Back</Button>
          )}
          <h1 className="absolute left-1/2 -translate-x-1/2 font-display text-[24px] leading-[32px] font-normal text-primary m-0 whitespace-nowrap">
            {editingProgram ? 'Edit Program' : 'Create New Program'}
          </h1>
          {step === 0 && (
            <Button color="primary" size="lg" isDisabled={programRows.length === 0} onPress={() => goToStep(1)}>Next</Button>
          )}
          {step === 1 && (
            <Button color="primary" size="lg" onPress={() => goToStep(2)}>Next</Button>
          )}
          {step === 2 && (
            <Button color="primary" size="lg" onPress={handleSave}>Save</Button>
          )}
        </div>
        <ProgramStepper
          steps={PROGRAM_BUILDER_STEPS}
          currentStep={step}
          maxReachedStep={maxReachedStep}
          onStepClick={goToStep}
        />
      </div>

      {step === 0 ? (
        /* Three-column content */
        <div className="flex flex-1 min-h-0 gap-6 px-6 py-5 overflow-hidden">

          {/* Left: Filters */}
          <div className="w-56 shrink-0 overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-secondary">
              <span className="font-display text-base font-medium text-primary tracking-[0.1px]">Filter By</span>
              {hasFilters && (
                <Button color="link-color" size="sm" onPress={clearFilters}>Clear all</Button>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-secondary flex flex-col gap-4">
              <CheckRow label="Favorites Only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
            </div>

            <FilterSection title="Condition" activeCount={filterConditions.length} onClear={() => setFilterConditions([])}>
              <FilterSearchBox value={conditionSearch} onChange={setConditionSearch} placeholder="Search conditions…" />
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
              <FilterSearchBox value={categorySearch} onChange={setCategorySearch} placeholder="Search categories…" />
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

          <Divider vertical />

          {/* Middle: Exercise Library */}
          <div className="flex flex-col gap-3 min-h-0 flex-1 min-w-0">
            <div className="flex gap-2.5 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or key words"
                  value={search}
                  onChange={setSearch}
                  icon={Search}
                  size="lg"
                />
              </div>
              <NativeSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                wrapperClassName="w-[200px] shrink-0"
              >
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </NativeSelect>
            </div>

            <p className="text-xs text-primary m-0">
              {filteredExercises.length} Exercise{filteredExercises.length !== 1 ? 's' : ''}
            </p>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xs text-tertiary mb-3">No exercises match your filters.</p>
                  <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-10">
                  {filteredExercises.map((ex) => {
                    const isAdded = programRows.some((r) => r.exerciseId === ex.id);
                    return (
                      <div
                        key={ex.id}
                        title={isAdded ? 'Remove from program' : 'Add to program'}
                        className="group relative flex flex-col cursor-pointer"
                        onClick={() => toggleInProgram(ex)}
                      >
                        <div className="relative aspect-[320/180] w-full shrink-0 overflow-hidden rounded-lg transition-shadow group-hover:shadow-[0_0_8px_2px_rgba(0,0,0,0.2)]">
                          <ExerciseThumbnail src={ex.imageUrl} alt={ex.name} />
                        </div>
                        <button
                          type="button"
                          aria-label={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.id); }}
                          className={cx(
                            'absolute left-2 top-2 z-10 flex size-12 items-center justify-center rounded-full border border-primary bg-primary transition-opacity',
                            favorites.has(ex.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          )}
                        >
                          <Heart
                            className={favorites.has(ex.id) ? 'text-favorite' : 'text-primary'}
                            size={24}
                            fill={favorites.has(ex.id) ? 'currentColor' : 'none'}
                            strokeWidth={1.25}
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={isAdded ? 'Remove from program' : 'Add to program'}
                          onClick={(e) => { e.stopPropagation(); toggleInProgram(ex); }}
                          className={cx(
                            'absolute z-10 flex size-11 items-center justify-center rounded-full border transition-all',
                            isAdded
                              ? 'right-2 top-2 border-brand-300 bg-brand-100 text-brand-700'
                              : 'right-3 top-3 border-secondary bg-secondary_alt text-tertiary group-hover:right-2 group-hover:top-2 group-hover:border-primary group-hover:bg-primary group-hover:shadow-[0px_0px_5px_rgba(0,0,0,0.07)]'
                          )}
                        >
                          {isAdded ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={1.25} />}
                        </button>
                        <div className="flex flex-col gap-2 pt-5">
                          <p className="font-display text-md font-medium text-primary tracking-[0.1px] truncate title-trim">{ex.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="flex-1 text-xs text-primary">{ex.category}</span>
                            <span className="shrink-0 rounded-full bg-tertiary px-3 py-2 text-xs text-primary whitespace-nowrap">{ex.level}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : step === 1 ? (
        /* Step 2: Edit exercises */
        <ExerciseEditTable
          rows={programRows}
          getExercise={(id) => mockExercises.find((e) => e.id === id)}
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onUpdateRow={updateRow}
          onRemoveRow={removeExercise}
          onPreview={setPreviewExercise}
        />
      ) : (
        /* Step 3: Program details */
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-80 shrink-0 overflow-y-auto border-r border-secondary bg-secondary_alt px-6 py-6">
            <ProgramOverviewList rows={programRows} getExercise={(id) => mockExercises.find((e) => e.id === id)} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
            <div className="max-w-lg flex flex-col gap-5">
              <ProgramImageUpload value={imageUrl} onChange={setImageUrl} />
              <Input
                label="Program name"
                placeholder="New program"
                value={programName}
                onChange={setProgramName}
              />
              <div>
                <label className="block text-base font-medium text-secondary mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this program…"
                  rows={5}
                  className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-base text-primary outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-secondary mb-1.5">Frequency</label>
                <NativeSelect value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </NativeSelect>
              </div>
            </div>
          </div>
        </div>
      )}

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
        onAddToCurrentProgram={() => { if (previewExercise) addExercise(previewExercise); }}
        isInCurrentProgram={!!previewExercise && programRows.some((r) => r.exerciseId === previewExercise.id)}
        hideAddToProgram
      />
    </div>
  );
}

export default function NewProgramPage() {
  return (
    <Suspense>
      <NewProgramContent />
    </Suspense>
  );
}
