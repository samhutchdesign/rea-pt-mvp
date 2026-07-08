'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Divider, Tooltip, InputNumber, ConfigProvider } from 'antd';
import { mockPatients, mockExercises, mockPrograms } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { Eye, GripVertical, Heart, MinusCircle, PlusCircle, Search, Zap } from 'lucide-react';

const { Text } = Typography;

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
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 290px)', overflow: 'hidden' }}>
      {/* Left: Exercise Library */}
      <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <Text strong>Exercise Library</Text>

        <Input
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search style={{ color: '#9E9E9E' }} />}
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag color="purple" style={{ margin: 0 }}>Pelvic Floor</Tag>
          <Tag.CheckableTag
            checked={showFavoritesOnly}
            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ border: '1px solid #E0E0E0', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Heart size={14} fill="currentColor" /> Favorites
          </Tag.CheckableTag>
          <FilterMenu label="Condition" options={ALL_CONDITIONS} selected={filterConditions} onChange={setFilterConditions} />
          <FilterMenu label="Surgery" options={ALL_SURGERIES} selected={filterSurgeries} onChange={setFilterSurgeries} />
          <FilterMenu label="Muscle" options={ALL_MUSCLES} selected={filterMuscles} onChange={setFilterMuscles} />
          <FilterMenu label="Body Part" options={ALL_BODY_PARTS} selected={filterBodyParts} onChange={setFilterBodyParts} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Sort:</Text>
          <Select value={sortBy} onChange={setSortBy} style={{ minWidth: 140 }} options={SORT_OPTIONS.map((o) => ({ value: o, label: o }))} />
        </div>

        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {filteredExercises.map((ex) => (
            <Card key={ex.id} hoverable styles={{ body: { padding: 12 } }} style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={20} />
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text strong ellipsis>{ex.name}</Text>
                    {favorites.has(ex.id) && <Heart size={12} fill="currentColor" />}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                    {ex.tags.specialty.slice(0, 2).map((t) => <Tag key={t} style={{ fontSize: 10 }}>{t}</Tag>)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Tooltip title="Preview">
                    <Button type="text" size="small" onClick={() => setPreviewExercise(ex)} icon={<Eye />} />
                  </Tooltip>
                  <Tooltip title={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}>
                    <Button type="text" size="small" onClick={() => toggleFavorite(ex.id)} icon={favorites.has(ex.id) ? <Heart style={{ color: '#E91E63' }} fill="currentColor" /> : <Heart />} />
                  </Tooltip>
                  <Tooltip title="Add to program">
                    <Button type="text" size="small" onClick={() => addExercise(ex)} disabled={programRows.some((r) => r.exerciseId === ex.id)} icon={<PlusCircle style={{ color: '#6750A4' }} />} />
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Divider type="vertical" style={{ height: 'auto' }} />

      {/* Right: Patient's Program */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>{patient?.firstName}&apos;s Program</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</Text>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {programRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Text type="secondary">Add exercises from the library</Text>
            </div>
          ) : programRows.map((row, idx) => {
            const ex = mockExercises.find((e) => e.id === row.exerciseId);
            if (!ex) return null;
            const isDragging = dragIndex === idx;
            const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
            return (
              <Card
                key={row.exerciseId}
                styles={{ body: { padding: 16 } }}
                style={{
                  flexShrink: 0,
                  opacity: isDragging ? 0.4 : 1,
                  border: isDropTarget ? '2px dashed #6750A4' : undefined,
                  transition: 'opacity 0.15s',
                }}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GripVertical size={16} style={{ color: '#BDBDBD', cursor: 'grab', flexShrink: 0 }} />
                    <Text strong>{ex.name}</Text>
                  </div>
                  <Button type="text" size="small" onClick={() => removeExercise(row.exerciseId)} icon={<MinusCircle />} style={{ color: '#9E9E9E' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <ConfigProvider theme={{ components: { InputNumber: { handleVisible: true } } }}>
                    {([
                      { label: 'Sets', field: 'sets' as const, value: row.sets },
                      { label: 'Reps', field: 'reps' as const, value: row.reps },
                      { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs },
                    ]).map(({ label, field, value }) => (
                      <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{label}:</Text>
                        <InputNumber size="small" min={0} value={value} onChange={(v) => updateRow(row.exerciseId, field, v ?? 0)} style={{ width: 72 }} />
                      </div>
                    ))}
                  </ConfigProvider>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Freq:</Text>
                    <Select value={row.frequency} onChange={(v) => updateRow(row.exerciseId, 'frequency', v)} size="small" style={{ minWidth: 130 }} options={FREQUENCIES.map((f) => ({ value: f, label: f }))} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
          <Button onClick={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
          <Button type="primary" onClick={() => router.push(`/patients/${id}/program`)}>Save Program Updates</Button>
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
