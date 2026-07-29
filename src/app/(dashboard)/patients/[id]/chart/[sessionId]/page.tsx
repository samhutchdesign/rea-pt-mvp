'use client';
import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions, updateChartSession, deleteChartSession, signChartSession, addAmendment } from '@/lib/chartSessionStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { useContactOverrides, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { useSignatureFontId, setSignatureFontId, SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { Button } from '@/components/base/buttons/button';
import { Textarea } from '@/components/ui/textarea';
import { SignatureFontPicker } from '@/components/ui/signature-font-picker';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import {
  emptySubjective, emptyObjective, emptyAnalysis, emptyPlan, emptyEvaluation,
  ChartFormBody, HistoryCard, ChartSessionReadPanel,
} from '@/components/charts/chart-form-sections';
import { copyChartSessionToClipboard } from '@/lib/chartExport';
import type { SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection } from '@/lib/types';
import { Trash2, Lock, Unlock, Copy, Check } from 'lucide-react';

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = useChartSessions(id);
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();
  const contactOverrides = useContactOverrides();
  const isChartWriter = !!patient && currentIdentity.id === getEffectiveAssignedEmployeeId(patient, locationOverrides);
  const signatureFontId = useSignatureFontId(currentIdentity.id);
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === signatureFontId);
  const isSigned = !!session?.signedAt;
  const canEdit = isChartWriter && !isSigned;

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

  const startEditing = () => {
    if (!session) return;
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

  // Deep-links from the inline Chart tab view: ?edit=1 opens straight into edit mode,
  // ?sign=1 opens straight into the Sign & Lock confirmation, so there's no redundant second click.
  useEffect(() => {
    if (searchParams.get('edit') === '1' && canEdit) startEditing();
  }, [searchParams, canEdit]);

  useEffect(() => {
    if (searchParams.get('sign') === '1') setSignOpen(true);
  }, [searchParams]);

  if (!patient || !session) {
    return <span className="block p-8 text-secondary">Session not found.</span>;
  }

  const contact = getEffectiveContactInfo(patient, contactOverrides);
  const sessionLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1} of ${sessions.length}`;
  const titleLabel = session.isIntakeSession ? 'Intake Session' : `Session ${sessionIndex + 1}`;

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

  const handleCopy = async () => {
    try {
      await copyChartSessionToClipboard(session, { ...patient, ...contact }, titleLabel);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
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
    <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] bg-primary flex flex-col overflow-hidden">
      {/* Full-screen header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 border-b border-secondary shrink-0">
        <div>
          <Link href={`/patients/${id}/chart`} className="text-sm font-medium text-secondary hover:text-primary">
            &lt; Back
          </Link>
        </div>
        <div className="flex items-center gap-3 justify-self-center">
          {isSigned ? <Lock size={26} className="shrink-0 text-primary" /> : <Unlock size={26} className="shrink-0 text-primary" />}
          <h1 className="whitespace-nowrap text-2xl font-bold text-primary">
            {contact.firstName} {contact.lastName}&apos;s Chart - {titleLabel}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-3">
          {isSigned && (
            <Button color="secondary" size="md" iconLeading={copySuccess ? Check : Copy} onPress={handleCopy}>
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          )}
          {!editing ? (
            canEdit && (
              <>
                <Button color="secondary" size="md" onPress={startEditing}>
                  Edit
                </Button>
                <Button color="primary" size="md" isDisabled={!signatureFontId} onPress={() => setSignOpen(true)}>
                  Sign & Lock
                </Button>
              </>
            )
          ) : (
            <>
              <Button color="secondary" size="md" onPress={() => setEditing(false)}>
                Cancel
              </Button>
              <Button color="secondary" size="md" onPress={handleSaveEdits}>
                Save as Draft
              </Button>
              <Button color="primary" size="md" isDisabled={!signatureFontId} onPress={handleSaveAndOpenSign}>
                Sign & Lock
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[820px] mx-auto">

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

      {editing ? (
        <div className="flex flex-col gap-4">
          {/* Notes */}
          <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
            <span className="mb-2 block text-sm font-semibold text-primary">Notes</span>
            <Textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          <p className="mt-2 text-sm font-semibold text-primary">H-SOAPIER Chart</p>

          {session.isIntakeSession && <HistoryCard patient={patient} />}

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
        </div>
      ) : (
        <ChartSessionReadPanel patient={patient} session={session} />
      )}

      {isChartWriter && isSigned && !editing && (
        <div className="mt-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs">
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

      {editing && (
        <div className="mt-8 border-t border-secondary pt-6">
          <Button color="primary-destructive" size="xs" iconLeading={Trash2} onPress={() => setDeleteOpen(true)}>
            Delete Session
          </Button>
        </div>
      )}

        </div>
      </div>

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
                This will permanently delete <strong>{sessionLabel}</strong> for {contact.firstName} {contact.lastName}. This cannot be undone.
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
