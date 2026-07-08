'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Button, Tag } from 'antd';
import { mockChartSessions } from '@/lib/mock-data';
import { useViewMode } from '@/lib/viewModeStore';
import { Pencil, Plus } from 'lucide-react';

const ADHERENCE_STYLE: Record<string, { bg: string; color: string }> = {
  'High Adherence':     { bg: '#E8F5E9', color: '#2E7D32' },
  'Moderate Adherence': { bg: '#FFF8E1', color: '#F57F17' },
  'Low Adherence':      { bg: '#FFEBEE', color: '#C62828' },
};

const { Text } = Typography;

export default function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const viewMode = useViewMode();
  const sessions = (mockChartSessions[id] ?? []).slice().reverse();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => router.push(`/patients/${id}/chart/new`)}>
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
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Text strong>
                    {session.isIntakeSession
                      ? `Intake Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : `Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </Text>
                  {viewMode === 'full' && !session.isIntakeSession && session.adherenceLevel && (() => {
                    const s = ADHERENCE_STYLE[session.adherenceLevel];
                    return (
                      <Tag style={{ fontSize: 11, border: 'none', background: s.bg, color: s.color, fontWeight: 600 }}>
                        {session.adherenceLevel}
                      </Tag>
                    );
                  })()}
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<Pencil size={14} />}
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
