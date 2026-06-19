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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TopBar from '@/components/layout/TopBar';
import FilterMenu from '@/components/exercises/FilterMenu';
import { mockPrograms } from '@/lib/mock-data';

const ALL_TAGS = ['Pelvic Floor', 'Postpartum', 'Incontinence', 'Pelvic Pain', 'Beginner', 'Intermediate', 'Relaxation'];
const SORT_OPTIONS = ['A → Z', 'Z → A', 'Most Exercises', 'Newest Added'];

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A → Z');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const filtered = useMemo(() => {
    let progs = mockPrograms.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (filterTags.length && !filterTags.some((t) => p.tags.includes(t))) return false;
      return true;
    });
    progs = progs.sort((a, b) => {
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z → A') return b.name.localeCompare(a.name);
      if (sortBy === 'Most Exercises') return b.exercises.length - a.exercises.length;
      if (sortBy === 'Newest Added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    return progs;
  }, [search, sortBy, filterTags, showFavoritesOnly, favorites]);

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <Box sx={{ px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Programs</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/programs/new')} disableElevation>Create New Program</Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search programs…" size="small" sx={{ width: 280 }}
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
          <FilterMenu label="Tag" options={ALL_TAGS} selected={filterTags} onChange={setFilterTags} />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" sx={{ fontSize: 13, minWidth: 150, ml: 'auto' }}>
            {SORT_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No programs match your filters.</Typography>
          ) : filtered.map((prog) => (
            <Card
              key={prog.id}
              sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.15s' }}
              onClick={() => router.push(`/programs/${prog.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FitnessCenterRoundedIcon sx={{ color: '#6750A4', fontSize: 22 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={600}>{prog.name}</Typography>
                    {favorites.has(prog.id) && <FavoriteIcon sx={{ fontSize: 14, color: '#E91E63' }} />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={0.75}>{prog.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {prog.tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
                  </Box>
                </Box>
                <Chip label={`${prog.exercises.length} exercises`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 500 }} />
                <Tooltip title={favorites.has(prog.id) ? 'Unfavorite' : 'Favorite'}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleFavorite(prog.id); }}>
                    {favorites.has(prog.id) ? <FavoriteIcon fontSize="small" sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
}
