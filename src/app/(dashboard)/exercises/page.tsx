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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

// Abbreviation → full search term
const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence',
  uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder',
  'ic-bps': 'Bladder Pain Syndrome',
  'ic bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain',
  pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti',
  pgp: 'Pelvic Girdle Pain',
  sfui: 'Fecal Incontinence',
  pfmt: 'Pelvic Floor Muscle Training',
  ta: 'Transversus Abdominis',
};

const CONDITION_GROUPS = [
  {
    group: 'Urinary Incontinence',
    color: '#E3F2FD',
    textColor: '#0277BD',
    conditions: [
      { name: 'Stress Urinary Incontinence', abbr: 'SUI', searchTerm: 'Stress Urinary Incontinence' },
      { name: 'Urge Urinary Incontinence', abbr: 'UUI', searchTerm: 'Urge Urinary Incontinence' },
      { name: 'Mixed Urinary Incontinence', abbr: null, searchTerm: 'Mixed Urinary Incontinence' },
      { name: 'Overactive Bladder', abbr: 'OAB', searchTerm: 'Overactive Bladder' },
    ],
  },
  {
    group: 'Pelvic Pain',
    color: '#FFF3E0',
    textColor: '#E65100',
    conditions: [
      { name: 'Dyspareunia', abbr: null, searchTerm: 'Dyspareunia' },
      { name: 'Vaginismus', abbr: null, searchTerm: 'Vaginismus' },
      { name: 'Vulvodynia', abbr: null, searchTerm: 'Vulvodynia' },
      { name: 'Vestibulodynia', abbr: null, searchTerm: 'Vestibulodynia' },
      { name: 'Pudendal Neuralgia', abbr: null, searchTerm: 'Pudendal Neuralgia' },
      { name: 'Coccydynia', abbr: null, searchTerm: 'Coccydynia' },
      { name: 'Pelvic Congestion', abbr: null, searchTerm: 'Pelvic Congestion' },
    ],
  },
  {
    group: 'Prolapse',
    color: '#F3E5F5',
    textColor: '#7B1FA2',
    conditions: [
      { name: 'Pelvic Organ Prolapse', abbr: 'POP', searchTerm: 'Pelvic Organ Prolapse' },
      { name: 'Cystocele', abbr: null, searchTerm: 'Cystocele' },
      { name: 'Rectocele', abbr: null, searchTerm: 'Rectocele' },
    ],
  },
  {
    group: 'Bladder',
    color: '#E8F5E9',
    textColor: '#2E7D32',
    conditions: [
      { name: 'Bladder Pain Syndrome / IC', abbr: 'IC-BPS', searchTerm: 'Bladder Pain Syndrome' },
      { name: 'Bladder Retraining', abbr: null, searchTerm: 'Overactive Bladder' },
    ],
  },
  {
    group: 'Bowel',
    color: '#FFF8E1',
    textColor: '#F57F17',
    conditions: [
      { name: 'Constipation', abbr: null, searchTerm: 'Constipation' },
      { name: 'Fecal Incontinence', abbr: null, searchTerm: 'Fecal Incontinence' },
      { name: 'Dyssynergic Defecation', abbr: null, searchTerm: 'Dyssynergic Defecation' },
    ],
  },
  {
    group: 'Postpartum & Pregnancy',
    color: '#FCE4EC',
    textColor: '#C62828',
    conditions: [
      { name: 'Postpartum Recovery', abbr: null, searchTerm: 'Postpartum' },
      { name: 'Pregnancy', abbr: null, searchTerm: 'Pregnancy' },
      { name: 'Diastasis Recti', abbr: 'DRA', searchTerm: 'Diastasis Recti' },
      { name: 'C-Section Recovery', abbr: null, searchTerm: 'C-Section' },
    ],
  },
  {
    group: 'Musculoskeletal',
    color: '#E8EAF6',
    textColor: '#283593',
    conditions: [
      { name: 'Low Back Pain', abbr: null, searchTerm: 'Low Back Pain' },
      { name: 'Pelvic Girdle Pain', abbr: 'PGP', searchTerm: 'Pelvic Girdle Pain' },
      { name: 'Sacroiliac Joint Dysfunction', abbr: null, searchTerm: 'Sacroiliac' },
      { name: 'Hip Pain', abbr: null, searchTerm: 'Hip Pain' },
    ],
  },
];

const ALL_CATEGORIES = [
  'Pelvic Floor Muscle Training', 'Core / Transversus', 'Glute / Hip Strength',
  'Hip & Pelvic Mobility', 'Functional / Lower Extremity', 'Bowel & Anorectal',
  'Scar Tissue & Post-Surgical', 'Thoracic & Upper Extremity', 'Balance & Return to Sport',
  'Pelvic Pain & Hypertonic', 'Bladder Retraining', 'Functional Movement & ADLs',
];
const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

function expandSearch(q: string): string {
  const alias = SEARCH_ALIASES[q.toLowerCase().trim()];
  return alias ?? q;
}

