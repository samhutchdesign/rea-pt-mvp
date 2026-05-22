'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TopBar from '@/components/layout/TopBar';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { mockExercises } from '@/lib/mock-data';

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const ex = mockExercises.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);

  if (!ex) return <Box sx={{ p: 4 }}><Typography>Exercise not found.</Typography></Box>;

  const allTags = [...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 800 }}>
        {/* Video */}
        <Box sx={{ width: '100%', height: 300, borderRadius: 2, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <FitnessCenterRoundedIcon sx={{ fontSize: 64, color: '#6750A4', opacity: 0.4, mb: 2 }} />
            <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} disableElevation>Play Video</Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={0.5}>{ex.name}</Typography>
            <Typography variant="body1" color="text.secondary">{ex.description}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setIsFavorite(!isFavorite)}>
              {isFavorite ? <FavoriteIcon sx={{ color: '#E91E63' }} /> : <FavoriteBorderIcon />}
            </IconButton>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          <Chip label={`${ex.defaultSets} Sets`} sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600 }} />
          <Chip label={`${ex.defaultReps} Reps`} sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600 }} />
          {ex.defaultHoldSecs > 0 && <Chip label={`${ex.defaultHoldSecs}s Hold`} sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600 }} />}
          <Chip label={ex.defaultFrequency} sx={{ bgcolor: '#E8E0F0', color: 'primary.main', fontWeight: 600 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 3 }}>
          {allTags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 12 }} />)}
        </Box>

        {/* Audio */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }}><VolumeUpRoundedIcon /></IconButton>
              <Box>
                <Typography variant="body2" fontWeight={600}>Audio Cue</Typography>
                <Typography variant="caption" color="text.secondary">Click play to hear the audio instruction</Typography>
              </Box>
              <Button sx={{ ml: 'auto' }}>Play</Button>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight={600} mb={2}>Instructions</Typography>
        <Box component="ol" sx={{ pl: 3, mb: 3 }}>
          {ex.instructions.map((step, i) => (
            <Box component="li" key={i} sx={{ mb: 1 }}>
              <Typography variant="body1">{step}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight={600} mb={2} color="warning.main">Common Mistakes</Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          {ex.commonMistakes.map((m, i) => (
            <Box component="li" key={i} sx={{ mb: 1 }}>
              <Typography variant="body1">{m}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
