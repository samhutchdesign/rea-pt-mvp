'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { mockChartSessions } from '@/lib/mock-data';

const { Text } = Typography;

export default function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sessions = (mockChartSessions[id] ?? []).slice().reverse();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push(`/patients/${id}/chart/new`)}>
          Add to Chart
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Text type="secondary">No sessions recorded yet.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map((session) => (
            <Card key={session.id} styles={{ body: { padding: 20 } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flexGrow: 1 }}>
                  <Text strong>
                    {session.isIntakeSession
                      ? `Intake Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : `Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </Text>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => router.push(`/patients/${id}/chart/${session.id}`)}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
