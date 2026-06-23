'use client';
import { use, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Tag, Divider, Card, Switch, Select, Tooltip, Modal, Flex } from 'antd';
import {
  ThunderboltOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  AudioOutlined,
  SoundOutlined,
  CaretRightOutlined,
  PauseOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { mockExercises, mockPhysio, mockPrograms } from '@/lib/mock-data';
import { getAudioTracks, saveAudioTrack, deleteAudioTrack } from '@/lib/audioStore';
import type { AudioTrack } from '@/lib/types';

const { Title, Text } = Typography;

const ME = { id: mockPhysio.id ?? 'p1', name: `${mockPhysio.firstName} ${mockPhysio.lastName}` };

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

// ─── Audio panel ──────────────────────────────────────────────────────────────
function AudioPanel({
  tracks,
  onAdd,
  onDelete,
  ytCmd,
}: {
  tracks: AudioTrack[];
  onAdd: () => void;
  onDelete: (ownerId: string) => void;
  ytCmd: (func: string, args?: unknown[]) => void;
}) {
  const myTrack = tracks.find((t) => t.ownerId === ME.id) ?? null;

  const [myEnabled, setMyEnabled] = useState(true);
  const [fallbackOriginal, setFallbackOriginal] = useState(true);
  const [listenId, setListenId] = useState(tracks[0]?.id ?? '');
  const [playing, setPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedListenId = tracks.find((t) => t.id === listenId) ? listenId : (tracks[0]?.id ?? '');
  const selectedTrack = tracks.find((t) => t.id === resolvedListenId) ?? null;

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setPlaying(false);
      ytCmd('pauseVideo');
      ytCmd('unMute');
    };
    return () => audioRef.current?.pause();
  }, [ytCmd]);

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

  const handleDelete = () => {
    setConfirmDelete(false);
    onDelete(ME.id);
  };

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: myTrack && myEnabled ? '#E8F5E9' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {myTrack && myEnabled
              ? <SoundOutlined style={{ fontSize: 18, color: '#2E7D32' }} />
              : <SoundOutlined style={{ fontSize: 18, color: '#9E9E9E' }} />}
          </div>
          <Text strong>Audio Overlay</Text>
        </div>

        {/* Your recording */}
        {myTrack ? (
          <div style={{ padding: 16, background: 'rgba(0,0,0,0.04)', borderRadius: 8, border: '1px solid #E0E0E0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CheckCircleFilled style={{ fontSize: 18, color: myEnabled ? '#2E7D32' : '#BDBDBD', flexShrink: 0 }} />
              <div style={{ flexGrow: 1 }}>
                <Text strong>Your recording</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fmt(myTrack.durationSecs)} · Recorded {new Date(myTrack.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {myTrack.blobUrl === null && ' · Demo'}
                  </Text>
                </div>
              </div>
              <Flex align="center" gap={6}>
                <Switch checked={myEnabled} onChange={setMyEnabled} size="small" />
                <Text style={{ fontSize: 12 }}>{myEnabled ? 'On' : 'Off'}</Text>
              </Flex>
              <Tooltip title="Delete recording">
                <Button type="text" size="small" onClick={() => setConfirmDelete(true)} icon={<DeleteOutlined />} />
              </Tooltip>
            </div>

            {!myEnabled && (
              <div style={{ marginTop: 12, paddingLeft: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>When Off:</Text>
                <Tag.CheckableTag checked={fallbackOriginal} onChange={() => setFallbackOriginal(true)} style={{ fontSize: 11, border: '1px solid #E0E0E0' }}>
                  Original Video Audio
                </Tag.CheckableTag>
                <Tag.CheckableTag checked={!fallbackOriginal} onChange={() => setFallbackOriginal(false)} style={{ fontSize: 11, border: '1px solid #E0E0E0' }}>
                  Muted
                </Tag.CheckableTag>
              </div>
            )}

            <div style={{ marginTop: 12, paddingLeft: 28 }}>
              <Button type="text" size="small" icon={<AudioOutlined />} onClick={onAdd} style={{ color: '#49454F', fontSize: 12 }}>
                Re-record
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16, background: 'rgba(0,0,0,0.04)', borderRadius: 8, border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <Text type="secondary">
              {tracks.length > 0 ? "You haven't recorded a voice-over yet." : 'No audio recorded. Record your voice-over to guide patients through this exercise.'}
            </Text>
            <Button size="small" icon={<AudioOutlined />} onClick={onAdd} style={{ flexShrink: 0 }}>
              Add New Audio
            </Button>
          </div>
        )}

        {/* Listen dropdown — all tracks */}
        <Divider style={{ margin: '16px 0' }} />
        <Text type="secondary" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>
          Recordings
        </Text>
        {tracks.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <Select
                value={resolvedListenId}
                onChange={(v) => { setListenId(v); setPlaying(false); audioRef.current?.pause(); }}
                style={{ flex: 1 }}
                options={tracks.map((t) => ({ value: t.id, label: `${t.ownerName} · ${fmt(t.durationSecs)}` }))}
              />
              <Tooltip title={selectedTrack?.blobUrl ? '' : 'Demo track — record in this session to enable playback'}>
                <span>
                  <Button
                    size="small"
                    icon={playing ? <PauseOutlined /> : <CaretRightOutlined />}
                    disabled={!selectedTrack?.blobUrl}
                    onClick={togglePlay}
                  >
                    {playing ? 'Pause' : 'Play'}
                  </Button>
                </span>
              </Tooltip>
            </div>
            {!selectedTrack?.blobUrl && (
              <Text type="secondary" style={{ marginTop: 6, display: 'block', fontSize: 12 }}>
                Demo track — record in this session to enable playback
              </Text>
            )}
          </>
        ) : (
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            No recordings yet. Record a voice-over above to get started.
          </Text>
        )}
      </Card>

      {/* Confirm delete dialog */}
      <Modal
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        title="Delete Audio Recording?"
        footer={[
          <Button key="cancel" onClick={() => setConfirmDelete(false)}>Cancel</Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>Delete</Button>,
        ]}
      >
        <Text type="secondary">
          This will remove your audio overlay. You can record a new one at any time.
        </Text>
      </Modal>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const ex = mockExercises.find((e) => e.id === id);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ytCmd = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }), '*'
    );
  }, []);

  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>(() => getAudioTracks(id));

  if (!ex) return <div style={{ padding: 32 }}><Text>Exercise not found.</Text></div>;

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

  const prescriptionTag = (label: string) => (
    <Tag key={label} style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 600 }}>{label}</Tag>
  );

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }]} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 820 }}>

        {/* Video */}
        {ex.videoUrl ? (
          <div style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden', marginBottom: 24, background: '#0f0f0f' }}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${ex.videoUrl}?enablejsapi=1&rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: 300, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 64, color: '#6750A4', opacity: 0.4, marginBottom: 16, display: 'block' }} />
              <Button type="primary" icon={<CaretRightOutlined />}>Play Video</Button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>{ex.name}</Title>
            <Text type="secondary">{ex.description}</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="text" shape="circle" onClick={() => setIsFavorite(!isFavorite)} icon={isFavorite ? <HeartFilled style={{ color: '#E91E63' }} /> : <HeartOutlined />} />
            <Button icon={<EditOutlined />} onClick={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {prescriptionTag(`${ex.defaultSets} Sets`)}
          {prescriptionTag(`${ex.defaultReps} Reps`)}
          {ex.defaultHoldSecs > 0 && prescriptionTag(`${ex.defaultHoldSecs}s Hold`)}
          {prescriptionTag(ex.defaultFrequency)}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {allTags.map((tag) => <Tag key={tag} style={{ fontSize: 12 }}>{tag}</Tag>)}
        </div>

        {/* Audio panel */}
        <AudioPanel
          tracks={tracks}
          onAdd={() => setRecordingOpen(true)}
          onDelete={handleDeleteAudio}
          ytCmd={ytCmd}
        />

        <Divider style={{ marginBottom: 24 }} />

        {/* Programs using this exercise */}
        {(() => {
          const usedInPrograms = mockPrograms.filter((prog) => prog.exercises.some((pe) => pe.exerciseId === id));
          if (usedInPrograms.length === 0) return null;
          return (
            <>
              <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Used in Programs</Title>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {usedInPrograms.map((prog) => (
                  <Tag
                    key={prog.id}
                    onClick={() => router.push(`/programs/${prog.id}`)}
                    style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {prog.name}
                  </Tag>
                ))}
              </div>
              <Divider style={{ marginBottom: 24 }} />
            </>
          );
        })()}

        <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>Instructions</Title>
        <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
          {ex.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text>{step}</Text>
            </li>
          ))}
        </ol>

        <Divider style={{ marginBottom: 24 }} />

        <Title level={3} style={{ marginTop: 0, marginBottom: 16, color: '#FB8C00' }}>Common Mistakes</Title>
        <ul style={{ paddingLeft: 24 }}>
          {ex.commonMistakes.map((m, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <Text>{m}</Text>
            </li>
          ))}
        </ul>
      </div>

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
