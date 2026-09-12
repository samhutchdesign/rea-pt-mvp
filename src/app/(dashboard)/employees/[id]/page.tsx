'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button as AriaButton } from 'react-aria-components';
import { Avatar } from '@/components/base/avatar/avatar';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { mockEmployees, mockPatients, mockClinicLocations } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useAvailableLocationIds, useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectivePatientIdsForEmployee, transferPatient as transferPatientLocation, type PatientLocationState } from '@/lib/patientLocationStore';
import type { Patient, Employee, UserRole } from '@/lib/types';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { cx } from '@/utils/cx';
import { ArrowLeftRight, ChevronRight, Crown, Inbox, Mail, MapPin, MoreHorizontal, Pencil, ShieldCheck, X } from 'lucide-react';
import { SearchMd } from '@untitledui/icons';

function BulkTransferDialog({
  open,
  patients,
  currentEmployee,
  onClose,
  onTransfer,
}: {
  open: boolean;
  patients: Patient[];
  currentEmployee: Employee;
  onClose: () => void;
  onTransfer: (locationId: string, toEmployee: Employee) => void;
}) {
  const availableLocationIds = useAvailableLocationIds();
  const [locationId, setLocationId] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);

  useEffect(() => {
    if (open) {
      setLocationId('');
      setSelected(null);
    }
  }, [open]);

  const locations = mockClinicLocations.filter((l) => l.orgId === currentEmployee.clinicId && availableLocationIds.includes(l.id));
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
            <h3 className="text-lg font-semibold text-primary mb-3">Transfer Patients</h3>
            <p className="text-tertiary text-sm mb-4">
              Transfer all <strong className="text-primary">{patients.length}</strong> of {currentEmployee.firstName} {currentEmployee.lastName}&apos;s patients to a clinic location and physiotherapist.
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
                isDisabled={!locationId || !selected || patients.length === 0}
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
                            style={{ background: '#D9E8E1', color: '#25382F' }}
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

