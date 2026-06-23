'use client';
import { useState, useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Typography, Tabs, Button, Tag, Alert, Modal, Input, Select, Divider, App } from 'antd';
import {
  MailOutlined,
  EnvironmentOutlined,
  EditOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import TopBar from '@/components/layout/TopBar';
import { mockPatients, mockClinicLocations } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import { useYourEmpId } from '@/lib/locationScope';
import { clearUploadedData } from '@/lib/uploadStore';

const { Title, Text } = Typography;

const patientTabs = [
  { label: 'Overview', path: 'overview' },
  { label: 'Details', path: 'details' },
  { label: 'Program', path: 'program' },
  { label: 'Chart', path: 'chart' },
  { label: 'Contact', path: 'contact' },
];

function conditionLabel(mechanism: string | undefined): string | null {
  if (!mechanism) return null;
  return mechanism.length > 32 ? mechanism.slice(0, 32).replace(/\s\S*$/, '') + '…' : mechanism;
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const patient = mockPatients.find((p) => p.id === id);

  const [archived, setArchived] = useState(patient?.archived ?? false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: patient?.firstName ?? '',
    lastName: patient?.lastName ?? '',
    email: patient?.email ?? '',
    locationId: mockClinicLocations.find((l) => patient?.location.includes(l.city))?.id ?? '',
  });

  const can = usePermissions();
  const yourEmpId = useYourEmpId();
  const isYourPatient = yourEmpId !== null && (patient?.assignedEmployeeIds ?? []).includes(yourEmpId);
  const canEdit = can.canArchivePatient || isYourPatient;
  const activeTab = patientTabs.findIndex((t) => pathname.includes(`/${t.path}`));
  const currentTab = patientTabs[activeTab] ?? patientTabs[0];

  useEffect(() => {
    return () => { clearUploadedData(id); };
  }, [id]);

  if (!patient) {
    return (
      <div style={{ paddingTop: 56, padding: 32 }}>
        <Text>Patient not found.</Text>
      </div>
    );
  }

  const chip = conditionLabel(patient.injuryHistory?.mechanism);

  const handleArchive = () => {
    setArchived(true);
    setEditOpen(false);
    setConfirmArchiveOpen(false);
    messageApi.warning(`${patient.firstName} ${patient.lastName} has been archived.`);
  };

  const handleRestore = () => {
    setArchived(false);
    messageApi.success(`${patient.firstName} ${patient.lastName} restored to active.`);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(false);
    router.push('/patients');
  };

  const handleSaveProfile = () => {
    setEditOpen(false);
    messageApi.success('Profile updated successfully.');
  };

  const selectedIndex = activeTab === -1 ? 0 : activeTab;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'All Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${id}/overview` },
          { label: currentTab.label },
        ]}
      />
      <div style={{ paddingTop: 56 }}>
        {archived && (
          <Alert
            type="warning"
            showIcon
            style={{ borderRadius: 0, padding: '8px 32px' }}
            message="This patient profile is archived. Restore it to resume active management."
          />
        )}

        <div style={{ padding: '32px 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            <Avatar style={{ width: 64, height: 64, background: '#EDE7F6', color: '#6750A4', fontWeight: 700, fontSize: 22, opacity: archived ? 0.6 : 1, marginTop: 4 }}>
              {patient.avatarInitials}
            </Avatar>
            <div style={{ flexGrow: 1 }}>
              <Title level={2} style={{ margin: 0 }}>{patient.firstName} {patient.lastName}</Title>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MailOutlined style={{ fontSize: 15, color: '#49454F' }} />
                  <Text type="secondary">{patient.email}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EnvironmentOutlined style={{ fontSize: 15, color: '#49454F' }} />
                  <Text type="secondary">{patient.location}</Text>
                </div>
              </div>
              {chip && (
                <div style={{ marginTop: 8 }}>
                  <Tag style={{ background: '#EDE7F6', color: '#6750A4', border: 'none', fontSize: '0.72rem', fontWeight: 500 }}>
                    {chip}
                  </Tag>
                </div>
              )}
            </div>

            {can.canArchivePatient && archived && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  icon={<InboxOutlined />}
                  size="small"
                  onClick={handleRestore}
                  style={{ borderColor: '#FB8C00', color: '#FB8C00' }}
                >
                  Restore Patient
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  Delete Patient
                </Button>
              </div>
            )}
            {canEdit && !archived && (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditForm({ firstName: patient.firstName, lastName: patient.lastName, email: patient.email, locationId: mockClinicLocations.find((l) => patient.location.includes(l.city))?.id ?? '' });
                  setEditOpen(true);
                }}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <Tabs
            activeKey={String(selectedIndex)}
            style={{ marginBottom: 0 }}
            items={patientTabs.map((tab, i) => ({
              key: String(i),
              label: <Link href={`/patients/${id}/${tab.path}`} style={{ color: 'inherit' }}>{tab.label}</Link>,
            }))}
          />
        </div>

        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        title="Edit Profile"
        footer={[
          <Button key="cancel" onClick={() => setEditOpen(false)}>Cancel</Button>,
          <Button key="save" type="primary" onClick={handleSaveProfile}>Save Changes</Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4, fontSize: 13 }}>First Name</div>
              <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4, fontSize: 13 }}>Last Name</div>
              <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 13 }}>Email</div>
            <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 13 }}>Location</div>
            <Select
              style={{ width: '100%' }}
              value={editForm.locationId || undefined}
              onChange={(val) => setEditForm((f) => ({ ...f, locationId: val }))}
              options={mockClinicLocations.map((loc) => ({ value: loc.id, label: `${loc.name} — ${loc.city}, ${loc.regionCountry}` }))}
            />
          </div>

          {can.canArchivePatient && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5, fontSize: 12 }}>
                  Danger Zone
                </Text>
                <Button
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={() => setConfirmArchiveOpen(true)}
                  style={{ borderColor: '#FB8C00', color: '#FB8C00' }}
                >
                  Archive Patient
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Archive Confirmation */}
      <Modal
        open={confirmArchiveOpen}
        onCancel={() => setConfirmArchiveOpen(false)}
        title="Archive Patient?"
        footer={[
          <Button key="cancel" onClick={() => setConfirmArchiveOpen(false)}>Cancel</Button>,
          <Button key="archive" type="primary" onClick={handleArchive} style={{ background: '#FB8C00', borderColor: '#FB8C00' }}>Archive Patient</Button>,
        ]}
      >
        <Text type="secondary">
          <strong>{patient.firstName} {patient.lastName}</strong> will be moved to the Archived tab and removed from your active patient list. You can restore them at any time.
        </Text>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        title="Permanently Delete Patient?"
        footer={[
          <Button key="cancel" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>Delete Patient</Button>,
        ]}
      >
        <Text type="secondary">
          This will permanently delete <strong>{patient.firstName} {patient.lastName}</strong> and all associated records. This cannot be undone.
        </Text>
      </Modal>
    </>
  );
}
