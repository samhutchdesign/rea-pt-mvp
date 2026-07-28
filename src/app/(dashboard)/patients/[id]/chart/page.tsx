'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions } from '@/lib/chartSessionStore';
import { useViewMode } from '@/lib/viewModeStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { Button } from '@/components/base/buttons/button';
import { Plus, Lock, ChevronRight } from 'lucide-react';
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
  const assignedEmpId = patient ? getEffectiveAssignedEmployeeId(patient, locationOverrides) : null;
  const isChartWriter = !!patient && currentIdentity.id === assignedEmpId;

  return (
    <div>
      <div className="flex justify-end items-center mb-6 gap-3">
        {!isChartWriter && (
          <span className="text-xs text-tertiary italic">
            {assignedEmpId ? 'Only the assigned practitioner can add chart entries.' : 'No practitioner is assigned to this patient yet.'}
          </span>
        )}
        {isChartWriter && (
          <Button
            color="primary"
            size="sm"
            iconLeading={Plus}
            onPress={() => router.push(`/patients/${id}/chart/new`)}
          >
            Add New Chart
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <span className="text-secondary text-sm">No sessions recorded yet.</span>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/patients/${id}/chart/${session.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/patients/${id}/chart/${session.id}`); }}
              className="rounded-xl border border-secondary bg-primary shadow-xs p-5 cursor-pointer transition-colors hover:bg-secondary_alt"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {session.signedAt && <Lock size={12} className="text-tertiary shrink-0" />}
                  <span className="font-semibold text-sm text-primary">
                    {session.isIntakeSession
                      ? `Intake Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : `Session – ${new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </span>
                  {viewMode === 'full' && !session.isIntakeSession && session.adherenceLevel && (() => {
                    const s = ADHERENCE_STYLE[session.adherenceLevel];
                    return (
                      <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', s?.bg, s?.text)}>
                        {session.adherenceLevel}
                      </span>
                    );
                  })()}
                </div>
                {viewMode === 'full' && session.summary && (
                  <p className="text-xs text-tertiary mt-1.5 line-clamp-2">{session.summary}</p>
                )}
                </div>
                <ChevronRight size={18} className="text-quaternary shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
