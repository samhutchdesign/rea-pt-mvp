'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions, addChartSession } from '@/lib/chartSessionStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { useContactOverrides, getEffectiveContactInfo } from '@/lib/patientContactStore';
import { Button } from '@/components/base/buttons/button';
import { Textarea } from '@/components/ui/textarea';
import {
  emptySubjective, emptyObjective, emptyAnalysis, emptyPlan, emptyEvaluation, emptyProblem, emptyGoal,
  ChartFormBody, HistoryCard,
} from '@/components/charts/chart-form-sections';
import { ChartTemplateSelect } from '@/components/charts/chart-template-select';
import { DictateButton } from '@/components/charts/dictate-button';
import { useDictation } from '@/components/charts/use-dictation';
import { applyDictationStubs } from '@/components/charts/apply-dictation-stubs';
import { useAddToChart } from '@/components/charts/use-add-to-chart';
import { deriveDictationCarryForward } from '@/components/charts/dictation-carry-forward';
import { DICTATION_NOTES_STUB, DICTATION_FOLLOWUP_NOTES_STUB } from '@/components/charts/dictation-stubs';
import type {
  ChartSession, ChartTemplateId, PainLevel, AdherenceLevel, ImprovementLevel,
  SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection,
} from '@/lib/types';
import { Sparkles, Unlock } from 'lucide-react';

