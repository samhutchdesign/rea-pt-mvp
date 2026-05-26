'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

const MAX_SECS = 300; // 5-minute ceiling

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

type Phase = 'idle' | 'recording' | 'preview';

interface Props {
  open: boolean;
  exerciseName: string;
  videoId?: string;
  onClose: () => void;
  onSave: (blobUrl: string, durationSecs: number) => void;
}

export default function AudioRecordingDialog({ open, exerciseName, videoId, onClose, onSave }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [savedDur, setSavedDur] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [permDenied, setPermDenied] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('');

  const setPhaseSync = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const ytCmd = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }), '*'
    );
  }, []);

  const doStop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    ytCmd('pauseVideo');
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [ytCmd]);

  // Reset + set iframe src each time dialog opens
  useEffect(() => {
    if (open) {
      setPhaseSync('idle');
      setElapsed(0);
      setBlobUrl(null);
      setPermDenied(false);
      setPreviewPlaying(false);
      elapsedRef.current = 0;
      if (videoId) {
        // Re-mount iframe by briefly clearing src
        setIframeSrc('');
        setTimeout(() => {
          setIframeSrc(`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`);
        }, 50);
      }
    } else {
      doStop();
    }
  }, [open, videoId, doStop]);

  // YouTube state-change listener: auto-stop recording when video ends
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== 'string') return;
      try {
        const d = JSON.parse(e.data);
        if (d.event === 'onStateChange' && d.info === 0 && phaseRef.current === 'recording') {
          doStop();
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [doStop]);

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      ytCmd('pauseVideo');
      setPreviewPlaying(false);
    };
    return () => { audioRef.current?.pause(); };
  }, [ytCmd]);

  const startRecording = async () => {
    setPermDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
        (m) => MediaRecorder.isTypeSupported(m)
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type ?? 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setSavedDur(elapsedRef.current);
        setPhaseSync('preview');

        // Auto-play preview: mute video, rewind, play both
        setTimeout(() => {
          ytCmd('seekTo', [0, true]);
          ytCmd('mute');
          ytCmd('playVideo');
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
          setPreviewPlaying(true);
        }, 400);
      };

      recorder.start(500);
      ytCmd('playVideo');
      ytCmd('mute');
      setPhaseSync('recording');
      elapsedRef.current = 0;
      setElapsed(0);

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECS) doStop();
      }, 1000);

    } catch {
      setPermDenied(true);
    }
  };

  const togglePreview = () => {
    if (previewPlaying) {
      ytCmd('pauseVideo');
      audioRef.current?.pause();
      setPreviewPlaying(false);
    } else {
      ytCmd('seekTo', [0, true]);
      ytCmd('playVideo');
      if (audioRef.current && blobUrl) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setPreviewPlaying(true);
    }
  };

  const handleDiscard = () => {
    audioRef.current?.pause();
    ytCmd('seekTo', [0, true]);
    ytCmd('pauseVideo');
    ytCmd('unMute');
    setBlobUrl(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setPreviewPlaying(false);
    setPhaseSync('idle');
  };

  const handleSave = () => {
    audioRef.current?.pause();
    if (blobUrl) onSave(blobUrl, savedDur);
  };

  const handleClose = () => {
    audioRef.current?.pause();
    doStop();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { overflow: 'hidden' } }}>
      {/* Title bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600} lineHeight={1.2}>
            {phase === 'preview' ? 'Preview Recording' : 'Record Audio Overlay'}
          </Typography>
          <Typography variant="caption" color="text.secondary">{exerciseName}</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small"><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Video / iframe */}
        <Box sx={{ width: '100%', height: 320, bgcolor: '#0f0f0f', position: 'relative', flexShrink: 0 }}>
          {videoId && iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FitnessCenterRoundedIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.15)' }} />
            </Box>
          )}

          {/* Recording badge */}
          {phase === 'recording' && (
            <Box sx={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: 'rgba(0,0,0,0.72)', borderRadius: 1, px: 1.5, py: 0.6,
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', bgcolor: '#F44336',
                '@keyframes recblink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
                animation: 'recblink 1s ease infinite',
              }} />
              <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
                REC {fmt(elapsed)}
              </Typography>
            </Box>
          )}

          {/* Preview badge */}
          {phase === 'preview' && (
            <Box sx={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 0.75,
              bgcolor: 'rgba(0,0,0,0.72)', borderRadius: 1, px: 1.5, py: 0.6,
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4CAF50' }} />
              <Typography variant="caption" sx={{ color: '#fff', fontSize: 12 }}>
                Audio overlay · video muted
              </Typography>
            </Box>
          )}
        </Box>

        {/* Controls panel */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          {phase === 'idle' && (
            <>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                The video will play automatically when you click Start Recording. Your microphone will capture your voice as an overlay — patients will hear your audio instead of the original video audio.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum recording length: 5 minutes. Recording stops automatically when the video ends.
              </Typography>
              {permDenied && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Microphone access was denied. Allow microphone access in your browser and try again.
                </Alert>
              )}
            </>
          )}

          {phase === 'recording' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="body2" fontWeight={500}>Recording in progress</Typography>
                <Typography variant="caption" color="text.secondary">· Stop manually or recording ends with the video</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(elapsed / MAX_SECS) * 100}
                  sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#F5F5F5', '& .MuiLinearProgress-bar': { bgcolor: '#F44336', borderRadius: 3 } }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', minWidth: 90, textAlign: 'right' }}>
                  {fmt(elapsed)} / {fmt(MAX_SECS)}
                </Typography>
              </Box>
            </>
          )}

          {phase === 'preview' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500} mb={0.3}>
                    Previewing — your audio plays over the muted video
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {fmt(savedDur)} · This is exactly how patients will hear it
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={previewPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={togglePreview}
                >
                  {previewPlaying ? 'Pause' : 'Play Again'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        {phase === 'idle' && (
          <>
            <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              startIcon={<MicIcon />}
              disableElevation
              onClick={startRecording}
              sx={{ bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' }, px: 3 }}
            >
              Start Recording
            </Button>
          </>
        )}
        {phase === 'recording' && (
          <>
            <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              startIcon={<StopIcon />}
              disableElevation
              onClick={doStop}
              sx={{ bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' }, px: 3 }}
            >
              Stop Recording
            </Button>
          </>
        )}
        {phase === 'preview' && (
          <>
            <Button onClick={handleDiscard} sx={{ color: 'text.secondary' }}>Discard</Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" disableElevation onClick={handleSave} sx={{ px: 3 }}>
              Save Audio
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
