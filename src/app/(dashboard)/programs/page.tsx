'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TopBar from '@/components/layout/TopBar';
import { mockPrograms } from '@/lib/mock-data';

export default function ProgramsPage() {
  const router = useRouter();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockPrograms.filter((p) => p.isFavorite).map((p) => p.id)));

  const toggleFavorite = (id: string) => setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const filtered = showFavoritesOnly ? mockPrograms.filter((p) => favorites.has(p.id)) : mockPrograms;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs' }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Programs</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/programs/new')} disableElevation>Create New Program</Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip
            label="Favorites" size="small"
            variant={showFavoritesOnly ? 'filled' : 'outlined'}
            color={showFavoritesOnly ? 'primary' : 'default'}
            icon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((prog) => (
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
