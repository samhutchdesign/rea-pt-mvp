'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Mic, Pause, Square, X, Zap } from 'lucide-react';

const MAX_SECS = 300;

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

  useEffect(() => {
    if (open) {
      setPhaseSync('idle');
      setElapsed(0);
      setBlobUrl(null);
      setPermDenied(false);
      setPreviewPlaying(false);
      elapsedRef.current = 0;
      if (videoId) {
        setIframeSrc('');
        setTimeout(() => {
          setIframeSrc(`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`);
        }, 50);
      }
    } else {
      doStop();
    }
  }, [open, videoId, doStop]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== 'string') return;
      try {
        const d = JSON.parse(e.data);
        if (d.event === 'onStateChange' && d.info === 0 && phaseRef.current === 'recording') doStop();
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [doStop]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => { ytCmd('pauseVideo'); setPreviewPlaying(false); };
    return () => { audioRef.current?.pause(); };
  }, [ytCmd]);

  const startRecording = async () => {
    setPermDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => MediaRecorder.isTypeSupported(m));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type ?? 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setSavedDur(elapsedRef.current);
        setPhaseSync('preview');
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

  const handleSave = () => { audioRef.current?.pause(); if (blobUrl) onSave(blobUrl, savedDur); };

  const handleClose = () => { audioRef.current?.pause(); doStop(); onClose(); };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Modal className="w-full max-w-2xl">
        <Dialog>
          {/* Title bar */}
          <div className="flex items-start px-6 pt-5 pb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary leading-tight">
                {phase === 'preview' ? 'Preview Recording' : 'Record Audio Overlay'}
              </h2>
              <p className="text-xs text-tertiary mt-0.5">{exerciseName}</p>
            </div>
            <button onClick={handleClose} className="flex size-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <X size={16} className="text-quaternary" />
            </button>
          </div>

          {/* Video */}
          <div className="relative h-80 w-full bg-[#0f0f0f] shrink-0">
            {videoId && iframeSrc ? (
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0 block"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Zap size={72} className="text-brand-300" />
              </div>
            )}

            {phase === 'recording' && (
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5">
                <span className="size-2 rounded-full bg-error-500 animate-pulse" />
                <span className="text-white font-mono text-sm tracking-wide">REC {fmt(elapsed)}</span>
              </div>
            )}
            {phase === 'preview' && (
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5">
                <span className="size-2 rounded-full bg-success-500" />
                <span className="text-white text-xs">Audio overlay · video muted</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="px-6 py-4">
            {phase === 'idle' && (
              <div>
                <p className="text-sm text-secondary mb-2">
                  The video will play automatically when you click Start Recording. Your microphone will capture your voice as an overlay — patients will hear your audio instead of the original video audio.
                </p>
                <p className="text-xs text-tertiary mb-3">Maximum recording length: 5 minutes. Recording stops automatically when the video ends.</p>
                {permDenied && (
                  <Alert type="error">Microphone access was denied. Allow microphone access in your browser and try again.</Alert>
                )}
              </div>
            )}
            {phase === 'recording' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">Recording in progress</span>
                  <span className="text-xs text-tertiary">· Stop manually or recording ends with the video</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={(elapsed / MAX_SECS) * 100} color="error" className="flex-1" />
                  <span className="text-xs text-tertiary font-mono whitespace-nowrap">{fmt(elapsed)} / {fmt(MAX_SECS)}</span>
                </div>
              </div>
            )}
            {phase === 'preview' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">Previewing — your audio plays over the muted video</p>
                  <p className="text-xs text-tertiary mt-0.5">Duration: {fmt(savedDur)} · This is exactly how patients will hear it</p>
                </div>
                <Button size="sm" color="secondary" iconLeading={previewPlaying ? Pause : ChevronRight} onPress={togglePreview}>
                  {previewPlaying ? 'Pause' : 'Play Again'}
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-secondary px-6 py-4">
            {phase === 'preview' ? (
              <>
                <button onClick={handleDiscard} className="text-sm text-tertiary hover:text-secondary transition-colors">Discard</button>
                <div className="flex-1" />
                <Button color="primary" onPress={handleSave}>Save Audio</Button>
              </>
            ) : (
              <>
                <button onClick={handleClose} className="text-sm text-tertiary hover:text-secondary transition-colors">Cancel</button>
                <div className="flex-1" />
                {phase === 'idle' ? (
                  <Button color="primary-destructive" iconLeading={Mic} onPress={startRecording}>Start Recording</Button>
                ) : (
                  <Button color="primary-destructive" iconLeading={Square} onPress={doStop}>Stop Recording</Button>
                )}
              </>
            )}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
