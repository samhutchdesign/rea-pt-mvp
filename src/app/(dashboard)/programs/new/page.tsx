'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Select, Divider, Tooltip, InputNumber, ConfigProvider } from 'antd';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';
import { Eye, GripVertical, Heart, MinusCircle, PlusCircle, Search, Zap } from 'lucide-react';

const { Title, Text } = Typography;

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
      <div style={{ paddingTop: 56, paddingLeft: 32, paddingRight: 32, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '24px 0' }}>
          <Input
            placeholder="Program Name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            style={{ width: 400 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden', paddingBottom: 24 }}>
          {/* Left: Exercise Library */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            <Text strong>Exercise Library</Text>

            <Input
              placeholder="Search exercises…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search style={{ color: '#9E9E9E' }} />}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Tag.CheckableTag
                checked={showFavoritesOnly}
                onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                style={{ border: '1px solid #E0E0E0', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Heart size={14} fill="currentColor" /> Favorites
              </Tag.CheckableTag>
              <FilterMenu label="Specialty" options={ALL_SPECIALTIES} selected={filterSpecialties} onChange={setFilterSpecialties} />
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
                <Card key={ex.id} styles={{ body: { padding: 12 } }} style={{ flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={18} />
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <Text strong ellipsis style={{ display: 'block' }}>{ex.name}</Text>
                      <div style={{ display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                        {ex.tags.specialty.slice(0, 2).map((t) => <Tag key={t} style={{ fontSize: 10 }}>{t}</Tag>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
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

          {/* Right: Program */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{programName || 'New Program'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</Text>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {programRows.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px 0' }}><Text type="secondary">Add exercises from the library</Text></div>
                : programRows.map((row, idx) => {
                  const ex = mockExercises.find((e) => e.id === row.exerciseId);
                  if (!ex) return null;
                  const isDragging = dragIndex === idx;
                  const isDropTarget = dragOverIndex === idx && dragIndex !== idx;
                  return (
                    <Card
                      key={row.exerciseId}
                      styles={{ body: { padding: 16 } }}
                      style={{ flexShrink: 0, opacity: isDragging ? 0.4 : 1, border: isDropTarget ? '2px dashed #6750A4' : undefined, transition: 'opacity 0.15s' }}
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
                          {([{ label: 'Sets', field: 'sets' as const, value: row.sets }, { label: 'Reps', field: 'reps' as const, value: row.reps }, { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs }]).map(({ label, field, value }) => (
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, paddingTop: 16, borderTop: '1px solid #E0E0E0', flexShrink: 0 }}>
              <Button onClick={() => router.push('/programs')}>Cancel</Button>
              <Button type="primary" onClick={() => router.push('/programs')}>Save Program</Button>
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
