'use client';
import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { mockPatients, mockChartSessions, mockEmployees, mockClinicLocations } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import { useRole } from '@/lib/roleStore';
import { useAvailableLocationIds } from '@/lib/locationScope';
import { useLocationState, transferPatient } from '@/lib/patientLocationStore';
import { useViewMode } from '@/lib/viewModeStore';
import { ArrowLeftRight, ChevronRight, Plus, X } from 'lucide-react';
import { cx } from '@/utils/cx';

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadBannerDismissed, setUploadBannerDismissed] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') toast.success('New patient created! An email was sent to them for account creation.');
  }, [searchParams]);

  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    if (searchParams.get('transfer') === '1') setTransferOpen(true);
  }, [searchParams]);

  const patient = mockPatients.find((p) => p.id === id);
  const showUploadBanner = searchParams.get('uploaded') === 'true' && !uploadBannerDismissed;
  const uploadedData = getUploadedData(id);
  const sessions = mockChartSessions[id] ?? [];
  const latestSession = sessions.filter((s) => !s.isIntakeSession)[0];
  const latestSessionIndex = latestSession ? sessions.findIndex((s) => s.id === latestSession.id) : -1;
  const latestSessionTitle = latestSession?.isIntakeSession ? 'Intake Session' : `Session ${sessions.length - latestSessionIndex}`;
  const locationState = useLocationState(id);
  const assignedEmployee = mockEmployees.find((e) => e.id === locationState.assignedEmployeeId) ?? null;
  const can = usePermissions();
  const role = useRole();
  const isStaffPersona = role === 'limited';
  const viewMode = useViewMode();
  const availableLocationIds = useAvailableLocationIds();

  const transferLocations = patient
    ? mockClinicLocations.filter((l) => l.orgId === patient.clinicId && availableLocationIds.includes(l.id))
    : [];
  const destinationLocation = mockClinicLocations.find((l) => l.id === selectedLocationId) ?? null;
  const physiosAtDestination = destinationLocation
    ? mockEmployees.filter((e) => destinationLocation.employeeIds.includes(e.id) && !e.archived)
    : [];
  const currentPhysioStillValid = !!assignedEmployee && physiosAtDestination.some((p) => p.id === assignedEmployee.id);

  const closeTransfer = () => { setTransferOpen(false); setSelectedLocationId(''); setSelectedEmployeeId(''); };

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    const location = mockClinicLocations.find((l) => l.id === locationId);
    const physios = location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived) : [];
    const keptPhysio = assignedEmployee && physios.some((p) => p.id === assignedEmployee.id) ? assignedEmployee : undefined;
    setSelectedEmployeeId(keptPhysio?.id ?? '');
  };

  const handleTransfer = () => {
    if (!patient || !destinationLocation) return;
    transferPatient(patient.id, destinationLocation.id, selectedEmployeeId || null);
    const physioName = mockEmployees.find((e) => e.id === selectedEmployeeId);
    closeTransfer();
    toast.success(
      physioName
        ? `${patient.firstName} ${patient.lastName} transferred to ${destinationLocation.name} with ${physioName.firstName} ${physioName.lastName}.`
        : `${patient.firstName} ${patient.lastName} transferred to ${destinationLocation.name}.`
    );
  };

  if (!patient) return null;

  return (
    <div className="mt-20">
      {showUploadBanner && (
        <Alert type="success" className="mb-6">
          <div className="flex w-full items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Profile updated from PDF</p>
              <p className="text-xs mt-0.5">
                {uploadedData
                  ? `${Object.keys(uploadedData).length} fields confirmed — ${uploadedData.firstName} ${uploadedData.lastName}'s profile has been updated. Review the details in the Details tab.`
                  : '7 fields pre-filled from uploaded document. Review the updated information in the Details tab.'}
              </p>
            </div>
            <button
              onClick={() => setUploadBannerDismissed(true)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </Alert>
      )}

      {!isStaffPersona && (
      <div className="flex gap-10 items-start">
        {/* Latest Session */}
        <div className="flex-1 min-w-0 rounded-xl border border-primary bg-secondary_alt p-7">
          <div className="flex justify-between items-center mb-5">
            <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Latest Session</span>
            <Button size="md" color="secondary" iconLeading={Plus} onPress={() => router.push(`/patients/${id}/chart/new`)}>
              New Chart
            </Button>
          </div>
          {latestSession ? (
            <>
              <div
                onClick={() => router.push(`/patients/${id}/chart/${latestSession.id}`)}
                className="relative flex items-center gap-5 rounded-xl border border-secondary bg-primary py-8 pl-6 pr-14 cursor-pointer hover:bg-secondary_alt transition-colors mb-4"
              >
                <div className={cx('self-stretch w-1 shrink-0 rounded-xl', latestSession.signedAt ? 'bg-[#206020]' : 'bg-[#BF9540]')} />
                <div className="flex flex-col gap-5 min-w-0">
                  <span className="font-display text-xl leading-5 font-medium text-primary">{latestSessionTitle}</span>
                  <span className="text-base leading-5 text-secondary">
                    {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={cx('text-base leading-5 italic', latestSession.signedAt ? 'text-[#206020]' : 'text-[#BF9540]')}>
                    {latestSession.signedAt ? 'Signed' : 'Draft'}
                  </span>
                  {viewMode === 'full' && (
                    <div className="flex gap-2 flex-wrap">
                      {latestSession.painLevel && (
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                          {latestSession.painLevel}
                        </span>
                      )}
                      {latestSession.improvementLevel && (
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                          {latestSession.improvementLevel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
              </div>
              <button
                className="text-sm text-brand-700 hover:underline"
                onClick={() => router.push(`/patients/${id}/chart`)}
              >
                See all sessions →
              </button>
            </>
          ) : (
            <p className="text-sm text-secondary">No sessions recorded yet.</p>
          )}
        </div>

        {/* Right column: Summary + Assigned Practitioner */}
        <div className="flex flex-col gap-7 w-[395px] shrink-0">
          <div className="rounded-xl border border-primary bg-primary p-7 flex flex-col gap-9">
            <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Summary</span>
            <div className="flex flex-col gap-9">
              <div className="flex flex-col gap-3">
                <span className="text-base leading-5 font-semibold text-primary">Issue:</span>
                <span className="text-base leading-5 text-primary">{patient.injuryHistory?.mechanism || 'Not recorded'}</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-base leading-5 font-semibold text-primary">Date of Onset:</span>
                <span className="text-base leading-5 text-primary">{patient.injuryHistory?.dateOfOnset || 'Not recorded'}</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-base leading-5 font-semibold text-primary">Patient Goals:</span>
                <span className="text-base leading-5 text-primary">{patient.sohx?.clientGoals || 'Not recorded'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary bg-primary p-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-md font-medium text-primary tracking-[0.1px]">Assigned Practitioner</span>
              {can.canTransferPatient && (
                <Button size="xs" color="link-color" iconLeading={ArrowLeftRight} onPress={() => setTransferOpen(true)}>
                  Transfer
                </Button>
              )}
            </div>
            {assignedEmployee ? (
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/employees/${assignedEmployee.id}`)}
              >
                <Avatar initials={assignedEmployee.avatarInitials} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-md font-medium text-primary">{assignedEmployee.firstName} {assignedEmployee.lastName}</span>
                    <span className="text-xs text-primary">{assignedEmployee.credentials}</span>
                  </div>
                  <span className="text-xs text-primary">{assignedEmployee.title}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-tertiary">No PT assigned yet.</p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Transfer Patient Dialog */}
      <ModalOverlay isOpen={transferOpen} onOpenChange={(open) => { if (!open) closeTransfer(); }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full min-w-[400px] max-w-md">
              <h2 className="text-lg font-semibold text-primary mb-1">Transfer Patient</h2>
              <p className="text-sm text-secondary mb-4">
                Update <strong>{patient.firstName} {patient.lastName}</strong>&apos;s clinic location and care team.
              </p>

              {transferLocations.length === 0 ? (
                <p className="text-sm text-tertiary">No locations are available to you in this organization.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-1 text-xs font-medium text-secondary">Location</div>
                    <NativeSelect
                      value={selectedLocationId}
                      onChange={(e) => handleSelectLocation(e.target.value)}
                    >
                      <option value="">Select a location</option>
                      {transferLocations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} — {l.city}, {l.regionCountry}{l.id === locationState.locationId ? ' (current)' : ''}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>

                  {destinationLocation && (
                    <div>
                      <div className="mb-1 text-xs font-medium text-secondary">Physiotherapist</div>
                      {physiosAtDestination.length === 0 ? (
                        <p className="text-sm text-tertiary">No physiotherapists are staffed at this location yet.</p>
                      ) : (
                        <>
                          <NativeSelect
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                          >
                            <option value="">Select physiotherapist</option>
                            {physiosAtDestination.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.firstName} {e.lastName} — {e.credentials}
                              </option>
                            ))}
                          </NativeSelect>
                          {currentPhysioStillValid && (
                            <p className="mt-1.5 text-xs text-tertiary">
                              {patient.firstName}&apos;s current physiotherapist already sees patients at this location and will stay assigned unless you pick someone else.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button color="secondary" size="sm" onPress={closeTransfer}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  isDisabled={!destinationLocation || !selectedEmployeeId}
                  onPress={handleTransfer}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
