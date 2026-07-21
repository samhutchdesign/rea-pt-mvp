'use client';
import { use, useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Alert } from '@/components/ui/alert';
import { NativeSelect } from '@/components/ui/native-select';
import { mockPatients, mockChartSessions, mockPrograms, mockExercises, mockEmployees, mockClinic, mockClinicLocations } from '@/lib/mock-data';
import { getUploadedData } from '@/lib/uploadStore';
import { usePermissions } from '@/lib/permissionsHook';
import { useLocationState, transferPatient } from '@/lib/patientLocationStore';
import { useViewMode } from '@/lib/viewModeStore';
import { ArrowLeftRight, Building2, Calendar, Plus, X, Zap } from 'lucide-react';

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadBannerDismissed, setUploadBannerDismissed] = useState(false);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') toast.success('Success! The patient has received their documents.');
  }, [searchParams]);

  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const patient = mockPatients.find((p) => p.id === id);
  const showUploadBanner = searchParams.get('uploaded') === 'true' && !uploadBannerDismissed;
  const uploadedData = getUploadedData(id);
  const sessions = mockChartSessions[id] ?? [];
  const latestSession = sessions.filter((s) => !s.isIntakeSession)[0];
  const program = patient?.programId ? mockPrograms.find((p) => p.id === patient.programId) : null;
  const locationState = useLocationState(id);
  const assignedEmployees = mockEmployees.filter((e) => locationState.assignedEmployeeIds.includes(e.id));
  const can = usePermissions();
  const viewMode = useViewMode();

  const otherLocations = patient
    ? mockClinicLocations.filter((l) => l.orgId === patient.clinicId && l.id !== locationState.locationId)
    : [];
  const destinationLocation = mockClinicLocations.find((l) => l.id === selectedLocationId) ?? null;
  const physiosAtDestination = destinationLocation
    ? mockEmployees.filter((e) => destinationLocation.employeeIds.includes(e.id) && !e.archived)
    : [];
  const currentPhysioStillValid = assignedEmployees.some((e) => physiosAtDestination.some((p) => p.id === e.id));

  const closeTransfer = () => { setTransferOpen(false); setSelectedLocationId(''); setSelectedEmployeeId(''); };

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    const location = mockClinicLocations.find((l) => l.id === locationId);
    const physios = location ? mockEmployees.filter((e) => location.employeeIds.includes(e.id) && !e.archived) : [];
    const keptPhysio = assignedEmployees.find((e) => physios.some((p) => p.id === e.id));
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

  const avgAdherence = (() => {
    if (!program) return null;
    const vals = program.exercises.map((e) => e.adherence).filter((v): v is number => v != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();

  const stats: { label: string; value: number | string; icon: ComponentType<{ style?: React.CSSProperties; size?: number; color?: string }>; color: string }[] = [
    ...(viewMode === 'full' ? [{ label: 'Total Sessions', value: sessions.length, icon: Calendar, color: '#0288D1' }] : []),
    ...(viewMode === 'full' && avgAdherence != null
      ? [{ label: 'Avg. Adherence', value: `${avgAdherence}%`, icon: Zap, color: avgAdherence >= 80 ? '#2E7D32' : avgAdherence >= 60 ? '#F57F17' : '#C62828' }]
      : []),
  ];

  if (!patient) return null;

  return (
    <>
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

      {stats.length > 0 && (
      <div className="flex gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex-1 rounded-xl border border-secondary bg-primary shadow-xs p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: color + '18' }}
              >
                <Icon size={20} color={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary leading-none">{value}</p>
                <p className="text-xs text-secondary mt-0.5">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="flex gap-6">
        {/* Recent Session */}
        <div className="flex-1 rounded-xl border border-secondary bg-primary shadow-xs p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-primary">Latest Session</span>
            <Button size="xs" color="primary" iconLeading={Plus} onPress={() => router.push(`/patients/${id}/chart/new`)}>
              Add to Chart
            </Button>
          </div>
          {latestSession ? (
            <>
              <div
                onClick={() => router.push(`/patients/${id}/chart/${latestSession.id}`)}
                className="rounded-lg border border-secondary p-3 mb-4 cursor-pointer hover:bg-secondary_alt hover:border-brand-300 transition-colors"
              >
                <p className="text-sm text-secondary">
                  {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {viewMode === 'full' && (
                  <div className="flex gap-2 flex-wrap mt-2">
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
              <button
                className="text-xs text-brand-700 hover:underline"
                onClick={() => router.push(`/patients/${id}/chart`)}
              >
                See all sessions →
              </button>
            </>
          ) : (
            <p className="text-sm text-secondary">No sessions recorded yet.</p>
          )}
        </div>

        {/* Current Program */}
        <div className="flex-1 rounded-xl border border-secondary bg-primary shadow-xs p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-primary">
              Current Program{program ? ` (${program.exercises.length})` : ''}
            </span>
            <Button size="xs" color="tertiary" onPress={() => router.push(`/patients/${id}/program`)}>
              View Program
            </Button>
          </div>
          {program ? (
            <>
              <p className="text-sm font-semibold text-primary mb-4">{program.name}</p>
              <div className="max-h-48 overflow-y-auto">
                {program.exercises.map((pe) => {
                  const ex = mockExercises.find((e) => e.id === pe.exerciseId);
                  if (!ex) return null;
                  return (
                    <div
                      key={pe.exerciseId}
                      className="flex justify-between items-center py-1.5 border-b border-secondary"
                    >
                      <span className="text-xs text-primary">{ex.name}</span>
                      <span className="text-xs text-secondary">{pe.reps} reps · {pe.sets} sets</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-secondary mb-4">No program assigned yet.</p>
              <Button size="xs" color="secondary" onPress={() => router.push(`/patients/${id}/program`)}>
                Assign Program
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Care Team */}
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-primary">Care Team</span>
          {can.canTransferPatient && (
            <Button size="xs" color="secondary" iconLeading={ArrowLeftRight} onPress={() => setTransferOpen(true)}>
              Transfer Patient
            </Button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap mb-4">
          {assignedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 p-3 border border-secondary rounded-lg cursor-pointer hover:border-brand-600 transition-colors min-w-[220px]"
              onClick={() => router.push(`/employees/${emp.id}`)}
            >
              <div className="w-10 h-10 rounded-full bg-[#EDE7F6] flex items-center justify-center shrink-0 font-bold text-sm text-[#6750A4]">
                {emp.avatarInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{emp.firstName} {emp.lastName}</p>
                <p className="text-xs text-secondary">{emp.credentials} · {emp.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/clinic')}
        >
          <Building2 size={16} className="text-secondary" />
          <span className="text-sm text-brand-700 underline">{mockClinic.name}</span>
        </div>
      </div>

      {/* Transfer Patient Dialog */}
      <ModalOverlay isOpen={transferOpen} onOpenChange={(open) => { if (!open) closeTransfer(); }}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full min-w-[400px] max-w-md">
              <h2 className="text-lg font-semibold text-primary mb-1">Transfer Patient</h2>
              <p className="text-sm text-secondary mb-4">
                Move <strong>{patient.firstName} {patient.lastName}</strong> to a different clinic location and care team.
              </p>

              {otherLocations.length === 0 ? (
                <p className="text-sm text-tertiary">No other locations are available in this organization.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-1 text-xs font-medium text-secondary">Destination Location</div>
                    <NativeSelect
                      value={selectedLocationId}
                      onChange={(e) => handleSelectLocation(e.target.value)}
                    >
                      <option value="">Select a location</option>
                      {otherLocations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name} — {l.city}, {l.regionCountry}</option>
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
    </>
  );
}
