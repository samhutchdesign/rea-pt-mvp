'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockPatients, mockExercises, mockPrograms } from '@/lib/mock-data';
import { getHepState, saveNewProgram } from '@/lib/patientHepStore';
import { toast } from 'sonner';
import type { Exercise } from '@/lib/types';
import { MOVEMENT_TYPES, EFFORT_TYPES } from '@/lib/types';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { cx } from '@/utils/cx';
import { toTitleCase } from '@/utils/text';
import { ArrowLeft, Check, Eye, GripVertical, Heart, Search, X, Zap } from 'lucide-react';
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
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];
const STEPS = ['Choose Exercises', 'Program Details'];

const ALL_CONDITIONS = [...new Set(mockExercises.flatMap((e) => e.tags.condition).map(toTitleCase))].sort();
const ALL_CATEGORIES = [...new Set(mockExercises.map((e) => e.category))].sort();

function expandSearch(q: string) { return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q; }

interface ProgramRow {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
}

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

function CompactField({ value, onChange, unitSingular, unitPlural }: { value: number; onChange: (v: number) => void; unitSingular: string; unitPlural: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary pl-2.5 pr-4 py-2 shadow-xs">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-6 bg-transparent text-sm text-primary text-center outline-none"
      />
      <span className="text-sm text-secondary whitespace-nowrap">{value === 1 ? unitSingular : unitPlural}</span>
    </div>
  );
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center w-full max-w-xs mx-auto">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-1">
            <div className={cx(
              'flex size-7 items-center justify-center rounded-full text-xs font-semibold shrink-0',
              i < activeStep ? 'bg-brand-600 text-white' :
              i === activeStep ? 'border-2 border-brand-600 text-brand-700' :
              'border-2 border-secondary text-tertiary'
            )}>
              {i < activeStep ? '✓' : i + 1}
            </div>
            <span className={cx('text-xs whitespace-nowrap', i === activeStep ? 'font-semibold text-brand-700' : 'text-tertiary')}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cx('flex-1 h-px mx-3 mb-5', i < activeStep ? 'bg-brand-600' : 'bg-secondary')} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const existingProgram = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  const [step, setStep] = useState(0);
  const [programName, setProgramName] = useState(existingProgram?.name ?? '');
  const [description, setDescription] = useState(existingProgram?.description ?? '');

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
    existingProgram?.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps, holdSecs: e.holdSecs, frequency: e.frequency })) ?? []
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
    setProgramRows((prev) => [...prev, { exerciseId: ex.id, sets: ex.defaultSets, reps: ex.defaultReps, holdSecs: ex.defaultHoldSecs, frequency: ex.defaultFrequency }]);
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

  const filteredExercises = useMemo(() => {
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
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (sortBy === 'A → Z') return aFav !== bFav ? bFav - aFav : a.name.localeCompare(b.name);
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

  const handleSave = () => {
    const current = getHepState(id);
    const currentProgram = current.programId ? mockPrograms.find((p) => p.id === current.programId) : null;
    const oldSnapshot = currentProgram && current.programAssignedAt
      ? { programId: currentProgram.id, programName: currentProgram.name, exercises: currentProgram.exercises, assignedAt: current.programAssignedAt }
      : null;
    const newProgramId = current.programId ?? 'prog1';
    const newProgramName = programName.trim() || 'Custom Program';
    const newExercises = programRows.map((r) => ({ ...r, adherence: 0 }));

    const progIdx = mockPrograms.findIndex((p) => p.id === newProgramId);
    if (progIdx !== -1) {
      mockPrograms[progIdx] = { ...mockPrograms[progIdx], name: newProgramName, description: description.trim(), exercises: newExercises };
    } else {
      mockPrograms.push({
        id: newProgramId,
        name: newProgramName,
        description: description.trim(),
        exercises: newExercises,
        tags: [],
        isFavorite: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }

    saveNewProgram(id, newProgramId, newProgramName, newExercises, oldSnapshot);
    toast.success('Program updated');
    router.push(`/patients/${id}/program`);
  };

  return (
    <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] bg-primary flex flex-col overflow-hidden">

      {/* Full-screen header */}
      <div className="grid grid-cols-3 items-center px-6 py-4 border-b border-secondary shrink-0">
        <button
          onClick={() => router.push(`/patients/${id}/program`)}
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors justify-self-start"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <StepIndicator activeStep={step} />
        <div className="flex gap-3 justify-self-end">
          <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
          {step === 0 ? (
            <Button color="primary" size="sm" isDisabled={programRows.length === 0} onPress={() => setStep(1)}>Next</Button>
          ) : (
            <>
              <Button color="secondary" size="sm" onPress={() => setStep(0)}>Back</Button>
              <Button color="primary" size="sm" onPress={handleSave}>Save</Button>
            </>
          )}
        </div>
      </div>

      {step === 0 ? (
        /* Three-column content */
        <div className="flex flex-1 min-h-0 gap-6 px-6 py-5 overflow-hidden">

          {/* Left: Filters */}
          <div className="w-56 shrink-0 overflow-y-auto pr-1">
            <span className="block text-lg font-bold text-primary mb-4">Exercises</span>

            <div className="flex justify-between items-center mb-4 pb-3 border-b border-secondary">
              <span className="font-semibold text-sm text-primary">Filters</span>
              {hasFilters && (
                <Button color="link-color" size="sm" onPress={clearFilters}>Clear all</Button>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-secondary">
              <CheckRow label="Favourites only" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly((v) => !v)} />
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

            <p className="text-xs text-tertiary m-0">
              {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} shown
            </p>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-tertiary mb-3">No exercises match your filters.</p>
                  <Button color="secondary" size="sm" onPress={clearFilters}>Clear filters</Button>
                </div>
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 260px)' }}>
                  {filteredExercises.map((ex) => {
                    const isAdded = programRows.some((r) => r.exerciseId === ex.id);
                    return (
                      <div
                        key={ex.id}
                        title={isAdded ? 'Remove from program' : 'Add to program'}
                        className={cx(
                          'cursor-pointer overflow-hidden rounded-xl border bg-primary shadow-xs hover:shadow-md transition-shadow',
                          isAdded ? 'border-brand-400' : 'border-secondary'
                        )}
                        onClick={() => toggleInProgram(ex)}
                      >
                        <div className="relative h-28 flex items-center justify-center bg-brand-50">
                          <Zap size={32} className="text-brand-600" />
                          {isAdded && (
                            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                              <Check size={13} className="text-white" strokeWidth={3} />
                            </div>
                          )}
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
                        <div className="px-3 py-2.5">
                          <p className="font-semibold text-sm text-primary leading-tight mb-2">{ex.name}</p>
                          <div className="flex gap-1 flex-wrap mb-2">
                            <span className={cx('text-xs rounded px-1.5 py-0.5 font-medium', levelClasses(ex.level))}>{ex.level}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-tertiary truncate">{ex.category}</span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                title="Preview"
                                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors text-tertiary shrink-0"
                                onClick={() => setPreviewExercise(ex)}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Divider vertical />

          {/* Right: Patient's Program */}
          <div className="flex flex-col gap-3 min-h-0 flex-1 min-w-0" style={{ maxWidth: 530 }}>
            <span className="text-sm font-semibold text-primary shrink-0">
              {programRows.length} exercise{programRows.length !== 1 ? 's' : ''} in program
            </span>

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
              {programRows.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-sm text-secondary">Add exercises from the library</span>
                </div>
              ) : programRows.map((row, idx) => {
                const ex = mockExercises.find((e) => e.id === row.exerciseId);
                if (!ex) return null;
                const isDragging = dragIndex === idx;
                const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
                return (
                  <div
                    key={row.exerciseId}
                    className={cx(
                      'shrink-0 rounded-xl border bg-primary shadow-xs p-4 transition-opacity',
                      isDragging ? 'opacity-40' : 'opacity-100',
                      isDropTarget ? 'border-brand-600 border-dashed' : 'border-secondary'
                    )}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="mb-3 flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="shrink-0 cursor-grab text-quaternary" />
                        <span className="text-sm font-semibold text-primary">{ex.name}</span>
                      </div>
                      <button
                        onClick={() => removeExercise(row.exerciseId)}
                        className="flex h-6 w-6 items-center justify-center rounded text-quaternary hover:bg-secondary hover:text-secondary transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <CompactField value={row.sets} unitSingular="Set" unitPlural="Sets" onChange={(v) => updateRow(row.exerciseId, 'sets', v)} />
                      <CompactField value={row.reps} unitSingular="Rep" unitPlural="Reps" onChange={(v) => updateRow(row.exerciseId, 'reps', v)} />
                      <CompactField value={row.holdSecs} unitSingular="Sec Hold" unitPlural="Sec Hold" onChange={(v) => updateRow(row.exerciseId, 'holdSecs', v)} />
                      <NativeSelect
                        value={row.frequency}
                        onChange={(e) => updateRow(row.exerciseId, 'frequency', e.target.value)}
                        wrapperClassName="w-[166px] shrink-0"
                      >
                        {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </NativeSelect>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Step 2: Program details */
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-10">
          <div className="max-w-lg mx-auto flex flex-col gap-5">
            <Input
              label="Program name"
              placeholder="New program"
              value={programName}
              onChange={setProgramName}
            />
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this program…"
                rows={5}
                className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
              />
            </div>
          </div>
        </div>
      )}

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
        onAddToCurrentProgram={previewExercise && !programRows.some((r) => r.exerciseId === previewExercise.id)
          ? () => { if (previewExercise) addExercise(previewExercise); }
          : undefined}
      />
    </div>
  );
}
