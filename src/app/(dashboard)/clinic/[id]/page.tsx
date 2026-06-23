'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Avatar, Button, Card, Input, Tag, Divider, Modal, App } from 'antd';
import {
  EnvironmentOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import { mockClinicLocations, mockClinic, mockEmployees, mockPatients } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';

const { Title, Text } = Typography;

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

export default function ClinicLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const can = usePermissions();

  const location = mockClinicLocations.find((l) => l.id === id);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    name: location?.name ?? '',
    city: location?.city ?? '',
    regionCountry: location?.regionCountry ?? '',
    address: location?.address ?? '',
    phone: location?.phone ?? '',
    email: location?.email ?? '',
    description: location?.description ?? '',
  });
  const [saved, setSaved] = useState({ ...form });

  if (!location) return null;

  const teamMembers = mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived);

  const handleSave = () => {
    setSaved({ ...form });
    setEditing(false);
    messageApi.success('Clinic profile updated.');
  };

  const handleCancel = () => {
    setForm({ ...saved });
    setEditing(false);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    router.push('/clinic');
  };

  const readOnly = !editing;
  const roStyle = readOnly ? { background: 'rgba(0,0,0,0.04)' } : undefined;
  const fieldLabel = (label: string) => <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Organization Profile', href: '/clinic' },
          { label: saved.name },
        ]}
      />
      <div style={{ padding: '32px', maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          <Avatar style={{ width: 72, height: 72, background: '#6750A4', color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <div style={{ flexGrow: 1 }}>
            <Text type="secondary" style={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
              {mockClinic.name}
            </Text>
            <Title level={2} style={{ marginTop: 2, marginBottom: 4 }}>{saved.name}</Title>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ fontSize: 15, color: '#49454F' }} />
                <Text type="secondary">{saved.city}, {saved.regionCountry}</Text>
              </div>
              {teamMembers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TeamOutlined style={{ fontSize: 15, color: '#49454F' }} />
                  <Text type="secondary">{teamMembers.length} physiotherapist{teamMembers.length !== 1 ? 's' : ''}</Text>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button size="small" icon={<ArrowLeftOutlined />} onClick={() => router.push('/clinic')}>
              Organization
            </Button>
            {can.canManageClinic && !editing && (
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Edit Clinic
              </Button>
            )}
            {editing && (
              <>
                <Button size="small" onClick={handleCancel}>Cancel</Button>
                <Button size="small" type="primary" onClick={handleSave}>Save Changes</Button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left: About + Contact + Danger Zone */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>About This Location</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>{fieldLabel('Clinic Name')}<Input value={form.name} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={roStyle} /></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>{fieldLabel('City')}<Input value={form.city} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} style={roStyle} /></div>
                  <div style={{ flex: 1 }}>{fieldLabel('Region / Country')}<Input value={form.regionCountry} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, regionCountry: e.target.value }))} style={roStyle} /></div>
                </div>
                <div>{fieldLabel('Description')}<Input.TextArea rows={4} value={form.description} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={roStyle} /></div>
              </div>
            </Card>

            <Card>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>Contact</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>{fieldLabel('Address')}<Input value={form.address} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={roStyle} /></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>{fieldLabel('Phone')}<Input value={form.phone} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={roStyle} /></div>
                  <div style={{ flex: 1 }}>{fieldLabel('Email')}<Input value={form.email} readOnly={readOnly} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={roStyle} /></div>
                </div>
              </div>
            </Card>

            {can.canManageClinic && (
              <Card style={{ border: '1px solid #FFCDD2' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5, fontSize: 12 }}>
                  Danger Zone
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong style={{ display: 'block' }}>Delete this clinic location</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>This will remove the location from the organization permanently.</Text>
                  </div>
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => setDeleteOpen(true)}>
                    Delete Location
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Team */}
          <div style={{ flex: 2 }}>
            <Card>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>
                Team {teamMembers.length > 0 ? `(${teamMembers.length})` : ''}
              </Text>
              {teamMembers.length === 0 ? (
                <Text type="secondary">No staff assigned to this location yet.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {teamMembers.map((emp, i) => {
                    const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';
                    const patientCount = mockPatients.filter((p) => emp.patientIds.includes(p.id)).length;
                    return (
                      <div key={emp.id}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', cursor: 'pointer', borderRadius: 8 }}
                          onClick={() => router.push(`/employees/${emp.id}`)}
                        >
                          <Avatar style={{ width: 40, height: 40, background: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {emp.avatarInitials}
                          </Avatar>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <Text strong ellipsis style={{ display: 'block' }}>{emp.firstName} {emp.lastName}</Text>
                            <Text type="secondary" ellipsis style={{ fontSize: 12 }}>{emp.credentials} · {emp.title}</Text>
                          </div>
                          <Tag style={{ background: '#EDE7F6', color: '#6750A4', fontSize: 11, fontWeight: 600, border: 'none' }}>{`${patientCount}p`}</Tag>
                        </div>
                        {i < teamMembers.length - 1 && <Divider style={{ margin: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Modal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        title="Delete Clinic Location?"
        footer={[
          <Button key="cancel" onClick={() => setDeleteOpen(false)}>Cancel</Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>Delete Location</Button>,
        ]}
      >
        <Text type="secondary">
          This will permanently remove <strong>{saved.name}</strong> from the organization. This cannot be undone.
        </Text>
      </Modal>
    </>
  );
}
