'use client';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Card, Button, Tag, Avatar, Modal, Select, Alert, App } from 'antd';
import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { mockPatients, mockChartSessions, mockPrograms, mockExercises, mockEmployees, mockClinic } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import type { Employee } from '@/lib/types';
import { useViewMode } from '@/lib/viewModeStore';
import { ArrowLeftRight, Building2, Calendar, Plus, Zap } from 'lucide-react';

const { Title, Text } = Typography;

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message: messageApi } = App.useApp();
  const [uploadBannerDismissed, setUploadBannerDismissed] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') messageApi.success('Success! The patient has received their documents.');
  }, [searchParams, messageApi]);

  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const patient = mockPatients.find((p) => p.id === id);
  const showUploadBanner = searchParams.get('uploaded') === 'true' && !uploadBannerDismissed;
  const uploadedData = getUploadedData(id);
  const sessions = mockChartSessions[id] ?? [];
  const latestSession = sessions.filter((s) => !s.isIntakeSession)[0];
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const assignedEmployees = patient ? mockEmployees.filter((e) => patient.assignedEmployeeIds.includes(e.id)) : [];
  const can = usePermissions();
  const viewMode = useViewMode();

  const avgAdherence = (() => {
    if (!program) return null;
    const vals = program.exercises.map((e) => e.adherence).filter((v): v is number => v != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();

  const stats: { label: string; value: number | string; icon: ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>; color: string }[] = [
    { label: 'Total Sessions', value: sessions.length, icon: Calendar, color: '#0288D1' },
    { label: 'Exercises in Program', value: program ? program.exercises.length : '—', icon: Zap, color: '#F57C00' },
    ...(viewMode === 'full' && avgAdherence != null
      ? [{ label: 'Avg. Adherence', value: `${avgAdherence}%`, icon: Zap, color: avgAdherence >= 80 ? '#2E7D32' : avgAdherence >= 60 ? '#F57F17' : '#C62828' }]
      : []),
  ];

  if (!patient) return null;

  return (
    <>
      {showUploadBanner && (
        <Alert
          type="success"
          closable
          onClose={() => setUploadBannerDismissed(true)}
          style={{ marginBottom: 24 }}
          message={<Text strong>Profile updated from PDF</Text>}
          description={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {uploadedData
                ? `${Object.keys(uploadedData).length} fields confirmed — ${uploadedData.firstName} ${uploadedData.lastName}'s profile has been updated. Review the details in the Details tab.`
                : '7 fields pre-filled from uploaded document. Review the updated information in the Details tab.'}
            </Text>
          }
        />
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, lineHeight: 1 }}>{value}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Recent Session */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>Latest Session</Text>
            <Button size="small" type="primary" icon={<Plus />} onClick={() => router.push(`/patients/${id}/chart/new`)}>
              Add to Chart
            </Button>
          </div>
          {latestSession ? (
            <>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {latestSession.painLevel && <Tag>{latestSession.painLevel}</Tag>}
                {latestSession.improvementLevel && <Tag>{latestSession.improvementLevel}</Tag>}
              </div>
              <Button type="link" size="small" style={{ padding: 0, fontSize: '0.75rem' }} onClick={() => router.push(`/patients/${id}/chart`)}>
                See all sessions →
              </Button>
            </>
          ) : (
            <Text type="secondary">No sessions recorded yet.</Text>
          )}
        </Card>

        {/* Current Program */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>Current Program</Text>
            <Button size="small" type="text" onClick={() => router.push(`/patients/${id}/program`)}>View Program</Button>
          </div>
          {program ? (
            <>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{program.name}</Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{program.exercises.length} exercises</Text>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {program.exercises.map((pe) => {
                  const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                  if (!ex) return null;
                  return (
                    <div key={pe.exerciseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <Text style={{ fontSize: 12 }}>{ex.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{pe.reps} reps · {pe.sets} sets</Text>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>No program assigned yet.</Text>
              <Button size="small" onClick={() => router.push(`/patients/${id}/program`)}>
                Assign Program
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Care Team */}
      <Card style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text strong>Care Team</Text>
          {can.canTransferPatient && (
            <Button size="small" icon={<ArrowLeftRight />} onClick={() => setTransferOpen(true)}>
              Transfer Patient
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {assignedEmployees.map((emp) => (
            <div
              key={emp.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', minWidth: 220 }}
              onClick={() => router.push(`/employees/${emp.id}`)}
            >
              <Avatar style={{ width: 40, height: 40, background: '#EDE7F6', color: '#6750A4', fontWeight: 700, fontSize: 14 }}>
                {emp.avatarInitials}
              </Avatar>
              <div>
                <Text strong style={{ display: 'block' }}>{emp.firstName} {emp.lastName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{emp.credentials} · {emp.title}</Text>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/clinic')}>
          <Building2 size={16} />
          <Text style={{ color: '#6750A4', textDecoration: 'underline' }}>{mockClinic.name}</Text>
        </div>
      </Card>

      {/* Transfer Patient Dialog */}
      <Modal
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        title="Transfer Patient"
        footer={[
          <Button key="cancel" onClick={() => { setTransferOpen(false); setSelectedEmployee(null); }}>Cancel</Button>,
          <Button
            key="transfer"
            type="primary"
            disabled={!selectedEmployee}
            onClick={() => { setTransferOpen(false); setSelectedEmployee(null); messageApi.success('Success! The patient has received their documents.'); }}
          >
            Transfer
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Reassign <strong>{patient?.firstName} {patient?.lastName}</strong> to another physiotherapist.
        </Text>
        <Select
          showSearch
          placeholder="Select physiotherapist"
          style={{ width: '100%' }}
          value={selectedEmployee?.id}
          onChange={(val) => setSelectedEmployee(mockEmployees.find((e) => e.id === val) ?? null)}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          options={mockEmployees
            .filter((e) => !patient?.assignedEmployeeIds.includes(e.id))
            .map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName} — ${e.credentials}` }))}
        />
      </Modal>
    </>
  );
}
