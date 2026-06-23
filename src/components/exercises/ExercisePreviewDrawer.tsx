'use client';
import { useState } from 'react';
import { Drawer, Typography, Tag, Button, Divider, Modal, Select } from 'antd';
import { mockPrograms } from '@/lib/mock-data';
import type { Exercise, Program } from '@/lib/types';
import { List, X, Zap } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

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

  const prescriptionTag = (label: string) => (
    <Tag key={label} style={{ background: '#EDE7F6', color: '#6750A4', border: 'none' }}>{label}</Tag>
  );

  return (
    <>
      <Drawer
        placement="right"
        open={open}
        onClose={onClose}
        width={480}
        closable={false}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
      >
        {/* Video Area */}
        <div style={{ width: '100%', height: 240, background: exercise.videoUrl ? '#0f0f0f' : '#F0EDF6', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
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
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={52} />
            </div>
          )}
          <Button
            onClick={onClose}
            size="small"
            shape="circle"
            icon={<X />}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)' }}
          />
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 4, fontWeight: 700 }}>{exercise.name}</Title>
          <Paragraph>{exercise.description}</Paragraph>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {allTags.map((tag) => <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>)}
          </div>

          {patientPrescription ? (
            <div style={{ marginBottom: 20, padding: 12, background: '#EDE7F6', border: '1px solid #6750A4', borderRadius: 8 }}>
              <Text style={{ fontWeight: 600, color: '#6750A4', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8, fontSize: 12 }}>
                Patient Prescription
              </Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {prescriptionTag(`${patientPrescription.sets} Sets`)}
                {prescriptionTag(`${patientPrescription.reps} Reps`)}
                {patientPrescription.holdSecs > 0 && prescriptionTag(`${patientPrescription.holdSecs}s Hold`)}
                {prescriptionTag(patientPrescription.frequency)}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {prescriptionTag(`${exercise.defaultSets} Sets`)}
              {prescriptionTag(`${exercise.defaultReps} Reps`)}
              {exercise.defaultHoldSecs > 0 && prescriptionTag(`${exercise.defaultHoldSecs}s Hold`)}
              {prescriptionTag(exercise.defaultFrequency)}
            </div>
          )}

          <Divider style={{ marginBottom: 20 }} />

          <Text strong style={{ display: 'block', marginBottom: 12 }}>Instructions</Text>
          <ol style={{ paddingLeft: 20, margin: 0, marginBottom: 20 }}>
            {exercise.instructions.map((step, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <Text>{step}</Text>
              </li>
            ))}
          </ol>

          <Divider style={{ marginBottom: 20 }} />

          <Text strong style={{ display: 'block', marginBottom: 12, color: '#FB8C00' }}>Common Mistakes</Text>
          <ul style={{ paddingLeft: 20, margin: 0, marginBottom: 8 }}>
            {exercise.commonMistakes.map((m, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <Text>{m}</Text>
              </li>
            ))}
          </ul>
        </div>

        {/* Action bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E0E0E0', display: 'flex', gap: 12, flexShrink: 0 }}>
          {onAddToCurrentProgram && (
            <Button type="primary" onClick={() => { onAddToCurrentProgram(); onClose(); }} style={{ flex: 1 }}>
              Add to This Program
            </Button>
          )}
          <Button
            type={onAddToCurrentProgram ? 'default' : 'primary'}
            icon={<List />}
            onClick={() => setProgramSelectorOpen(true)}
            style={{ flex: 1 }}
          >
            Add to a Program
          </Button>
        </div>
      </Drawer>

      {/* Program Selector Dialog */}
      <Modal
        open={programSelectorOpen}
        onCancel={() => setProgramSelectorOpen(false)}
        title="Add to a Program"
        footer={[
          <Button key="cancel" onClick={() => setProgramSelectorOpen(false)}>Cancel</Button>,
          <Button key="add" type="primary" disabled={!selectedProgram} onClick={handleAddToProgram}>
            Add to Program
          </Button>,
        ]}
      >
        <Paragraph type="secondary">
          Select a program to add <strong>{exercise.name}</strong> to.
        </Paragraph>
        <Select
          showSearch
          placeholder="Search programs"
          style={{ width: '100%' }}
          value={selectedProgram?.id}
          onChange={(val) => setSelectedProgram(mockPrograms.find((p) => p.id === val) ?? null)}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          options={mockPrograms.map((p) => ({ value: p.id, label: p.name }))}
        />
      </Modal>
    </>
  );
}