export default function NewChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();
  const contactOverrides = useContactOverrides();
  const isChartWriter = !!patient && currentIdentity.id === getEffectiveAssignedEmployeeId(patient, locationOverrides);
  const contact = patient ? getEffectiveContactInfo(patient, contactOverrides) : null;
  const sessions = useChartSessions(id);
  const isIntake = sessions.length === 0;
  const lastSession = [...sessions].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const intakeSession = sessions.find((s) => s.isIntakeSession);

  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<ChartTemplateId | null>(null);

  const [summary, setSummary] = useState('');
  const { dictating, dictSecs, toggle: toggleDictation } = useDictation(
    (text) => setSummary((prev) => (prev ? prev + ' ' + text : text)),
    isIntake ? DICTATION_NOTES_STUB : DICTATION_FOLLOWUP_NOTES_STUB
  );
  const painLevel: PainLevel = 'No Pain';
  const adherenceLevel: AdherenceLevel = 'High Adherence';
  const improvementLevel: ImprovementLevel = 'Some Improvement';
  const exercisesPerDay = 0;

  const [subjective, setSubjective] = useState<SubjectiveSection>(emptySubjective);
  const [objective, setObjective] = useState<ObjectiveSection>(emptyObjective);
  const [analysis, setAnalysis] = useState<AnalysisSection>(() =>
    !isIntake && lastSession
      ? {
          bodyStructures: lastSession.analysis.bodyStructures,
          problemList: lastSession.analysis.problemList.length ? lastSession.analysis.problemList : [emptyProblem()],
          ptDiagnosis: lastSession.analysis.ptDiagnosis,
          goals: lastSession.analysis.goals.length ? lastSession.analysis.goals : [emptyGoal()],
          notes: '',
        }
      : emptyAnalysis()
  );
  const [plan, setPlan] = useState<PlanSection>(() =>
    !isIntake && intakeSession ? structuredClone(intakeSession.plan) : emptyPlan()
  );
  const [interventions, setInterventions] = useState<InterventionItem[]>(() =>
    !isIntake && intakeSession ? structuredClone(intakeSession.interventions) : []
  );
  const [interventionsRawText, setInterventionsRawText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationSection>(emptyEvaluation);

  const buildSession = (): ChartSession | null => {
    if (!patient || !template) return null;
    return {
      id: `cs_${id}_${Date.now()}`,
      patientId: id,
      date: new Date().toISOString().slice(0, 10),
      isIntakeSession: isIntake,
      template,
      summary,
      painLevel,
      exercisesPerDay,
      subjective,
      objective,
      analysis,
      plan,
      interventions,
      interventionsRawText,
      evaluation,
      ...(isIntake ? {} : { adherenceLevel, improvementLevel }),
    };
  };

  const handleSaveDraft = () => {
    const session = buildSession();
    if (!session) return;
    addChartSession(id, session);
    toast.success('Chart saved as draft.');
    router.push(`/patients/${id}/chart`);
  };

  const handleSaveAndSign = () => {
    const session = buildSession();
    if (!session) return;
    addChartSession(id, session);
    router.push(`/patients/${id}/chart/${session.id}?sign=1`);
  };

  const { isLoading: isAddingToChart, run: handleAddToChart } = useAddToChart(() => {
    applyDictationStubs({ isIntake, setSubjective, setObjective, setAnalysis, setPlan, setInterventionsRawText, setEvaluation });
    toast.success('Chart sections filled in from dictation.');
  });

  const handleSelectTemplate = (t: ChartTemplateId) => {
    setTemplate(t);
    if (t === 'default-dictation' && !isIntake && lastSession) {
      const carryForward = deriveDictationCarryForward(lastSession);
      setAnalysis((a) => ({ ...a, rawText: carryForward.analysisText }));
      setPlan((p) => ({ ...p, rawText: carryForward.planText }));
      setInterventionsRawText(carryForward.interventionText);
      setEvaluation((e) => ({ ...e, rawText: carryForward.evaluationText }));
    }
    setStep(1);
  };

  if (!patient || !contact) return null;

  if (!isChartWriter) {
    return (
      <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] flex flex-col items-center justify-center gap-4 bg-primary px-6">
        <p className="max-w-[420px] text-center text-sm text-secondary">Only {contact.firstName} {contact.lastName}&apos;s assigned practitioner can add entries to this chart.</p>
        <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart`)}>
          Back to Chart
        </Button>
      </div>
    );
  }

  const titleLabel = isIntake ? 'Intake Session' : `Session ${sessions.length + 1}`;

  return (
    <div className="fixed top-10 left-0 right-0 bottom-0 z-[500] bg-primary flex flex-col overflow-hidden">
      {/* Full-screen header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 border-b border-secondary shrink-0">
        <div>
          <Button color="secondary" size="md" onPress={() => router.push(`/patients/${id}/chart`)}>
            Cancel
          </Button>
        </div>
        <div className="flex items-center gap-3 justify-self-center">
          <Unlock size={26} className="shrink-0 text-primary" />
          <h1 className="whitespace-nowrap text-2xl font-bold text-primary">
            {contact.firstName} {contact.lastName}&apos;s Chart - {titleLabel}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-3">
          {step === 1 && (
            <>
              <Button color="secondary" size="md" onPress={handleSaveDraft}>
                Save Draft
              </Button>
              <Button color="primary" size="md" onPress={handleSaveAndSign}>
                Save and Sign
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {step === 0 ? (
          <ChartTemplateSelect onSelect={handleSelectTemplate} />
        ) : (
        <div className="max-w-[820px] mx-auto">
      <div className="flex flex-col gap-4">
        {/* Notes */}
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Notes</span>
            {template === 'default-dictation' && (
              <DictateButton dictating={dictating} dictSecs={dictSecs} onPress={toggleDictation} />
            )}
          </div>
          <Textarea
            rows={6}
            placeholder={dictating ? 'Listening…' : 'Add notes about this session — shown in the chart list…'}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={dictating ? 'border-red-400 bg-red-50' : undefined}
          />
          {template === 'default-dictation' && (
            <div className="mt-3 flex justify-end">
              <Button
                color="secondary" size="sm" iconLeading={Sparkles}
                isLoading={isAddingToChart} showTextWhileLoading
                isDisabled={!summary.trim() || isAddingToChart}
                onPress={handleAddToChart}
              >
                {isAddingToChart ? 'Adding to Chart…' : 'Add to Chart'}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-2 text-sm font-semibold text-primary">{isIntake ? 'H-SOAPIE Chart' : 'SOAPIE Chart'}</p>

        {isIntake && <HistoryCard patient={patient} />}

        <ChartFormBody
          isDictation={template === 'default-dictation'}
          subjective={subjective} setSubjective={setSubjective}
          objective={objective} setObjective={setObjective}
          analysis={analysis} setAnalysis={setAnalysis}
          plan={plan} setPlan={setPlan}
          interventions={interventions} setInterventions={setInterventions}
          interventionsRawText={interventionsRawText} setInterventionsRawText={setInterventionsRawText}
          evaluation={evaluation} setEvaluation={setEvaluation}
        />
      </div>
        </div>
        )}
      </div>
    </div>
  );
}
