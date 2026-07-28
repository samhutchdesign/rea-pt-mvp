'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockPatients } from '@/lib/mock-data';
import { useChartSessions, addChartSession } from '@/lib/chartSessionStore';
import { useCurrentIdentity } from '@/lib/locationScope';
import { useLocationOverrides, getEffectiveAssignedEmployeeId } from '@/lib/patientLocationStore';
import { Button } from '@/components/base/buttons/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import {
  inputCls, emptySubjective, emptyObjective, emptyAnalysis, emptyPlan, emptyEvaluation,
  ChartFormBody, HistoryCard,
} from '@/components/charts/chart-form-sections';
import type {
  ChartSession, PainLevel, AdherenceLevel, ImprovementLevel,
  SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection,
} from '@/lib/types';

const PAIN_LEVELS: PainLevel[] = ['No Pain', 'Low Pain', 'Moderate Pain', 'High Pain'];
const ADHERENCE_LEVELS: AdherenceLevel[] = ['High Adherence', 'Moderate Adherence', 'Low Adherence'];
const IMPROVEMENT_LEVELS: ImprovementLevel[] = ['Significant Improvement', 'Some Improvement', 'No Improvement', 'Worsening'];

export default function NewChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const patient = mockPatients.find((p) => p.id === id);
  const currentIdentity = useCurrentIdentity();
  const locationOverrides = useLocationOverrides();
  const isChartWriter = !!patient && currentIdentity.id === getEffectiveAssignedEmployeeId(patient, locationOverrides);
  const sessions = useChartSessions(id);
  const isIntake = sessions.length === 0;
  const lastSession = [...sessions].sort((a, b) => a.date.localeCompare(b.date)).at(-1);

  const [summary, setSummary] = useState('');
  const [painLevel, setPainLevel] = useState<PainLevel>('No Pain');
  const [adherenceLevel, setAdherenceLevel] = useState<AdherenceLevel>('High Adherence');
  const [improvementLevel, setImprovementLevel] = useState<ImprovementLevel>('Some Improvement');
  const [exercisesPerDay, setExercisesPerDay] = useState(0);

  const [subjective, setSubjective] = useState<SubjectiveSection>(emptySubjective);
  const [objective, setObjective] = useState<ObjectiveSection>(emptyObjective);
  const [showGeneralScreen, setShowGeneralScreen] = useState(isIntake);
  const [analysis, setAnalysis] = useState<AnalysisSection>(() =>
    !isIntake && lastSession
      ? { bodyStructures: lastSession.analysis.bodyStructures, problemList: lastSession.analysis.problemList, ptDiagnosis: lastSession.analysis.ptDiagnosis, goals: lastSession.analysis.goals, notes: '' }
      : emptyAnalysis()
  );
  const [plan, setPlan] = useState<PlanSection>(emptyPlan);
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationSection>(emptyEvaluation);
  const [recommendations, setRecommendations] = useState<{ text: string }[]>([]);

  const handleSave = () => {
    if (!patient) return;
    const session: ChartSession = {
      id: `cs_${id}_${Date.now()}`,
      patientId: id,
      date: new Date().toISOString().slice(0, 10),
      isIntakeSession: isIntake,
      summary,
      painLevel,
      exercisesPerDay,
      subjective,
      objective,
      analysis,
      plan,
      interventions,
      evaluation,
      recommendations: recommendations.map((r) => r.text).filter(Boolean),
      ...(isIntake ? {} : { adherenceLevel, improvementLevel }),
    };
    addChartSession(id, session);
    toast.success('Chart saved successfully.');
    router.push(`/patients/${id}/chart`);
  };

  if (!patient) return null;

  if (!isChartWriter) {
    return (
      <div className="max-w-[560px]">
        <p className="text-sm text-secondary">Only {patient.firstName} {patient.lastName}&apos;s assigned practitioner can add entries to this chart.</p>
        <Button color="secondary" size="sm" className="mt-4" onPress={() => router.push(`/patients/${id}/chart`)}>
          Back to Chart
        </Button>
      </div>
    );
  }

  const sessionDate = new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const ageLabel = patient.metrics?.age ? `${patient.metrics.age} y.o.` : '';
  const sexLabel = patient.metrics?.sexAssignedAtBirth ?? '';

  return (
    <div className="max-w-[820px]">
      {/* Session header bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-secondary bg-black/4 px-5 py-3">
        <span className="text-sm font-semibold text-primary">{patient.firstName} {patient.lastName}</span>
        {ageLabel && <span className="text-sm text-secondary">{ageLabel}{sexLabel ? ` · ${sexLabel}` : ''}</span>}
        <span className="text-sm text-secondary">{sessionDate}</span>
        <div className="ml-auto">
          <span className="inline-flex items-center rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            {isIntake ? 'Intake Session' : `Session ${sessions.length + 1}`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Session summary */}
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <span className="mb-3 block text-sm font-semibold text-primary">Session Summary</span>
          <Textarea
            rows={2}
            placeholder="One or two lines summarizing this session — shown in the chart list…"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Pain Level">
              <NativeSelect value={painLevel} onChange={(e) => setPainLevel(e.target.value as PainLevel)}>
                {PAIN_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </NativeSelect>
            </Field>
            {!isIntake && (
              <>
                <Field label="Adherence">
                  <NativeSelect value={adherenceLevel} onChange={(e) => setAdherenceLevel(e.target.value as AdherenceLevel)}>
                    {ADHERENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="Improvement">
                  <NativeSelect value={improvementLevel} onChange={(e) => setImprovementLevel(e.target.value as ImprovementLevel)}>
                    {IMPROVEMENT_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </NativeSelect>
                </Field>
              </>
            )}
            <Field label="Exercises / Day">
              <input type="number" min={0} className={inputCls} value={exercisesPerDay} onChange={(e) => setExercisesPerDay(Number(e.target.value))} />
            </Field>
          </div>
        </div>

        <p className="mt-2 text-sm font-semibold text-primary">H-SOAPIER Chart</p>

        {isIntake && <HistoryCard patient={patient} />}

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

      <div className="mt-8 flex justify-end gap-4">
        <Button color="secondary" size="sm" onPress={() => router.push(`/patients/${id}/chart`)}>
          Cancel
        </Button>
        <Button color="primary" size="sm" onPress={handleSave}>
          Save New Chart
        </Button>
      </div>
    </div>
  );
}
