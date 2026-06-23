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
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ElderlyRoundedIcon from '@mui/icons-material/ElderlyRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import TopBar from '@/components/layout/TopBar';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

// ── Specialties ───────────────────────────────────────────────────────────────

const SPECIALTIES = [
  {
    id: 'pelvic-health',
    name: 'Pelvic Health',
    apta: "Pelvic & Women's Health",
    description: 'Pelvic floor, incontinence, prolapse, pain with sex, postpartum & pregnancy',
    icon: SelfImprovementRoundedIcon,
    color: '#6750A4',
    bg: '#EDE7F6',
    available: true,
    count: 50,
  },
  {
    id: 'orthopaedics',
    name: 'Orthopaedics',
    apta: 'Orthopaedics',
    description: 'Spine, hip, knee, shoulder, and extremity rehabilitation',
    icon: AccessibilityNewRoundedIcon,
    color: '#0277BD',
    bg: '#E1F5FE',
    available: false,
    count: 0,
  },
  {
    id: 'sports',
    name: 'Sports & Performance',
    apta: 'Sports',
    description: 'Return to sport, athletic performance, and injury prevention',
    icon: SportsRoundedIcon,
    color: '#2E7D32',
    bg: '#E8F5E9',
    available: false,
    count: 0,
  },
  {
    id: 'neurology',
    name: 'Neurological Rehab',
    apta: 'Neurology',
    description: 'Stroke, MS, Parkinson\'s, and spinal cord conditions',
    icon: PsychologyRoundedIcon,
    color: '#E65100',
    bg: '#FFF3E0',
    available: false,
    count: 0,
  },
  {
    id: 'cardio',
    name: 'Cardio & Respiratory',
    apta: 'Cardiovascular & Pulmonary',
    description: 'Cardiac rehabilitation and pulmonary physiotherapy',
    icon: FavoriteOutlinedIcon,
    color: '#C62828',
    bg: '#FFEBEE',
    available: false,
    count: 0,
  },
  {
    id: 'oncology',
    name: 'Cancer Care',
    apta: 'Oncology',
    description: 'Lymphoedema, post-mastectomy, and cancer-related fatigue',
    icon: HealingRoundedIcon,
    color: '#6A1B9A',
    bg: '#F3E5F5',
    available: false,
    count: 0,
  },
  {
    id: 'geriatrics',
    name: 'Ageing & Geriatrics',
    apta: 'Geriatrics',
    description: 'Falls prevention, balance, mobility, and frailty',
    icon: ElderlyRoundedIcon,
    color: '#1565C0',
    bg: '#E8EAF6',
    available: false,
    count: 0,
  },
  {
    id: 'paediatrics',
    name: 'Paediatrics',
    apta: 'Pediatrics',
    description: 'Children\'s physiotherapy and developmental conditions',
    icon: ChildCareRoundedIcon,
    color: '#F57F17',
    bg: '#FFF8E1',
    available: false,
    count: 0,
  },
  {
    id: 'vestibular',
    name: 'Vestibular & Balance',
    apta: 'Vestibular',
    description: 'BPPV, vertigo, and vestibular rehabilitation',
    icon: FitnessCenterRoundedIcon,
    color: '#00695C',
    bg: '#E0F2F1',
    available: false,
    count: 0,
  },
  {
    id: 'wound',
    name: 'Wound & Skin',
    apta: 'Wound Management',
    description: 'Wound care, scar management, and skin rehabilitation',
    icon: ContentCutRoundedIcon,
    color: '#4E342E',
    bg: '#EFEBE9',
    available: false,
    count: 0,
  },
  {
    id: 'hand',
    name: 'Hand & Upper Limb',
    apta: 'Hands',
    description: 'Fine motor rehabilitation, hand therapy, and upper extremity',
    icon: AccessibilityNewRoundedIcon,
    color: '#37474F',
    bg: '#ECEFF1',
    available: false,
    count: 0,
  },
  {
    id: 'electrophysiology',
    name: 'Electrophysiology',
    apta: 'Clinical Electrophysiology',
    description: 'Pain science, neuromodulation, and electrophysiology',
    icon: BoltRoundedIcon,
    color: '#880E4F',
    bg: '#FCE4EC',
    available: false,
    count: 0,
  },
];

// ── Search aliases ────────────────────────────────────────────────────────────

const SEARCH_ALIASES: Record<string, string> = {
  sui: 'Stress Urinary Incontinence',
  uui: 'Urge Urinary Incontinence',
  oab: 'Overactive Bladder',
  'ic-bps': 'Bladder Pain Syndrome',
  ic: 'Bladder Pain',
  pop: 'Pelvic Organ Prolapse',
  dra: 'Diastasis Recti',
  pgp: 'Pelvic Girdle Pain',
  pfmt: 'Pelvic Floor Muscle Training',
};

