'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions, updateChartSession, deleteChartSession, signChartSession, addAmendment } from '@/lib/chartSessionStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { useSignatureFontId, setSignatureFontId, SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Textarea } from '@/components/ui/textarea';
import { SignatureFontPicker } from '@/components/ui/signature-font-picker';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import {
  emptySubjective, emptyObjective, emptyAnalysis, emptyPlan, emptyEvaluation,
  ChartFormBody, ChartReadOnlyBody, HistoryCard,
} from '@/components/charts/chart-form-sections';
import type { SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection } from '@/lib/types';
import { Copy, Pencil, Trash2, Lock, FileSignature } from 'lucide-react';
import { cx } from '@/utils/cx';

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = useChartSessions(id);
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();
  const isChartWriter = !!patient && currentIdentity.id === getEffectiveAssignedEmployeeId(patient, locationOverrides);
  const signatureFontId = useSignatureFontId(currentIdentity.id);
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === signatureFontId);

  const [editing, setEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [amendmentText, setAmendmentText] = useState('');
  const [pendingSignatureFont, setPendingSignatureFont] = useState<string>(SIGNATURE_FONTS[0].id);

  const [summary, setSummary] = useState(session?.summary ?? '');
  const [subjective, setSubjective] = useState<SubjectiveSection>(session?.subjective ?? emptySubjective());
  const [objective, setObjective] = useState<ObjectiveSection>(session?.objective ?? emptyObjective());
  const [showGeneralScreen, setShowGeneralScreen] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisSection>(session?.analysis ?? emptyAnalysis());
  const [plan, setPlan] = useState<PlanSection>(session?.plan ?? emptyPlan());
  const [interventions, setInterventions] = useState<InterventionItem[]>(session?.interventions ?? []);
  const [evaluation, setEvaluation] = useState<EvaluationSection>(session?.evaluation ?? emptyEvaluation());
  const [recommendations, setRecommendations] = useState<{ text: string }[]>(
    (session?.recommendations ?? []).map((text) => ({ text }))
  );

  if (!patient || !session) {
    return <span className="block p-8 text-secondary">Session not found.</span>;
  }

  const sessionDate = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;
  const isSigned = !!session.signedAt;
  const canEdit = isChartWriter && !isSigned;
  const amendments = session.amendments ?? [];

  const startEditing = () => {
    setSummary(session.summary);
    setSubjective(session.subjective);
    setObjective(session.objective);
    setAnalysis(session.analysis);
    setPlan(session.plan);
    setInterventions(session.interventions);
    setEvaluation(session.evaluation);
    setRecommendations(session.recommendations.map((text) => ({ text })));
    setEditing(true);
  };

  const persistEdits = () => {
    updateChartSession(id, {
      ...session,
      summary,
      subjective,
      objective,
      analysis,
      plan,
      interventions,
      evaluation,
      recommendations: recommendations.map((r) => r.text).filter(Boolean),
    });
  };

  const handleSaveEdits = () => {
    persistEdits();
    setEditing(false);
    toast.success('Chart saved as draft.');
  };

  const handleSaveAndOpenSign = () => {
    if (!signatureFontId) return;
    persistEdits();
    setEditing(false);
    setSignOpen(true);
  };

  const handleCopy = async () => {
    const lines = [`${sessionLabel} — ${patient.firstName} ${patient.lastName}`, sessionDate, '', 'Summary', session.summary, ''];
    lines.push('S — Subjective', session.subjective.notes || '—', '');
    lines.push('O — Objective', session.objective.notes || '—', '');
    lines.push('A — Analysis', session.analysis.ptDiagnosis || session.analysis.notes || '—', '');
    lines.push('P — Plan', session.plan.notes || '—', '');
    lines.push('I — Intervention', session.interventions.map((i) => `${i.type}: ${i.details}`).join('\n') || '—', '');
    lines.push('E — Evaluation', session.evaluation.patientReaction || '—', '');
    lines.push('R — Recommendations', session.recommendations.join('\n') || '—');
    if (isSigned) {
      lines.push('', `Signed by ${session.signedByName} on ${new Date(session.signedAt!).toLocaleString()}`);
    }
    if (amendments.length > 0) {
      lines.push('', 'Amendments');
      for (const a of amendments) {
        lines.push(`${a.authorName} — ${new Date(a.createdAt).toLocaleString()}`, a.text, '');
      }
    }
    await navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDelete = () => {
    deleteChartSession(id, sessionId);
    setDeleteOpen(false);
    toast.success('Session deleted.');
    router.push(`/patients/${id}/chart`);
  };

  const handleSign = () => {
    if (!signatureFontId) return;
    signChartSession(id, sessionId, {
      empId: currentIdentity.id,
      name: `${currentIdentity.firstName} ${currentIdentity.lastName}`,
      initials: currentIdentity.avatarInitials,
      signatureFontId,
    });
    setSignOpen(false);
    toast.success('Chart signed and locked.');
  };

  const handleSaveSignature = () => {
    setSignatureFontId(currentIdentity.id, pendingSignatureFont);
    toast.success('Signature saved.');
  };

  const handleAddAmendment = () => {
    if (!amendmentText.trim()) return;
    addAmendment(id, sessionId, {
      authorId: currentIdentity.id,
      authorName: `${currentIdentity.firstName} ${currentIdentity.lastName}`,
      authorInitials: currentIdentity.avatarInitials,
      text: amendmentText.trim(),
    });
    setAmendmentText('');
    toast.success('Amendment added.');
  };

  return (
    <div className="max-w-[820px]">
      {/* Session header bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-secondary bg-black/4 px-5 py-3">
        <span className="text-sm font-semibold text-primary">{patient.firstName} {patient.lastName}</span>
        {ageLabel && <span className="text-sm text-secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</span>}
        <span className="text-sm text-secondary">{sessionDate}</span>
        <div className="ml-auto flex items-center gap-2">
          {isSigned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary_alt px-2.5 py-0.5 text-xs font-semibold text-secondary" title={`Signed by ${session.signedByName} on ${new Date(session.signedAt!).toLocaleString()}`}>
              <Lock size={11} /> Signed
            </span>
          )}
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
              {canEdit && (
                <>
                  <Button size="xs" color="secondary" iconLeading={Pencil} onPress={startEditing}>
                    Edit
                  </Button>
                  <Button size="xs" color="secondary" iconLeading={FileSignature} isDisabled={!signatureFontId} onPress={() => setSignOpen(true)}>
                    Sign & Lock
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {canEdit && !signatureFontId && (
        <div className="mb-6 rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <span className="mb-2 block text-sm font-semibold text-primary">Set Up Your Signature</span>
          <p className="mb-4 text-sm text-secondary">
            You&apos;ll need a signature before you can sign and lock charts. Pick a style below — you can change it anytime in{' '}
            <Link href="/account/settings" className="font-medium text-brand-600 hover:underline">Account Settings</Link>.
          </p>
          <SignatureFontPicker
            name={`${currentIdentity.firstName} ${currentIdentity.lastName}`}
            value={pendingSignatureFont}
            onChange={setPendingSignatureFont}
          />
          <div className="mt-4 flex justify-end">
            <Button size="sm" color="primary" onPress={handleSaveSignature}>
              Save Signature
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Session summary */}
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <span className="mb-2 block text-sm font-semibold text-primary">Session Summary</span>
          {editing ? (
            <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          ) : (
            <span className="whitespace-pre-wrap text-sm text-secondary">{session.summary || 'No summary recorded.'}</span>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold text-primary">H-SOAPIER Chart</p>

        {session.isIntakeSession && <HistoryCard patient={patient} />}

        {editing ? (
          <ChartFormBody
            subjective={subjective} setSubjective={setSubjective}
            objective={objective} setObjective={setObjective}
            showGeneralScreen={showGeneralScreen} setShowGeneralScreen={setShowGeneralScreen}
            analysis={analysis} setAnalysis={setAnalysis}
            plan={plan} setPlan={setPlan}
            interventions={interventions} setInterventions={setInterventions}
            evaluation={evaluation} setEvaluation={setEvaluation}
            recommendations={recommendations} setRecommendations={setRecommendations}
          />
        ) : (
          <ChartReadOnlyBody
            subjective={session.subjective}
            objective={session.objective}
            analysis={session.analysis}
            plan={session.plan}
            interventions={session.interventions}
            evaluation={session.evaluation}
            recommendations={session.recommendations}
          />
        )}

        {isSigned && !editing && (
          <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
            <span className="mb-2 block text-sm font-semibold text-primary">Signed</span>
            <span
              style={{ fontFamily: SIGNATURE_FONTS.find((f) => f.id === session.signatureFontId)?.variable }}
              className="block text-3xl text-primary"
            >
              {session.signedByName}
            </span>
            <span className="mt-1 block text-xs text-tertiary">
              {new Date(session.signedAt!).toLocaleString()}
            </span>
          </div>
        )}

        {amendments.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-primary">Amendments</p>
            <div className="flex flex-col gap-3">
              {amendments.map((a) => (
                <div key={a.id} className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar initials={a.authorInitials} size="xs" />
                    <span className="text-xs font-semibold text-amber-900">{a.authorName}</span>
                    <span className="text-xs text-amber-700">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-amber-900">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isChartWriter && isSigned && !editing && (
          <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
            <span className="mb-2 block text-sm font-semibold text-primary">Add Amendment</span>
            <Textarea
              rows={3}
              placeholder="This chart is signed and locked. Add a dated, attributed amendment instead of editing the original entry…"
              value={amendmentText}
              onChange={(e) => setAmendmentText(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" color="secondary" isDisabled={!amendmentText.trim()} onPress={handleAddAmendment}>
                Add Amendment
              </Button>
            </div>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-8">
          <div className="flex justify-end gap-4">
            <Button color="secondary" size="sm" onPress={() => setEditing(false)}>
              Cancel
            </Button>
            <Button color="secondary" size="sm" onPress={handleSaveEdits}>
              Save as Draft
            </Button>
            <Button size="sm" color="primary" iconLeading={FileSignature} isDisabled={!signatureFontId} onPress={handleSaveAndOpenSign}>
              Sign & Lock
            </Button>
          </div>
          <div className="mt-6 border-t border-secondary pt-6">
            <Button color="primary-destructive" size="xs" iconLeading={Trash2} onPress={() => setDeleteOpen(true)}>
              Delete Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart`)}>
            Back to Chart
          </Button>
        </div>
      )}

      {/* Sign & Lock confirmation modal */}
      <ModalOverlay isOpen={signOpen} onOpenChange={setSignOpen}>
        <Modal>
          <Dialog>
            <div className="w-full max-w-sm p-6">
              <h2 className="mb-2 text-lg font-semibold text-primary">Sign & Lock Chart?</h2>
              <p className="mb-4 text-sm text-secondary">
                Once signed, <strong>{sessionLabel}</strong> becomes locked and can no longer be edited directly. Any future correction will be added as a separate, dated amendment.
              </p>
              {signatureFont && (
                <div className="mb-6 rounded-lg border border-secondary bg-secondary_alt px-4 py-3">
                  <span className="mb-1 block text-xs text-secondary">This will be stamped as your signature:</span>
                  <span style={{ fontFamily: signatureFont.variable }} className="block text-2xl text-primary">
                    {currentIdentity.firstName} {currentIdentity.lastName}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button color="secondary" size="sm" onPress={() => setSignOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" size="sm" onPress={handleSign}>
                  Sign & Lock
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>

      {/* Delete confirmation modal */}
      <ModalOverlay isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal>
          <Dialog>
            <div className="w-full max-w-sm p-6">
              <h2 className="mb-2 text-lg font-semibold text-primary">Delete Session?</h2>
              <p className="mb-6 text-sm text-secondary">
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
    </div>
  );
}
