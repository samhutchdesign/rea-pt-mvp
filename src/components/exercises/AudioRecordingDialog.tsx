'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Button, Modal, Alert, Progress } from 'antd';
import { ChevronRight, Mic, Pause, Square, X, Zap } from 'lucide-react';

const { Title, Text } = Typography;

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

  const footer =
    phase === 'idle' ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button type="text" onClick={handleClose} style={{ color: '#49454F' }}>Cancel</Button>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<Mic />}
          onClick={startRecording}
          style={{ background: '#D32F2F', borderColor: '#D32F2F', padding: '0 24px' }}
        >
          Start Recording
        </Button>
      </div>
    ) : phase === 'recording' ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button type="text" onClick={handleClose} style={{ color: '#49454F' }}>Cancel</Button>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<Square />}
          onClick={doStop}
          style={{ background: '#D32F2F', borderColor: '#D32F2F', padding: '0 24px' }}
        >
          Stop Recording
        </Button>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button type="text" onClick={handleDiscard} style={{ color: '#49454F' }}>Discard</Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" onClick={handleSave} style={{ padding: '0 24px' }}>
          Save Audio
        </Button>
      </div>
    );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={760}
      closable={false}
      footer={footer}
      styles={{ body: { padding: 0 }, container: { overflow: 'hidden', padding: 0 } }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 12px' }}>
        <div style={{ flexGrow: 1 }}>
          <Title level={3} style={{ margin: 0, lineHeight: 1.2 }}>
            {phase === 'preview' ? 'Preview Recording' : 'Record Audio Overlay'}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{exerciseName}</Text>
        </div>
        <Button type="text" size="small" icon={<X />} onClick={handleClose} />
      </div>

      {/* Video / iframe */}
      <div style={{ width: '100%', height: 320, background: '#0f0f0f', position: 'relative', flexShrink: 0 }}>
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
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={72} />
          </div>
        )}

        {/* Recording badge */}
        {phase === 'recording' && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,0,0,0.72)', borderRadius: 8, padding: '5px 12px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F44336', animation: 'recblink 1s ease infinite' }} />
            <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
              REC {fmt(elapsed)}
            </span>
            <style>{`@keyframes recblink { 0%,100% { opacity: 1 } 50% { opacity: 0.2 } }`}</style>
          </div>
        )}

        {/* Preview badge */}
        {phase === 'preview' && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.72)', borderRadius: 8, padding: '5px 12px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
            <span style={{ color: '#fff', fontSize: 12 }}>Audio overlay · video muted</span>
          </div>
        )}
      </div>

      {/* Controls panel */}
      <div style={{ padding: '20px 24px 8px' }}>
        {phase === 'idle' && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              The video will play automatically when you click Start Recording. Your microphone will capture your voice as an overlay — patients will hear your audio instead of the original video audio.
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Maximum recording length: 5 minutes. Recording stops automatically when the video ends.
            </Text>
            {permDenied && (
              <Alert
                type="error"
                style={{ marginTop: 16 }}
                message="Microphone access was denied. Allow microphone access in your browser and try again."
              />
            )}
          </>
        )}

        {phase === 'recording' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text strong>Recording in progress</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>· Stop manually or recording ends with the video</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Progress
                percent={(elapsed / MAX_SECS) * 100}
                showInfo={false}
                strokeColor="#F44336"
                style={{ flex: 1 }}
              />
              <Text type="secondary" style={{ fontFamily: 'monospace', minWidth: 90, textAlign: 'right' }}>
                {fmt(elapsed)} / {fmt(MAX_SECS)}
              </Text>
            </div>
          </>
        )}

        {phase === 'preview' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: 'block', marginBottom: 2 }}>
                Previewing — your audio plays over the muted video
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Duration: {fmt(savedDur)} · This is exactly how patients will hear it
              </Text>
            </div>
            <Button
              size="small"
              icon={previewPlaying ? <Pause /> : <ChevronRight />}
              onClick={togglePreview}
            >
              {previewPlaying ? 'Pause' : 'Play Again'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
