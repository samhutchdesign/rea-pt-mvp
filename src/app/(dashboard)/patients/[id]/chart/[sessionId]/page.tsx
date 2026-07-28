'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions, updateChartSession, deleteChartSession } from '@/lib/chartSessionStore';
import { Button } from '@/components/base/buttons/button';
import { Textarea } from '@/components/ui/textarea';
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal';
import {
  emptySubjective, emptyObjective, emptyAnalysis, emptyPlan, emptyEvaluation,
  ChartFormBody, ChartReadOnlyBody, HistoryCard,
} from '@/components/charts/chart-form-sections';
import type { SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection } from '@/lib/types';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { cx } from '@/utils/cx';

export default function ChartDetailPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const sessions = useChartSessions(id);
  const session = sessions.find((s) => s.id === sessionId);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  const [editing, setEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const handleSaveEdits = () => {
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
    setEditing(false);
    toast.success('Chart updated successfully.');
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

  return (
    <div className="max-w-[820px]">
      {/* Session header bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-secondary bg-black/4 px-5 py-3">
        <span className="text-sm font-semibold text-primary">{patient.firstName} {patient.lastName}</span>
        {ageLabel && <span className="text-sm text-secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</span>}
        <span className="text-sm text-secondary">{sessionDate}</span>
        <div className="ml-auto flex items-center gap-2">
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
              <Button size="xs" color="secondary" iconLeading={Pencil} onPress={startEditing}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

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
      </div>

      {editing ? (
        <div className="mt-8">
          <div className="flex justify-end gap-4">
            <Button color="secondary" size="sm" onPress={() => setEditing(false)}>
              Cancel
            </Button>
            <Button color="primary" size="sm" onPress={handleSaveEdits}>
              Save Updates
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
