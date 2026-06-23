'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Input, Button, Card, Tag, Modal, Tooltip, App } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';

const { Text } = Typography;

const SOAPIER_SECTIONS = [
  { key: 'subjective', letter: 'S', label: 'Subjective', rows: 5 },
  { key: 'objective', letter: 'O', label: 'Objective', rows: 4 },
  { key: 'assessment', letter: 'A', label: 'Analysis', rows: 6 },
  { key: 'plan', letter: 'P', label: 'Plan', rows: 4 },
  { key: 'intervention', letter: 'I', label: 'Intervention', rows: 4 },
  { key: 'evaluation', letter: 'E', label: 'Evaluation', rows: 3 },
  { key: 'recommendations', letter: 'R', label: 'Recommendations', rows: 3 },
];

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const [editing, setEditing] = useState(false);
  const [soapie, setSoapie] = useState<Record<string, string>>(session?.soapie ?? {});
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!patient || !session) return <Text style={{ padding: 32, display: 'block' }}>Session not found.</Text>;

  const sessionDate = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;

  const handleCopy = async () => {
    const lines = [`${sessionLabel} — ${patient.firstName} ${patient.lastName}`, sessionDate, ''];
    for (const { letter, label, key } of SOAPIER_SECTIONS) {
      lines.push(`${letter} — ${label}`);
      lines.push((soapie as Record<string, string>)[key] || '—');
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    messageApi.success('Session deleted.');
    setTimeout(() => router.push(`/patients/${id}/chart`), 1500);
  };

  const letterBadge = (letter: string) => (
    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6750A4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>{letter}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Session header bar */}
      <div style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #E0E0E0', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <Text strong>{patient.firstName} {patient.lastName}</Text>
        {ageLabel && <Text type="secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</Text>}
        <Text type="secondary">{sessionDate}</Text>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag style={{ background: session.isIntakeSession ? '#EDE7F6' : '#6750A4', color: session.isIntakeSession ? '#6750A4' : 'white', border: 'none', fontWeight: 600 }}>{sessionLabel}</Tag>
          {!editing && (
            <>
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy chart notes'}>
                <Button type="text" size="small" onClick={handleCopy} icon={<CopyOutlined />} style={{ color: copySuccess ? '#2E7D32' : '#49454F' }} />
              </Tooltip>
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Session summary */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 8 }}>
          <Text strong>Session Notes</Text>
        </div>
        {editing ? (
          <Input.TextArea rows={3} defaultValue={session.summary} />
        ) : (
          <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>{session.summary}</Text>
        )}
      </Card>

      {/* H-SOAPIER sections */}
      <Text strong style={{ display: 'block', marginBottom: 16 }}>H-SOAPIER Chart</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SOAPIER_SECTIONS.map(({ key, letter, label, rows }) => {
          const value = (soapie as Record<string, string>)[key] || '';
          return (
            <Card key={key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {letterBadge(letter)}
                <Text strong>{label}</Text>
              </div>
              {editing ? (
                <Input.TextArea
                  rows={rows}
                  value={value}
                  onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              ) : value ? (
                <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{value}</Text>
              ) : (
                <Text type="secondary" italic>Not recorded</Text>
              )}
            </Card>
          );
        })}
      </div>

      {editing ? (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="text" size="small" style={{ color: '#49454F' }}>View Version History</Button>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="primary" onClick={() => { setEditing(false); messageApi.success('Chart updated successfully.'); }}>
                Save Updates
              </Button>
            </div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #F0F0F0' }}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete Session
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <Button onClick={() => router.push(`/patients/${id}/chart`)}>Back to Chart</Button>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        title="Delete Session?"
        footer={[
          <Button key="cancel" onClick={() => setDeleteOpen(false)}>Cancel</Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>Delete Session</Button>,
        ]}
      >
        <Text type="secondary">
          This will permanently delete <strong>{sessionLabel}</strong> for {patient.firstName} {patient.lastName}. This cannot be undone.
        </Text>
      </Modal>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
