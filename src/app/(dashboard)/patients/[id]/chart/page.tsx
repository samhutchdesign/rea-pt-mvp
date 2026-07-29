'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions } from '@/lib/chartSessionStore';
import { useViewMode } from '@/lib/viewModeStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { useContactOverrides, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { Button } from '@/components/base/buttons/button';
import { ChartSessionReadPanel } from '@/components/charts/chart-form-sections';
import { copyChartSessionToClipboard } from '@/lib/chartExport';
import { Plus, Lock, Unlock, Copy, Check } from 'lucide-react';
import { cx } from '@/utils/cx';

const ADHERENCE_STYLE: Record<string, { bg: string; text: string }> = {
  'High Adherence':     { bg: 'bg-green-50',  text: 'text-green-800' },
  'Moderate Adherence': { bg: 'bg-amber-50',  text: 'text-amber-800' },
  'Low Adherence':      { bg: 'bg-red-50',    text: 'text-red-800' },
};

export default function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const viewMode = useViewMode();
  const sessions = useChartSessions(id).slice().reverse();

  const patient = mockPatients.find((p) => p.id === id);
  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();
  const contactOverrides = useContactOverrides();
  const assignedEmpId = patient ? getEffectiveAssignedEmployeeId(patient, locationOverrides) : null;
  const isChartWriter = !!patient && currentIdentity.id === assignedEmpId;

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessions[0]?.id ?? null);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedIndex = sessions.findIndex((s) => s.id === selectedSessionId);
  const selectedSession = selectedIndex >= 0 ? sessions[selectedIndex] : null;

  if (!patient) return null;

  const contact = getEffectiveContactInfo(patient, contactOverrides);
  const sessionCount = sessions.length;
  const titleLabel = selectedSession
    ? selectedSession.isIntakeSession
      ? 'Intake Session'
      : `Session ${sessionCount - selectedIndex}`
    : '';
  const canEditSelected = isChartWriter && !!selectedSession && !selectedSession.signedAt;

  const handleCopy = async () => {
    if (!selectedSession) return;
    try {
      await copyChartSessionToClipboard(selectedSession, { ...patient, ...contact }, titleLabel);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
      {/* Left pane: session list */}
      <div className="flex flex-col gap-3">
        {isChartWriter ? (
          <Button
            color="secondary"
            size="sm"
            iconLeading={Plus}
            onPress={() => router.push(`/patients/${id}/chart/new`)}
            className="w-full justify-center"
          >
            Create New Chart
          </Button>
        ) : (
          <span className="text-xs text-tertiary italic">
            {assignedEmpId ? 'Only the assigned practitioner can add chart entries.' : 'No practitioner is assigned to this patient yet.'}
          </span>
        )}

        {sessions.length === 0 ? (
          <span className="text-secondary text-sm">No sessions recorded yet.</span>
        ) : (
          sessions.map((session, i) => {
            const isSelected = session.id === selectedSessionId;
            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSessionId(session.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedSessionId(session.id); }}
                className={cx(
                  'rounded-xl border p-4 cursor-pointer transition-colors',
                  isSelected ? 'border-brand-600 bg-brand-50' : 'border-secondary bg-primary hover:bg-secondary_alt'
                )}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {session.signedAt ? (
                    <Lock size={12} className="text-tertiary shrink-0" />
                  ) : (
                    <Unlock size={12} className="text-tertiary shrink-0" />
                  )}
                  <span className="font-semibold text-sm text-primary">
                    {session.isIntakeSession ? 'Intake Session' : `Session ${sessionCount - i}`}
                  </span>
                </div>
                <span className="mt-1 block text-xs text-tertiary">
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {viewMode === 'full' && !session.isIntakeSession && session.adherenceLevel && (() => {
                  const s = ADHERENCE_STYLE[session.adherenceLevel];
                  return (
                    <span className={cx('mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', s?.bg, s?.text)}>
                      {session.adherenceLevel}
                    </span>
                  );
                })()}
                {viewMode === 'full' && session.summary && (
                  <p className="text-xs text-tertiary mt-1.5 line-clamp-2">{session.summary}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right pane: selected session, read-only */}
      <div>
        {selectedSession ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 border-b border-secondary pb-4">
              <div>
                <h2 className="text-xl font-bold text-primary">{titleLabel}</h2>
                <span className="text-sm text-tertiary">
                  {new Date(selectedSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {selectedSession.signedAt && (
                  <Button color="secondary" size="sm" iconLeading={copySuccess ? Check : Copy} onPress={handleCopy}>
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                )}
                {canEditSelected && (
                  <>
                    <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart/${selectedSession.id}?edit=1`)}>
                      Edit
                    </Button>
                    <Button color="primary" size="sm" onPress={() => router.push(`/patients/${id}/chart/${selectedSession.id}?sign=1`)}>
                      Sign & Lock
                    </Button>
                  </>
                )}
              </div>
            </div>

            <ChartSessionReadPanel patient={patient} session={selectedSession} />
          </div>
        ) : (
          <span className="text-secondary text-sm">Select a session to view its chart.</span>
        )}
      </div>
    </div>
  );
}
