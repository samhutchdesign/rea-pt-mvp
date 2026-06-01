'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import AudioRecordingDialog from './AudioRecordingDialog';
import { mockPrograms, mockPhysio } from '@/lib/mock-data';
import { getAudioTracks, saveAudioTrack } from '@/lib/audioStore';
import type { Exercise, Program, AudioTrack } from '@/lib/types';

const ME_ID = mockPhysio.id ?? 'p1';
const ME_NAME = `${mockPhysio.firstName} ${mockPhysio.lastName}`;

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

interface PatientPrescription {
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
  adherence: number;
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
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [listenId, setListenId] = useState('');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ytCmd = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }), '*'
    );
  }, []);

  // Reload tracks whenever the exercise changes
  useEffect(() => {
    if (exercise) {
      const t = getAudioTracks(exercise.id);
      setTracks(t);
      setListenId(t[0]?.id ?? '');
      setPlaying(false);
      audioRef.current?.pause();
      ytCmd('pauseVideo');
    }
  }, [exercise, ytCmd]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setPlaying(false);
      ytCmd('pauseVideo');
      ytCmd('unMute');
    };
    return () => audioRef.current?.pause();
  }, [ytCmd]);

  const resolvedListenId = tracks.find((t) => t.id === listenId) ? listenId : (tracks[0]?.id ?? '');
  const selectedTrack = tracks.find((t) => t.id === resolvedListenId) ?? null;

  const togglePlay = useCallback(() => {
    if (!selectedTrack?.blobUrl) return;
    if (playing) {
      audioRef.current?.pause();
      ytCmd('pauseVideo');
      setPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = selectedTrack.blobUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      ytCmd('seekTo', [0, true]);
      ytCmd('mute');
      ytCmd('playVideo');
      setPlaying(true);
    }
  }, [playing, selectedTrack, ytCmd]);

  if (!exercise) return null;

  const myTrack = tracks.find((t) => t.ownerId === ME_ID) ?? null;

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
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${exercise.videoUrl}?enablejsapi=1&rel=0&modestbranding=1`}
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
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#F8F5FF', border: '1px solid #D4C5F9', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                Patient Prescription
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={`${patientPrescription.sets} Sets`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
                <Chip label={`${patientPrescription.reps} Reps`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
                {patientPrescription.holdSecs > 0 && <Chip label={`${patientPrescription.holdSecs}s Hold`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />}
                <Chip label={patientPrescription.frequency} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Adherence: <strong>{patientPrescription.adherence}%</strong>
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
              <Chip label={`${exercise.defaultSets} Sets`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
              <Chip label={`${exercise.defaultReps} Reps`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
              {exercise.defaultHoldSecs > 0 && <Chip label={`${exercise.defaultHoldSecs}s Hold`} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />}
              <Chip label={exercise.defaultFrequency} size="small" sx={{ bgcolor: '#E8E0F0', color: 'primary.main' }} />
            </Box>
          )}

          {/* Audio overlay compact section */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2.5,
            bgcolor: myTrack ? '#F8FFF8' : 'action.hover',
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

          {/* Recordings dropdown */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
              Recordings
            </Typography>
            {tracks.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select
                  size="small"
                  value={resolvedListenId}
                  onChange={(e) => { setListenId(e.target.value); setPlaying(false); audioRef.current?.pause(); }}
                  sx={{ flex: 1, fontSize: 13 }}
                >
                  {tracks.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.ownerName} · {fmt(t.durationSecs)}</MenuItem>
                  ))}
                </Select>
                <Tooltip title={selectedTrack?.blobUrl ? '' : 'Demo track — record in this session to enable playback'}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                      disabled={!selectedTrack?.blobUrl}
                      onClick={togglePlay}
                      disableElevation
                    >
                      {playing ? 'Pause' : 'Play'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No recordings yet.</Typography>
            )}
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
