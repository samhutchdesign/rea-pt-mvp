'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Card, Tag, Modal, Select, App } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { mockPrograms, mockExercises, mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';
import { Heart, Pencil, UserPlus, Zap } from 'lucide-react';

const { Title, Text } = Typography;

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const prog = mockPrograms.find((p) => p.id === id);
  const [isFavorite, setIsFavorite] = useState(prog?.isFavorite ?? false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (!prog) return <div style={{ padding: 32 }}><Text>Program not found.</Text></div>;

  const handleAssign = () => {
    if (selectedPatient) {
      messageApi.success(`Program assigned to ${selectedPatient.firstName} ${selectedPatient.lastName}!`);
    }
    setAssignOpen(false);
    setSelectedPatient(null);
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Programs', href: '/programs' }, { label: prog.name }]} />
      <div style={{ padding: '32px', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Title level={2} style={{ margin: 0 }}>{prog.name}</Title>
              <Button
                type="text"
                shape="circle"
                onClick={() => setIsFavorite(!isFavorite)}
                icon={isFavorite ? <Heart style={{ color: '#E91E63' }} fill="currentColor" /> : <Heart />}
              />
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{prog.description}</Text>
            <div style={{ display: 'flex', gap: 6 }}>
              {prog.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<UserPlus />} onClick={() => setAssignOpen(true)}>
              Assign to Patient
            </Button>
            <Button icon={<Pencil />} onClick={() => router.push('/programs/new')}>Edit</Button>
          </div>
        </div>

        <Text strong style={{ display: 'block', marginBottom: 16, color: '#49454F' }}>{prog.exercises.length} exercises</Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {prog.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <Card key={pe.exerciseId} styles={{ body: { padding: 0 } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>{ex.name}</Text>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Tag>{`${pe.sets} Sets`}</Tag>
                      <Tag>{`${pe.reps} Reps`}</Tag>
                      {pe.holdSecs > 0 && <Tag>{`${pe.holdSecs}s Hold`}</Tag>}
                      <Tag>{pe.frequency}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Assign to Patient Dialog */}
      <Modal
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        title="Assign to Patient"
        footer={[
          <Button key="cancel" onClick={() => setAssignOpen(false)}>Cancel</Button>,
          <Button key="assign" type="primary" disabled={!selectedPatient} onClick={handleAssign}>Assign Program</Button>,
        ]}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Select a patient to assign <strong>{prog.name}</strong> to.
        </Text>
        <Select
          showSearch
          placeholder="Search patients"
          style={{ width: '100%' }}
          value={selectedPatient?.id}
          onChange={(val) => setSelectedPatient(mockPatients.find((p) => p.id === val) ?? null)}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          options={mockPatients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
        />
      </Modal>
    </>
  );
}
