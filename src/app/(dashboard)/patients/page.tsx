'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import AddPatientDialog from '@/components/patients/AddPatientDialog';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Input } from '@/components/base/input/input';
import { cx } from '@/utils/cx';
import { mockChartSessions, mockClinicLocations, mockEmployees } from '@/lib/mock-data';
import { useLocationScope, useYourEmpId, useAvailableLocationIds } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveLocationString, getEffectiveAssignedEmployeeId, transferPatient } from '@/lib/patientLocationStore';
import { useContactOverrides, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { useRole } from '@/lib/roleStore';
import { useViewMode } from '@/lib/viewModeStore';
import { useDataState } from '@/lib/dataStateStore';
import { EmptyState } from '@/components/ui/empty-state';
import { NativeSelect } from '@/components/ui/native-select';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import type { Patient } from '@/lib/types';
import { ChevronRight, Plus, RefreshCcw01, SearchMd, User01 } from '@untitledui/icons';

function computeEstimatedNext(patientId: string): number {
  const sessions = mockChartSessions[patientId] ?? [];
  if (sessions.length === 0) return Infinity;
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const lastTs = new Date(sorted[sorted.length - 1].date + 'T12:00:00').getTime();
  let avgGapDays: number;
  if (sorted.length === 1) {
    avgGapDays = 14;
  } else {
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      total += (new Date(sorted[i].date + 'T12:00:00').getTime() - new Date(sorted[i - 1].date + 'T12:00:00').getTime()) / 86400000;
    }
    avgGapDays = total / (sorted.length - 1);
  }
  return lastTs + avgGapDays * 86400000;
}

function conditionChip(patient: Patient): string | null {
  const text = patient.injuryHistory?.mechanism;
  if (!text) return null;
  return text.length > 32 ? text.slice(0, 32).replace(/\s\S*$/, '') + '…' : text;
}

function sessionInfo(patient: Patient): { lastSeen: string | null; count: number } {
  const sessions = mockChartSessions[patient.id] ?? [];
  if (!sessions.length) return { lastSeen: null, count: 0 };
  const latest = sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastSeen = new Date(latest.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { lastSeen, count: sessions.length };
}

const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'a-z', label: 'A → Z' },
  { value: 'z-a', label: 'Z → A' },
  { value: 'location', label: 'Location' },
  { value: 'practitioner', label: 'Practitioner' },
];

