'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Divider } from '@/components/ui/divider';
import { cx } from '@/utils/cx';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';
import { Eye, GripVertical, Heart, MinusCircle, PlusCircle, Search, Zap } from 'lucide-react';

const ALL_SPECIALTIES = ['Pelvic Floor', 'Orthopedic'];
const ALL_CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const ALL_SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const ALL_MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus'];
const ALL_BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Most Popular', 'Newest Added'];
const FREQUENCIES = ['Daily', '2x Daily', 'Every Other Day', '3x Weekly'];

interface ProgramRow { exerciseId: string; sets: number; reps: number; holdSecs: number; frequency: string; }

export default function NewProgramPage() {
  const router = useRouter();
  const [programName, setProgramName] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterSpecialties, setFilterSpecialties] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterSurgeries, setFilterSurgeries] = useState<string[]>([]);
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [filterBodyParts, setFilterBodyParts] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [programRows, setProgramRows] = useState<ProgramRow[]>([]);
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
      if (filterSpecialties.length && !filterSpecialties.some((s) => ex.tags.specialty.includes(s))) return false;
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.includes(c))) return false;
      if (filterSurgeries.length && !filterSurgeries.some((s) => ex.tags.surgery.includes(s))) return false;
      if (filterMuscles.length && !filterMuscles.some((m) => ex.tags.muscle.includes(m))) return false;
      if (filterBodyParts.length && !filterBodyParts.some((b) => ex.tags.bodyPart.includes(b))) return false;
      return true;
    });
    exs = exs.sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used' || sortBy === 'Most Popular') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    return exs;
  }, [search, sortBy, filterSpecialties, filterConditions, filterSurgeries, filterMuscles, filterBodyParts, showFavoritesOnly, favorites]);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });
  const addExercise = (ex: Exercise) => {
    if (programRows.some((r) => r.exerciseId === ex.id)) return;
    setProgramRows((prev) => [...prev, { exerciseId: ex.id, sets: ex.defaultSets, reps: ex.defaultReps, holdSecs: ex.defaultHoldSecs, frequency: ex.defaultFrequency }]);
  };
  const removeExercise = (exId: string) => setProgramRows((prev) => prev.filter((r) => r.exerciseId !== exId));
  const updateRow = (exId: string, field: keyof ProgramRow, value: number | string) =>
    setProgramRows((prev) => prev.map((r) => r.exerciseId === exId ? { ...r, [field]: value } : r));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: 'New Program' }]} />

      {/* Full-height flex column so the builder panels fill remaining space */}
      <div className="pt-14 px-8 h-screen flex flex-col overflow-hidden">
        <div className="py-6">
          <Input
            placeholder="Program Name"
            value={programName}
            onChange={setProgramName}
            size="md"
            wrapperClassName="max-w-[400px]"
          />
        </div>

        <div className="flex gap-6 flex-1 overflow-hidden pb-6">
          {/* Left: Exercise Library */}
          <div className="w-[45%] flex flex-col gap-4 min-h-0">
            <span className="font-semibold text-primary">Exercise Library</span>

            <Input
              placeholder="Search exercises…"
              value={search}
              onChange={setSearch}
              icon={Search}
              size="sm"
            />

            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={cx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors',
                  showFavoritesOnly
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-secondary bg-primary text-secondary hover:bg-secondary_alt',
                )}
              >
                <Heart size={12} fill="currentColor" /> Favorites
              </button>
              <FilterMenu label="Specialty" options={ALL_SPECIALTIES} selected={filterSpecialties} onChange={setFilterSpecialties} />
              <FilterMenu label="Condition" options={ALL_CONDITIONS} selected={filterConditions} onChange={setFilterConditions} />
              <FilterMenu label="Surgery" options={ALL_SURGERIES} selected={filterSurgeries} onChange={setFilterSurgeries} />
              <FilterMenu label="Muscle" options={ALL_MUSCLES} selected={filterMuscles} onChange={setFilterMuscles} />
              <FilterMenu label="Body Part" options={ALL_BODY_PARTS} selected={filterBodyParts} onChange={setFilterBodyParts} />
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs text-tertiary">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-secondary px-3 py-1.5 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 bg-primary min-w-[140px]"
              >
                {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-2 min-h-0">
              {filteredExercises.map((ex) => (
                <div key={ex.id} className="rounded-xl border border-secondary bg-primary shadow-xs p-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-sm text-primary truncate">{ex.name}</span>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {ex.tags.specialty.slice(0, 2).map((t) => (
                          <span key={t} className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        title="Preview"
                        onClick={() => setPreviewExercise(ex)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-tertiary hover:bg-secondary_alt border-0 bg-transparent cursor-pointer transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        title={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}
                        onClick={() => toggleFavorite(ex.id)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-tertiary hover:bg-secondary_alt border-0 bg-transparent cursor-pointer transition-colors"
                      >
                        {favorites.has(ex.id)
                          ? <Heart size={15} className="text-pink-500" fill="#E91E63" />
                          : <Heart size={15} />}
                      </button>
                      <button
                        title="Add to program"
                        onClick={() => addExercise(ex)}
                        disabled={programRows.some((r) => r.exerciseId === ex.id)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-brand-600 hover:bg-brand-50 border-0 bg-transparent cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <PlusCircle size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider vertical />

          {/* Right: Program */}
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">{programName || 'New Program'}</span>
              <span className="text-xs text-tertiary">{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-2 min-h-0">
              {programRows.length === 0
                ? (
                  <div className="text-center py-12">
                    <span className="text-secondary">Add exercises from the library</span>
                  </div>
                )
                : programRows.map((row, idx) => {
                  const ex = mockExercises.find((e) => e.id === row.exerciseId);
                  if (!ex) return null;
                  const isDragging = dragIndex === idx;
                  const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
                  return (
                    <div
                      key={row.exerciseId}
                      className={cx(
                        'rounded-xl border bg-primary shadow-xs p-4 shrink-0 transition-opacity duration-150',
                        isDragging ? 'opacity-40 border-secondary' : 'opacity-100 border-secondary',
                        isDropTarget && 'border-brand-400 border-dashed bg-brand-50',
                      )}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-quaternary cursor-grab shrink-0" />
                          <span className="font-semibold text-sm text-primary">{ex.name}</span>
                        </div>
                        <button
                          onClick={() => removeExercise(row.exerciseId)}
                          className="flex items-center justify-center w-6 h-6 rounded-md text-quaternary hover:text-tertiary hover:bg-secondary_alt border-0 bg-transparent cursor-pointer transition-colors"
                        >
                          <MinusCircle size={15} />
                        </button>
                      </div>
                      <div className="flex gap-3 flex-wrap items-center">
                        {([
                          { label: 'Sets', field: 'sets' as const, value: row.sets },
                          { label: 'Reps', field: 'reps' as const, value: row.reps },
                          { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs },
                        ]).map(({ label, field, value }) => (
                          <div key={field} className="flex items-center gap-1.5">
                            <span className="text-xs text-tertiary">{label}:</span>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updateRow(row.exerciseId, field, Number(e.target.value))}
                              min={0}
                              className="w-16 rounded-lg border border-secondary px-2 py-1.5 text-sm text-primary text-center shadow-xs outline-none focus:ring-2 focus:ring-brand-300"
                            />
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-tertiary">Freq:</span>
                          <select
                            value={row.frequency}
                            onChange={(e) => updateRow(row.exerciseId, 'frequency', e.target.value)}
                            className="rounded-lg border border-secondary px-2 py-1.5 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 bg-primary min-w-[130px]"
                          >
                            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-secondary shrink-0">
              <Button color="secondary" size="md" onPress={() => router.push('/programs')}>Cancel</Button>
              <Button color="primary" size="md" onPress={() => router.push('/programs')}>Save Program</Button>
            </div>
          </div>
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
    </>
  );
}
