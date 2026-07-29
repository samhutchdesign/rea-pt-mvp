'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { RepeatableList } from '@/components/ui/repeatable-list';
import { BodyMap } from '@/components/charts/body-map';
import { Avatar } from '@/components/base/avatar/avatar';
import { SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { MapPin } from 'lucide-react';
import type {
  Patient, ChartSession, PainPoint, RomEntry, ProblemListItem, GoalItem, PlanItem, InterventionItem,
  SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, EvaluationSection,
} from '@/lib/types';

export const inputCls = 'w-full rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300';

export const INTERVENTION_TYPES: InterventionItem['type'][] = ['Manual Therapy', 'Exercise', 'Modality', 'Education', 'Other'];

export const emptyPainPoint = (): PainPoint => ({ location: '', description: '', nprs: 0, pattern: 'intermittent', aggravating: '', easing: '' });
export const emptyRomEntry = (): RomEntry => ({ joint: '', side: '', aromNotes: '', strengthNotes: '' });
export const emptyProblem = (): ProblemListItem => ({ bodyFunction: '', activityParticipation: '', environment: '' });
export const emptyGoal = (): GoalItem => ({ problem: '', shortTerm: '', longTerm: '' });
export const emptyPlanItem = (): PlanItem => ({ problemRef: '', treatment: '' });
export const emptyIntervention = (): InterventionItem => ({ type: 'Exercise', details: '' });

export const emptySubjective = (): SubjectiveSection => ({ painPoints: [], amSymptoms: '', pmSymptoms: '', nightPain: false, sleepingPosition: '', bladderBowelUpdate: '', notes: '' });
export const emptyObjective = (): ObjectiveSection => ({
  observation: '', functionalTests: '', romStrength: [],
  pelvicFloorExam: { power: 0, endurance: 0, repetitions: 0, fastContractions: 0, tone: '', tenderness: '' },
  prolapseGrade: '', diastasisRecti: '', specialTests: '', palpation: '', notes: '',
});
export const emptyAnalysis = (): AnalysisSection => ({ bodyStructures: '', problemList: [], ptDiagnosis: '', goals: [], notes: '' });
export const emptyPlan = (): PlanSection => ({ items: [], frequency: '', reassessmentPlan: '', dischargePlan: '', consentObtained: true, notes: '' });
export const emptyEvaluation = (): EvaluationSection => ({ patientReaction: '', objectiveResponse: '' });

export function SectionCard({ letter, label, children }: { letter: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-secondary bg-primary shadow-xs p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brand-600">
          <span className="text-[0.8rem] font-bold leading-none text-white">{letter}</span>
        </div>
        <span className="text-sm font-semibold text-primary">{label}</span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function HistoryCard({ patient }: { patient: Patient }) {
  const rows: { label: string; value?: string }[] = [
    { label: 'Reason for consultation / referral', value: patient.pmhx?.referralReason },
    { label: 'Referring physician', value: patient.pmhx?.referringPhysician },
    { label: 'Mechanism / onset', value: patient.injuryHistory?.mechanism },
    { label: 'Date of onset', value: patient.injuryHistory?.dateOfOnset },
    { label: 'Symptom evolution', value: patient.injuryHistory?.symptomEvolution },
    { label: 'Management to date', value: patient.injuryHistory?.management },
    { label: 'PMHx', value: patient.pmhx?.pmhx },
    { label: 'Medications', value: patient.pmhx?.medicationList },
    { label: 'Obstetric / pelvic health history', value: patient.obstetricPelvicHealth?.obstetricsHistory },
    { label: 'Bladder / bowel symptoms', value: patient.obstetricPelvicHealth?.bladderBowelSymptoms },
    { label: 'Job / hobbies', value: [patient.sohx?.job, patient.sohx?.hobbies].filter(Boolean).join(' · ') || undefined },
    { label: "Client's goals", value: patient.sohx?.clientGoals },
  ].filter((r) => r.value);

  return (
    <div className="rounded-xl border border-secondary bg-secondary_alt p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">History</span>
        <Link href={`/patients/${patient.id}/details`} className="text-xs font-medium text-brand-600 hover:underline">
          Edit in Patient Details
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm italic text-tertiary">No history recorded yet for this patient. Add it in Patient Details, or capture it in the Subjective section below.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label}>
              <span className="mb-0.5 block text-xs text-secondary">{r.label}</span>
              <div className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary">{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ChartFormBodyProps {
  subjective: SubjectiveSection;
  setSubjective: (updater: (s: SubjectiveSection) => SubjectiveSection) => void;
  objective: ObjectiveSection;
  setObjective: (updater: (o: ObjectiveSection) => ObjectiveSection) => void;
  showGeneralScreen: boolean;
  setShowGeneralScreen: (v: boolean) => void;
  analysis: AnalysisSection;
  setAnalysis: (updater: (a: AnalysisSection) => AnalysisSection) => void;
  plan: PlanSection;
  setPlan: (updater: (p: PlanSection) => PlanSection) => void;
  interventions: InterventionItem[];
  setInterventions: (items: InterventionItem[]) => void;
  evaluation: EvaluationSection;
  setEvaluation: (updater: (e: EvaluationSection) => EvaluationSection) => void;
  recommendations: { text: string }[];
  setRecommendations: (items: { text: string }[]) => void;
}

export function ChartFormBody({
  subjective, setSubjective, objective, setObjective, showGeneralScreen, setShowGeneralScreen,
  analysis, setAnalysis, plan, setPlan, interventions, setInterventions, evaluation, setEvaluation,
  recommendations, setRecommendations,
}: ChartFormBodyProps) {
  const [armedIndex, setArmedIndex] = useState<number | null>(null);

  const handlePlace = (view: 'front' | 'back', x: number, y: number) => {
    if (armedIndex === null) return;
    setSubjective((s) => ({
      ...s,
      painPoints: s.painPoints.map((p, i) => (i === armedIndex ? { ...p, bodyView: view, x, y } : p)),
    }));
    setArmedIndex(null);
  };

  const handleCreate = (view: 'front' | 'back', x: number, y: number) => {
    setSubjective((s) => ({
      ...s,
      painPoints: [...s.painPoints, { ...emptyPainPoint(), bodyView: view, x, y }],
    }));
  };

  return (
    <>
      {/* Subjective */}
      <SectionCard letter="S" label="Subjective">
        <Field label="Pain Points">
          <BodyMap painPoints={subjective.painPoints} armedIndex={armedIndex} onPlace={handlePlace} onCreate={handleCreate} />
          <div className="mt-3">
          <RepeatableList
            items={subjective.painPoints}
            onChange={(painPoints) => setSubjective((s) => ({ ...s, painPoints }))}
            newItem={emptyPainPoint}
            addLabel="Add Pain Point"
            emptyLabel="No pain points reported."
            renderRow={(pp, update, index) => (
              <div className="flex gap-3">
                <PainPointBadge index={index} />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Location"><input className={inputCls} value={pp.location} onChange={(e) => update({ location: e.target.value })} /></Field>
                    <Field label="Description"><input className={inputCls} value={pp.description} onChange={(e) => update({ description: e.target.value })} /></Field>
                    <Field label="NPRS (0-10)"><input type="number" min={0} max={10} className={inputCls} value={pp.nprs} onChange={(e) => update({ nprs: Number(e.target.value) })} /></Field>
                    <Field label="Pattern">
                      <NativeSelect value={pp.pattern} onChange={(e) => update({ pattern: e.target.value as PainPoint['pattern'] })}>
                        <option value="constant">Constant</option>
                        <option value="intermittent">Intermittent</option>
                      </NativeSelect>
                    </Field>
                    <Field label="Aggravating Factors"><input className={inputCls} value={pp.aggravating} onChange={(e) => update({ aggravating: e.target.value })} /></Field>
                    <Field label="Easing Factors"><input className={inputCls} value={pp.easing} onChange={(e) => update({ easing: e.target.value })} /></Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArmedIndex(index)}
                    className="inline-flex w-fit items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                  >
                    <MapPin size={12} /> {pp.bodyView ? `Reposition P${index + 1} on Diagram` : `Place P${index + 1} on Diagram`}
                  </button>
                </div>
              </div>
            )}
          />
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="AM Symptoms"><input className={inputCls} value={subjective.amSymptoms} onChange={(e) => setSubjective((s) => ({ ...s, amSymptoms: e.target.value }))} /></Field>
          <Field label="PM Symptoms"><input className={inputCls} value={subjective.pmSymptoms} onChange={(e) => setSubjective((s) => ({ ...s, pmSymptoms: e.target.value }))} /></Field>
          <Field label="Sleeping Position"><input className={inputCls} value={subjective.sleepingPosition} onChange={(e) => setSubjective((s) => ({ ...s, sleepingPosition: e.target.value }))} /></Field>
          <div className="flex items-center gap-2 pt-5">
            <input id="nightPain" type="checkbox" checked={subjective.nightPain} onChange={(e) => setSubjective((s) => ({ ...s, nightPain: e.target.checked }))} />
            <label htmlFor="nightPain" className="text-sm text-primary">Night pain</label>
          </div>
        </div>
        <Field label="Bladder / Bowel Update">
          <Textarea rows={2} value={subjective.bladderBowelUpdate} onChange={(e) => setSubjective((s) => ({ ...s, bladderBowelUpdate: e.target.value }))} placeholder="Voiding frequency, urgency, leakage episodes, bowel symptoms…" />
        </Field>
        <Field label="Additional Notes">
          <Textarea rows={3} value={subjective.notes} onChange={(e) => setSubjective((s) => ({ ...s, notes: e.target.value }))} placeholder="Anything else the patient reports…" />
        </Field>
      </SectionCard>

      {/* Objective */}
      <SectionCard letter="O" label="Objective">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Power (0-5)"><input type="number" min={0} max={5} className={inputCls} value={objective.pelvicFloorExam.power} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, power: Number(e.target.value) } }))} /></Field>
          <Field label="Endurance (sec)"><input type="number" min={0} className={inputCls} value={objective.pelvicFloorExam.endurance} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, endurance: Number(e.target.value) } }))} /></Field>
          <Field label="Repetitions"><input type="number" min={0} className={inputCls} value={objective.pelvicFloorExam.repetitions} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, repetitions: Number(e.target.value) } }))} /></Field>
          <Field label="Fast Contractions"><input type="number" min={0} className={inputCls} value={objective.pelvicFloorExam.fastContractions} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, fastContractions: Number(e.target.value) } }))} /></Field>
          <Field label="Tone">
            <NativeSelect value={objective.pelvicFloorExam.tone} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, tone: e.target.value as ObjectiveSection['pelvicFloorExam']['tone'] } }))}>
              <option value="">—</option>
              <option value="hypertonic">Hypertonic</option>
              <option value="normal">Normal</option>
              <option value="hypotonic">Hypotonic</option>
            </NativeSelect>
          </Field>
          <Field label="Tenderness"><input className={inputCls} value={objective.pelvicFloorExam.tenderness} onChange={(e) => setObjective((o) => ({ ...o, pelvicFloorExam: { ...o.pelvicFloorExam, tenderness: e.target.value } }))} /></Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Prolapse Grade"><input className={inputCls} value={objective.prolapseGrade} onChange={(e) => setObjective((o) => ({ ...o, prolapseGrade: e.target.value }))} placeholder="e.g. Grade I cystocele" /></Field>
          <Field label="Diastasis Recti"><input className={inputCls} value={objective.diastasisRecti} onChange={(e) => setObjective((o) => ({ ...o, diastasisRecti: e.target.value }))} placeholder="e.g. 2cm supra-umbilical, doming" /></Field>
        </div>
        <Field label="Special Tests"><Textarea rows={2} value={objective.specialTests} onChange={(e) => setObjective((o) => ({ ...o, specialTests: e.target.value }))} placeholder="Cough/stress test, Q-tip test, etc…" /></Field>
        <Field label="Palpation / Circulation / Sensation"><Textarea rows={2} value={objective.palpation} onChange={(e) => setObjective((o) => ({ ...o, palpation: e.target.value }))} /></Field>

        {!showGeneralScreen ? (
          <button type="button" onClick={() => setShowGeneralScreen(true)} className="w-fit text-xs font-medium text-brand-600 hover:underline">
            + Add general musculoskeletal screen (posture, ROM, functional tests)
          </button>
        ) : (
          <>
            <Field label="Observation"><Textarea rows={2} value={objective.observation} onChange={(e) => setObjective((o) => ({ ...o, observation: e.target.value }))} placeholder="Posture, atrophy/hypertrophy, edema, skin condition, deformities…" /></Field>
            <Field label="Functional Tests"><Textarea rows={2} value={objective.functionalTests} onChange={(e) => setObjective((o) => ({ ...o, functionalTests: e.target.value }))} placeholder="Gait, weight-bearing, squat, other…" /></Field>
            <Field label="ROM / Strength Screen">
              <RepeatableList
                items={objective.romStrength}
                onChange={(romStrength) => setObjective((o) => ({ ...o, romStrength }))}
                newItem={emptyRomEntry}
                addLabel="Add Joint"
                emptyLabel="No general MSK findings recorded."
                renderRow={(r, update) => (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <Field label="Joint"><input className={inputCls} value={r.joint} onChange={(e) => update({ joint: e.target.value })} /></Field>
                    <Field label="Side"><input className={inputCls} value={r.side} onChange={(e) => update({ side: e.target.value })} /></Field>
                    <Field label="AROM / PROM"><input className={inputCls} value={r.aromNotes} onChange={(e) => update({ aromNotes: e.target.value })} /></Field>
                    <Field label="Strength"><input className={inputCls} value={r.strengthNotes} onChange={(e) => update({ strengthNotes: e.target.value })} /></Field>
                  </div>
                )}
              />
            </Field>
          </>
        )}
        <Field label="Additional Notes"><Textarea rows={2} value={objective.notes} onChange={(e) => setObjective((o) => ({ ...o, notes: e.target.value }))} /></Field>
      </SectionCard>

      {/* Analysis */}
      <SectionCard letter="A" label="Analysis">
        <Field label="Body Structure(s)"><input className={inputCls} value={analysis.bodyStructures} onChange={(e) => setAnalysis((a) => ({ ...a, bodyStructures: e.target.value }))} placeholder="Specific structure(s) that are the source of symptoms/limitations" /></Field>
        <Field label="Problem List (by priority)">
          <RepeatableList
            items={analysis.problemList}
            onChange={(problemList) => setAnalysis((a) => ({ ...a, problemList }))}
            newItem={emptyProblem}
            addLabel="Add Problem"
            emptyLabel="No problems listed yet."
            renderRow={(p, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Body Function (impairment)"><input className={inputCls} value={p.bodyFunction} onChange={(e) => update({ bodyFunction: e.target.value })} /></Field>
                <Field label="Activity & Participation (limitation)"><input className={inputCls} value={p.activityParticipation} onChange={(e) => update({ activityParticipation: e.target.value })} /></Field>
                <Field label="Environment (barrier)"><input className={inputCls} value={p.environment} onChange={(e) => update({ environment: e.target.value })} /></Field>
              </div>
            )}
          />
        </Field>
        <Field label="PT Diagnosis">
          <Textarea rows={2} value={analysis.ptDiagnosis} onChange={(e) => setAnalysis((a) => ({ ...a, ptDiagnosis: e.target.value }))} placeholder="[age] y.o. [sex] presenting with [nature/severity/phase] dt [impairments] affecting [activity/participation limitations]." />
        </Field>
        <Field label="Goals">
          <RepeatableList
            items={analysis.goals}
            onChange={(goals) => setAnalysis((a) => ({ ...a, goals }))}
            newItem={emptyGoal}
            addLabel="Add Goal"
            emptyLabel="No goals set yet."
            renderRow={(g, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Problem"><input className={inputCls} value={g.problem} onChange={(e) => update({ problem: e.target.value })} /></Field>
                <Field label="Short-Term Goal"><input className={inputCls} value={g.shortTerm} onChange={(e) => update({ shortTerm: e.target.value })} /></Field>
                <Field label="Long-Term Goal"><input className={inputCls} value={g.longTerm} onChange={(e) => update({ longTerm: e.target.value })} /></Field>
              </div>
            )}
          />
        </Field>
        <Field label="Additional Notes"><Textarea rows={2} value={analysis.notes} onChange={(e) => setAnalysis((a) => ({ ...a, notes: e.target.value }))} /></Field>
      </SectionCard>

      {/* Plan */}
      <SectionCard letter="P" label="Plan">
        <Field label="Treatment Plan (per problem)">
          <RepeatableList
            items={plan.items}
            onChange={(items) => setPlan((p) => ({ ...p, items }))}
            newItem={emptyPlanItem}
            addLabel="Add Plan Item"
            emptyLabel="No plan items yet."
            renderRow={(item, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Problem #"><input className={inputCls} value={item.problemRef} onChange={(e) => update({ problemRef: e.target.value })} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Treatment"><input className={inputCls} value={item.treatment} onChange={(e) => update({ treatment: e.target.value })} /></Field>
                </div>
              </div>
            )}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Expected Frequency"><input className={inputCls} value={plan.frequency} onChange={(e) => setPlan((p) => ({ ...p, frequency: e.target.value }))} placeholder="e.g. 6 sessions × 1×/wk" /></Field>
          <Field label="Reassessment Plan"><input className={inputCls} value={plan.reassessmentPlan} onChange={(e) => setPlan((p) => ({ ...p, reassessmentPlan: e.target.value }))} /></Field>
        </div>
        <Field label="Discharge Plan"><input className={inputCls} value={plan.dischargePlan} onChange={(e) => setPlan((p) => ({ ...p, dischargePlan: e.target.value }))} /></Field>
        <div className="flex items-center gap-2">
          <input id="consent" type="checkbox" checked={plan.consentObtained} onChange={(e) => setPlan((p) => ({ ...p, consentObtained: e.target.checked }))} />
          <label htmlFor="consent" className="text-sm text-primary">Treatment plan explained, understood & accepted by client</label>
        </div>
        <Field label="Additional Notes"><Textarea rows={2} value={plan.notes} onChange={(e) => setPlan((p) => ({ ...p, notes: e.target.value }))} /></Field>
      </SectionCard>

      {/* Interventions */}
      <SectionCard letter="I" label="Intervention">
        <RepeatableList
          items={interventions}
          onChange={setInterventions}
          newItem={emptyIntervention}
          addLabel="Add Intervention"
          emptyLabel="No interventions recorded yet."
          renderRow={(item, update) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Type">
                <NativeSelect value={item.type} onChange={(e) => update({ type: e.target.value as InterventionItem['type'] })}>
                  {INTERVENTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Details & Parameters"><input className={inputCls} value={item.details} onChange={(e) => update({ details: e.target.value })} /></Field>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Evaluation */}
      <SectionCard letter="E" label="Evaluation (post-intervention)">
        <Field label="Post-Session NPRS (0-10)">
          <input type="number" min={0} max={10} className={inputCls + ' max-w-[120px]'} value={evaluation.postNprs ?? ''} onChange={(e) => setEvaluation((ev) => ({ ...ev, postNprs: e.target.value === '' ? undefined : Number(e.target.value) }))} />
        </Field>
        <Field label="Patient's Reaction to Treatment"><Textarea rows={3} value={evaluation.patientReaction} onChange={(e) => setEvaluation((ev) => ({ ...ev, patientReaction: e.target.value }))} /></Field>
        <Field label="Objective Response"><Textarea rows={2} value={evaluation.objectiveResponse} onChange={(e) => setEvaluation((ev) => ({ ...ev, objectiveResponse: e.target.value }))} /></Field>
      </SectionCard>

      {/* Recommendations */}
      <SectionCard letter="R" label="Recommendations">
        <RepeatableList
          items={recommendations}
          onChange={setRecommendations}
          newItem={() => ({ text: '' })}
          addLabel="Add Recommendation"
          emptyLabel="No recommendations yet."
          renderRow={(r, update) => (
            <input className={inputCls} value={r.text} onChange={(e) => update({ text: e.target.value })} placeholder="To client / family / caregiver / other health professional…" />
          )}
        />
      </SectionCard>
    </>
  );
}

