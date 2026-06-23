'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Avatar, Button, Card, Tag, Tabs, Modal, Select, Input, Alert, App } from 'antd';
import TopBar from '@/components/layout/TopBar';
import { mockEmployees, mockPatients } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import type { Patient, Employee } from '@/lib/types';
import { ArrowLeftRight, Calendar, Inbox, Mail, Pencil, Phone, User } from 'lucide-react';

const { Title, Text } = Typography;

const AVATAR_COLORS: Record<string, string> = {
  emp1: '#6750A4',
  emp2: '#0288D1',
  emp3: '#2E7D32',
  emp4: '#F57C00',
};

function TransferDialog({
  open,
  patient,
  currentEmployee,
  onClose,
  onTransfer,
}: {
  open: boolean;
  patient: Patient | null;
  currentEmployee: Employee;
  onClose: () => void;
  onTransfer: (toEmployee: Employee) => void;
}) {
  const [selected, setSelected] = useState<Employee | null>(null);
  const otherEmployees = mockEmployees.filter((e) => e.id !== currentEmployee.id && !e.archived);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Transfer Patient"
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="transfer" type="primary" disabled={!selected} onClick={() => { if (selected) onTransfer(selected); }}>Transfer</Button>,
      ]}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Transfer <strong>{patient?.firstName} {patient?.lastName}</strong> to another physiotherapist.
      </Text>
      <Select
        showSearch
        placeholder="Select physiotherapist"
        style={{ width: '100%' }}
        value={selected?.id}
        onChange={(val) => setSelected(otherEmployees.find((e) => e.id === val) ?? null)}
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        options={otherEmployees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName} — ${e.credentials}` }))}
      />
    </Modal>
  );
}

function ArchiveEmployeeDialog({
  open,
  employee,
  assignedPatients,
  onClose,
  onConfirm,
}: {
  open: boolean;
  employee: Employee;
  assignedPatients: Patient[];
  onClose: () => void;
  onConfirm: (reassignments: Record<string, Employee>) => void;
}) {
  const [reassignments, setReassignments] = useState<Record<string, Employee | null>>({});
  const otherEmployees = mockEmployees.filter((e) => e.id !== employee.id && !e.archived);

  useEffect(() => {
    if (open) {
      const init: Record<string, Employee | null> = {};
      assignedPatients.forEach((p) => { init[p.id] = null; });
      setReassignments(init);
    }
  }, [open, assignedPatients]);

  const hasPatients = assignedPatients.length > 0;
  const allReassigned = assignedPatients.every((p) => reassignments[p.id] != null);
  const canConfirm = !hasPatients || allReassigned;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Archive Employee?"
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button
          key="archive"
          type="primary"
          disabled={!canConfirm}
          style={{ background: canConfirm ? '#FB8C00' : undefined, borderColor: canConfirm ? '#FB8C00' : undefined }}
          onClick={() => {
            const result: Record<string, Employee> = {};
            assignedPatients.forEach((p) => {
              if (reassignments[p.id]) result[p.id] = reassignments[p.id]!;
            });
            onConfirm(result);
          }}
        >
          Archive Employee
        </Button>,
      ]}
    >
      {!hasPatients ? (
        <Text type="secondary">
          Are you sure you want to archive <strong>{employee.firstName} {employee.lastName}</strong>? They will be moved to the Archived tab and lose clinic access. You can restore them at any time.
        </Text>
      ) : (
        <>
          <Alert
            type="warning"
            style={{ marginBottom: 24 }}
            message={<span><strong>{employee.firstName} {employee.lastName}</strong> currently has {assignedPatients.length} assigned patient{assignedPatients.length !== 1 ? 's' : ''}. Select a new physiotherapist for each before archiving.</span>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignedPatients.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar style={{ width: 36, height: 36, background: '#EDE7F6', color: '#6750A4', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {p.avatarInitials}
                </Avatar>
                <div style={{ minWidth: 130, flexShrink: 0 }}>
                  <Text strong>{p.firstName} {p.lastName}</Text>
                </div>
                <Select
                  placeholder="Transfer to…"
                  style={{ flex: 1 }}
                  value={reassignments[p.id]?.id}
                  status={reassignments[p.id] === null && allReassigned === false ? 'error' : undefined}
                  onChange={(val) => setReassignments((r) => ({ ...r, [p.id]: otherEmployees.find((e) => e.id === val) ?? null }))}
                  options={otherEmployees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { message: messageApi } = App.useApp();
  const emp = mockEmployees.find((e) => e.id === id);

  const [tab, setTab] = useState('0');
  const [archived, setArchived] = useState(emp?.archived ?? false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [transferPatient, setTransferPatient] = useState<Patient | null>(null);

  // Details tab edit state
  const [editingContact, setEditingContact] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(false);
  const [savedContact, setSavedContact] = useState({
    firstName: emp?.firstName ?? '',
    lastName: emp?.lastName ?? '',
    email: emp?.email ?? '',
    phone: emp?.phone ?? '',
  });
  const [savedProfessional, setSavedProfessional] = useState({
    title: emp?.title ?? '',
    credentials: emp?.credentials ?? '',
  });
  const [contactDraft, setContactDraft] = useState({ ...savedContact });
  const [professionalDraft, setProfessionalDraft] = useState({ ...savedProfessional });
  const can = usePermissions();

  if (!emp) return <div style={{ padding: 32 }}><Text>Employee not found.</Text></div>;

  const assignedPatients = mockPatients.filter((p) => emp.patientIds.includes(p.id));
  const bgColor = AVATAR_COLORS[emp.id] ?? '#6750A4';

  const handleTransfer = (toEmployee: Employee) => {
    const name = `${transferPatient?.firstName} ${transferPatient?.lastName}`;
    setTransferPatient(null);
    messageApi.success(`${name} transferred to ${toEmployee.firstName} ${toEmployee.lastName}`);
  };

  const handleConfirmArchive = (reassignments: Record<string, Employee>) => {
    setArchived(true);
    setArchiveDialogOpen(false);
    const count = Object.keys(reassignments).length;
    const msg = count > 0
      ? `${emp.firstName} ${emp.lastName} archived. ${count} patient${count !== 1 ? 's' : ''} transferred.`
      : `${emp.firstName} ${emp.lastName} has been archived.`;
    messageApi.warning(msg);
  };

  const handleRestore = () => {
    setArchived(false);
    messageApi.success(`${emp.firstName} ${emp.lastName} restored to active.`);
  };

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    messageApi.success('Contact information updated.');
  };

  const handleEditProfessional = () => {
    setProfessionalDraft({ ...savedProfessional });
    setEditingProfessional(true);
  };

  const handleSaveProfessional = () => {
    setSavedProfessional({ ...professionalDraft });
    setEditingProfessional(false);
    messageApi.success('Professional details updated.');
  };

  const fieldLabel = (label: string) => <div style={{ marginBottom: 4, fontSize: 13 }}>{label}</div>;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: `${savedContact.firstName} ${savedContact.lastName}` }]} />
      <div style={{ padding: '32px' }}>

        {archived && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
            message="This employee profile is archived. Restore it to re-activate their access."
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          <Avatar style={{ width: 72, height: 72, background: bgColor + '18', color: bgColor, fontWeight: 700, fontSize: 24, flexShrink: 0, opacity: archived ? 0.6 : 1 }}>
            {emp.avatarInitials}
          </Avatar>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Title level={2} style={{ margin: 0 }}>{savedContact.firstName} {savedContact.lastName}</Title>
              <Tag style={{ background: '#EDE7F6', color: '#6750A4', fontWeight: 600, border: 'none' }}>{savedProfessional.credentials}</Tag>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{savedProfessional.title}</Text>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={15} />
                <Text type="secondary">{savedContact.email}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={15} />
                <Text type="secondary">{savedContact.phone}</Text>
              </div>
            </div>
          </div>
          {can.canManageStaff && (
            archived ? (
              <Button icon={<Inbox />} size="small" onClick={handleRestore} style={{ borderColor: '#FB8C00', color: '#FB8C00' }}>
                Restore Employee
              </Button>
            ) : (
              <Button
                icon={<Inbox />}
                size="small"
                onClick={() => setArchiveDialogOpen(true)}
                style={{ color: '#49454F', borderColor: '#BDBDBD' }}
              >
                Archive Employee
              </Button>
            )
          )}
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={tab}
          onChange={setTab}
          style={{ marginBottom: 24 }}
          items={[
            { key: '0', label: 'Overview' },
            { key: '1', label: `Patients (${assignedPatients.length})` },
            { key: '2', label: 'Details' },
          ]}
        />

        {/* Overview Tab */}
        {tab === '0' && (
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Card style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#6750A418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <Title level={2} style={{ margin: 0, lineHeight: 1 }}>{assignedPatients.length}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>Active Patients</Text>
                    </div>
                  </div>
                </Card>
                <Card style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#0288D118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <Title level={2} style={{ margin: 0, lineHeight: 1 }}>{new Date(emp.joinedAt).getFullYear()}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>Joined</Text>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>About</Text>
                <Text type="secondary" style={{ lineHeight: 1.7 }}>{emp.bio}</Text>
              </Card>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Specialties</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {emp.specialties.map((s) => (
                    <Tag key={s} style={{ fontSize: 12 }}>{s}</Tag>
                  ))}
                </div>
              </Card>

              <Card>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Assigned Patients</Text>
                {assignedPatients.length === 0 ? (
                  <Text type="secondary">No patients assigned.</Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {assignedPatients.map((p) => (
                      <div
                        key={p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: 8, borderRadius: 8 }}
                        onClick={() => router.push(`/patients/${p.id}/overview`)}
                      >
                        <Avatar style={{ width: 32, height: 32, background: '#EDE7F6', color: '#6750A4', fontSize: 12, fontWeight: 600 }}>{p.avatarInitials}</Avatar>
                        <Text strong>{p.firstName} {p.lastName}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {tab === '1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assignedPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Text type="secondary">No patients assigned to {emp.firstName} yet.</Text>
              </div>
            ) : (
              assignedPatients.map((p) => (
                <Card key={p.id} hoverable styles={{ body: { padding: 0 } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px' }}>
                    <Avatar style={{ width: 48, height: 48, background: '#EDE7F6', color: '#6750A4', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {p.avatarInitials}
                    </Avatar>
                    <div style={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push(`/patients/${p.id}/overview`)}>
                      <Text strong style={{ display: 'block', marginBottom: 2 }}>{p.firstName} {p.lastName}</Text>
                      <Text type="secondary">{p.email}</Text>
                    </div>
                    {can.canManageStaff && (
                      <Button
                        size="small"
                        icon={<ArrowLeftRight />}
                        onClick={() => setTransferPatient(p)}
                        style={{ flexShrink: 0 }}
                      >
                        Transfer
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Details Tab */}
        {tab === '2' && (
          <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Contact Information</Text>
                {can.canManageStaff && !editingContact && (
                  <Button type="text" size="small" onClick={handleEditContact} icon={<Pencil />} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    {fieldLabel('First Name')}
                    <Input value={editingContact ? contactDraft.firstName : savedContact.firstName} readOnly={!editingContact} onChange={(e) => setContactDraft((d) => ({ ...d, firstName: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    {fieldLabel('Last Name')}
                    <Input value={editingContact ? contactDraft.lastName : savedContact.lastName} readOnly={!editingContact} onChange={(e) => setContactDraft((d) => ({ ...d, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  {fieldLabel('Email')}
                  <Input value={editingContact ? contactDraft.email : savedContact.email} readOnly={!editingContact} onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))} />
                </div>
                <div>
                  {fieldLabel('Phone')}
                  <Input value={editingContact ? contactDraft.phone : savedContact.phone} readOnly={!editingContact} onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))} />
                </div>
              </div>
              {editingContact && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <Button size="small" onClick={() => setEditingContact(false)}>Cancel</Button>
                  <Button size="small" type="primary" onClick={handleSaveContact}>Save</Button>
                </div>
              )}
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Professional Details</Text>
                {can.canManageStaff && !editingProfessional && (
                  <Button type="text" size="small" onClick={handleEditProfessional} icon={<Pencil />} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  {fieldLabel('Title')}
                  <Input value={editingProfessional ? professionalDraft.title : savedProfessional.title} readOnly={!editingProfessional} onChange={(e) => setProfessionalDraft((d) => ({ ...d, title: e.target.value }))} />
                </div>
                <div>
                  {fieldLabel('Credentials')}
                  <Input value={editingProfessional ? professionalDraft.credentials : savedProfessional.credentials} readOnly={!editingProfessional} onChange={(e) => setProfessionalDraft((d) => ({ ...d, credentials: e.target.value }))} />
                </div>
                <div>
                  {fieldLabel('Date Joined')}
                  <Input value={new Date(emp.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} readOnly />
                </div>
              </div>
              {editingProfessional && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                  <Button size="small" onClick={() => setEditingProfessional(false)}>Cancel</Button>
                  <Button size="small" type="primary" onClick={handleSaveProfessional}>Save</Button>
                </div>
              )}
            </Card>

            <Card>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Specialties</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {emp.specialties.map((s) => (
                  <Tag key={s} style={{ fontSize: 12 }}>{s}</Tag>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <TransferDialog
        open={!!transferPatient}
        patient={transferPatient}
        currentEmployee={emp}
        onClose={() => setTransferPatient(null)}
        onTransfer={handleTransfer}
      />

      <ArchiveEmployeeDialog
        open={archiveDialogOpen}
        employee={emp}
        assignedPatients={assignedPatients}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
      />
    </>
  );
}
