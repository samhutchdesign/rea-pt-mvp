'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Tag, Divider, Select, Modal, App } from 'antd';
import TopBar from '@/components/layout/TopBar';
import AudioRecordingDialog from '@/components/exercises/AudioRecordingDialog';
import { mockExercises, mockExercisesFull, mockPrograms, mockPatients } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import type { Patient } from '@/lib/types';
import { ChevronRight, Heart, ListPlus, Mic, Pencil, UserPlus, Zap } from 'lucide-react';

const { Title, Text } = Typography;

function variationLabel(name: string): string {
  const idx = name.indexOf(':');
  return idx !== -1 ? name.slice(idx + 1).trim() : name;
}

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const viewMode = useViewMode();
  const { message: messageApi } = App.useApp();

  const sourceArray = id.startsWith('fx-') ? mockExercisesFull : mockExercises;
  const ex = sourceArray.find((e) => e.id === id);
  const [isFavorite, setIsFavorite] = useState(ex?.isFavorite ?? false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [programOpen, setProgramOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const handleAddToProgram = () => {
    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    if (prog) messageApi.success(`Exercise added to "${prog.name}"!`);
    setProgramOpen(false);
    setSelectedProgramId(null);
  };

  const handleAssign = () => {
    if (selectedPatient) {
      messageApi.success(`Exercise added to ${selectedPatient.firstName} ${selectedPatient.lastName}'s program!`);
    }
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  if (!ex) return <div style={{ padding: 32 }}><Text>Exercise not found.</Text></div>;

  const siblings = ex.variationGroup
    ? sourceArray.filter((e) => e.variationGroup === ex.variationGroup).sort((a, b) => b.usageCount - a.usageCount)
    : [];

  const groupName = ex.variationGroup ? (ex.defaultName ?? ex.name.split(':')[0].trim()) : null;

  const allTags = [...new Set([...ex.tags.specialty, ...ex.tags.condition, ...ex.tags.surgery, ...ex.tags.muscle, ...ex.tags.bodyPart])];

  const prescriptionTag = (label: string) => (
    <Tag key={label} style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 600 }}>{label}</Tag>
  );

  const usedInPrograms = mockPrograms.filter((prog) => prog.exercises.some((pe) => pe.exerciseId === id));

  const breadcrumbs = groupName
    ? [{ label: 'All Exercises', href: '/exercises' }, { label: groupName, href: `/exercises/${siblings[0]?.id ?? id}` }, { label: variationLabel(ex.name) }]
    : [{ label: 'All Exercises', href: '/exercises' }, { label: ex.name }];

  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <div style={{ paddingTop: 56, padding: '32px', maxWidth: 820 }}>

        {/* Variation selector */}
        {siblings.length > 1 && (
          <div style={{ background: '#F5F3FF', border: '1px solid #D0BCFF', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ color: '#6750A4', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {groupName}
            </Text>
            <Select
              value={id}
              onChange={(val) => router.push(`/exercises/${val}`)}
              style={{ flex: 1, minWidth: 200 }}
              options={siblings.map((s) => ({ value: s.id, label: variationLabel(s.name) }))}
            />
            <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 600, margin: 0 }}>
              {siblings.length} variations
            </Tag>
          </div>
        )}

        {/* Video */}
        {ex.videoUrl ? (
          <div style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden', marginBottom: 24, background: '#0f0f0f' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ex.videoUrl}?rel=0&modestbranding=1`}
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
              <Zap size={64} color="#6750A4" />
              <div style={{ marginTop: 8 }}>
                <Button type="primary" icon={<ChevronRight size={14} />}>Play Video</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>{ex.name}</Title>
            <Text type="secondary">{ex.description}</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {viewMode === 'full' && (
              <Button icon={<Mic size={14} />} onClick={() => setAudioOpen(true)}>Record Audio Cue</Button>
            )}
            <Button icon={<ListPlus size={14} />} onClick={() => setProgramOpen(true)}>Add to Program</Button>
            <Button icon={<UserPlus size={14} />} onClick={() => setAssignOpen(true)}>Add to Patient</Button>
            <Button
              type="text"
              shape="circle"
              onClick={() => setIsFavorite(!isFavorite)}
              icon={isFavorite ? <Heart size={16} fill="#E91E63" color="#E91E63" /> : <Heart size={16} />}
            />
            <Button icon={<Pencil size={14} />} onClick={() => router.push(`/exercises/new?edit=${id}`)}>Edit</Button>
          </div>
        </div>

        {/* Prescription chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {prescriptionTag(`${ex.defaultSets} Sets`)}
          {prescriptionTag(`${ex.defaultReps} Reps`)}
          {ex.defaultHoldSecs > 0 && prescriptionTag(`${ex.defaultHoldSecs}s Hold`)}
          {prescriptionTag(ex.defaultFrequency)}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {allTags.map((tag) => <Tag key={tag} style={{ fontSize: 12 }}>{tag}</Tag>)}
        </div>

        <Divider style={{ marginBottom: 24 }} />

        {/* Programs using this exercise */}
        {usedInPrograms.length > 0 && (
          <>
            <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Used in Programs</Title>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {usedInPrograms.map((prog) => (
                <Tag key={prog.id} onClick={() => router.push(`/programs/${prog.id}`)} style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontWeight: 500, cursor: 'pointer' }}>
                  {prog.name}
                </Tag>
              ))}
            </div>
            <Divider style={{ marginBottom: 24 }} />
          </>
        )}

        {/* Instructions */}
        <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>Instructions</Title>
        <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
          {ex.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: 8 }}><Text>{step}</Text></li>
          ))}
        </ol>

        <Divider style={{ marginBottom: 24 }} />

        {/* Common mistakes */}
        <Title level={3} style={{ marginTop: 0, marginBottom: 16, color: '#FB8C00' }}>Common Mistakes</Title>
        <ul style={{ paddingLeft: 24 }}>
          {ex.commonMistakes.map((m, i) => (
            <li key={i} style={{ marginBottom: 8 }}><Text>{m}</Text></li>
          ))}
        </ul>
      </div>

      <AudioRecordingDialog
        open={audioOpen}
        exerciseName={ex.name}
        videoId={ex.videoUrl}
        onClose={() => setAudioOpen(false)}
        onSave={(_blobUrl, _dur) => setAudioOpen(false)}
      />

      <Modal
        open={programOpen}
        onCancel={() => { setProgramOpen(false); setSelectedProgramId(null); }}
        title="Add to Program"
        footer={[
          <Button key="cancel" onClick={() => { setProgramOpen(false); setSelectedProgramId(null); }}>Cancel</Button>,
          <Button key="add" type="primary" disabled={!selectedProgramId} onClick={handleAddToProgram}>Add to Program</Button>,
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <Select
            placeholder="Select a program…"
            style={{ width: '100%' }}
            value={selectedProgramId}
            onChange={(val) => {
              if (val === '__new__') {
                router.push('/programs/new');
                setProgramOpen(false);
                return;
              }
              setSelectedProgramId(val);
            }}
            options={[
              { value: '__new__', label: '+ Create new program' },
              ...mockPrograms.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={assignOpen}
        onCancel={() => { setAssignOpen(false); setSelectedPatient(null); }}
        title="Add to Patient's Program"
        footer={[
          <Button key="cancel" onClick={() => { setAssignOpen(false); setSelectedPatient(null); }}>Cancel</Button>,
          <Button key="add" type="primary" disabled={!selectedPatient} onClick={handleAssign}>Add to Program</Button>,
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <Select
            placeholder="Select a patient…"
            style={{ width: '100%' }}
            value={selectedPatient?.id ?? null}
            onChange={(val) => setSelectedPatient(mockPatients.find((p) => p.id === val) ?? null)}
            options={mockPatients.filter((p) => !p.archived).map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
      </Modal>
    </>
  );
}
