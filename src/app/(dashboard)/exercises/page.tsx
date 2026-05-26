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
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

const ALL_SPECIALTIES = ['Pelvic Floor', 'Orthopedic'];
const ALL_CONDITIONS = ['Incontinence', 'Prolapse', 'Pelvic Pain', 'Postpartum', 'Urgency'];
const ALL_SURGERIES = ['Post-THA', 'Post-TKA', 'C-Section', 'Post-Hysterectomy'];
const ALL_MUSCLES = ['Levator Ani', 'Coccygeus', 'Transverse Abdominis', 'Glutes', 'Diaphragm', 'Multifidus'];
const ALL_BODY_PARTS = ['Pelvis', 'Core', 'Hip', 'Spine', 'Knee'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Most Popular', 'Newest Added'];

export default function ExercisesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterSpecialties, setFilterSpecialties] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterSurgeries, setFilterSurgeries] = useState<string[]>([]);
  const [filterMuscles, setFilterMuscles] = useState<string[]>([]);
  const [filterBodyParts, setFilterBodyParts] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });

  const filtered = useMemo(() => {
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

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises' }]} />
      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Exercises</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/exercises/new')} disableElevation>
            Create New Exercise
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search exercises…" size="small" sx={{ width: 280 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }}
          />
          <Chip
            label="Favorites"
            size="small"
            variant={showFavoritesOnly ? 'filled' : 'outlined'}
            color={showFavoritesOnly ? 'primary' : 'default'}
            icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
          <FilterMenu label="Specialty" options={ALL_SPECIALTIES} selected={filterSpecialties} onChange={setFilterSpecialties} />
          <FilterMenu label="Condition" options={ALL_CONDITIONS} selected={filterConditions} onChange={setFilterConditions} />
          <FilterMenu label="Surgery" options={ALL_SURGERIES} selected={filterSurgeries} onChange={setFilterSurgeries} />
          <FilterMenu label="Muscle" options={ALL_MUSCLES} selected={filterMuscles} onChange={setFilterMuscles} />
          <FilterMenu label="Body Part" options={ALL_BODY_PARTS} selected={filterBodyParts} onChange={setFilterBodyParts} />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 150, ml: 'auto' }}>
            {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((ex) => (
            <Card
              key={ex.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
              onClick={() => setPreviewExercise(ex)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 1.5, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 24 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={600}>{ex.name}</Typography>
                    {favorites.has(ex.id) && <FavoriteIcon sx={{ fontSize: 14, color: '#E91E63' }} />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={0.75}>{ex.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {[...new Set([...ex.tags.specialty, ...ex.tags.condition.slice(0, 2), ...ex.tags.muscle.slice(0, 2)])].map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Preview">
                    <IconButton size="small" onClick={() => setPreviewExercise(ex)}><VisibilityOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title={favorites.has(ex.id) ? 'Unfavorite' : 'Favorite'}>
                    <IconButton size="small" onClick={() => toggleFavorite(ex.id)}>
                      {favorites.has(ex.id) ? <FavoriteIcon fontSize="small" sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
