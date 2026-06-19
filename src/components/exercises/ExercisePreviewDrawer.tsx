'use client';
import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { mockPrograms } from '@/lib/mock-data';
import type { Exercise, Program } from '@/lib/types';

interface PatientPrescription {
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
}

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToCurrentProgram?: () => void;
  patientPrescription?: PatientPrescription;
}

export default function ExercisePreviewDrawer({ exercise, open, onClose, onAddToCurrentProgram, patientPrescription }: Props) {
  const [programSelectorOpen, setProgramSelectorOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  if (!exercise) return null;

  const allTags = [...new Set([
    ...exercise.tags.specialty,
    ...exercise.tags.condition,
    ...exercise.tags.surgery,
    ...exercise.tags.muscle,
    ...exercise.tags.bodyPart,
  ])];

  const handleAddToProgram = () => {
    setProgramSelectorOpen(false);
    setSelectedProgram(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 480, p: 0, display: 'flex', flexDirection: 'column' } }}
      >
        {/* Video Area */}
        <Box sx={{ width: '100%', height: 240, bgcolor: exercise.videoUrl ? '#0f0f0f' : '#F0EDF6', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {exercise.videoUrl ? (
            <iframe
              src={`https://www.youtube.com/embed/${exercise.videoUrl}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FitnessCenterRoundedIcon sx={{ fontSize: 52, color: '#6750A4', opacity: 0.5 }} />
            </Box>
          )}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={0.5}>{exercise.name}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>{exercise.description}</Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
            {allTags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
          </Box>

          {patientPrescription ? (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                Patient Prescription
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={`${patientPrescription.sets} Sets`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
                <Chip label={`${patientPrescription.reps} Reps`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
                {patientPrescription.holdSecs > 0 && <Chip label={`${patientPrescription.holdSecs}s Hold`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />}
                <Chip label={patientPrescription.frequency} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
              <Chip label={`${exercise.defaultSets} Sets`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
              <Chip label={`${exercise.defaultReps} Reps`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
              {exercise.defaultHoldSecs > 0 && <Chip label={`${exercise.defaultHoldSecs}s Hold`} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />}
              <Chip label={exercise.defaultFrequency} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main' }} />
            </Box>
          )}

          <Divider sx={{ mb: 2.5 }} />

          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Instructions</Typography>
          <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 2.5 }}>
            {exercise.instructions.map((step, i) => (
              <Box component="li" key={i} sx={{ mb: 0.75 }}>
                <Typography variant="body2">{step}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="warning.main">Common Mistakes</Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 1 }}>
            {exercise.commonMistakes.map((m, i) => (
              <Box component="li" key={i} sx={{ mb: 0.75 }}>
                <Typography variant="body2">{m}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Action bar */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #E0E0E0', display: 'flex', gap: 1.5, flexShrink: 0 }}>
          {onAddToCurrentProgram && (
            <Button variant="contained" disableElevation onClick={() => { onAddToCurrentProgram(); onClose(); }} sx={{ flex: 1 }}>
              Add to This Program
            </Button>
          )}
          <Button
            variant={onAddToCurrentProgram ? 'outlined' : 'contained'}
            disableElevation
            startIcon={<PlaylistAddIcon />}
            onClick={() => setProgramSelectorOpen(true)}
            sx={{ flex: 1 }}
          >
            Add to a Program
          </Button>
        </Box>
      </Drawer>

      {/* Program Selector Dialog */}
      <Dialog open={programSelectorOpen} onClose={() => setProgramSelectorOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add to a Program</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select a program to add <strong>{exercise.name}</strong> to.
          </Typography>
          <Autocomplete
            options={mockPrograms}
            getOptionLabel={(p) => p.name}
            value={selectedProgram}
            onChange={(_, val) => setSelectedProgram(val)}
            renderInput={(params) => <TextField {...params} label="Search programs" size="small" autoFocus />}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProgramSelectorOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation disabled={!selectedProgram} onClick={handleAddToProgram}>
            Add to Program
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