export default function ExercisesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'filter' | 'condition'>('filter');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [activeConditionSearch, setActiveConditionSearch] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });

  const selectCondition = (searchTerm: string) => {
    setActiveConditionSearch(searchTerm);
    setViewMode('filter');
    setSearch('');
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
  };

  const clearAll = () => {
    setSearch('');
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setActiveConditionSearch(null);
    setShowFavoritesOnly(false);
  };

  const effectiveSearch = expandSearch(search);
  const activeFilterCount = filterCategories.length + filterLevels.length + filterEquipment.length + (activeConditionSearch ? 1 : 0);

  const filtered = useMemo(() => {
    let exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (activeConditionSearch) {
        const term = activeConditionSearch.toLowerCase();
        if (!ex.tags.condition.some((c) => c.toLowerCase().includes(term))) return false;
      }
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (
          !ex.name.toLowerCase().includes(q) &&
          !ex.category.toLowerCase().includes(q) &&
          !allTags.some((t) => t.toLowerCase().includes(q))
        ) return false;
      }
      if (filterCategories.length && !filterCategories.includes(ex.category)) return false;
      if (filterLevels.length && !filterLevels.includes(ex.level)) return false;
      if (filterEquipment.length && !filterEquipment.includes(ex.equipment)) return false;
      return true;
    });
    return exs.sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Used') return b.usageCount - a.usageCount;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [effectiveSearch, sortBy, filterCategories, filterLevels, filterEquipment, activeConditionSearch, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises' }]} />
      <Box sx={{ px: 4, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Exercises</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => { if (v) setViewMode(v); }}
              size="small"
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 13, px: 1.5, py: 0.5 } }}
            >
              <ToggleButton value="filter"><ListRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />Filter</ToggleButton>
              <ToggleButton value="condition"><GridViewRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />Browse by Condition</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/exercises/new')} disableElevation>
              Create New
            </Button>
          </Box>
        </Box>

        {/* Browse by Condition */}
        {viewMode === 'condition' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
              Select a condition to see all matching exercises.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {CONDITION_GROUPS.map(({ group, color, textColor, conditions }) => (
                <Box key={group}>
                  <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                    {group}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {conditions.map(({ name, abbr, searchTerm }) => (
                      <Box
                        key={name}
                        onClick={() => selectCondition(searchTerm)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 0.75,
                          px: 2, py: 0.75, borderRadius: '999px',
                          bgcolor: color, cursor: 'pointer',
                          border: `1px solid ${textColor}22`,
                          transition: 'all 0.15s',
                          '&:hover': { filter: 'brightness(0.95)', transform: 'translateY(-1px)' },
                        }}
                      >
                        <Typography variant="body2" fontWeight={500} sx={{ color: textColor }}>{name}</Typography>
                        {abbr && (
                          <Typography variant="caption" sx={{ color: textColor, opacity: 0.7, fontWeight: 600, fontSize: 10 }}>
                            {abbr}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Filter Row */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search name, condition, SUI, OAB…" size="small" sx={{ width: 280 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }}
          />
          <Chip
            label="Favorites" size="small"
            variant={showFavoritesOnly ? 'filled' : 'outlined'}
            color={showFavoritesOnly ? 'primary' : 'default'}
            icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
          <FilterMenu label="Category" options={ALL_CATEGORIES} selected={filterCategories} onChange={setFilterCategories} />
          <FilterMenu label="Level" options={ALL_LEVELS} selected={filterLevels} onChange={setFilterLevels} />
          <FilterMenu label="Equipment" options={ALL_EQUIPMENT} selected={filterEquipment} onChange={setFilterEquipment} />
          {(activeFilterCount > 0 || search) && (
            <Button size="small" onClick={clearAll} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 13 }}>
              Clear all
            </Button>
          )}
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 140, ml: 'auto' }}>
            {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </Box>

        {/* Active condition badge */}
        {activeConditionSearch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Showing exercises for:</Typography>
            <Chip
              label={activeConditionSearch}
              size="small"
              color="primary"
              onDelete={() => setActiveConditionSearch(null)}
              sx={{ fontSize: 12 }}
            />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {filtered.length} of {mockExercises.length} exercises
        </Typography>

        {/* Exercise list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary" mb={1}>No exercises match your filters.</Typography>
              <Button size="small" onClick={clearAll}>Clear filters</Button>
            </Box>
          ) : filtered.map((ex) => (
            <Card
              key={ex.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
              onClick={() => router.push(`/exercises/${ex.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 1.5, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 24 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={600}>{ex.name}</Typography>
                    {favorites.has(ex.id) && <FavoriteIcon sx={{ fontSize: 14, color: '#E91E63' }} />}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={ex.category} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                    <Chip
                      label={ex.level} size="small"
                      sx={{
                        fontSize: 11, height: 20,
                        bgcolor: ex.level === 'Beginner' ? '#E8F5E9' : ex.level === 'Intermediate' ? '#FFF8E1' : '#FFF3E0',
                        color: ex.level === 'Beginner' ? '#2E7D32' : ex.level === 'Intermediate' ? '#F57F17' : '#E65100',
                      }}
                    />
                    {ex.equipment !== 'None' && <Chip label={ex.equipment} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />}
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
