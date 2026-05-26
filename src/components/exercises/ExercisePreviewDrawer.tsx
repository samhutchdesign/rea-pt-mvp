'use client';
import { useState, useEffect } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AudioRecordingDialog from './AudioRecordingDialog';
import { mockPrograms, mockPhysio } from '@/lib/mock-data';
import { getAudioTracks, saveAudioTrack } from '@/lib/audioStore';
import type { Exercise, Program, AudioTrack } from '@/lib/types';

const ME_ID = mockPhysio.id ?? 'p1';
const ME_NAME = `${mockPhysio.firstName} ${mockPhysio.lastName}`;

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onClose: () => void;
  onAddToCurrentProgram?: () => void;
}

export default function ExercisePreviewDrawer({ exercise, open, onClose, onAddToCurrentProgram }: Props) {
  const [programSelectorOpen, setProgramSelectorOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);

  // Reload tracks whenever the exercise changes
  useEffect(() => {
    if (exercise) setTracks(getAudioTracks(exercise.id));
  }, [exercise]);

  if (!exercise) return null;

  const myTrack = tracks.find((t) => t.ownerId === ME_ID) ?? null;

  const allTags = [
    ...exercise.tags.specialty,
    ...exercise.tags.condition,
    ...exercise.tags.surgery,
    ...exercise.tags.muscle,
    ...exercise.tags.bodyPart,
  ];

  const handleAddToProgram = () => {
    setProgramSelectorOpen(false);
    setSelectedProgram(null);
  };

  const handleSaveAudio = (blobUrl: string, durationSecs: number) => {
    const track: AudioTrack = {
      id: `track-${Date.now()}`,
      ownerId: ME_ID,
      ownerName: ME_NAME,
      durationSecs,
      createdAt: new Date().toISOString().slice(0, 10),
      blobUrl,
    };
    saveAudioTrack(exercise.id, track);
    setTracks(getAudioTracks(exercise.id));
    setRecordingOpen(false);
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

          <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
            <Chip label={`${exercise.defaultSets} Sets`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
            <Chip label={`${exercise.defaultReps} Reps`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
            {exercise.defaultHoldSecs > 0 && <Chip label={`${exercise.defaultHoldSecs}s Hold`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />}
            <Chip label={exercise.defaultFrequency} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
          </Box>

          {/* Audio overlay compact section */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, border: '1px solid #E0E0E0', borderRadius: 1, mb: 2.5,
            bgcolor: myTrack ? '#F8FFF8' : '#FAFAFA',
          }}>
            {myTrack
              ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#2E7D32', flexShrink: 0 }} />
              : <VolumeOffRoundedIcon sx={{ fontSize: 18, color: '#BDBDBD', flexShrink: 0 }} />
            }
            <Box sx={{ flexGrow: 1 }}>
              {myTrack ? (
                <>
                  <Typography variant="body2" fontWeight={500} color="#2E7D32">Audio overlay recorded</Typography>
                  <Typography variant="caption" color="text.secondary">{ME_NAME} · {fmt(myTrack.durationSecs)}</Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" fontWeight={500}>No audio overlay</Typography>
                  <Typography variant="caption" color="text.secondary">Record your voice-over for this exercise</Typography>
                </>
              )}
            </Box>
            <Tooltip title={myTrack ? 'Re-record audio overlay' : 'Record audio overlay'}>
              <Button
                size="small"
                variant={myTrack ? 'outlined' : 'contained'}
                startIcon={<MicIcon />}
                disableElevation
                onClick={() => setRecordingOpen(true)}
                sx={myTrack ? {} : { bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' }, color: '#fff' }}
              >
                {myTrack ? 'Re-record' : 'Record'}
              </Button>
            </Tooltip>
          </Box>

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

      {/* Audio Recording Dialog */}
      <AudioRecordingDialog
        open={recordingOpen}
        exerciseName={exercise.name}
        videoId={exercise.videoUrl}
        onClose={() => setRecordingOpen(false)}
        onSave={handleSaveAudio}
      />
    </>
  );
}
