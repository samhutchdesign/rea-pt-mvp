'use client';
import { useState, useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import TopBar from '@/components/layout/TopBar';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { PatientHeaderMenu } from '@/components/patients/PatientHeaderMenu';
import { mockPatients, mockClinicLocations, mockEmployees } from '@/lib/mock-data';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useYourEmpId, useAvailableLocationIds } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveLocationString, getEffectiveAssignedEmployeeId, transferPatient } from '@/lib/patientLocationStore';
import { useContactOverrides, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { useViewMode } from '@/lib/viewModeStore';
import { clearUploadedData } from '@/lib/uploadStore';
import { cx } from '@/utils/cx';
import { Inbox, Mail, MapPin } from 'lucide-react';

const ALL_TABS = [
  { label: 'Overview', path: 'overview' },
  { label: 'Details', path: 'details', staffHide: true },
  { label: 'Program', path: 'program', staffHide: true },
  { label: 'Chart', path: 'chart', staffHide: true },
  { label: 'Documents', path: 'documents', fullOnly: true },
  { label: 'Contact', path: 'contact' },
];

function conditionLabel(mechanism: string | undefined): string | null {
  if (!mechanism) return null;
  return mechanism.length > 32 ? mechanism.slice(0, 32).replace(/\s\S*$/, '') + '…' : mechanism;
}

function ConfirmModal({ open, onClose, title, description, confirmLabel, destructive, onConfirm }: {
  open: boolean; onClose: () => void; title: string; description: React.ReactNode;
  confirmLabel: string; destructive?: boolean; onConfirm: () => void;
}) {
  return (
    <ModalOverlay isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Modal className="w-full max-w-md">
        <Dialog>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-3">{title}</h2>
            <p className="text-sm text-secondary mb-6">{description}</p>
            <div className="flex justify-end gap-3">
              <Button color="secondary" onPress={onClose}>Cancel</Button>
              <Button color={destructive ? 'primary-destructive' : 'primary'} onPress={onConfirm}>{confirmLabel}</Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const locationOverrides = useLocationOverrides();
  const contactOverrides = useContactOverrides();

  const [archived, setArchived] = useState(patient?.archived ?? false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreLocationId, setRestoreLocationId] = useState('');
  const [restorePtId, setRestorePtId] = useState('');

  const can = usePermissions();
  const role = useRole();
  const isStaffPersona = role === 'limited';
  const yourEmpId = useYourEmpId();
  const viewMode = useViewMode();
  const availableLocationIds = useAvailableLocationIds();

  const MVP_HIDDEN = new Set(['pat8', 'pat1']);
  useEffect(() => {
    if (viewMode === 'mvp' && MVP_HIDDEN.has(id)) router.push('/patients');
  }, [viewMode, id, router]);

  const patientTabs = ALL_TABS.filter((t) => !(t.fullOnly && viewMode === 'mvp') && !(t.staffHide && isStaffPersona));
  const isYourPatient = yourEmpId !== null && !!patient && getEffectiveAssignedEmployeeId(patient, locationOverrides) === yourEmpId;
  const canEdit = can.canArchivePatient || isYourPatient;
  const activeTab = patientTabs.findIndex((t) => pathname.includes(`/${t.path}`));
  const currentTab = patientTabs[activeTab] ?? patientTabs[0];

  useEffect(() => {
    return () => { clearUploadedData(id); };
  }, [id]);

  if (!patient) {
    return (
      <div className="px-8 py-8 pt-14">
        <p className="text-sm text-secondary">Patient not found.</p>
      </div>
    );
  }

  const chip = conditionLabel(patient.injuryHistory?.mechanism);

  const handleArchive = () => {
    setArchived(true);
    setConfirmArchiveOpen(false);
    toast.warning(`${patient.firstName} ${patient.lastName} has been archived.`);
  };

  const restoreLocations = mockClinicLocations.filter((l) => l.orgId === patient.clinicId && availableLocationIds.includes(l.id));
  const restoreDestLocation = mockClinicLocations.find((l) => l.id === restoreLocationId) ?? null;
  const restoreEligiblePts = restoreDestLocation
    ? mockEmployees.filter((e) => restoreDestLocation.employeeIds.includes(e.id) && !e.archived)
    : [];

  const openRestore = () => {
    const currentLocationId = locationOverrides.get(id)?.locationId ?? '';
    setRestoreLocationId(availableLocationIds.includes(currentLocationId) ? currentLocationId : '');
    setRestorePtId('');
    setRestoreOpen(true);
  };

  const handleSelectRestoreLocation = (locationId: string) => {
    setRestoreLocationId(locationId);
    const location = mockClinicLocations.find((l) => l.id === locationId);
    const pts = location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived) : [];
    const currentAssigned = getEffectiveAssignedEmployeeId(patient, locationOverrides);
    const keptPt = pts.find((p) => p.id === currentAssigned);
    setRestorePtId(keptPt?.id ?? '');
  };

  const handleRestore = () => {
    if (!restoreLocationId || !restorePtId) return;
    transferPatient(id, restoreLocationId, restorePtId);
    setArchived(false);
    setRestoreOpen(false);
    setRestoreLocationId('');
    setRestorePtId('');
    toast.success(`${patient.firstName} ${patient.lastName} restored to active.`);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(false);
    router.push('/patients');
  };

  const effectiveContact = getEffectiveContactInfo(patient, contactOverrides);
  const selectedIndex = activeTab === -1 ? 0 : activeTab;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'All Patients', href: '/patients' },
          { label: `${effectiveContact.firstName} ${effectiveContact.lastName}`, href: `/patients/${id}/overview` },
          { label: currentTab.label },
        ]}
      />
      <div className="pt-14">
        {archived && (
          <Alert type="warning" className="rounded-none px-8">
            This patient profile is archived. Restore it to resume active management.
          </Alert>
        )}

        <div className="px-8 pt-8">
          <div className="flex items-start gap-5 mb-6">
            <Avatar initials={patient.avatarInitials} size="xl" className={archived ? 'opacity-60' : ''} />
            <div className="flex-1 min-w-0">
              <h1 className="text-display-xs font-semibold text-primary" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {effectiveContact.firstName} {effectiveContact.lastName}
              </h1>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-quaternary" />
                  <span className="text-sm text-tertiary">{effectiveContact.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-quaternary" />
                  <span className="text-sm text-tertiary">{getEffectiveLocationString(patient, locationOverrides)}</span>
                </div>
              </div>
              {chip && !isStaffPersona && (
                <div className="mt-2">
                  <Badge type="pill-color" color="brand" size="sm">{chip}</Badge>
                </div>
              )}
            </div>

            {can.canArchivePatient && archived && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" color="secondary" iconLeading={Inbox} onPress={openRestore}>
                  Restore Patient
                </Button>
                <Button size="sm" color="primary-destructive" onPress={() => setConfirmDeleteOpen(true)}>
                  Delete Patient
                </Button>
              </div>
            )}
            {canEdit && !archived && (
              <PatientHeaderMenu
                canArchive={can.canArchivePatient}
                onEditProfile={() => router.push(`/patients/${id}/contact?edit=1`)}
                onArchive={() => setConfirmArchiveOpen(true)}
                onReassign={() => router.push(`/patients/${id}/overview?transfer=1`)}
              />
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-secondary">
            {patientTabs.map((tab, i) => (
              <Link
                key={tab.path}
                href={`/patients/${id}/${tab.path}`}
                className={cx(
                  'mr-6 pb-3 pt-0 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                  selectedIndex === i
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-tertiary hover:text-secondary hover:border-secondary'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-8 py-8">
          {children}
        </div>
      </div>

      {/* Restore Patient Dialog */}
      <ModalOverlay isOpen={restoreOpen} onOpenChange={(v) => { if (!v) setRestoreOpen(false); }}>
        <Modal className="w-full max-w-md">
          <Dialog>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-1">Restore Patient</h2>
              <p className="text-sm text-secondary mb-4">
                To reactivate <strong>{patient.firstName} {patient.lastName}</strong>, assign a clinic location and treating PT.
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
                <Button color="secondary" onPress={() => setRestoreOpen(false)}>Cancel</Button>
                <Button color="primary" isDisabled={!restoreLocationId || !restorePtId} onPress={handleRestore}>Restore Patient</Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      <ConfirmModal
        open={confirmArchiveOpen}
        onClose={() => setConfirmArchiveOpen(false)}
        title="Archive Patient?"
        description={<><strong>{patient.firstName} {patient.lastName}</strong> will be moved to the Archived tab and removed from your active patient list. <strong className="text-error-600">You&apos;ll lose access to their profile and won&apos;t be able to make edits</strong> — an admin will need to restore them to active status.</>}
        confirmLabel="Archive Patient"
        onConfirm={handleArchive}
      />

      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Permanently Delete Patient?"
        description={<>This will permanently delete <strong>{patient.firstName} {patient.lastName}</strong> and all associated records. This cannot be undone.</>}
        confirmLabel="Delete Patient"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
