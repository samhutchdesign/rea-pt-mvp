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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ElderlyRoundedIcon from '@mui/icons-material/ElderlyRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
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
    color: '#6750A4', bg: '#EDE7F6',
    available: true, count: 50,
  },
  {
    id: 'orthopaedics',
    name: 'Orthopaedics',
    apta: 'Orthopaedics',
    description: 'Spine, hip, knee, shoulder, and extremity rehabilitation',
    icon: AccessibilityNewRoundedIcon,
    color: '#0277BD', bg: '#E1F5FE',
    available: false, count: 0,
  },
  {
    id: 'sports',
    name: 'Sports & Performance',
    apta: 'Sports',
    description: 'Return to sport, athletic performance, and injury prevention',
    icon: SportsRoundedIcon,
    color: '#2E7D32', bg: '#E8F5E9',
    available: false, count: 0,
  },
  {
    id: 'neurology',
    name: 'Neurological Rehab',
    apta: 'Neurology',
    description: "Stroke, MS, Parkinson's, and spinal cord conditions",
    icon: PsychologyRoundedIcon,
    color: '#E65100', bg: '#FFF3E0',
    available: false, count: 0,
  },
  {
    id: 'cardio',
    name: 'Cardio & Respiratory',
    apta: 'Cardiovascular & Pulmonary',
    description: 'Cardiac rehabilitation and pulmonary physiotherapy',
    icon: FavoriteBorderRoundedIcon,
    color: '#C62828', bg: '#FFEBEE',
    available: false, count: 0,
  },
  {
    id: 'oncology',
    name: 'Cancer Care',
    apta: 'Oncology',
    description: 'Lymphoedema, post-mastectomy, and cancer-related fatigue',
    icon: HealingRoundedIcon,
    color: '#6A1B9A', bg: '#F3E5F5',
    available: false, count: 0,
  },
  {
    id: 'geriatrics',
    name: 'Ageing & Geriatrics',
    apta: 'Geriatrics',
    description: 'Falls prevention, balance, mobility, and frailty',
    icon: ElderlyRoundedIcon,
    color: '#1565C0', bg: '#E8EAF6',
    available: false, count: 0,
  },
  {
    id: 'paediatrics',
    name: 'Paediatrics',
    apta: 'Pediatrics',
    description: "Children's physiotherapy and developmental conditions",
    icon: ChildCareRoundedIcon,
    color: '#F57F17', bg: '#FFF8E1',
    available: false, count: 0,
  },
  {
    id: 'vestibular',
    name: 'Vestibular & Balance',
    apta: 'Vestibular',
    description: 'BPPV, vertigo, and vestibular rehabilitation',
    icon: FitnessCenterRoundedIcon,
    color: '#00695C', bg: '#E0F2F1',
    available: false, count: 0,
  },
  {
    id: 'wound',
    name: 'Wound & Skin',
    apta: 'Wound Management',
    description: 'Wound care, scar management, and skin rehabilitation',
    icon: ContentCutRoundedIcon,
    color: '#4E342E', bg: '#EFEBE9',
    available: false, count: 0,
  },
  {
    id: 'hand',
    name: 'Hand & Upper Limb',
    apta: 'Hands',
    description: 'Fine motor rehabilitation, hand therapy, and upper extremity',
    icon: AccessibilityNewRoundedIcon,
    color: '#37474F', bg: '#ECEFF1',
    available: false, count: 0,
  },
  {
    id: 'electrophysiology',
    name: 'Electrophysiology',
    apta: 'Clinical Electrophysiology',
    description: 'Pain science, neuromodulation, and electrophysiology',
    icon: BoltRoundedIcon,
    color: '#880E4F', bg: '#FCE4EC',
    available: false, count: 0,
  },
];

// ── Per-specialty filter config ───────────────────────────────────────────────
// When more specialties get exercises, add their filter sets here.

type SpecialtyFilters = {
  conditionLabel: string;
  conditions: string[];
  categories: string[];
};

