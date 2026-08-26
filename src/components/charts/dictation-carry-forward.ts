import type { ChartSession } from '@/lib/types';

/**
 * Derives text for a new dictation-template chart's Analysis/Plan/Intervention/Evaluation
 * boxes from the immediately preceding session — works whether that session was itself a
 * dictation-template chart (its rawText is used directly) or a structured "Default Form"
 * chart (its structured notes/fields are joined into a text summary).
 */
export function deriveDictationCarryForward(session: ChartSession) {
  const analysisText = session.analysis.rawText?.trim()
    || [session.analysis.bodyStructures, session.analysis.ptDiagnosis, session.analysis.notes].filter(Boolean).join(' ');

  const planText = session.plan.rawText?.trim()
    || [
      session.plan.frequency && `Expected frequency: ${session.plan.frequency}.`,
      session.plan.reassessmentPlan && `Reassessment: ${session.plan.reassessmentPlan}.`,
      session.plan.dischargePlan && `Discharge plan: ${session.plan.dischargePlan}.`,
      session.plan.notes,
    ].filter(Boolean).join(' ');

  const interventionText = session.interventionsRawText?.trim()
    || session.interventions.map((i) => `${i.type}: ${i.details}`).join(' ');

  const evaluationText = session.evaluation.rawText?.trim()
    || [session.evaluation.patientReaction, session.evaluation.objectiveResponse].filter(Boolean).join(' ');

  return { analysisText, planText, interventionText, evaluationText };
}
