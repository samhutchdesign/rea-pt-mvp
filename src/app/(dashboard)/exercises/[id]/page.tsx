'use client';
import { use, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TopBar from '@/components/layout/TopBar';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { mockExercises, mockPhysio } from '@/lib/mock-data';
import { getAudioTracks, saveAudioTrack, deleteAudioTrack } from '@/lib/audioStore';
import type { AudioTrack } from '@/lib/types';

const ME = { id: mockPhysio.id ?? 'p1', name: `${mockPhysio.firstName} ${mockPhysio.lastName}` };

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

// ─── Audio panel ──────────────────────────────────────────────────────────────
function AudioPanel({
  exerciseId,
  tracks,
  onAdd,
  onDelete,
}: {
  exerciseId: string;
  tracks: AudioTrack[];
  onAdd: () => void;
  onDelete: (ownerId: string) => void;
}) {
  const myTrack = tracks.find((t) => t.ownerId === ME.id) ?? null;

  const [myEnabled, setMyEnabled] = useState(true);
  const [fallbackOriginal, setFallbackOriginal] = useState(true);
  const [listenId, setListenId] = useState(tracks[0]?.id ?? '');
  const [playing, setPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If the currently selected track was removed or replaced (e.g. after re-record),
  // fall back to the first available track.
  const resolvedListenId = tracks.find((t) => t.id === listenId) ? listenId : (tracks[0]?.id ?? '');
  const selectedTrack = tracks.find((t) => t.id === resolvedListenId) ?? null;

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setPlaying(false);
    return () => audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (!selectedTrack?.blobUrl) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = selectedTrack.blobUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setPlaying(true);
    }
  }, [playing, selectedTrack]);

  const handleDelete = () => {
    setConfirmDelete(false);
    onDelete(ME.id);
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: myTrack && myEnabled ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {myTrack && myEnabled
                ? <VolumeUpRoundedIcon sx={{ fontSize: 18, color: '#2E7D32' }} />
                : <VolumeOffRoundedIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />}
            </Box>
            <Typography variant="body2" fontWeight={600}>Audio Overlay</Typography>
          </Box>

          {/* Your recording */}
          {myTrack ? (
            <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: myEnabled ? '#2E7D32' : '#BDBDBD', flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={500}>Your recording</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmt(myTrack.durationSecs)} · Recorded {new Date(myTrack.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {myTrack.blobUrl === null && ' · Demo'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={myEnabled} onChange={(e) => setMyEnabled(e.target.checked)} size="small" />}
                  label={<Typography variant="caption">{myEnabled ? 'On' : 'Off'}</Typography>}
                  sx={{ mr: 0 }}
                />
                <Tooltip title="Delete recording">
                  <IconButton size="small" onClick={() => setConfirmDelete(true)}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {!myEnabled && (
                <Box sx={{ mt: 1.5, pl: 3.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">When Off:</Typography>
                  <Chip
                    label="Original Video Audio"
                    size="small"
                    onClick={() => setFallbackOriginal(true)}
                    variant={fallbackOriginal ? 'filled' : 'outlined'}
                    sx={{ fontSize: 11, height: 22, cursor: 'pointer', bgcolor: fallbackOriginal ? '#E8E0F0' : undefined, color: fallbackOriginal ? 'primary.main' : undefined }}
                  />
                  <Chip
                    label="Muted"
                    size="small"
                    onClick={() => setFallbackOriginal(false)}
                    variant={!fallbackOriginal ? 'filled' : 'outlined'}
                    sx={{ fontSize: 11, height: 22, cursor: 'pointer', bgcolor: !fallbackOriginal ? '#E8E0F0' : undefined, color: !fallbackOriginal ? 'primary.main' : undefined }}
                  />
                </Box>
              )}

              <Box sx={{ mt: 1.5, pl: 3.5 }}>
                <Button size="small" startIcon={<MicIcon />} onClick={onAdd} sx={{ color: 'text.secondary', fontSize: 12 }}>
                  Re-record
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 1, border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {tracks.length > 0 ? "You haven't recorded a voice-over yet." : 'No audio recorded. Record your voice-over to guide patients through this exercise.'}
              </Typography>
              <Button variant="outlined" size="small" startIcon={<MicIcon />} onClick={onAdd} sx={{ flexShrink: 0 }}>
                Add New Audio
              </Button>
            </Box>
          )}

          {/* Listen dropdown — all tracks */}
          {tracks.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Recordings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                <Select
                  size="small"
                  value={resolvedListenId}
                  onChange={(e) => { setListenId(e.target.value); setPlaying(false); audioRef.current?.pause(); }}
                  sx={{ flex: 1, fontSize: 13 }}
                >
                  {tracks.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.ownerName} · {fmt(t.durationSecs)}
                    </MenuItem>
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
                    >
                      {playing ? 'Pause' : 'Play'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
              {!selectedTrack?.blobUrl && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  Demo track — record in this session to enable playback
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Audio Recording?</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography variant="body2" color="text.secondary">
            This will remove your audio overlay. You can record a new one at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const ex = mockExercises.find((e) => e.id === id);

  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>(() => getAudioTracks(id));

  if (!ex) return <Box sx={{ p: 4 }}><Typography>Exercise not found.</Typography></Box>;

  const allTags = [...new Set([...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart])];

  const handleSaveAudio = (blobUrl: string, durationSecs: number) => {
    const track: AudioTrack = {
      id: `track-${Date.now()}`,
      ownerId: ME.id,
      ownerName: ME.name,
      durationSecs,
      createdAt: new Date().toISOString().slice(0, 10),
      blobUrl,
    };
    saveAudioTrack(id, track);
    setTracks(getAudioTracks(id));
    setRecordingOpen(false);
  };

  const handleDeleteAudio = (ownerId: string) => {
    deleteAudioTrack(id, ownerId);
    setTracks(getAudioTracks(id));
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }]} />
      <Box sx={{ pt: '56px', px: 4, py: 4, maxWidth: 820 }}>

        {/* Video */}
        {ex.videoUrl ? (
          <Box sx={{ width: '100%', height: 360, borderRadius: 2, overflow: 'hidden', mb: 3, bgcolor: '#0f0f0f' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 300, borderRadius: 2, bgcolor: '#F0EDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <FitnessCenterRoundedIcon sx={{ fontSize: 64, color: '#6750A4', opacity: 0.4, mb: 2 }} />
              <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} disableElevation>Play Video</Button>
            </Box>
          </Box>
        )}

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

        {/* Audio panel */}
        <AudioPanel
          exerciseId={id}
          tracks={tracks}
          onAdd={() => setRecordingOpen(true)}
          onDelete={handleDeleteAudio}
        />

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

      <AudioRecordingDialog
        open={recordingOpen}
        exerciseName={ex.name}
        videoId={ex.videoUrl}
        onClose={() => setRecordingOpen(false)}
        onSave={handleSaveAudio}
      />
    </>
  );
}