const SPECIALTY_FILTER_CONFIG: Record<string, SpecialtyFilters> = {
  'pelvic-health': {
    conditionLabel: 'Condition',
    conditions: [
      'Urinary Incontinence', 'Urge Urinary Incontinence', 'Mixed Urinary Incontinence',
      'Overactive Bladder', 'Bladder Pain Syndrome',
      'Dyspareunia', 'Vaginismus', 'Vulvodynia', 'Vestibulodynia', 'Pudendal Neuralgia', 'Coccydynia',
      'Pelvic Organ Prolapse', 'Cystocele', 'Rectocele',
      'Constipation', 'Fecal Incontinence', 'Dyssynergic Defecation',
      'Postpartum Recovery', 'Pregnancy', 'Diastasis Recti', 'C-Section Recovery',
      'Low Back Pain', 'Pelvic Girdle Pain',
    ],
    categories: [
      'Pelvic Floor Muscle Training', 'Core / Transversus', 'Glute / Hip Strength',
      'Hip & Pelvic Mobility', 'Functional / Lower Extremity', 'Bowel & Anorectal',
      'Scar Tissue & Post-Surgical', 'Pelvic Pain & Hypertonic', 'Bladder Retraining',
    ],
  },
};

// Search abbreviation aliases
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

const ALL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_EQUIPMENT = ['None', 'Ball', 'Elastic Band', 'Weights', 'Wall', 'Footstool', 'Chair / Wall'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Used', 'Newest Added'];

function expandSearch(q: string) {
  return SEARCH_ALIASES[q.toLowerCase().trim()] ?? q;
}

// ── Specialty landing grid ────────────────────────────────────────────────────

function SpecialtyGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Select a specialty to browse exercises.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {SPECIALTIES.map((sp) => {
          const Icon = sp.icon;
          return (
            <Box
              key={sp.id}
              onClick={() => onSelect(sp.id)}
              sx={{
                border: '1px solid',
                borderColor: sp.available ? sp.color + '44' : 'divider',
                borderRadius: 2,
                p: 2.5,
                cursor: 'pointer',
                bgcolor: 'background.paper',
                transition: 'all 0.15s',
                '&:hover': {
                  borderColor: sp.color,
                  bgcolor: sp.bg + 'aa',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ fontSize: 22, color: sp.color }} />
                </Box>
                {sp.available ? (
                  <Chip label={`${sp.count} exercises`} size="small" sx={{ fontSize: 11, bgcolor: sp.bg, color: sp.color, fontWeight: 600 }} />
                ) : (
                  <Chip label="Coming soon" size="small" sx={{ fontSize: 11, color: 'text.disabled', bgcolor: 'action.hover' }} />
                )}
              </Box>
              <Typography variant="body2" fontWeight={600} mb={0.5}>{sp.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                {sp.description}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Coming soon placeholder ───────────────────────────────────────────────────

function ComingSoonState({ sp }: { sp: typeof SPECIALTIES[0] }) {
  const Icon = sp.icon;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, borderRadius: 2, border: '2px dashed', borderColor: 'divider', bgcolor: sp.bg + '44' }}>
      <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: sp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Icon sx={{ fontSize: 30, color: sp.color }} />
      </Box>
      <Typography variant="h6" fontWeight={600} mb={0.5}>{sp.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, textAlign: 'center', mb: 2 }}>
        {sp.description}
      </Typography>
      <Chip label="Coming Soon" size="small" sx={{ bgcolor: sp.bg, color: sp.color, fontWeight: 600, mb: 1 }} />
      <Typography variant="caption" color="text.disabled">APTA: {sp.apta}</Typography>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterLevels, setFilterLevels] = useState<string[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockExercises.filter((e) => e.isFavorite).map((e) => e.id)));
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  const specialty = SPECIALTIES.find((s) => s.id === selectedId) ?? null;
  const filterConfig = selectedId ? SPECIALTY_FILTER_CONFIG[selectedId] : null;

  const toggleFavorite = (exId: string) => setFavorites((prev) => { const next = new Set(prev); next.has(exId) ? next.delete(exId) : next.add(exId); return next; });

  const goBack = () => {
    setSelectedId(null);
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const selectSpecialty = (id: string) => {
    setSelectedId(id);
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterConditions([]);
    setFilterCategories([]);
    setFilterLevels([]);
    setFilterEquipment([]);
    setShowFavoritesOnly(false);
  };

  const effectiveSearch = expandSearch(search);
  const hasFilters = !!search || filterConditions.length > 0 || filterCategories.length > 0 || filterLevels.length > 0 || filterEquipment.length > 0 || showFavoritesOnly;

  const filtered = useMemo(() => {
    if (!specialty?.available) return [];
    let exs = mockExercises.filter((ex) => {
      if (showFavoritesOnly && !favorites.has(ex.id)) return false;
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];
        if (!ex.name.toLowerCase().includes(q) && !ex.category.toLowerCase().includes(q) && !allTags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterConditions.length && !filterConditions.some((c) => ex.tags.condition.some((ec) => ec.toLowerCase().includes(c.toLowerCase())))) return false;
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
  }, [specialty, effectiveSearch, sortBy, filterConditions, filterCategories, filterLevels, filterEquipment, showFavoritesOnly, favorites]);

  const breadcrumbs = specialty
    ? [{ label: 'All Exercises' }, { label: specialty.name }]
    : [{ label: 'All Exercises' }];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <Box sx={{ px: 4, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {specialty && (
              <IconButton size="small" onClick={goBack} sx={{ color: 'text.secondary' }}>
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {specialty ? specialty.name : 'Exercises'}
              </Typography>
              {specialty && (
                <Typography variant="caption" color="text.secondary">{specialty.apta}</Typography>
              )}
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/exercises/new')} disableElevation>
            Create New
          </Button>
        </Box>

        {/* Landing: specialty grid */}
        {!specialty && <SpecialtyGrid onSelect={selectSpecialty} />}

        {/* Coming soon */}
        {specialty && !specialty.available && <ComingSoonState sp={specialty} />}

        {/* Exercise browser */}
        {specialty && specialty.available && (
          <>
            {/* Filter bar */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center', flexWrap: 'wrap', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField
                placeholder="Search exercises, SUI, OAB…" size="small" sx={{ width: 260 }}
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 18 }} /></InputAdornment> }}
              />
              <Chip
                label="Favourites" size="small"
                variant={showFavoritesOnly ? 'filled' : 'outlined'}
                color={showFavoritesOnly ? 'primary' : 'default'}
                icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => setShowFavoritesOnly((v) => !v)}
              />
              {filterConfig && (
                <FilterMenu
                  label={filterConfig.conditionLabel}
                  options={filterConfig.conditions}
                  selected={filterConditions}
                  onChange={setFilterConditions}
                />
              )}
              {filterConfig && (
                <FilterMenu
                  label="Category"
                  options={filterConfig.categories}
                  selected={filterCategories}
                  onChange={setFilterCategories}
                />
              )}
              <FilterMenu label="Level" options={ALL_LEVELS} selected={filterLevels} onChange={setFilterLevels} />
              <FilterMenu label="Equipment" options={ALL_EQUIPMENT} selected={filterEquipment} onChange={setFilterEquipment} />
              {hasFilters && (
                <Button size="small" onClick={clearFilters} sx={{ color: 'text.secondary', textTransform: 'none', fontSize: 13 }}>
                  Clear all
                </Button>
              )}
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 130, ml: 'auto' }}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
              </Select>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {filtered.length} of {mockExercises.length} exercises
            </Typography>

            {/* Exercise list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="text.secondary" mb={1}>No exercises match your filters.</Typography>
                  <Button size="small" onClick={clearFilters}>Clear filters</Button>
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
                        {ex.equipment !== 'None' && (
                          <Chip label={ex.equipment} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => setPreviewExercise(ex)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={favorites.has(ex.id) ? 'Unfavourite' : 'Favourite'}>
                        <IconButton size="small" onClick={() => toggleFavorite(ex.id)}>
                          {favorites.has(ex.id)
                            ? <FavoriteIcon fontSize="small" sx={{ color: '#E91E63' }} />
                            : <FavoriteBorderIcon fontSize="small" />}
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
