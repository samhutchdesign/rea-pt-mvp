'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockPatients, mockExercises, mockPrograms, mockChartSessions, mockExerciseComments } from '@/lib/mock-data';
import { useHepState } from '@/lib/patientHepStore';
import type { Exercise, ProgramExercise, HepHistoryEntry, Program } from '@/lib/types';
import { useViewMode } from '@/lib/viewModeStore';
import { Avatar } from '@/components/base/avatar/avatar';
import { cx } from '@/utils/cx';
import { ChevronDown, ChevronUp, Eye, Pencil, Pin, Search, Send, X, Zap } from 'lucide-react';

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

const ALL_CONDITIONS = [...new Set(mockExercises.flatMap((e) => e.tags.condition).map(toTitleCase))].sort();
const ALL_CATEGORIES = [...new Set(mockExercises.map((e) => e.category))].sort();
const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function FilterSection({ title, activeCount, onClear, children }: { title: string; activeCount: number; onClear: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-secondary last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-primary">{title}</span>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="p-0.5 text-quaternary hover:text-tertiary bg-transparent border-none cursor-pointer leading-none">
            <X size={12} />
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
      className="flex w-full items-center gap-2 mb-1.5 cursor-pointer text-left bg-transparent border-none p-0"
    >
      <span className={cx(
        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border',
        checked ? 'bg-brand-600 border-brand-600' : 'border-secondary bg-primary'
      )}>
        {checked && (
          <svg className="h-2 w-2 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-xs text-primary leading-tight">{label}</span>
    </button>
  );
}

function ExerciseCard({
  pe,
  viewMode,
  onPreview,
}: {
  pe: ProgramExercise;
  viewMode: string;
  onPreview: (ex: Exercise, pe: ProgramExercise) => void;
}) {
  const ex = mockExercises.find((e) => e.id === pe.exerciseId);
  if (!ex) return null;

  const comments = mockExerciseComments[pe.exerciseId] ?? [];
  const sorted = [...comments].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-5">
          <div className="w-20 h-16 rounded-lg bg-[#EDE7F6] flex items-center justify-center shrink-0">
            <Zap size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary mb-0.5">{ex.name}</p>
            <p className="text-xs text-secondary mb-2">{ex.description}</p>
            <div className="flex gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.sets} Sets</span>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.reps} Reps</span>
              {pe.holdSecs > 0 && (
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.holdSecs} Sec Hold</span>
              )}
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{pe.frequency}</span>
            </div>
          </div>
          {viewMode === 'full' && pe.adherence != null && (
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              <span
                className="text-lg font-bold leading-none"
                style={{ color: pe.adherence >= 80 ? '#2E7D32' : pe.adherence >= 60 ? '#F57F17' : '#C62828' }}
              >
                {pe.adherence}%
              </span>
              <span className="text-[10px] text-secondary whitespace-nowrap">adherence</span>
            </div>
          )}
          <button
            title="Preview exercise"
            className="p-1.5 rounded-lg text-secondary hover:bg-secondary hover:text-primary transition-colors"
            onClick={() => onPreview(ex, pe)}
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {viewMode === 'full' && sorted.length > 0 && (
        <div className="border-t border-secondary bg-secondary_alt px-4 py-3 flex flex-col gap-3">
          {sorted.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar initials={c.authorInitials} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-primary">{c.authorName}</span>
                  {c.pinned && <Pin size={10} className="text-brand-500 shrink-0" />}
                  <span className="text-[11px] text-tertiary ml-auto shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryEntry({ entry }: { entry: HepHistoryEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-primary">{entry.programName}</p>
          <p className="text-xs text-tertiary mt-0.5">
            {formatDate(entry.assignedAt)} – {formatDate(entry.endedAt)} · {entry.exercises.length} exercise{entry.exercises.length !== 1 ? 's' : ''}
          </p>
        </div>
        {open ? <ChevronUp size={14} className="text-quaternary shrink-0" /> : <ChevronDown size={14} className="text-quaternary shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-secondary px-4 py-3 flex flex-col gap-1.5">
          {entry.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-primary">{ex.name}</span>
                <span className="text-xs text-tertiary shrink-0 ml-4">
                  {pe.sets} × {pe.reps}{pe.holdSecs > 0 ? ` · ${pe.holdSecs}s hold` : ''} · {pe.frequency}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewPE, setPreviewPE] = useState<ProgramExercise | null>(null);
  const viewMode = useViewMode();

  // Filter state
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [conditionSearch, setConditionSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showMoreConditions, setShowMoreConditions] = useState(false);

  const patient = mockPatients.find((p) => p.id === id);
  const hep = useHepState(id);
  const program: Program | undefined = hep.programId ? mockPrograms.find((p) => p.id === hep.programId) : undefined;
  const completedSessions = (mockChartSessions[id] ?? []).filter((s) => !s.isIntakeSession).length;
  const totalSessions = patient?.totalSessions ?? 8;

  const hasFilters = filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0;
  const clearFilters = () => { setFilterConditions([]); setFilterCategories([]); setFilterLevels([]); setFilterEquipment([]); };
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filteredConditionsList = conditionSearch
    ? ALL_CONDITIONS.filter((c) => c.toLowerCase().includes(conditionSearch.toLowerCase()))
    : ALL_CONDITIONS;
  const filteredCategoriesList = categorySearch
    ? ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
    : ALL_CATEGORIES;
  const visibleConditions = conditionSearch
    ? filteredConditionsList
    : showMoreConditions ? ALL_CONDITIONS : ALL_CONDITIONS.slice(0, 7);

  // Filter exercises in the current program
  const visibleExercises = useMemo(() => {
    if (!program) return [];
    return program.exercises.filter((pe) => {
      const ex = mockExercises.find((e) => e.id === pe.exerciseId);
      if (!ex) return false;
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.some((ec) => toTitleCase(ec) === c))) return false;
      if (filterCategories.length && !filterCategories.some((c) => ex.category === c)) return false;
      if (filterLevels.length && !filterLevels.includes(ex.level)) return false;
      if (filterEquipment.length && !filterEquipment.includes(toTitleCase(ex.equipment))) return false;
      return true;
    });
  }, [program, filterConditions, filterCategories, filterLevels, filterEquipment]);

  // Filter template programs in "no program" state
  const visiblePrograms = useMemo(() => {
    return mockPrograms.filter((prog) => {
      const exs = prog.exercises.map((pe) => mockExercises.find((e) => e.id === pe.exerciseId)).filter(Boolean);
      if (filterConditions.length && !filterConditions.some((c) => exs.some((ex) => ex!.tags.condition.some((ec) => toTitleCase(ec) === c)))) return false;
      if (filterCategories.length && !filterCategories.some((c) => exs.some((ex) => ex!.category === c))) return false;
      if (filterLevels.length && !filterLevels.some((l) => exs.some((ex) => ex!.level === l))) return false;
      if (filterEquipment.length && !filterEquipment.some((eq) => exs.some((ex) => toTitleCase(ex!.equipment) === eq))) return false;
      return true;
    });
  }, [filterConditions, filterCategories, filterLevels, filterEquipment]);

  if (!patient) return null;

  const filterPanel = (
    <div className="w-44 shrink-0 pr-5 border-r border-secondary mr-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-secondary">
        <span className="font-semibold text-xs text-primary">Filters</span>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-xs text-brand-700 hover:text-brand-600 font-medium bg-transparent border-none cursor-pointer p-0">
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Condition" activeCount={filterConditions.length} onClear={() => setFilterConditions([])}>
        <div className="relative mb-2.5">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={conditionSearch}
            onChange={(e) => setConditionSearch(e.target.value)}
            className="w-full rounded-lg border border-secondary bg-primary pl-6 pr-2 py-1 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
          />
        </div>
        {visibleConditions.map((c) => (
          <CheckRow key={c} label={c} checked={filterConditions.includes(c)} onChange={() => toggleArr(filterConditions, c, setFilterConditions)} />
        ))}
        {!conditionSearch && ALL_CONDITIONS.length > 7 && (
          <button type="button" onClick={() => setShowMoreConditions((v) => !v)} className="text-xs text-brand-700 hover:text-brand-600 font-medium bg-transparent border-none cursor-pointer p-0 mt-1">
            {showMoreConditions ? 'Show less' : `+${ALL_CONDITIONS.length - 7} more`}
          </button>
        )}
        {conditionSearch && filteredConditionsList.length === 0 && (
          <p className="text-xs text-tertiary">No results.</p>
        )}
      </FilterSection>

      <FilterSection title="Category" activeCount={filterCategories.length} onClear={() => setFilterCategories([])}>
        <div className="relative mb-2.5">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-quaternary pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full rounded-lg border border-secondary bg-primary pl-6 pr-2 py-1 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-quaternary"
          />
        </div>
        {filteredCategoriesList.map((c) => (
          <CheckRow key={c} label={c} checked={filterCategories.includes(c)} onChange={() => toggleArr(filterCategories, c, setFilterCategories)} />
        ))}
        {categorySearch && filteredCategoriesList.length === 0 && (
          <p className="text-xs text-tertiary">No results.</p>
        )}
      </FilterSection>

      <FilterSection title="Level" activeCount={filterLevels.length} onClear={() => setFilterLevels([])}>
        {ALL_LEVELS.map((l) => (
          <CheckRow key={l} label={l} checked={filterLevels.includes(l)} onChange={() => toggleArr(filterLevels, l, setFilterLevels)} />
        ))}
      </FilterSection>

      <FilterSection title="Equipment" activeCount={filterEquipment.length} onClear={() => setFilterEquipment([])}>
        {ALL_EQUIPMENT.map((eq) => (
          <CheckRow key={eq} label={eq} checked={filterEquipment.includes(eq)} onChange={() => toggleArr(filterEquipment, eq, setFilterEquipment)} />
        ))}
      </FilterSection>
    </div>
  );

  if (!program) {
    return (
      <div className="flex gap-0 items-start">
        {filterPanel}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary mt-0 mb-2">Program</h3>
          <p className="text-sm text-secondary mb-6">
            No program assigned yet. Choose a recommended template or start from scratch.
          </p>
          {visiblePrograms.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-tertiary mb-3">No programs match your filters.</p>
              <button type="button" onClick={clearFilters} className="text-sm text-brand-700 hover:text-brand-600 font-medium bg-transparent border-none cursor-pointer p-0">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visiblePrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-xl border border-secondary bg-primary shadow-xs p-5 cursor-pointer hover:border-brand-600 transition-colors"
                  onClick={() => router.push(`/patients/${id}/program/edit`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-primary">{prog.name}</p>
                      <p className="text-xs text-secondary mt-0.5">{prog.description}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {prog.tags.map((t) => (
                          <span key={t} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{t}</span>
                        ))}
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 shrink-0">
                      {prog.exercises.length} exercises
                    </span>
                  </div>
                </div>
              ))}
              <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/program/edit`)}>
                Create Program from Scratch
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-0 items-start">
      {filterPanel}
      <div className="flex-1 min-w-0">

        {/* Current program header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary m-0">{program.name}</h3>
            <p className="text-sm text-secondary mt-0.5">
              {completedSessions} of {totalSessions} sessions
              {viewMode === 'full' && hep.programAssignedAt && (
                <span className="ml-3 text-xs text-tertiary">Assigned {formatDate(hep.programAssignedAt)}</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button color="secondary" size="sm" iconLeading={Pencil} onPress={() => router.push(`/patients/${id}/program/edit`)}>
              Modify
            </Button>
            <Button color="primary" size="sm" iconLeading={Send} onPress={() => router.push(`/patients/${id}/program/send`)}>
              Send Program to Patient
            </Button>
          </div>
        </div>

        {/* Active filters summary */}
        {hasFilters && (
          <p className="text-xs text-tertiary mb-3">
            Showing {visibleExercises.length} of {program.exercises.length} exercise{program.exercises.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Exercises */}
        {visibleExercises.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-tertiary mb-3">No exercises match your filters.</p>
            <button type="button" onClick={clearFilters} className="text-sm text-brand-700 hover:text-brand-600 font-medium bg-transparent border-none cursor-pointer p-0">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleExercises.map((pe) => (
              <ExerciseCard
                key={pe.exerciseId}
                pe={pe}
                viewMode={viewMode}
                onPreview={(ex, pe) => { setPreviewExercise(ex); setPreviewPE(pe); }}
              />
            ))}
          </div>
        )}

        {/* HEP History */}
        {viewMode === 'full' && hep.hepHistory.length > 0 && (
          <div className="mt-10">
            <h4 className="text-sm font-semibold text-primary mb-3">Previous Programs</h4>
            <div className="flex flex-col gap-2">
              {[...hep.hepHistory].reverse().map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        <ExercisePreviewDrawer
          exercise={previewExercise}
          open={!!previewExercise}
          onClose={() => { setPreviewExercise(null); setPreviewPE(null); }}
          patientPrescription={previewPE ? { sets: previewPE.sets, reps: previewPE.reps, holdSecs: previewPE.holdSecs, frequency: previewPE.frequency } : undefined}
        />
      </div>
    </div>
  );
}
