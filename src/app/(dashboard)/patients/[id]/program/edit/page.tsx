'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { mockPatients, mockExercises, mockPrograms } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';

const ALL_CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const ALL_SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const ALL_MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus', 'Hip Abductors', 'Adductors', 'Hip Flexors', 'Quadriceps'];
const ALL_BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Most Popular', 'Newest Added'];

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
  const [filterSpecialty] = useState(['Pelvic Floor']);
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [filterBodyParts, setFilterBodyParts] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));

  const [programRows, setProgramRows] = useState<ProgramRow[]>(
    existingProgram?.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps, holdSecs: e.holdSecs, frequency: e.frequency })) ?? []
  );
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

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
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 290px)', overflow: 'hidden' }}>
      {/* Left: Exercise Library */}
      <Box sx={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
        <Typography variant="subtitle1" fontWeight={600}>Exercise Library</Typography>

        <TextField
          placeholder="Search exercises…" size="small" fullWidth
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label="Pelvic Floor" size="small" color="primary" variant="filled" />
          <Chip
            label="Favorites"
            size="small"
            variant={showFavoritesOnly ? 'filled' : 'outlined'}
            color={showFavoritesOnly ? 'primary' : 'default'}
            icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
          <FilterMenu label="Condition" options={ALL_CONDITIONS} selected={filterConditions} onChange={setFilterConditions} />
          <FilterMenu label="Surgery" options={ALL_SURGERIES} selected={filterSurgeries} onChange={setFilterSurgeries} />
          <FilterMenu label="Muscle" options={ALL_MUSCLES} selected={filterMuscles} onChange={setFilterMuscles} />
          <FilterMenu label="Body Part" options={ALL_BODY_PARTS} selected={filterBodyParts} onChange={setFilterBodyParts} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">Sort:</Typography>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 140 }}>
            {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
          {filteredExercises.map((ex) => (
            <Card key={ex.id} sx={{ flexShrink: 0, '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 20 }} />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{ex.name}</Typography>
                    {favorites.has(ex.id) && <FavoriteIcon sx={{ fontSize: 12, color: '#E91E63' }} />}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                    {ex.tags.specialty.slice(0, 2).map((t) => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Preview">
                    <IconButton size="small" onClick={() => setPreviewExercise(ex)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}>
                    <IconButton size="small" onClick={() => toggleFavorite(ex.id)}>
                      {favorites.has(ex.id) ? <FavoriteIcon fontSize="small" sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add to program">
                    <IconButton size="small" onClick={() => addExercise(ex)} disabled={programRows.some((r) => r.exerciseId === ex.id)} color="primary">
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Right: Patient's Program */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>{patient?.firstName}&apos;s Program</Typography>
          <Typography variant="caption" color="text.secondary">{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</Typography>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
          {programRows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">Add exercises from the library</Typography>
            </Box>
          ) : programRows.map((row) => {
            const ex = mockExercises.find((e) => e.id === row.exerciseId);
            if (!ex) return null;
            return (
              <Card key={row.exerciseId} sx={{ flexShrink: 0 }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={600}>{ex.name}</Typography>
                    <IconButton size="small" onClick={() => removeExercise(row.exerciseId)} sx={{ color: '#9E9E9E', '&:hover': { color: '#F44336' } }}>
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Sets', field: 'sets' as const, value: row.sets },
                      { label: 'Reps', field: 'reps' as const, value: row.reps },
                      { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs },
                    ].map(({ label, field, value }) => (
                      <Box key={field} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{label}:</Typography>
                        <TextField
                          type="number" size="small" value={value}
                          onChange={(e) => updateRow(row.exerciseId, field, parseInt(e.target.value) || 0)}
                          sx={{ width: 64, '& input': { py: 0.5, px: 1, fontSize: 13 } }}
                          inputProps={{ min: 0 }}
                        />
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Freq:</Typography>
                      <Select value={row.frequency} onChange={(e) => updateRow(row.exerciseId, 'frequency', e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 130 }}>
                        {['Daily', '2x Daily', 'Every Other Day', '3x Weekly'].map((f) => <MenuItem key={f} value={f} sx={{ fontSize: 13 }}>{f}</MenuItem>)}
                      </Select>
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
          <Button onClick={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
          <Button variant="contained" onClick={() => router.push(`/patients/${id}/program`)} disableElevation>Save Program Updates</Button>
        </Box>
      </Box>

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => setPreviewExercise(null)}
        onAddToCurrentProgram={previewExercise && !programRows.some((r) => r.exerciseId === previewExercise.id)
          ? () => { if (previewExercise) addExercise(previewExercise); }
          : undefined}
      />
    </Box>
  );
}