function ReadField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <span className="mb-0.5 block text-xs text-secondary">{label}</span>
      <span className="text-sm text-primary">{value}</span>
    </div>
  );
}

function ReadEmpty({ children }: { children: React.ReactNode }) {
  return <span className="text-sm italic text-tertiary">{children}</span>;
}

function PainPointBadge({ index }: { index: number }) {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
      {index + 1}
    </div>
  );
}

interface ChartReadOnlyBodyProps {
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  analysis: AnalysisSection;
  plan: PlanSection;
  interventions: InterventionItem[];
  evaluation: EvaluationSection;
  recommendations: string[];
}

export function ChartReadOnlyBody({ subjective, objective, analysis, plan, interventions, evaluation, recommendations }: ChartReadOnlyBodyProps) {
  const pf = objective.pelvicFloorExam;
  const hasPfExam = pf.power || pf.endurance || pf.repetitions || pf.fastContractions || pf.tone || pf.tenderness;

  return (
    <>
      {/* Subjective */}
      <SectionCard letter="S" label="Subjective">
        {subjective.painPoints.some((p) => p.bodyView) && (
          <BodyMap painPoints={subjective.painPoints} interactive={false} />
        )}
        {subjective.painPoints.length === 0 ? (
          <ReadEmpty>No pain points reported.</ReadEmpty>
        ) : (
          <div className="flex flex-col gap-3">
            {subjective.painPoints.map((pp, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-secondary p-3">
                <PainPointBadge index={i} />
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <ReadField label="Location" value={pp.location} />
                  <ReadField label="Description" value={pp.description} />
                  <ReadField label="NPRS" value={`${pp.nprs}/10`} />
                  <ReadField label="Pattern" value={pp.pattern} />
                  <ReadField label="Aggravating Factors" value={pp.aggravating} />
                  <ReadField label="Easing Factors" value={pp.easing} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadField label="AM Symptoms" value={subjective.amSymptoms} />
          <ReadField label="PM Symptoms" value={subjective.pmSymptoms} />
          <ReadField label="Sleeping Position" value={subjective.sleepingPosition} />
          <ReadField label="Night Pain" value={subjective.nightPain ? 'Yes' : 'No'} />
        </div>
        <ReadField label="Bladder / Bowel Update" value={subjective.bladderBowelUpdate} />
        <ReadField label="Additional Notes" value={subjective.notes} />
      </SectionCard>

      {/* Objective */}
      <SectionCard letter="O" label="Objective">
        {hasPfExam && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ReadField label="Power" value={pf.power ? `${pf.power}/5` : undefined} />
            <ReadField label="Endurance" value={pf.endurance ? `${pf.endurance} sec` : undefined} />
            <ReadField label="Repetitions" value={pf.repetitions || undefined} />
            <ReadField label="Fast Contractions" value={pf.fastContractions || undefined} />
            <ReadField label="Tone" value={pf.tone} />
            <ReadField label="Tenderness" value={pf.tenderness} />
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadField label="Prolapse Grade" value={objective.prolapseGrade} />
          <ReadField label="Diastasis Recti" value={objective.diastasisRecti} />
        </div>
        <ReadField label="Special Tests" value={objective.specialTests} />
        <ReadField label="Palpation / Circulation / Sensation" value={objective.palpation} />
        <ReadField label="Observation" value={objective.observation} />
        <ReadField label="Functional Tests" value={objective.functionalTests} />
        {objective.romStrength.length > 0 && (
          <div>
            <span className="mb-2 block text-xs text-secondary">ROM / Strength Screen</span>
            <div className="flex flex-col gap-2">
              {objective.romStrength.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-secondary p-3 sm:grid-cols-4">
                  <ReadField label="Joint" value={r.joint} />
                  <ReadField label="Side" value={r.side} />
                  <ReadField label="AROM / PROM" value={r.aromNotes} />
                  <ReadField label="Strength" value={r.strengthNotes} />
                </div>
              ))}
            </div>
          </div>
        )}
        <ReadField label="Additional Notes" value={objective.notes} />
        {!hasPfExam && !objective.observation && !objective.functionalTests && !objective.prolapseGrade && !objective.diastasisRecti && !objective.specialTests && !objective.palpation && !objective.notes && objective.romStrength.length === 0 && (
          <ReadEmpty>Not recorded</ReadEmpty>
        )}
      </SectionCard>

      {/* Analysis */}
      <SectionCard letter="A" label="Analysis">
        <ReadField label="Body Structure(s)" value={analysis.bodyStructures} />
        {analysis.problemList.length > 0 && (
          <div>
            <span className="mb-2 block text-xs text-secondary">Problem List</span>
            <div className="flex flex-col gap-2">
              {analysis.problemList.map((p, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-secondary p-3 sm:grid-cols-3">
                  <ReadField label="Body Function" value={p.bodyFunction} />
                  <ReadField label="Activity & Participation" value={p.activityParticipation} />
                  <ReadField label="Environment" value={p.environment} />
                </div>
              ))}
            </div>
          </div>
        )}
        <ReadField label="PT Diagnosis" value={analysis.ptDiagnosis} />
        {analysis.goals.length > 0 && (
          <div>
            <span className="mb-2 block text-xs text-secondary">Goals</span>
            <div className="flex flex-col gap-2">
              {analysis.goals.map((g, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-secondary p-3 sm:grid-cols-3">
                  <ReadField label="Problem" value={g.problem} />
                  <ReadField label="Short-Term Goal" value={g.shortTerm} />
                  <ReadField label="Long-Term Goal" value={g.longTerm} />
                </div>
              ))}
            </div>
          </div>
        )}
        <ReadField label="Additional Notes" value={analysis.notes} />
        {!analysis.bodyStructures && analysis.problemList.length === 0 && !analysis.ptDiagnosis && analysis.goals.length === 0 && !analysis.notes && (
          <ReadEmpty>Not recorded</ReadEmpty>
        )}
      </SectionCard>

      {/* Plan */}
      <SectionCard letter="P" label="Plan">
        {plan.items.length > 0 && (
          <div className="flex flex-col gap-2">
            {plan.items.map((item, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-secondary p-3 sm:grid-cols-3">
                <ReadField label="Problem #" value={item.problemRef} />
                <div className="sm:col-span-2"><ReadField label="Treatment" value={item.treatment} /></div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadField label="Expected Frequency" value={plan.frequency} />
          <ReadField label="Reassessment Plan" value={plan.reassessmentPlan} />
        </div>
        <ReadField label="Discharge Plan" value={plan.dischargePlan} />
        <ReadField label="Client Consent" value={plan.consentObtained ? 'Treatment plan explained, understood & accepted' : 'Not yet obtained'} />
        <ReadField label="Additional Notes" value={plan.notes} />
      </SectionCard>

      {/* Interventions */}
      <SectionCard letter="I" label="Intervention">
        {interventions.length === 0 ? (
          <ReadEmpty>No interventions recorded.</ReadEmpty>
        ) : (
          <div className="flex flex-col gap-2">
            {interventions.map((item, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-secondary p-3 sm:grid-cols-3">
                <ReadField label="Type" value={item.type} />
                <div className="sm:col-span-2"><ReadField label="Details & Parameters" value={item.details} /></div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Evaluation */}
      <SectionCard letter="E" label="Evaluation (post-intervention)">
        <ReadField label="Post-Session NPRS" value={evaluation.postNprs !== undefined ? `${evaluation.postNprs}/10` : undefined} />
        <ReadField label="Patient's Reaction to Treatment" value={evaluation.patientReaction} />
        <ReadField label="Objective Response" value={evaluation.objectiveResponse} />
        {evaluation.postNprs === undefined && !evaluation.patientReaction && !evaluation.objectiveResponse && <ReadEmpty>Not recorded</ReadEmpty>}
      </SectionCard>

      {/* Recommendations */}
      <SectionCard letter="R" label="Recommendations">
        {recommendations.length === 0 ? (
          <ReadEmpty>No recommendations recorded.</ReadEmpty>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {recommendations.map((r, i) => <li key={i} className="text-sm text-primary">{r}</li>)}
          </ul>
        )}
      </SectionCard>
    </>
  );
}

/** Read-only body for a single chart session — Notes, History (intake only), H-SOAPIER sections,
 *  Signed card, and Amendments. Shared between the full-screen chart page and the inline Chart tab view. */
export function ChartSessionReadPanel({ patient, session }: { patient: Patient; session: ChartSession }) {
  const amendments = session.amendments ?? [];
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === session.signatureFontId);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
        <span className="mb-2 block text-sm font-semibold text-primary">Notes</span>
        <span className="whitespace-pre-wrap text-sm text-secondary">{session.summary || 'No notes recorded.'}</span>
      </div>

      <p className="mt-2 text-sm font-semibold text-primary">H-SOAPIER Chart</p>

      {session.isIntakeSession && <HistoryCard patient={patient} />}

      <ChartReadOnlyBody
        subjective={session.subjective}
        objective={session.objective}
        analysis={session.analysis}
        plan={session.plan}
        interventions={session.interventions}
        evaluation={session.evaluation}
        recommendations={session.recommendations}
      />

      {session.signedAt && (
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <span className="mb-2 block text-sm font-semibold text-primary">Signed</span>
          <span style={{ fontFamily: signatureFont?.variable }} className="block text-3xl text-primary">
            {session.signedByName}
          </span>
          <span className="mt-1 block text-xs text-tertiary">
            {new Date(session.signedAt).toLocaleString()}
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
    </div>
  );
}
