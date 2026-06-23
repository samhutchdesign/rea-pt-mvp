'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Divider, App } from 'antd';
import { SendOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { mockPatients, mockPrograms, mockExercises } from '@/lib/mock-data';

const { Title, Text } = Typography;

export default function SendProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const patient = mockPatients.find((p) => p.id === id);
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;

  const templateMessage = program
    ? `Hi ${patient?.firstName},\n\nI hope you're doing well! Please find your updated home exercise program attached below. I've put together ${program.exercises.length} exercises tailored to your current treatment plan.\n\nPlease aim to complete your exercises as prescribed. If you have any questions or experience any discomfort, don't hesitate to reach out.\n\nWarm regards,\nSarah Harper, PT, DPT, PRPC\nRea Pelvic Health`
    : '';

  const [message, setMessage] = useState(templateMessage);

  const handleSend = () => {
    messageApi.success('New Program has successfully been emailed to the Patient!');
    setTimeout(() => router.push(`/patients/${id}/program`), 1500);
  };

  if (!patient || !program) return <Text style={{ padding: 32, display: 'block' }}>No program to send.</Text>;

  return (
    <div style={{ maxWidth: 700 }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>Send Program to Patient</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>{patient.firstName} {patient.lastName} · {patient.email}</Text>

      <Card style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Message</Text>
        <Input.TextArea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 16 }}>{program.name}</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {program.exercises.map((pe) => {
            const ex = mockExercises.find((e) => e.id === pe.exerciseId);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ThunderboltOutlined style={{ color: '#6750A4', fontSize: 18 }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <Text strong>{ex.name}</Text>
                    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                      <Tag style={{ fontSize: 11 }}>{`${pe.sets} Sets`}</Tag>
                      <Tag style={{ fontSize: 11 }}>{`${pe.reps} Reps`}</Tag>
                      {pe.holdSecs > 0 && <Tag style={{ fontSize: 11 }}>{`${pe.holdSecs}s Hold`}</Tag>}
                      <Tag style={{ fontSize: 11 }}>{pe.frequency}</Tag>
                    </div>
                  </div>
                </div>
                <Divider style={{ marginTop: 12, marginBottom: 0 }} />
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <Button onClick={() => router.push(`/patients/${id}/program`)}>Cancel</Button>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>Send to Patient</Button>
      </div>
    </div>
  );
}
