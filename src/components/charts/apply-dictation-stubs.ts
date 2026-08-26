import {
  DICTATION_SUBJECTIVE_STUB, DICTATION_OBJECTIVE_STUB, DICTATION_ANALYSIS_STUB,
  DICTATION_PLAN_STUB, DICTATION_INTERVENTION_STUB, DICTATION_EVALUATION_STUB,
  DICTATION_FOLLOWUP_SUBJECTIVE_STUB, DICTATION_FOLLOWUP_OBJECTIVE_STUB,
} from '@/components/charts/dictation-stubs';
import type { SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, EvaluationSection } from '@/lib/types';

interface ApplyDictationStubsArgs {
  isIntake: boolean;
  setSubjective: (updater: (s: SubjectiveSection) => SubjectiveSection) => void;
  setObjective: (updater: (o: ObjectiveSection) => ObjectiveSection) => void;
  setAnalysis: (updater: (a: AnalysisSection) => AnalysisSection) => void;
  setPlan: (updater: (p: PlanSection) => PlanSection) => void;
  setInterventionsRawText: (text: string) => void;
  setEvaluation: (updater: (e: EvaluationSection) => EvaluationSection) => void;
}

/**
 * Stubbed "AI populate" — copies fixed dummy content into section boxes, simulating dictation → structured chart.
 * Intake: fills all six sections. Follow-up: only Subjective/Objective — Analysis/Plan/Intervention/Evaluation
 * are already carried forward from the previous chart (see dictation-carry-forward.ts) and shouldn't be overwritten.
 */
export function applyDictationStubs({
  isIntake, setSubjective, setObjective, setAnalysis, setPlan, setInterventionsRawText, setEvaluation,
}: ApplyDictationStubsArgs) {
  setSubjective((s) => ({ ...s, rawText: isIntake ? DICTATION_SUBJECTIVE_STUB : DICTATION_FOLLOWUP_SUBJECTIVE_STUB }));
  setObjective((o) => ({ ...o, rawText: isIntake ? DICTATION_OBJECTIVE_STUB : DICTATION_FOLLOWUP_OBJECTIVE_STUB }));
  if (isIntake) {
    setAnalysis((a) => ({ ...a, rawText: DICTATION_ANALYSIS_STUB }));
    setPlan((p) => ({ ...p, rawText: DICTATION_PLAN_STUB }));
    setInterventionsRawText(DICTATION_INTERVENTION_STUB);
    setEvaluation((e) => ({ ...e, rawText: DICTATION_EVALUATION_STUB }));
  }
}
