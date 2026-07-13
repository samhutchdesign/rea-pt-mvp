'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockPatients, mockExercises, mockPrograms } from '@/lib/mock-data';
import { getHepState, saveNewProgram } from '@/lib/patientHepStore';
import { toast } from 'sonner';
import type { Exercise } from '@/lib/types';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { Eye, GripVertical, Heart, MinusCircle, PlusCircle, Search, Zap } from 'lucide-react';

const ALL_CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const ALL_SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const ALL_MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus', 'Hip Abductors', 'Adductors', 'Hip Flexors', 'Quadriceps'];
const ALL_BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Most Popular', 'Newest Added'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

interface ProgramRow {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
}

export default function ProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const existingProgram = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>(() => {
    const cond = patient?.injuryHistory?.mechanism ?? '';
    if (cond.toLowerCase().includes('postpartum') || cond.toLowerCase().includes('c-section')) return ['Postpartum'];
    if (cond.toLowerCase().includes('incontinence')) return ['Incontinence'];
    if (cond.toLowerCase().includes('pain') || cond.toLowerCase().includes('hysterectomy')) return ['Pelvic Pain'];
    return [];
  });
  const [filterSurgeries, setFilterSurgeries] = useState<string[]>(() => {
    const surgery = patient?.injuryHistory?.surgeryType ?? '';
    if (surgery.includes('C-section') || surgery.includes('C-Section')) return ['C-Section'];
    if (surgery.includes('hysterectomy') || surgery.includes('Hysterectomy')) return ['Post-Hysterectomy'];
    return [];
  });
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [filterBodyParts, setFilterBodyParts] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  const filteredExercises = useMemo(() => {
    let exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.includes(c))) return false;
      if (filterSurgeries.length && !filterSurgeries.some((s) => ex.tags.surgery.includes(s))) return false;
      if (filterMuscles.length && !filterMuscles.some((m) => ex.tags.muscle.includes(m))) return false;
      if (filterBodyParts.length && !filterBodyParts.some((b) => ex.tags.bodyPart.includes(b))) return false;
      return true;
    });
    exs = exs.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (sortBy === 'A → Z') return aFav !== bFav ? bFav - aFav : a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return a.name.localeCompare(b.name) * -1;
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Most Popular') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    return exs;
  }, [search, sortBy, filterConditions, filterSurgeries, filterMuscles, filterBodyParts, showFavoritesOnly, favorites]);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const addExercise = (ex: Exercise) => {
    if (programRows.some((r) => r.exerciseId === ex.id)) return;
    setProgramRows((prev) => [...prev, { exerciseId: ex.id, sets: ex.defaultSets, reps: ex.defaultReps, holdSecs: ex.defaultHoldSecs, frequency: ex.defaultFrequency }]);
  };
  const removeExercise = (exId: string) => setProgramRows((prev) => prev.filter((r) => r.exerciseId !== exId));
  const updateRow = (exId: string, field: keyof ProgramRow, value: number | string) =>
    setProgramRows((prev) => prev.map((r) => r.exerciseId === exId ? { ...r, [field]: value } : r));

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 290px)', overflow: 'hidden' }}>
      {/* Left: Exercise Library */}
      <div className="flex flex-col gap-4 min-h-0" style={{ width: '45%' }}>
        <span className="text-sm font-semibold text-primary">Exercise Library</span>

        <Input
          placeholder="Search exercises…"
          value={search}
          onChange={(val) => setSearch(val)}
          icon={Search}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center rounded-md bg-[#EDE7F6] px-2.5 py-1 text-xs font-semibold text-brand-700">Pelvic Floor</span>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors ${showFavoritesOnly ? 'border-brand-600 bg-brand-600 text-white' : 'border-secondary bg-primary text-secondary hover:bg-secondary'}`}
          >
            <Heart size={14} fill="currentColor" /> Favorites
          </button>
          <FilterMenu label="Condition" options={ALL_CONDITIONS} selected={filterConditions} onChange={setFilterConditions} />
          <FilterMenu label="Surgery" options={ALL_SURGERIES} selected={filterSurgeries} onChange={setFilterSurgeries} />
          <FilterMenu label="Muscle" options={ALL_MUSCLES} selected={filterMuscles} onChange={setFilterMuscles} />
          <FilterMenu label="Body Part" options={ALL_BODY_PARTS} selected={filterBodyParts} onChange={setFilterBodyParts} />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-secondary">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-secondary bg-primary px-3 py-1.5 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
          >
            {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="shrink-0 rounded-xl border border-secondary bg-primary shadow-xs p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EDE7F6]">
                  <Zap size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold text-primary">{ex.name}</span>
                    {favorites.has(ex.id) && <Heart size={12} fill="currentColor" className="text-[#E91E63] shrink-0" />}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {ex.tags.specialty.slice(0, 2).map((t) => (
                      <span key={t} className="rounded border border-secondary px-1.5 py-0.5 text-[10px] text-secondary">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    title="Preview"
                    onClick={() => setPreviewExercise(ex)}
                    className="flex h-7 w-7 items-center justify-center rounded text-secondary hover:bg-secondary transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    title={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}
                    onClick={() => toggleFavorite(ex.id)}
                    className="flex h-7 w-7 items-center justify-center rounded text-secondary hover:bg-secondary transition-colors"
                  >
                    {favorites.has(ex.id) ? <Heart size={14} style={{ color: '#E91E63' }} fill="currentColor" /> : <Heart size={14} />}
                  </button>
                  <button
                    title="Add to program"
                    onClick={() => addExercise(ex)}
                    disabled={programRows.some((r) => r.exerciseId === ex.id)}
                    className="flex h-7 w-7 items-center justify-center rounded text-brand-700 hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider vertical />

      {/* Right: Patient's Program */}
      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">{patient?.firstName}&apos;s Program</span>
          <span className="text-xs text-secondary">{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
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
                className={`shrink-0 rounded-xl bg-primary p-4 transition-opacity ${isDragging ? 'opacity-40' : 'opacity-100'}`}
                style={{
                  border: isDropTarget ? '2px dashed #6750A4' : '1px solid var(--color-border-secondary, #E0E0E0)',
                }}
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
                    className="flex h-7 w-7 items-center justify-center rounded text-quaternary hover:bg-secondary hover:text-secondary transition-colors"
                  >
                    <MinusCircle size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {([
                    { label: 'Sets', field: 'sets' as const, value: row.sets },
                    { label: 'Reps', field: 'reps' as const, value: row.reps },
                    { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs },
                  ]).map(({ label, field, value }) => (
                    <div key={field} className="flex items-center gap-1">
                      <span className="text-xs text-secondary">{label}:</span>
                      <input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => updateRow(row.exerciseId, field, Number(e.target.value))}
                        className="w-16 rounded-lg border border-secondary px-2 py-1.5 text-sm text-center shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary">Freq:</span>
                    <select
                      value={row.frequency}
                      onChange={(e) => updateRow(row.exerciseId, 'frequency', e.target.value)}
                      className="rounded-lg border border-secondary bg-primary px-2 py-1.5 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 border-t border-secondary pt-4">
          <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
          <Button
            color="primary"
            size="sm"
            onPress={() => {
              const current = getHepState(id);
              const currentProgram = current.programId ? mockPrograms.find((p) => p.id === current.programId) : null;
              const oldSnapshot = currentProgram && current.programAssignedAt
                ? {
                    programId: currentProgram.id,
                    programName: currentProgram.name,
                    exercises: currentProgram.exercises,
                    assignedAt: current.programAssignedAt,
                  }
                : null;
              const newProgramId = current.programId ?? 'prog1';
              const newProgramName = currentProgram?.name ?? 'Custom Program';
              const newExercises = programRows.map((r) => ({ ...r, adherence: 0 }));
              saveNewProgram(id, newProgramId, newProgramName, newExercises, oldSnapshot);
              toast.success('Program updated');
              router.push(`/patients/${id}/program`);
            }}
          >
            Save Program Updates
          </Button>
        </div>
      </div>

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