export default function PatientsPage() {
  const router = useRouter();
  const dataState = useDataState();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('newest');
  const [addOpen, setAddOpen] = useState(false);
  const [localPatients, setLocalPatients] = useState<Record<string, boolean>>({});

  const { patients: scopedPatients } = useLocationScope();
  const yourEmpId = useYourEmpId();
  const viewMode = useViewMode();
  const role = useRole();
  const locationOverrides = useLocationOverrides();
  const contactOverrides = useContactOverrides();
  const availableLocationIds = useAvailableLocationIds();

  const MVP_HIDDEN = new Set(['pat8', 'pat1']);
  const patients = scopedPatients
    .filter((p) => !(viewMode === 'mvp' && MVP_HIDDEN.has(p.id)))
    .map((p) => p.id in localPatients ? { ...p, archived: localPatients[p.id] } : p);

  const yourPatients = yourEmpId
    ? patients.filter((p) => !p.archived && getEffectiveAssignedEmployeeId(p, locationOverrides) === yourEmpId)
    : [];
  const allActive = patients.filter((p) => !p.archived);
  const archived = patients.filter((p) => p.archived);

  // "User: Staff" (Limited Access) behaves like Owner/Admin here: All + Archived, no Your Patients.
  const isStaffPersona = role === 'limited';
  const isManagerView = role === 'owner' || role === 'admin';
  const gridCols = isManagerView
    ? 'grid-cols-[minmax(0,1fr)_140px_120px_140px_24px]'
    : 'grid-cols-[minmax(0,1fr)_120px_140px_24px]';
  // Practitioners (editor role) only see patients assigned to them — no "All" tab, and useYourEmpId
  // already returns null for Owner/Limited so showYoursTab naturally excludes them too.
  const showYoursTab = yourEmpId !== null;
  const showAllTab = role !== 'editor';
  const showArchivedTab = role !== 'editor';

  const sections = [
    ...(showYoursTab ? [{ list: yourPatients, label: 'Your Patients', searchPlaceholder: 'Search your patients…', emptyMessage: 'No patients assigned to you yet' }] : []),
    ...(showAllTab ? [{ list: allActive, label: 'All', searchPlaceholder: 'Search all patients…', emptyMessage: 'No active patients found' }] : []),
    ...(showArchivedTab ? [{ list: archived, label: 'Archived', searchPlaceholder: 'Search archived patients…', emptyMessage: 'No archived patients found' }] : []),
  ];
  const tabList = sections.map((s) => s.list);

  useEffect(() => { setTab(0); }, [showYoursTab, showAllTab]);
  useEffect(() => { if (viewMode === 'mvp' && sort === 'upcoming') setSort('newest'); }, [viewMode, sort]);
  useEffect(() => { if (!isManagerView && sort === 'practitioner') setSort('newest'); }, [isManagerView, sort]);
  const currentList = tabList[tab] ?? allActive;

  const practitionerName = (p: Patient) => {
    const emp = mockEmployees.find((e) => e.id === getEffectiveAssignedEmployeeId(p, locationOverrides));
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  };

  const applySearch = (list: Patient[]) => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const contact = getEffectiveContactInfo(p, contactOverrides);
      return (
        contact.firstName.toLowerCase().includes(q) ||
        contact.lastName.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        getEffectiveLocationString(p, locationOverrides).toLowerCase().includes(q) ||
        practitionerName(p).toLowerCase().includes(q)
      );
    });
  };

  const applySort = (list: Patient[]) => {
    const sorted = [...list];
    const name = (p: Patient) => getEffectiveContactInfo(p, contactOverrides);
    if (sort === 'upcoming') sorted.sort((a, b) => computeEstimatedNext(a.id) - computeEstimatedNext(b.id));
    else if (sort === 'a-z') sorted.sort((a, b) => name(a).firstName.localeCompare(name(b).firstName) || name(a).lastName.localeCompare(name(b).lastName));
    else if (sort === 'z-a') sorted.sort((a, b) => name(b).firstName.localeCompare(name(a).firstName) || name(b).lastName.localeCompare(name(a).lastName));
    else if (sort === 'location') sorted.sort((a, b) => getEffectiveLocationString(a, locationOverrides).localeCompare(getEffectiveLocationString(b, locationOverrides)));
    // Unassigned patients (no practitioner name) sort first — empty string compares before any name.
    else if (sort === 'practitioner') sorted.sort((a, b) => practitionerName(a).localeCompare(practitionerName(b)) || name(a).firstName.localeCompare(name(b).firstName));
    else if (sort === 'oldest') sorted.sort((a, b) => a.id.localeCompare(b.id));
    else sorted.sort((a, b) => b.id.localeCompare(a.id));
    return sorted;
  };

  const displayed = applySort(applySearch(currentList));

  const [restoreTarget, setRestoreTarget] = useState<Patient | null>(null);
  const [restoreLocationId, setRestoreLocationId] = useState('');
  const [restorePtId, setRestorePtId] = useState('');

  const restoreLocations = restoreTarget
    ? mockClinicLocations.filter((l) => l.orgId === restoreTarget.clinicId && availableLocationIds.includes(l.id))
    : [];
  const restoreDestLocation = mockClinicLocations.find((l) => l.id === restoreLocationId) ?? null;
  const restoreEligiblePts = restoreDestLocation
    ? mockEmployees.filter((e) => restoreDestLocation.employeeIds.includes(e.id) && !e.archived)
    : [];

  const openRestore = (patient: Patient) => {
    const currentLocationId = locationOverrides.get(patient.id)?.locationId ?? '';
    setRestoreTarget(patient);
    setRestoreLocationId(availableLocationIds.includes(currentLocationId) ? currentLocationId : '');
    setRestorePtId('');
  };

  const handleSelectRestoreLocation = (locationId: string) => {
    setRestoreLocationId(locationId);
    const location = mockClinicLocations.find((l) => l.id === locationId);
    const pts = location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived) : [];
    const currentAssigned = restoreTarget ? getEffectiveAssignedEmployeeId(restoreTarget, locationOverrides) : null;
    const keptPt = pts.find((p) => p.id === currentAssigned);
    setRestorePtId(keptPt?.id ?? '');
  };

  const confirmRestore = () => {
    if (!restoreTarget || !restoreLocationId || !restorePtId) return;
    transferPatient(restoreTarget.id, restoreLocationId, restorePtId);
    setLocalPatients((prev) => ({ ...prev, [restoreTarget.id]: false }));
    toast.success(`${restoreTarget.firstName} ${restoreTarget.lastName} restored to active.`);
    setRestoreTarget(null);
    setRestoreLocationId('');
    setRestorePtId('');
  };

  const searchPlaceholders = sections.map((s) => s.searchPlaceholder);
  const emptyMessages = sections.map((s) => s.emptyMessage);
  const tabItems = sections.map((s, i) => ({ key: i, label: s.label, count: s.list.length }));
  const archivedTabIndex = showArchivedTab ? sections.length - 1 : -1;
  const empty = displayed.length === 0;

  if (dataState === 'empty') {
    return (
      <>
        <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
        <EmptyState
          icon={User01}
          title="No patients yet"
          description="Create your organization to start managing patients and tracking their care."
        />
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'All Patients' }]} />
      <div className="p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-[40px] leading-[48px] font-normal text-primary m-0">Patients</h1>
          <Button color="primary" size="lg" iconLeading={Plus} onPress={() => setAddOpen(true)}>
            Add New Patient
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 border-b border-secondary mb-10">
          {tabItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSearch(''); }}
              className={cx(
                'flex items-center gap-2 pb-4 pt-0 text-base -mb-px border-b-[3px] transition-colors duration-100',
                tab === item.key
                  ? 'border-b-[#9b9897] text-primary font-medium'
                  : 'border-transparent text-primary font-normal hover:text-secondary'
              )}
            >
              {item.label}
              <span className="inline-flex items-center justify-center rounded-full bg-secondary_alt px-3 py-1 text-xs text-primary">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="mb-5 flex gap-4 items-start">
          <div className="flex-1">
            <Input
              size="lg"
              wrapperClassName="h-12 shadow-none ring-secondary"
              icon={SearchMd}
              placeholder={searchPlaceholders[tab]}
              value={search}
              onChange={setSearch}
            />
          </div>
          {tab !== archivedTabIndex && (
            <NativeSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              wrapperClassName="w-[200px] shrink-0"
              className="h-12"
            >
              {SORT_OPTIONS.filter((o) =>
                (viewMode === 'full' || o.value !== 'upcoming') &&
                (isManagerView || o.value !== 'practitioner')
              ).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
          )}
        </div>

        {/* Patient list */}
        {empty ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex items-center justify-center size-14 rounded-full bg-secondary">
              <User01 className="size-7 text-quaternary" />
            </div>
            <p className="text-sm text-secondary">{emptyMessages[tab]}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className={cx('grid items-center gap-4 border-b border-secondary px-5 pb-3', gridCols)}>
              <span className="text-xs text-primary">Patient</span>
              {isManagerView && <span className="text-xs text-primary">Assigned Doctor</span>}
              <span className="text-xs text-primary">Location</span>
              <span className="text-xs text-primary">Date</span>
              <span />
            </div>
            <div className="flex flex-col gap-5">
              {displayed.map((patient) => {
                const { lastSeen } = sessionInfo(patient);
                const condition = conditionChip(patient);
                const assignedEmp = mockEmployees.find((e) => e.id === getEffectiveAssignedEmployeeId(patient, locationOverrides));
                const contact = getEffectiveContactInfo(patient, contactOverrides);
                return (
                  <div
                    key={patient.id}
                    onClick={() => router.push(`/patients/${patient.id}/overview`)}
                    className={cx(
                      'grid items-center gap-4 rounded-lg border border-secondary bg-primary pl-5 pr-7 py-5 cursor-pointer',
                      'hover:bg-secondary_alt transition-colors duration-100',
                      patient.archived && 'opacity-60',
                      gridCols
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar initials={patient.avatarInitials} size="lg" />
                      <div className="min-w-0 flex flex-col gap-2">
                        <p className="font-display text-md font-medium text-primary">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-primary">{contact.email}</p>
                        {condition && !isStaffPersona && !isManagerView && (
                          <Badge type="pill-color" color="brand" size="sm">{condition}</Badge>
                        )}
                      </div>
                    </div>

                    {isManagerView && (
                      <span className="text-xs text-primary whitespace-nowrap">
                        {assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : 'Unassigned'}
                      </span>
                    )}

                    <span className="w-fit rounded-full bg-secondary_alt px-3 py-1.5 text-xs text-primary whitespace-nowrap">
                      {getEffectiveLocationString(patient, locationOverrides)}
                    </span>

                    <span className="text-xs text-primary whitespace-nowrap">
                      {viewMode === 'full' ? (lastSeen ?? 'No sessions yet') : '—'}
                    </span>

                    {tab === archivedTabIndex ? (
                      <div onClick={(e) => e.stopPropagation()} className="justify-self-end">
                        <Button size="xs" color="secondary" iconLeading={RefreshCcw01} onPress={() => openRestore(patient)}>
                          Restore
                        </Button>
                      </div>
                    ) : (
                      <ChevronRight className="size-5 text-primary shrink-0 justify-self-end" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Restore Patient Dialog */}
      <ModalOverlay isOpen={!!restoreTarget} onOpenChange={(v) => { if (!v) setRestoreTarget(null); }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-primary mb-1">Restore Patient</h3>
              <p className="text-sm text-secondary mb-4">
                To reactivate <strong>{restoreTarget?.firstName} {restoreTarget?.lastName}</strong>, assign a clinic location and treating PT.
              </p>
              {restoreLocations.length === 0 ? (
                <p className="text-sm text-tertiary mb-4">No locations are available to you for this organization.</p>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <div className="mb-1 text-xs font-medium text-secondary">Location</div>
                    <NativeSelect
                      value={restoreLocationId}
                      onChange={(e) => handleSelectRestoreLocation(e.target.value)}
                    >
                      <option value="">Select a location…</option>
                      {restoreLocations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} — {l.city}, {l.regionCountry}</option>
                      ))}
                    </NativeSelect>
                  </div>
                  {restoreDestLocation && (
                    <div>
                      <div className="mb-1 text-xs font-medium text-secondary">Treating PT</div>
                      {restoreEligiblePts.length === 0 ? (
                        <p className="text-sm text-tertiary">No physiotherapists are staffed at this location yet.</p>
                      ) : (
                        <NativeSelect
                          value={restorePtId}
                          onChange={(e) => setRestorePtId(e.target.value)}
                        >
                          <option value="">Select a PT…</option>
                          {restoreEligiblePts.map((e) => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                          ))}
                        </NativeSelect>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button color="secondary" size="md" onPress={() => setRestoreTarget(null)}>Cancel</Button>
                <Button color="primary" size="md" isDisabled={!restoreLocationId || !restorePtId} onPress={confirmRestore}>
                  Restore Patient
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
