'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { Avatar } from '@/components/base/avatar/avatar';
import { mockEmployees, mockPatients, mockClinicLocations } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import { useAvailableLocationIds } from '@/lib/locationScope';
import { useLocationOverrides, getEffectivePatientIdsForEmployee, transferPatient as transferPatientLocation, type PatientLocationState } from '@/lib/patientLocationStore';
import type { Patient, Employee } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { cx } from '@/utils/cx';
import { ArrowLeftRight, Calendar, Inbox, Mail, Pencil, Phone, User } from 'lucide-react';

function TransferDialog({
  open,
  patient,
  currentEmployee,
  locationOverrides,
  onClose,
  onTransfer,
}: {
  open: boolean;
  patient: Patient | null;
  currentEmployee: Employee;
  locationOverrides: Map<string, PatientLocationState>;
  onClose: () => void;
  onTransfer: (locationId: string, toEmployee: Employee) => void;
}) {
  const availableLocationIds = useAvailableLocationIds();
  const [locationId, setLocationId] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);

  useEffect(() => {
    if (open && patient) {
      const currentLocationId = locationOverrides.get(patient.id)?.locationId ?? '';
      setLocationId(availableLocationIds.includes(currentLocationId) ? currentLocationId : '');
      setSelected(null);
    }
  }, [open, patient, locationOverrides, availableLocationIds]);

  const locations = patient
    ? mockClinicLocations.filter((l) => l.orgId === patient.clinicId && availableLocationIds.includes(l.id))
    : [];
  const destinationLocation = mockClinicLocations.find((l) => l.id === locationId) ?? null;
  const otherEmployees = destinationLocation
    ? mockEmployees.filter((e) => destinationLocation.employeeIds.includes(e.id) && e.id !== currentEmployee.id && !e.archived)
    : [];

  const handleSelectLocation = (id: string) => {
    setLocationId(id);
    setSelected(null);
  };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal>
        <Dialog>
          <div className="p-6 w-full min-w-[420px]">
            <h3 className="text-lg font-semibold text-primary mb-3">Transfer Patient</h3>
            <p className="text-tertiary text-sm mb-4">
              Transfer <strong className="text-primary">{patient?.firstName} {patient?.lastName}</strong> to a clinic location and physiotherapist.
            </p>
            {locations.length === 0 ? (
              <p className="text-sm text-tertiary mb-4">No locations are available to you for this organization.</p>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <div className="mb-1 text-xs font-medium text-secondary">Location</div>
                  <NativeSelect
                    value={locationId}
                    onChange={(e) => handleSelectLocation(e.target.value)}
                  >
                    <option value="">Select a location</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} — {l.city}, {l.regionCountry}</option>
                    ))}
                  </NativeSelect>
                </div>
                {destinationLocation && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-secondary">Physiotherapist</div>
                    {otherEmployees.length === 0 ? (
                      <p className="text-sm text-tertiary">No other physiotherapists are staffed at this location.</p>
                    ) : (
                      <NativeSelect
                        value={selected?.id ?? ''}
                        onChange={(e) => setSelected(otherEmployees.find((emp) => emp.id === e.target.value) ?? null)}
                      >
                        <option value="" disabled>Select physiotherapist</option>
                        {otherEmployees.map((e) => (
                          <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.credentials}</option>
                        ))}
                      </NativeSelect>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button color="secondary" size="sm" onPress={onClose}>Cancel</Button>
              <Button
                color="primary"
                size="sm"
                isDisabled={!locationId || !selected}
                onPress={() => { if (selected) onTransfer(locationId, selected); }}
              >
                Transfer
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

type ArchiveReassignment = { locationId: string; employee: Employee | null };

function ArchiveEmployeeDialog({
  open,
  employee,
  assignedPatients,
  locationOverrides,
  onClose,
  onConfirm,
}: {
  open: boolean;
  employee: Employee;
  assignedPatients: Patient[];
  locationOverrides: Map<string, PatientLocationState>;
  onClose: () => void;
  onConfirm: (reassignments: Record<string, { locationId: string; employee: Employee }>) => void;
}) {
  const availableLocationIds = useAvailableLocationIds();
  const [reassignments, setReassignments] = useState<Record<string, ArchiveReassignment>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, ArchiveReassignment> = {};
      assignedPatients.forEach((p) => {
        const currentLocationId = locationOverrides.get(p.id)?.locationId ?? '';
        init[p.id] = { locationId: availableLocationIds.includes(currentLocationId) ? currentLocationId : '', employee: null };
      });
      setReassignments(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assignedPatients]);

  const locationsFor = (patient: Patient) =>
    mockClinicLocations.filter((l) => l.orgId === patient.clinicId && availableLocationIds.includes(l.id));
  const employeesFor = (locationId: string) => {
    const location = mockClinicLocations.find((l) => l.id === locationId);
    return location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && e.id !== employee.id && !e.archived) : [];
  };

  const setPatientLocation = (patientId: string, locationId: string) => {
    setReassignments((r) => ({ ...r, [patientId]: { locationId, employee: null } }));
  };
  const setPatientEmployee = (patientId: string, emp: Employee | null) => {
    setReassignments((r) => ({ ...r, [patientId]: { ...r[patientId], employee: emp } }));
  };

  const hasPatients = assignedPatients.length > 0;
  const allReassigned = assignedPatients.every((p) => reassignments[p.id]?.locationId && reassignments[p.id]?.employee);
  const canConfirm = !hasPatients || allReassigned;

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal>
        <Dialog>
          <div className="p-6 w-full min-w-[480px]">
            <h3 className="text-lg font-semibold text-primary mb-3">Archive Employee?</h3>
            {!hasPatients ? (
              <p className="text-tertiary text-sm mb-6">
                Are you sure you want to archive <strong className="text-primary">{employee.firstName} {employee.lastName}</strong>? They will be moved to the Archived tab and lose clinic access. You can restore them at any time.
              </p>
            ) : (
              <>
                <Alert type="warning" className="mb-6">
                  <strong>{employee.firstName} {employee.lastName}</strong> currently has {assignedPatients.length} assigned patient{assignedPatients.length !== 1 ? 's' : ''}. Select a new clinic location and physiotherapist for each before archiving.
                </Alert>
                <div className="flex flex-col gap-4 mb-6">
                  {assignedPatients.map((p) => {
                    const locations = locationsFor(p);
                    const rowLocationId = reassignments[p.id]?.locationId ?? '';
                    const rowEmployees = employeesFor(rowLocationId);
                    return (
                      <div key={p.id} className="flex flex-col gap-2 pb-4 border-b border-secondary last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
                            style={{ background: '#EDE7F6', color: '#6750A4' }}
                          >
                            {p.avatarInitials}
                          </div>
                          <span className="font-semibold text-primary text-sm">{p.firstName} {p.lastName}</span>
                        </div>
                        <div className="flex gap-3 pl-12">
                          <NativeSelect
                            wrapperClassName="flex-1"
                            value={rowLocationId}
                            onChange={(e) => setPatientLocation(p.id, e.target.value)}
                          >
                            <option value="" disabled>Location…</option>
                            {locations.map((l) => (
                              <option key={l.id} value={l.id}>{l.name} — {l.city}</option>
                            ))}
                          </NativeSelect>
                          <NativeSelect
                            wrapperClassName="flex-1"
                            value={reassignments[p.id]?.employee?.id ?? ''}
                            onChange={(e) => setPatientEmployee(p.id, rowEmployees.find((emp) => emp.id === e.target.value) ?? null)}
                          >
                            <option value="" disabled>Transfer to…</option>
                            {rowEmployees.map((e) => (
                              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                            ))}
                          </NativeSelect>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button color="secondary" size="sm" onPress={onClose}>Cancel</Button>
              <Button
                color="secondary-destructive"
                size="sm"
                isDisabled={!canConfirm}
                onPress={() => {
                  const result: Record<string, { locationId: string; employee: Employee }> = {};
                  assignedPatients.forEach((p) => {
                    const r = reassignments[p.id];
                    if (r?.locationId && r.employee) result[p.id] = { locationId: r.locationId, employee: r.employee };
                  });
                  onConfirm(result);
                }}
              >
                Archive Employee
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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
  const locationOverrides = useLocationOverrides();

  if (!emp) return <div className="p-8"><span className="text-tertiary text-sm">Employee not found.</span></div>;

  const assignedPatientIds = getEffectivePatientIdsForEmployee(emp, locationOverrides);
  const assignedPatients = mockPatients.filter((p) => assignedPatientIds.includes(p.id));

  const handleTransfer = (locationId: string, toEmployee: Employee) => {
    if (!transferPatient) return;
    const name = `${transferPatient.firstName} ${transferPatient.lastName}`;
    transferPatientLocation(transferPatient.id, locationId, toEmployee.id);
    setTransferPatient(null);
    toast.success(`${name} transferred to ${toEmployee.firstName} ${toEmployee.lastName}`);
  };

  const handleConfirmArchive = (reassignments: Record<string, { locationId: string; employee: Employee }>) => {
    Object.entries(reassignments).forEach(([patientId, { locationId, employee: toEmployee }]) => {
      transferPatientLocation(patientId, locationId, toEmployee.id);
    });
    setArchived(true);
    setArchiveDialogOpen(false);
    const count = Object.keys(reassignments).length;
    const msg = count > 0
      ? `${emp.firstName} ${emp.lastName} archived. ${count} patient${count !== 1 ? 's' : ''} transferred.`
      : `${emp.firstName} ${emp.lastName} has been archived.`;
    toast.warning(msg);
  };

  const handleRestore = () => {
    setArchived(false);
    toast.success(`${emp.firstName} ${emp.lastName} restored to active.`);
  };

  const handleEditContact = () => {
    setContactDraft({ ...savedContact });
    setEditingContact(true);
  };

  const handleSaveContact = () => {
    setSavedContact({ ...contactDraft });
    setEditingContact(false);
    toast.success('Contact information updated.');
  };

  const handleEditProfessional = () => {
    setProfessionalDraft({ ...savedProfessional });
    setEditingProfessional(true);
  };

  const handleSaveProfessional = () => {
    setSavedProfessional({ ...professionalDraft });
    setEditingProfessional(false);
    toast.success('Professional details updated.');
  };

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Employees', href: '/employees' }, { label: `${savedContact.firstName} ${savedContact.lastName}` }]} />
      <div className="p-8">

        {archived && (
          <Alert type="warning" className="mb-6 rounded-xl">
            This employee profile is archived. Restore it to re-activate their access.
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar
            size="2xl"
            src={emp.avatarUrl}
            alt={`${emp.firstName} ${emp.lastName}`}
            initials={emp.avatarInitials}
            className={cx('shrink-0', archived && 'opacity-60')}
          />
          <div className="grow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-primary m-0">{savedContact.firstName} {savedContact.lastName}</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#EDE7F6', color: '#6750A4' }}
              >
                {savedProfessional.credentials}
              </span>
            </div>
            <span className="block text-tertiary text-sm mb-2">{savedProfessional.title}</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Mail size={15} className="text-tertiary" />
                <span className="text-tertiary text-sm">{savedContact.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={15} className="text-tertiary" />
                <span className="text-tertiary text-sm">{savedContact.phone}</span>
              </div>
            </div>
          </div>
          {can.canManageStaff && (
            archived ? (
              <Button
                color="secondary"
                size="xs"
                iconLeading={Inbox}
                onPress={handleRestore}
                className="border-utility-warning-300 text-utility-warning-700"
              >
                Restore Employee
              </Button>
            ) : (
              <Button
                color="secondary"
                size="xs"
                iconLeading={Inbox}
                onPress={() => setArchiveDialogOpen(true)}
              >
                Archive Employee
              </Button>
            )
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary mb-6">
          {[
            { key: '0', label: 'Overview', count: null },
            { key: '1', label: 'Patients', count: assignedPatients.length },
            { key: '2', label: 'Details', count: null },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                'flex items-center gap-2 px-1 pb-3 pt-0 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                tab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-tertiary hover:text-secondary hover:border-secondary'
              )}
            >
              {label}
              {count !== null && (
                <span className={cx(
                  'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                  tab === key
                    ? 'bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200'
                    : 'bg-utility-neutral-50 text-utility-neutral-600 ring-utility-neutral-200'
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === '0' && (
          <div className="flex gap-6">
            <div className="flex-[2] flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <User size={20} className="text-brand-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary m-0 leading-none">{assignedPatients.length}</h2>
                      <span className="text-tertiary text-xs">Active Patients</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#0288D118' }}>
                      <Calendar size={20} style={{ color: '#0288D1' }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary m-0 leading-none">{new Date(emp.joinedAt).getFullYear()}</h2>
                      <span className="text-tertiary text-xs">Joined</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
                <span className="block font-semibold text-primary mb-3">About</span>
                <p className="text-tertiary text-sm leading-relaxed m-0">{emp.bio}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
                <span className="block font-semibold text-primary mb-3">Specialties</span>
                <div className="flex flex-wrap gap-1.5">
                  {emp.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full border border-secondary text-secondary bg-secondary_alt"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
                <span className="block font-semibold text-primary mb-3">Assigned Patients</span>
                {assignedPatients.length === 0 ? (
                  <span className="text-tertiary text-sm">No patients assigned.</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {assignedPatients.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-secondary_alt transition-colors"
                        onClick={() => router.push(`/patients/${p.id}/overview`)}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ background: '#EDE7F6', color: '#6750A4' }}
                        >
                          {p.avatarInitials}
                        </div>
                        <span className="font-semibold text-primary text-sm">{p.firstName} {p.lastName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {tab === '1' && (
          <div className="flex flex-col gap-3">
            {assignedPatients.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-tertiary text-sm">No patients assigned to {emp.firstName} yet.</span>
              </div>
            ) : (
              assignedPatients.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-secondary bg-primary shadow-xs hover:bg-secondary_alt transition-colors"
                >
                  <div className="flex items-center gap-5 px-6 py-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-base"
                      style={{ background: '#EDE7F6', color: '#6750A4' }}
                    >
                      {p.avatarInitials}
                    </div>
                    <div
                      className="grow cursor-pointer"
                      onClick={() => router.push(`/patients/${p.id}/overview`)}
                    >
                      <span className="block font-semibold text-primary text-sm mb-0.5">{p.firstName} {p.lastName}</span>
                      <span className="text-tertiary text-sm">{p.email}</span>
                    </div>
                    {can.canManageStaff && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          color="secondary"
                          size="xs"
                          iconLeading={ArrowLeftRight}
                          onPress={() => setTransferPatient(p)}
                        >
                          Transfer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Details Tab */}
        {tab === '2' && (
          <div className="max-w-[600px] flex flex-col gap-4">
            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-primary">Contact Information</span>
                {can.canManageStaff && !editingContact && (
                  <button onClick={handleEditContact} className="text-tertiary hover:text-secondary transition-colors p-1">
                    <Pencil size={15} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">First Name</div>
                    <Input
                      value={editingContact ? contactDraft.firstName : savedContact.firstName}
                      isReadOnly={!editingContact}
                      onChange={(v) => setContactDraft((d) => ({ ...d, firstName: v }))}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-secondary">Last Name</div>
                    <Input
                      value={editingContact ? contactDraft.lastName : savedContact.lastName}
                      isReadOnly={!editingContact}
                      onChange={(v) => setContactDraft((d) => ({ ...d, lastName: v }))}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Email</div>
                  <Input
                    value={editingContact ? contactDraft.email : savedContact.email}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, email: v }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Phone</div>
                  <Input
                    value={editingContact ? contactDraft.phone : savedContact.phone}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, phone: v }))}
                  />
                </div>
              </div>
              {editingContact && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button color="secondary" size="xs" onPress={() => setEditingContact(false)}>Cancel</Button>
                  <Button color="primary" size="xs" onPress={handleSaveContact}>Save</Button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-primary">Professional Details</span>
                {can.canManageStaff && !editingProfessional && (
                  <button onClick={handleEditProfessional} className="text-tertiary hover:text-secondary transition-colors p-1">
                    <Pencil size={15} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="mb-1 text-sm text-secondary">Title</div>
                  <Input
                    value={editingProfessional ? professionalDraft.title : savedProfessional.title}
                    isReadOnly={!editingProfessional}
                    onChange={(v) => setProfessionalDraft((d) => ({ ...d, title: v }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Credentials</div>
                  <Input
                    value={editingProfessional ? professionalDraft.credentials : savedProfessional.credentials}
                    isReadOnly={!editingProfessional}
                    onChange={(v) => setProfessionalDraft((d) => ({ ...d, credentials: v }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-sm text-secondary">Date Joined</div>
                  <Input
                    value={new Date(emp.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    isReadOnly
                  />
                </div>
              </div>
              {editingProfessional && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button color="secondary" size="xs" onPress={() => setEditingProfessional(false)}>Cancel</Button>
                  <Button color="primary" size="xs" onPress={handleSaveProfessional}>Save</Button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-secondary bg-primary shadow-xs p-6">
              <span className="block font-semibold text-primary mb-3">Specialties</span>
              <div className="flex flex-wrap gap-1.5">
                {emp.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full border border-secondary text-secondary bg-secondary_alt"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <TransferDialog
        open={!!transferPatient}
        patient={transferPatient}
        currentEmployee={emp}
        locationOverrides={locationOverrides}
        onClose={() => setTransferPatient(null)}
        onTransfer={handleTransfer}
      />

      <ArchiveEmployeeDialog
        open={archiveDialogOpen}
        employee={emp}
        assignedPatients={assignedPatients}
        locationOverrides={locationOverrides}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
      />
    </>
  );
}
