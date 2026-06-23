'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button, Tag, Tooltip } from 'antd';
import { EditOutlined, SendOutlined, ThunderboltOutlined, EyeOutlined } from '@ant-design/icons';
import ExercisePreviewDrawer from '@/components/exercises/ExercisePreviewDrawer';
import { mockPatients, mockPrograms, mockExercises, mockChartSessions } from '@/lib/mock-data';
import type { Exercise, ProgramExercise } from '@/lib/types';

const { Title, Text } = Typography;

export default function PatientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewPE, setPreviewPE] = useState<ProgramExercise | null>(null);
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const completedSessions = (mockChartSessions[id] ?? []).filter((s) => !s.isIntakeSession).length;
  const totalSessions = patient?.totalSessions ?? 8;

  if (!patient) return null;

  if (!program) {
    return (
      <div>
        <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>Program</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          No program assigned yet. Choose a recommended template or start from scratch.
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockPrograms.map((prog) => (
            <Card
              key={prog.id}
              hoverable
              styles={{ body: { padding: 20 } }}
              onClick={() => router.push(`/patients/${id}/program/edit`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text strong style={{ display: 'block' }}>{prog.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{prog.description}</Text>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {prog.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                  </div>
                </div>
                <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none' }}>{`${prog.exercises.length} exercises`}</Tag>
              </div>
            </Card>
          ))}
          <Button onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Create Program from Scratch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>{program.name}</Title>
          <Text type="secondary">{completedSessions} out of {totalSessions} total sessions</Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/patients/${id}/program/edit`)}>
            Modify
          </Button>
          <Button type="primary" icon={<SendOutlined />} onClick={() => router.push(`/patients/${id}/program/send`)}>
            Send Program to Patient
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {program.exercises.map((pe) => {
          const ex = mockExercises.find((e) => e.id === pe.exerciseId);
          if (!ex) return null;
          return (
            <Card key={pe.exerciseId} styles={{ body: { padding: 16 } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 80, height: 64, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ThunderboltOutlined style={{ color: '#6750A4', fontSize: 28 }} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <Text strong style={{ display: 'block', marginBottom: 2 }}>{ex.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{ex.description}</Text>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Tag>{`${pe.sets} Sets`}</Tag>
                    <Tag>{`${pe.reps} Reps`}</Tag>
                    {pe.holdSecs > 0 && <Tag>{`${pe.holdSecs} Sec Hold`}</Tag>}
                    <Tag>{pe.frequency}</Tag>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <Tooltip title="Preview exercise">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => { setPreviewExercise(ex); setPreviewPE(pe); }}
                      icon={<EyeOutlined />}
                    />
                  </Tooltip>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ExercisePreviewDrawer
        exercise={previewExercise}
        open={!!previewExercise}
        onClose={() => { setPreviewExercise(null); setPreviewPE(null); }}
        patientPrescription={previewPE ? { sets: previewPE.sets, reps: previewPE.reps, holdSecs: previewPE.holdSecs, frequency: previewPE.frequency } : undefined}
      />
    </div>
  );
}
