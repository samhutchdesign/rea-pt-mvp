'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients, mockChartSessions } from '@/lib/mock-data';
import { Button } from '@/components/base/buttons/button';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { cx } from '@/utils/cx';

const SOAPIER_SECTIONS = [
  { key: 'subjective', letter: 'S', label: 'Subjective', rows: 5 },
  { key: 'objective', letter: 'O', label: 'Objective', rows: 4 },
  { key: 'assessment', letter: 'A', label: 'Analysis', rows: 6 },
  { key: 'plan', letter: 'P', label: 'Plan', rows: 4 },
  { key: 'intervention', letter: 'I', label: 'Intervention', rows: 4 },
  { key: 'evaluation', letter: 'E', label: 'Evaluation', rows: 3 },
  { key: 'recommendations', letter: 'R', label: 'Recommendations', rows: 3 },
];

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = mockChartSessions[id] ?? [];
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const [editing, setEditing] = useState(false);
  const [soapie, setSoapie] = useState<Record<string, string>>(session?.soapie ?? {});
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!patient || !session) {
    return <span className="block p-8 text-secondary">Session not found.</span>;
  }

  const sessionDate = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;

  const handleCopy = async () => {
    const lines = [`${sessionLabel} — ${patient.firstName} ${patient.lastName}`, sessionDate, ''];
    for (const { letter, label, key } of SOAPIER_SECTIONS) {
      lines.push(`${letter} — ${label}`);
      lines.push((soapie as Record<string, string>)[key] || '—');
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    toast.success('Session deleted.');
    setTimeout(() => router.push(`/patients/${id}/chart`), 1500);
  };

  const letterBadge = (letter: string) => (
    <div className="w-[30px] h-[30px] rounded-full bg-brand-600 flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-[0.8rem] leading-none">{letter}</span>
    </div>
  );

  return (
    <div className="max-w-[820px]">
      {/* Session header bar */}
      <div className="bg-black/4 border border-secondary rounded-lg px-5 py-3 mb-6 flex flex-wrap gap-4 items-center">
        <span className="font-semibold text-sm text-primary">{patient.firstName} {patient.lastName}</span>
        {ageLabel && (
          <span className="text-secondary text-sm">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</span>
        )}
        <span className="text-secondary text-sm">{sessionDate}</span>
        <div className="ml-auto flex gap-2 items-center">
          <span className={cx(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
            session.isIntakeSession ? 'bg-brand-50 text-brand-700' : 'bg-brand-600 text-white',
          )}>
            {sessionLabel}
          </span>
          {!editing && (
            <>
              <button
                title={copySuccess ? 'Copied!' : 'Copy chart notes'}
                onClick={handleCopy}
                className={cx(
                  'inline-flex items-center justify-center rounded-lg p-1.5 text-sm transition-colors hover:bg-secondary_alt',
                  copySuccess ? 'text-green-700' : 'text-secondary',
                )}
              >
                <Copy size={14} />
              </button>
              <Button size="xs" color="secondary" iconLeading={Pencil} onPress={() => setEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Session summary */}
      <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5 mb-6">
        <div className={cx('flex justify-between items-center', editing ? 'mb-4' : 'mb-2')}>
          <span className="font-semibold text-sm text-primary">Session Notes</span>
        </div>
        {editing ? (
          <textarea
            rows={3}
            defaultValue={session.summary}
            className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 min-h-[120px] bg-primary"
          />
        ) : (
          <span className="text-secondary text-sm whitespace-pre-wrap">{session.summary}</span>
        )}
      </div>

      {/* H-SOAPIER sections */}
      <p className="font-semibold text-sm text-primary mb-4">H-SOAPIER Chart</p>
      <div className="flex flex-col gap-4">
        {SOAPIER_SECTIONS.map(({ key, letter, label, rows }) => {
          const value = (soapie as Record<string, string>)[key] || '';
          return (
            <div key={key} className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
              <div className="flex items-center gap-3 mb-3">
                {letterBadge(letter)}
                <span className="font-semibold text-sm text-primary">{label}</span>
              </div>
              {editing ? (
                <textarea
                  rows={rows}
                  value={value}
                  onChange={(e) => setSoapie((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300 min-h-[120px] bg-primary"
                />
              ) : value ? (
                <span className="text-sm text-primary whitespace-pre-wrap leading-relaxed">{value}</span>
              ) : (
                <span className="text-secondary text-sm italic">Not recorded</span>
              )}
            </div>
          );
        })}
      </div>

      {editing ? (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {}}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              View Version History
            </button>
            <div className="flex gap-4">
              <Button color="secondary" size="sm" onPress={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => { setEditing(false); toast.success('Chart updated successfully.'); }}
              >
                Save Updates
              </Button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-secondary">
            <Button
              color="primary-destructive"
              size="xs"
              iconLeading={Trash2}
              onPress={() => setDeleteOpen(true)}
            >
              Delete Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end mt-6">
          <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart`)}>
            Back to Chart
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ModalOverlay isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal>
          <Dialog>
            <div className="p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold text-primary mb-2">Delete Session?</h2>
              <p className="text-sm text-secondary mb-6">
                This will permanently delete <strong>{sessionLabel}</strong> for {patient.firstName} {patient.lastName}. This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button color="secondary" size="sm" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary-destructive" size="sm" onPress={handleDelete}>
                  Delete Session
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