function EmployeeHeaderMenu({
  archived,
  canArchive,
  canEditRole,
  onArchive,
  onRestore,
  onEditRole,
}: {
  archived: boolean;
  canArchive: boolean;
  canEditRole: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onEditRole: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!canArchive && !canEditRole) return null;

  const handleAction = (key: React.Key) => {
    if (key === 'archive') onArchive();
    if (key === 'restore') onRestore();
    if (key === 'edit-role') onEditRole();
  };

  return (
    <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label="More actions"
        className={cx(
          'flex size-12 items-center justify-center rounded-full border border-primary bg-primary text-primary transition-colors outline-none hover:bg-secondary',
          isOpen && 'bg-secondary',
        )}
      >
        <MoreHorizontal size={24} />
      </AriaButton>
      <Dropdown.Popover className="w-52">
        <Dropdown.Menu onAction={handleAction}>
          {canArchive && (archived
            ? <Dropdown.Item id="restore" icon={Inbox} label="Restore Employee" />
            : <Dropdown.Item id="archive" icon={Inbox} label="Archive" />
          )}
          {canEditRole && <Dropdown.Item id="edit-role" icon={ShieldCheck} label="Edit Role" />}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}

function EditRoleDialog({
  open,
  role,
  onClose,
  onSave,
}: {
  open: boolean;
  role: UserRole;
  onClose: () => void;
  onSave: (role: UserRole) => void;
}) {
  const [draft, setDraft] = useState<UserRole>(role);

  useEffect(() => {
    if (open) setDraft(role);
  }, [open, role]);

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal className="w-full max-w-md">
        <Dialog>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Edit Role</h3>
            <div className="mb-6">
              <div className="mb-1 text-sm text-secondary">Permissions</div>
              <NativeSelect value={draft} onChange={(e) => setDraft(e.target.value as UserRole)}>
                <option value="admin">Manager</option>
                <option value="editor">Practitioner</option>
                <option value="limited">Staff</option>
              </NativeSelect>
            </div>
            <div className="flex justify-end gap-2">
              <Button color="secondary" size="sm" onPress={onClose}>Cancel</Button>
              <Button color="primary" size="sm" onPress={() => onSave(draft)}>Save</Button>
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

  const [tab, setTab] = useState('overview');
  const [archived, setArchived] = useState(emp?.archived ?? false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [bulkTransferOpen, setBulkTransferOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [roleOverride, setRoleOverride] = useState<UserRole>(emp?.role ?? 'editor');

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
    specialties: emp?.specialties ?? [],
  });
  const [contactDraft, setContactDraft] = useState({ ...savedContact });
  const [professionalDraft, setProfessionalDraft] = useState({ ...savedProfessional });
  const can = usePermissions();
  const role = useRole();
  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();

  if (!emp) return <div className="p-8"><span className="text-tertiary text-sm">Employee not found.</span></div>;

  const isOwnProfile = role === 'owner' && currentIdentity.id === emp.id;

  const assignedPatientIds = getEffectivePatientIdsForEmployee(emp, locationOverrides);
  const assignedPatients = mockPatients.filter((p) => assignedPatientIds.includes(p.id));
  const empLocation = mockClinicLocations.find((l) => emp.locationIds.includes(l.id));
  const empLocationString = empLocation ? `${empLocation.city}, ${empLocation.regionCountry.split(',')[0].trim()}` : '—';

  const patientSearchLower = patientSearch.trim().toLowerCase();
  const filteredPatients = patientSearchLower === ''
    ? assignedPatients
    : assignedPatients.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearchLower) || p.email.toLowerCase().includes(patientSearchLower)
      );

  const handleBulkTransfer = (locationId: string, toEmployee: Employee) => {
    assignedPatients.forEach((p) => transferPatientLocation(p.id, locationId, toEmployee.id));
    setBulkTransferOpen(false);
    toast.success(`${assignedPatients.length} patient${assignedPatients.length !== 1 ? 's' : ''} transferred to ${toEmployee.firstName} ${toEmployee.lastName}.`);
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

  const handleChangeRole = (newRole: UserRole) => {
    setRoleOverride(newRole);
    const label = newRole === 'admin' ? 'Manager' : newRole === 'limited' ? 'Staff' : 'Practitioner';
    toast.success(`${emp.firstName} ${emp.lastName}'s permissions updated to ${label}.`);
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
    setSavedProfessional({ ...professionalDraft, specialties: professionalDraft.specialties.filter((s) => s.trim() !== '') });
    setEditingProfessional(false);
    toast.success('Professional details updated.');
  };

  const addSpecialty = () => {
    setProfessionalDraft((d) => ({ ...d, specialties: [...d.specialties, ''] }));
  };

  const updateSpecialty = (index: number, value: string) => {
    setProfessionalDraft((d) => ({ ...d, specialties: d.specialties.map((s, i) => (i === index ? value : s)) }));
  };

  const removeSpecialty = (index: number) => {
    setProfessionalDraft((d) => ({ ...d, specialties: d.specialties.filter((_, i) => i !== index) }));
  };

  return (
    <>
      <div className="p-10 flex flex-col gap-14">

        {archived && (
          <Alert type="warning" className="rounded-xl">
            This employee profile is archived. Restore it to re-activate their access.
          </Alert>
        )}

        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-5 mb-10">
            <div className="flex items-start gap-5">
              <Avatar
                size="2xl"
                src={emp.avatarUrl}
                alt={`${emp.firstName} ${emp.lastName}`}
                initials={emp.avatarInitials}
                className={cx('shrink-0 size-[100px]', archived && 'opacity-60')}
              />
              <div className="flex flex-col gap-4 py-3">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl leading-8 font-medium text-primary m-0">{savedContact.firstName} {savedContact.lastName}</h1>
                  <span className="text-base leading-5 text-secondary">{savedProfessional.credentials}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-base leading-5 text-primary">{savedProfessional.title}</span>
                  <div className="flex items-center gap-2">
                    <Mail size={24} className="text-tertiary" />
                    <span className="text-base leading-5 text-secondary">{savedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={24} className="text-tertiary" />
                    <span className="text-base leading-5 text-secondary">{empLocationString}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isOwnProfile && (
                <Button
                  color="secondary"
                  size="sm"
                  iconLeading={Crown}
                  onPress={() => router.push('/account/settings?transfer=1')}
                >
                  Transfer Ownership
                </Button>
              )}
              <EmployeeHeaderMenu
                archived={archived}
                canArchive={can.canArchiveEmployees}
                canEditRole={role === 'owner' && emp.role !== 'owner'}
                onArchive={() => setArchiveDialogOpen(true)}
                onRestore={handleRestore}
                onEditRole={() => setEditRoleOpen(true)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-10 border-b border-secondary">
            {[
              { key: 'overview', label: 'Overview', count: null },
              { key: 'details', label: 'Details', count: null },
              { key: 'patients', label: 'Patients', count: assignedPatients.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cx(
                  'flex items-center gap-2 pb-4 pt-0 text-base -mb-px border-b-[3px] transition-colors duration-100',
                  tab === key
                    ? 'border-b-[#9b9897] text-primary font-medium'
                    : 'border-transparent text-primary font-normal hover:text-secondary'
                )}
              >
                {label}
                {count !== null && (
                  <span className="inline-flex items-center justify-center rounded-full bg-tertiary px-2.5 py-0.5 text-xs text-primary">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="flex gap-10 items-start">
            <div className="flex-1 min-w-0 rounded-xl border border-primary bg-secondary_alt p-7 flex flex-col gap-5">
              <span className="font-display text-md font-medium text-primary tracking-[0.1px]">About</span>
              <p className="text-base leading-5 text-primary m-0">{emp.bio}</p>
            </div>
            <div className="flex flex-col gap-7 w-[395px] shrink-0">
              <div className="rounded-xl border border-primary bg-primary p-7 flex flex-col gap-5">
                <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Specialties</span>
                <div className="flex flex-wrap gap-4">
                  {savedProfessional.specialties.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-full bg-tertiary px-3 py-1.5 text-xs text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-primary bg-primary p-7 flex flex-col gap-4">
                <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Active Patients</span>
                <span className="font-display text-2xl leading-8 font-medium text-primary">{assignedPatients.length}</span>
              </div>
              <div className="rounded-xl border border-primary bg-primary p-7 flex flex-col gap-4">
                <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Joined</span>
                <span className="font-display text-2xl leading-8 font-medium text-primary">{new Date(emp.joinedAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {tab === 'patients' && (
          <div className="flex flex-col gap-4 w-full -mt-8">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  size="lg"
                  wrapperClassName="h-12 shadow-none ring-secondary"
                  icon={SearchMd}
                  placeholder="Search by name or email"
                  value={patientSearch}
                  onChange={setPatientSearch}
                />
              </div>
              {can.canManageStaff && (
                <Button
                  color="secondary"
                  size="lg"
                  iconLeading={ArrowLeftRight}
                  isDisabled={assignedPatients.length === 0}
                  onPress={() => setBulkTransferOpen(true)}
                >
                  Transfer Patients
                </Button>
              )}
            </div>

            {assignedPatients.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-tertiary text-sm">No patients assigned to {emp.firstName} yet.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_140px_120px_140px_24px] items-center gap-4 border-b border-secondary px-5 pb-3">
                  <span className="text-xs text-primary">Patient</span>
                  <span className="text-xs text-primary">Assigned Doctor</span>
                  <span className="text-xs text-primary">Location</span>
                  <span className="text-xs text-primary ml-4">Date Added</span>
                  <span />
                </div>

                {filteredPatients.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-tertiary text-sm">No patients match &quot;{patientSearch}&quot;.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/patients/${p.id}/overview`)}
                        className="grid grid-cols-[minmax(0,1fr)_140px_120px_140px_24px] items-center gap-4 rounded-lg border border-secondary bg-primary pl-5 pr-7 py-5 cursor-pointer hover:bg-secondary_alt transition-colors duration-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar size="lg" initials={p.avatarInitials} />
                          <div className="min-w-0 flex flex-col gap-2">
                            <p className="font-display text-md font-medium text-primary">{p.firstName} {p.lastName}</p>
                            <p className="text-xs text-primary">{p.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-primary whitespace-nowrap">{emp.firstName} {emp.lastName}</span>
                        <span className="w-fit rounded-full bg-secondary_alt px-3 py-1.5 text-xs text-primary whitespace-nowrap">
                          {p.location}
                        </span>
                        <span className="text-xs text-primary whitespace-nowrap ml-4">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <ChevronRight size={20} className="text-primary shrink-0 justify-self-end" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Details Tab */}
        {tab === 'details' && (
          <div className="max-w-[800px] flex flex-col gap-4">
            <div className="rounded-lg border border-[#cdcccb] bg-primary p-10 flex flex-col gap-7">
              <div className="flex justify-between items-center">
                <span className="font-display text-xl leading-5 font-medium text-primary">Contact Information</span>
                {can.canManageStaff && !editingContact && (
                  <button onClick={handleEditContact} className="text-tertiary hover:text-secondary transition-colors p-1">
                    <Pencil size={20} />
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">First Name</div>
                  <Input
                    value={editingContact ? contactDraft.firstName : savedContact.firstName}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, firstName: v }))}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">Last Name</div>
                  <Input
                    value={editingContact ? contactDraft.lastName : savedContact.lastName}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, lastName: v }))}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">Email</div>
                  <Input
                    value={editingContact ? contactDraft.email : savedContact.email}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, email: v }))}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">Phone</div>
                  <Input
                    value={editingContact ? contactDraft.phone : savedContact.phone}
                    isReadOnly={!editingContact}
                    onChange={(v) => setContactDraft((d) => ({ ...d, phone: v }))}
                  />
                </div>
              </div>
              {editingContact && (
                <div className="flex justify-end gap-2">
                  <Button color="secondary" size="sm" onPress={() => setEditingContact(false)}>Cancel</Button>
                  <Button color="primary" size="sm" onPress={handleSaveContact}>Save</Button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#cdcccb] bg-primary p-10 flex flex-col gap-7">
              <div className="flex justify-between items-center">
                <span className="font-display text-xl leading-5 font-medium text-primary">Professional Details</span>
                {can.canManageStaff && !editingProfessional && (
                  <button onClick={handleEditProfessional} className="text-tertiary hover:text-secondary transition-colors p-1">
                    <Pencil size={20} />
                  </button>
                )}
              </div>
              <div>
                <div className="mb-2 text-xs text-secondary">Date Joined</div>
                <Input
                  value={new Date(emp.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  isReadOnly
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">Title</div>
                  <Input
                    value={editingProfessional ? professionalDraft.title : savedProfessional.title}
                    isReadOnly={!editingProfessional}
                    onChange={(v) => setProfessionalDraft((d) => ({ ...d, title: v }))}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-xs text-secondary">Credentials / Degrees</div>
                  <Input
                    value={editingProfessional ? professionalDraft.credentials : savedProfessional.credentials}
                    isReadOnly={!editingProfessional}
                    onChange={(v) => setProfessionalDraft((d) => ({ ...d, credentials: v }))}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs text-secondary">Specialties</div>
                {editingProfessional ? (
                  <div className="flex flex-col gap-3 items-start">
                    {professionalDraft.specialties.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 w-full max-w-[350px]">
                        <span className="size-2 rounded-full bg-quaternary shrink-0" />
                        <Input
                          value={s}
                          onChange={(v) => updateSpecialty(i, v)}
                          className="flex-1"
                        />
                        <button onClick={() => removeSpecialty(i)} className="shrink-0 text-tertiary hover:text-secondary transition-colors p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <Button color="link-color" size="sm" onPress={addSpecialty}>+ Add Specialty</Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {savedProfessional.specialties.length === 0 ? (
                      <span className="text-sm text-tertiary">No specialties added.</span>
                    ) : (
                      savedProfessional.specialties.map((s) => (
                        <span key={s} className="inline-flex items-center rounded-full bg-tertiary px-3 py-1.5 text-xs text-primary">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
              {editingProfessional && (
                <div className="flex justify-end gap-2">
                  <Button color="secondary" size="sm" onPress={() => setEditingProfessional(false)}>Cancel</Button>
                  <Button color="primary" size="sm" onPress={handleSaveProfessional}>Save</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BulkTransferDialog
        open={bulkTransferOpen}
        patients={assignedPatients}
        currentEmployee={emp}
        onClose={() => setBulkTransferOpen(false)}
        onTransfer={handleBulkTransfer}
      />

      <ArchiveEmployeeDialog
        open={archiveDialogOpen}
        employee={emp}
        assignedPatients={assignedPatients}
        locationOverrides={locationOverrides}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
      />

      <EditRoleDialog
        open={editRoleOpen}
        role={roleOverride}
        onClose={() => setEditRoleOpen(false)}
        onSave={(newRole) => { handleChangeRole(newRole); setEditRoleOpen(false); }}
      />
    </>
  );
}
