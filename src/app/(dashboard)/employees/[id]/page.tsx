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
import { AlertTriangle, ArrowLeftRight, ChevronRight, Crown, Inbox, Mail, MapPin, MoreHorizontal, Pencil, ShieldCheck, X } from 'lucide-react';
import { SearchMd } from '@untitledui/icons';
import { ProgramStepper } from '@/components/programs/ProgramStepper';
import type { ClinicLocation } from '@/lib/types';

type TransferRow = { locationId: string; employee: Employee | null };

function PatientTransferTable({
  patients,
  rows,
  locations,
  currentEmployee,
  onRowLocationChange,
  onRowEmployeeChange,
}: {
  patients: Patient[];
  rows: Record<string, TransferRow>;
  locations: ClinicLocation[];
  currentEmployee: Employee;
  onRowLocationChange: (patientId: string, locationId: string) => void;
  onRowEmployeeChange: (patientId: string, emp: Employee | null) => void;
}) {
  const employeesFor = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    return location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && e.id !== currentEmployee.id && !e.archived) : [];
  };

  if (patients.length === 0) {
    return <p className="text-sm text-tertiary">No patients to reassign.</p>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-[minmax(0,1fr)_240px_240px] gap-4 border-b border-secondary px-5 pb-3">
        <span className="text-xs text-primary">Patient</span>
        <span className="text-xs text-primary">Assigned Doctor</span>
        <span className="text-xs text-primary">Location</span>
      </div>
      <div className="flex flex-col gap-4">
        {patients.map((p) => {
          const row = rows[p.id];
          const rowEmployees = employeesFor(row?.locationId ?? '');
          return (
            <div
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_240px_240px] items-center gap-4 rounded-lg border border-secondary bg-primary px-5 py-5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar size="md" initials={p.avatarInitials} />
                <span className="font-display text-md font-medium text-primary tracking-[0.1px] truncate">{p.firstName} {p.lastName}</span>
              </div>
              <NativeSelect
                value={row?.employee?.id ?? ''}
                disabled={!row?.locationId}
                onChange={(e) => onRowEmployeeChange(p.id, rowEmployees.find((emp) => emp.id === e.target.value) ?? null)}
              >
                <option value="" disabled>Transfer to…</option>
                {rowEmployees.map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </NativeSelect>
              <NativeSelect
                value={row?.locationId ?? ''}
                onChange={(e) => onRowLocationChange(p.id, e.target.value)}
              >
                <option value="" disabled>Location…</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} — {l.city}</option>
                ))}
              </NativeSelect>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BulkTransferDialog({
  open,
  patients,
  currentEmployee,
  locationOverrides,
  onClose,
  onApply,
}: {
  open: boolean;
  patients: Patient[];
  currentEmployee: Employee;
  locationOverrides: Map<string, PatientLocationState>;
  onClose: () => void;
  onApply: (transfers: Record<string, { locationId: string; employee: Employee }>) => void;
}) {
  const availableLocationIds = useAvailableLocationIds();
  const [rows, setRows] = useState<Record<string, TransferRow>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, TransferRow> = {};
      patients.forEach((p) => {
        const currentLocationId = locationOverrides.get(p.id)?.locationId ?? '';
        init[p.id] = { locationId: availableLocationIds.includes(currentLocationId) ? currentLocationId : '', employee: null };
      });
      setRows(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patients]);

  const locations = mockClinicLocations.filter((l) => l.orgId === currentEmployee.clinicId && availableLocationIds.includes(l.id));

  const setRowLocation = (patientId: string, locationId: string) => {
    setRows((r) => ({ ...r, [patientId]: { locationId, employee: null } }));
  };
  const setRowEmployee = (patientId: string, emp: Employee | null) => {
    setRows((r) => ({ ...r, [patientId]: { ...r[patientId], employee: emp } }));
  };

  const readyCount = patients.filter((p) => rows[p.id]?.locationId && rows[p.id]?.employee).length;

  const handleApply = () => {
    const result: Record<string, { locationId: string; employee: Employee }> = {};
    patients.forEach((p) => {
      const row = rows[p.id];
      if (row?.locationId && row.employee) result[p.id] = { locationId: row.locationId, employee: row.employee };
    });
    onApply(result);
  };

  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal className="w-full max-w-[980px]">
        <Dialog>
          <div className="p-10 flex flex-col gap-10">
            <div className="relative flex items-center justify-between">
              <Button color="secondary" size="lg" onPress={onClose}>Cancel</Button>
              <h2 className="absolute left-1/2 -translate-x-1/2 font-display text-2xl leading-8 font-medium text-primary m-0 whitespace-nowrap">
                Transfer Patients
              </h2>
              <Button color="primary" size="lg" isDisabled={readyCount === 0} onPress={handleApply}>
                Apply Transfers
              </Button>
            </div>

            <PatientTransferTable
              patients={patients}
              rows={rows}
              locations={locations}
              currentEmployee={currentEmployee}
              onRowLocationChange={setRowLocation}
              onRowEmployeeChange={setRowEmployee}
            />
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function ArchiveFlow({
  open,
  employee,
  patients,
  locationOverrides,
  onClose,
  onConfirm,
}: {
  open: boolean;
  employee: Employee;
  patients: Patient[];
  locationOverrides: Map<string, PatientLocationState>;
  onClose: () => void;
  onConfirm: (transfers: Record<string, { locationId: string; employee: Employee }>) => void;
}) {
  const availableLocationIds = useAvailableLocationIds();
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<Record<string, TransferRow>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, TransferRow> = {};
      patients.forEach((p) => {
        const currentLocationId = locationOverrides.get(p.id)?.locationId ?? '';
        init[p.id] = { locationId: availableLocationIds.includes(currentLocationId) ? currentLocationId : '', employee: null };
      });
      setRows(init);
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patients]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  const locations = mockClinicLocations.filter((l) => l.orgId === employee.clinicId && availableLocationIds.includes(l.id));
  const setRowLocation = (patientId: string, locationId: string) => setRows((r) => ({ ...r, [patientId]: { locationId, employee: null } }));
  const setRowEmployee = (patientId: string, emp: Employee | null) => setRows((r) => ({ ...r, [patientId]: { ...r[patientId], employee: emp } }));

  const reassignedCount = patients.filter((p) => rows[p.id]?.locationId && rows[p.id]?.employee).length;
  const allReassigned = patients.length === 0 || reassignedCount === patients.length;

  const handleConfirm = () => {
    const result: Record<string, { locationId: string; employee: Employee }> = {};
    patients.forEach((p) => {
      const row = rows[p.id];
      if (row?.locationId && row.employee) result[p.id] = { locationId: row.locationId, employee: row.employee };
    });
    onConfirm(result);
  };

  return (
    <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] bg-primary flex flex-col overflow-hidden">
      <div className="flex flex-col items-center gap-7 border-b border-secondary px-10 pt-4 pb-9 shrink-0">
        <div className="flex items-center justify-between w-full">
          <Button color="secondary" size="lg" onPress={onClose}>Cancel</Button>
          <h1 className="font-display text-[32px] leading-[32px] font-normal text-primary m-0">
            Archive {employee.firstName} {employee.lastName}
          </h1>
          {step === 0 ? (
            <Button color="primary" size="lg" isDisabled={!allReassigned} onPress={() => setStep(1)}>
              Next
            </Button>
          ) : (
            <Button color="secondary-destructive" size="lg" iconLeading={AlertTriangle} onPress={handleConfirm}>
              Confirm Archive
            </Button>
          )}
        </div>
        <ProgramStepper
          steps={['Transfer Patients', 'Confirm Archive']}
          currentStep={step}
          maxReachedStep={step}
          onStepClick={setStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-10">
        {step === 0 ? (
          <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
            <span className="text-xs text-primary">{reassignedCount} out of {patients.length} Patients Reassigned</span>
            <PatientTransferTable
              patients={patients}
              rows={rows}
              locations={locations}
              currentEmployee={employee}
              onRowLocationChange={setRowLocation}
              onRowEmployeeChange={setRowEmployee}
            />
          </div>
        ) : (
          <div className="max-w-[800px] mx-auto rounded-xl border p-7 flex flex-col gap-7" style={{ background: '#f7eded', borderColor: '#993335' }}>
            <h2 className="font-display text-2xl leading-8 font-medium m-0" style={{ color: '#993335' }}>
              Are you sure you want to archive and transfer?
            </h2>
            <p className="text-base leading-5 m-0" style={{ color: '#592626' }}>
              Once the patients are transferred, they will be sent notifications of their new practitioner and the practitioner will be sent to archive. Archive is only accessible to administrators of the clinic. <strong>The practitioner will no longer have access to their profile or their patients.</strong>
            </p>
          </div>
        )}
      </div>
    </div>
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

  const handleApplyBulkTransfer = (transfers: Record<string, { locationId: string; employee: Employee }>) => {
    Object.entries(transfers).forEach(([patientId, { locationId, employee: toEmployee }]) => {
      transferPatientLocation(patientId, locationId, toEmployee.id);
    });
    setBulkTransferOpen(false);
    const count = Object.keys(transfers).length;
    toast.success(`${count} patient${count !== 1 ? 's' : ''} transferred.`);
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
        locationOverrides={locationOverrides}
        onClose={() => setBulkTransferOpen(false)}
        onApply={handleApplyBulkTransfer}
      />

      <ArchiveFlow
        open={archiveDialogOpen}
        employee={emp}
        patients={assignedPatients}
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