// ── Condition browse groups ───────────────────────────────────────────────────

const CONDITION_GROUPS = [
  {
    group: 'Urinary Incontinence',
    color: '#E3F2FD', textColor: '#0277BD',
    conditions: [
      { name: 'Stress Urinary Incontinence', abbr: 'SUI', searchTerm: 'Stress Urinary Incontinence' },
      { name: 'Urge Urinary Incontinence', abbr: 'UUI', searchTerm: 'Urge Urinary Incontinence' },
      { name: 'Mixed Urinary Incontinence', abbr: null, searchTerm: 'Mixed Urinary Incontinence' },
      { name: 'Overactive Bladder', abbr: 'OAB', searchTerm: 'Overactive Bladder' },
    ],
  },
  {
    group: 'Pelvic Pain',
    color: '#FFF3E0', textColor: '#E65100',
    conditions: [
      { name: 'Dyspareunia', abbr: null, searchTerm: 'Dyspareunia' },
      { name: 'Vaginismus', abbr: null, searchTerm: 'Vaginismus' },
      { name: 'Vulvodynia', abbr: null, searchTerm: 'Vulvodynia' },
      { name: 'Vestibulodynia', abbr: null, searchTerm: 'Vestibulodynia' },
      { name: 'Pudendal Neuralgia', abbr: null, searchTerm: 'Pudendal Neuralgia' },
      { name: 'Coccydynia', abbr: null, searchTerm: 'Coccydynia' },
    ],
  },
  {
    group: 'Prolapse',
    color: '#F3E5F5', textColor: '#7B1FA2',
    conditions: [
      { name: 'Pelvic Organ Prolapse', abbr: 'POP', searchTerm: 'Pelvic Organ Prolapse' },
      { name: 'Cystocele', abbr: null, searchTerm: 'Cystocele' },
      { name: 'Rectocele', abbr: null, searchTerm: 'Rectocele' },
    ],
  },
  {
    group: 'Bladder',
    color: '#E8F5E9', textColor: '#2E7D32',
    conditions: [
      { name: 'Bladder Pain Syndrome / IC', abbr: 'IC-BPS', searchTerm: 'Bladder Pain Syndrome' },
      { name: 'Bladder Retraining', abbr: null, searchTerm: 'Overactive Bladder' },
    ],
  },
  {
    group: 'Bowel',
    color: '#FFF8E1', textColor: '#F57F17',
    conditions: [
      { name: 'Constipation', abbr: null, searchTerm: 'Constipation' },
      { name: 'Fecal Incontinence', abbr: null, searchTerm: 'Fecal Incontinence' },
      { name: 'Dyssynergic Defecation', abbr: null, searchTerm: 'Dyssynergic Defecation' },
    ],
  },
  {
    group: 'Postpartum & Pregnancy',
    color: '#FCE4EC', textColor: '#C62828',
    conditions: [
      { name: 'Postpartum Recovery', abbr: null, searchTerm: 'Postpartum' },
      { name: 'Pregnancy', abbr: null, searchTerm: 'Pregnancy' },
      { name: 'Diastasis Recti', abbr: 'DRA', searchTerm: 'Diastasis Recti' },
      { name: 'C-Section Recovery', abbr: null, searchTerm: 'C-Section' },
    ],
  },
  {
    group: 'Musculoskeletal',
    color: '#E8EAF6', textColor: '#283593',
    conditions: [
      { name: 'Low Back Pain', abbr: null, searchTerm: 'Low Back Pain' },
      { name: 'Pelvic Girdle Pain', abbr: 'PGP', searchTerm: 'Pelvic Girdle Pain' },
      { name: 'Sacroiliac Joint Dysfunction', abbr: null, searchTerm: 'Sacroiliac' },
    ],
  },
];

// ── Filter options ────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  'Pelvic Floor Muscle Training', 'Core / Transversus', 'Glute / Hip Strength',
  'Hip & Pelvic Mobility', 'Functional / Lower Extremity', 'Bowel & Anorectal',
  'Scar Tissue & Post-Surgical', 'Thoracic & Upper Extremity', 'Balance & Return to Sport',
  'Pelvic Pain & Hypertonic', 'Bladder Retraining', 'Functional Movement & ADLs',
];
const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

