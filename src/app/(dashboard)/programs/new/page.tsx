'use client';
import { useState, useMemo } from 'react';
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
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Most Popular', 'Newest Added'];

interface ProgramRow { exerciseId: string; sets: number; reps: number; holdSecs: number; frequency: string; }

export default function NewProgramPage() {
  const router = useRouter();
  const [programName, setProgramName] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [programRows, setProgramRows] = useState<ProgramRow[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const filteredExercises = useMemo(() => {
    let exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
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
  }, [search, sortBy, showFavoritesOnly, favorites]);

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
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <TextField label="Program Name" size="small" value={programName} onChange={(e) => setProgramName(e.target.value)} sx={{ mb: 3, width: 400 }} />

        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
          {/* Left */}
          <Box sx={{ width: '45%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Exercise Library</Typography>
            <TextField placeholder="Search exercises…" size="small" fullWidth value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label="Favorites" size="small" variant={showFavoritesOnly ? 'filled' : 'outlined'} color={showFavoritesOnly ? 'primary' : 'default'}
                icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} />
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 140, ml: 'auto' }}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </Box>
            <Box sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredExercises.map((ex) => (
                <Card key={ex.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 18 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{ex.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Preview"><IconButton size="small" onClick={() => setPreviewExercise(ex)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
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

          {/* Right */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>{programName || 'New Program'}</Typography>
              <Typography variant="caption" color="text.secondary">{programRows.length} exercise{programRows.length !== 1 ? 's' : ''}</Typography>
            </Box>
            <Box sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {programRows.length === 0
                ? <Box sx={{ textAlign: 'center', py: 6 }}><Typography variant="body2" color="text.secondary">Add exercises from the library</Typography></Box>
                : programRows.map((row) => {
                  const ex = mockExercises.find((e) => e.id === row.exerciseId);
                  if (!ex) return null;
                  return (
                    <Card key={row.exerciseId}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="body2" fontWeight={600}>{ex.name}</Typography>
                          <IconButton size="small" onClick={() => removeExercise(row.exerciseId)} sx={{ color: '#9E9E9E', '&:hover': { color: '#F44336' } }}>
                            <RemoveCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          {[{ label: 'Sets', field: 'sets' as const, value: row.sets }, { label: 'Reps', field: 'reps' as const, value: row.reps }, { label: 'Hold (sec)', field: 'holdSecs' as const, value: row.holdSecs }].map(({ label, field, value }) => (
                            <Box key={field} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">{label}:</Typography>
                              <TextField type="number" size="small" value={value} onChange={(e) => updateRow(row.exerciseId, field, parseInt(e.target.value) || 0)} sx={{ width: 64, '& input': { py: 0.5, px: 1, fontSize: 13 } }} inputProps={{ min: 0 }} />
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
              <Button onClick={() => router.push('/programs')}>Cancel</Button>
              <Button variant="contained" onClick={() => router.push('/programs')} disableElevation>Save Program</Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
