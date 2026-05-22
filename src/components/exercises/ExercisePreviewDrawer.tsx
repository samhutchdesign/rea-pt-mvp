'use client';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import type { Exercise } from '@/lib/types';

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
}

export default function ExercisePreviewDrawer({ exercise, open, onClose }: Props) {
  if (!exercise) return null;

  const allTags = [
    ...exercise.tags.specialty,
    ...exercise.tags.condition,
    ...exercise.tags.surgery,
    ...exercise.tags.muscle,
    ...exercise.tags.bodyPart,
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480, p: 0 } }}
    >
      {/* Video Area */}
      <Box sx={{ width: '100%', height: 240, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        <Box sx={{ textAlign: 'center' }}>
          <FitnessCenterRoundedIcon sx={{ fontSize: 52, color: '#6750A4', opacity: 0.5, mb: 1 }} />
          <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} disableElevation sx={{ bgcolor: 'rgba(103,80,164,0.9)' }}>
            Play Video
          </Button>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>{exercise.name}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>{exercise.description}</Typography>

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
          {allTags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
        </Box>

        {/* Default params */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
          <Chip label={`${exercise.defaultSets} Sets`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
          <Chip label={`${exercise.defaultReps} Reps`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
          {exercise.defaultHoldSecs > 0 && <Chip label={`${exercise.defaultHoldSecs}s Hold`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />}
          <Chip label={exercise.defaultFrequency} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
        </Box>

        {/* Audio */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, border: '1px solid #E0E0E0', borderRadius: 1, mb: 2.5 }}>
          <IconButton size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }}>
            <VolumeUpRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">Audio cue</Typography>
          <Button size="small" sx={{ ml: 'auto' }}>Play</Button>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Instructions */}
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Instructions</Typography>
        <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 2.5 }}>
          {exercise.instructions.map((step, i) => (
            <Box component="li" key={i} sx={{ mb: 0.75 }}>
              <Typography variant="body2">{step}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Common Mistakes */}
        <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="warning.main">Common Mistakes</Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 3 }}>
          {exercise.commonMistakes.map((m, i) => (
            <Box component="li" key={i} sx={{ mb: 0.75 }}>
              <Typography variant="body2">{m}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}