function expandSearch(q: string) {
  return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q;
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────

function ComingSoonState({ specialty }: { specialty: typeof SPECIALTIES[0] }) {
  const Icon = specialty.icon;
  const placeholders = Array.from({ length: 6 });
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, mb: 4, borderRadius: 2, border: '2px dashed', borderColor: 'divider', bgcolor: specialty.bg + '55' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: specialty.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Icon sx={{ fontSize: 28, color: specialty.color }} />
        </Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>{specialty.name}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ maxWidth: 380, textAlign: 'center' }}>
          {specialty.description}
        </Typography>
        <Chip
          label="Coming Soon"
          size="small"
          sx={{ bgcolor: specialty.bg, color: specialty.color, fontWeight: 600, fontSize: 12 }}
        />
        <Typography variant="caption" color="text.secondary" mt={1.5}>
          APTA Specialty: {specialty.apta}
        </Typography>
      </Box>

      {/* Blurred placeholder cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, opacity: 0.35, pointerEvents: 'none', filter: 'blur(1px)' }}>
        {placeholders.map((_, i) => (
          <Card key={i}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: 1.5, bgcolor: specialty.bg }} />
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ height: 14, borderRadius: 1, bgcolor: 'grey.300', width: `${40 + (i * 13) % 40}%` }} />
                <Box sx={{ height: 10, borderRadius: 1, bgcolor: 'grey.200', width: `${25 + (i * 7) % 30}%` }} />
              </Box>
              <Box sx={{ width: 60, height: 20, borderRadius: 1, bgcolor: 'grey.200' }} />
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState('pelvic-health');
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

  const specialty = SPECIALTIES.find((s) => s.id === selectedSpecialty)!;

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
  const hasActiveFilters = filterCategories.length + filterLevels.length + filterEquipment.length > 0 || !!activeConditionSearch || !!search;

  const filtered = useMemo(() => {
    if (!specialty.available) return [];
    let exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (activeConditionSearch) {
        const term = activeConditionSearch.toLowerCase();
        if (!ex.tags.condition.some((c) => c.toLowerCase().includes(term))) return false;
      }
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
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
  }, [specialty, effectiveSearch, sortBy, filterCategories, filterLevels, filterEquipment, activeConditionSearch, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises' }]} />
      <Box sx={{ px: 4, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Exercises</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/exercises/new')} disableElevation>
            Create New
          </Button>
        </Box>

        {/* Specialty rail */}
        <Box
          sx={{
            display: 'flex', gap: 1.5, mb: 3, pb: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#E0E0E0', borderRadius: 2 },
          }}
        >
          {SPECIALTIES.map((sp) => {
            const Icon = sp.icon;
            const active = selectedSpecialty === sp.id;
            return (
              <Box
                key={sp.id}
                onClick={() => { setSelectedSpecialty(sp.id); clearAll(); }}
                sx={{
                  flexShrink: 0, width: 130, cursor: 'pointer',
                  border: '1px solid', borderRadius: 2, p: 1.5,
                  borderColor: active ? sp.color : 'divider',
                  bgcolor: active ? sp.bg : 'background.paper',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: sp.color, bgcolor: sp.bg + '88' },
                  display: 'flex', flexDirection: 'column', gap: 0.75,
                }}
              >
                <Icon sx={{ fontSize: 20, color: active ? sp.color : 'text.secondary' }} />
                <Typography variant="caption" fontWeight={active ? 600 : 400} sx={{ color: active ? sp.color : 'text.primary', lineHeight: 1.2 }}>
                  {sp.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
                  {sp.available ? `${sp.count} exercises` : 'Coming soon'}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Coming soon state */}
        {!specialty.available && <ComingSoonState specialty={specialty} />}

        {/* Pelvic Health content */}
        {specialty.available && (
          <>
            {/* View mode toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <ToggleButtonGroup
                value={viewMode} exclusive
                onChange={(_, v) => { if (v) setViewMode(v); }}
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 13, px: 1.5, py: 0.5 } }}
              >
                <ToggleButton value="filter"><ListRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />Filter</ToggleButton>
                <ToggleButton value="condition"><GridViewRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />Browse by Condition</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Condition browser */}
            {viewMode === 'condition' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={2.5}>Select a condition to see all matching exercises.</Typography>
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
                            {abbr && <Typography variant="caption" sx={{ color: textColor, opacity: 0.7, fontWeight: 600, fontSize: 10 }}>{abbr}</Typography>}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Filter row */}
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
              {hasActiveFilters && (
                <Button size="small" onClick={clearAll} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 13 }}>
                  Clear all
                </Button>
              )}
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 140, ml: 'auto' }}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </Box>

            {activeConditionSearch && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Showing exercises for:</Typography>
                <Chip label={activeConditionSearch} size="small" color="primary" onDelete={() => setActiveConditionSearch(null)} sx={{ fontSize: 12 }} />
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
          </>
        )}
      </Box>

      <ExercisePreviewDrawer exercise={previewExercise} open={!!previewExercise} onClose={() => setPreviewExercise(null)} />
    </>
  );
}
