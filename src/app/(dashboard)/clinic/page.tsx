'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Avatar, Button, Card, Input, Tag, Divider, Modal, App } from 'antd';
import {
  EditOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';
import TopBar from '@/components/layout/TopBar';
import { mockClinic, mockClinicLocations, mockEmployees, mockPatients } from '@/lib/mock-data';
import type { ClinicLocation } from '@/lib/types';

const { Title, Text } = Typography;

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

const INITIAL_LOCATIONS: ClinicLocation[] = mockClinicLocations;

const fieldLabel = (label: string) => <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>;

export default function ClinicPage() {
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: mockClinic.name,
    address: mockClinic.address,
    phone: mockClinic.phone,
    email: mockClinic.email,
    website: mockClinic.website,
    description: mockClinic.description,
  });

  const [locations, setLocations] = useState<ClinicLocation[]>(INITIAL_LOCATIONS);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleSave = () => {
    setEditing(false);
    messageApi.success('Organization profile updated successfully!');
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    const parts = newLocation.trim().split(',').map((s) => s.trim());
    const city = parts[0] ?? newLocation.trim();
    const regionCountry = parts.slice(1).join(', ') || '';
    setLocations((prev) => [
      ...prev,
      {
        id: `loc-${Date.now()}`,
        orgId: 'clinic1',
        name: `${city} Clinic`,
        city,
        regionCountry,
        address: '',
        phone: '',
        email: '',
        description: '',
        employeeIds: [],
      },
    ]);
    setNewLocation('');
    setAddLocationOpen(false);
    messageApi.success('Location added.');
  };

  const contactItems: { icon: ComponentType<{ style?: React.CSSProperties }>; label: string }[] = [
    { icon: PhoneOutlined, label: mockClinic.phone },
    { icon: MailOutlined, label: mockClinic.email },
    { icon: GlobalOutlined, label: mockClinic.website },
    { icon: EnvironmentOutlined, label: mockClinic.address },
  ];

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Organization Profile' }]} />
      <div style={{ padding: '32px', maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <Avatar style={{ width: 72, height: 72, background: '#6750A4', color: '#fff', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
            {mockClinic.logoInitials}
          </Avatar>
          <div style={{ flexGrow: 1 }}>
            <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>{mockClinic.name}</Title>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ fontSize: 15, color: '#49454F' }} />
                <Text type="secondary">{locations.length} location{locations.length !== 1 ? 's' : ''}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShopOutlined style={{ fontSize: 15, color: '#49454F' }} />
                <Text type="secondary">{mockEmployees.length} physiotherapists</Text>
              </div>
            </div>
          </div>
          {!editing ? (
            <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit Organization</Button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="primary" onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left column */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>Organization Information</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>{fieldLabel('Organization Name')}<Input value={form.name} readOnly={!editing} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>{fieldLabel('Primary Address')}<Input value={form.address} readOnly={!editing} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>{fieldLabel('Phone')}<Input value={form.phone} readOnly={!editing} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div style={{ flex: 1 }}>{fieldLabel('Email')}<Input value={form.email} readOnly={!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div>{fieldLabel('Website')}<Input value={form.website} readOnly={!editing} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                <div>{fieldLabel('About the Organization')}<Input.TextArea rows={4} value={form.description} readOnly={!editing} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
            </Card>

            {/* Locations */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Locations</Text>
                <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => setAddLocationOpen(true)}>
                  Add Location
                </Button>
              </div>
              {locations.length === 0 ? (
                <Text type="secondary">No locations added yet.</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {locations.map((loc, i) => (
                    <div key={loc.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                        <EnvironmentOutlined style={{ fontSize: 18, color: '#49454F', flexShrink: 0 }} />
                        <div
                          style={{ flexGrow: 1, cursor: 'pointer' }}
                          onClick={() => router.push(`/clinic/${loc.id}`)}
                        >
                          <Text strong style={{ display: 'block' }}>{loc.name}</Text>
                          {loc.regionCountry && (
                            <Text type="secondary" style={{ fontSize: 12 }}>{loc.city}, {loc.regionCountry}</Text>
                          )}
                        </div>
                        <RightOutlined
                          style={{ fontSize: 14, color: '#49454F', cursor: 'pointer' }}
                          onClick={() => router.push(`/clinic/${loc.id}`)}
                        />
                      </div>
                      {i < locations.length - 1 && <Divider style={{ margin: 0 }} />}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Contact summary */}
            {!editing && (
              <Card>
                <Text strong style={{ display: 'block', marginBottom: 16 }}>Contact</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {contactItems.map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <Icon style={{ fontSize: 17, color: '#49454F', marginTop: 2, flexShrink: 0 }} />
                      <Text type="secondary">{label}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Team */}
          <div style={{ flex: 2 }}>
            <Card style={{ height: '100%' }}>
              <Text strong style={{ display: 'block', marginBottom: 16 }}>Team ({mockEmployees.length} employees)</Text>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {mockEmployees.map((emp, i) => {
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
                      {i < mockEmployees.length - 1 && <Divider style={{ margin: 0 }} />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Location Dialog */}
      <Modal
        open={addLocationOpen}
        onCancel={() => { setAddLocationOpen(false); setNewLocation(''); }}
        title="Add Location"
        footer={[
          <Button key="cancel" onClick={() => { setAddLocationOpen(false); setNewLocation(''); }}>Cancel</Button>,
          <Button key="add" type="primary" disabled={!newLocation.trim()} onClick={handleAddLocation}>Add Location</Button>,
        ]}
      >
        {fieldLabel('Location')}
        <Input
          placeholder="e.g. Toronto, ON, Canada"
          autoFocus
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onPressEnter={handleAddLocation}
        />
      </Modal>
    </>
  );
}
