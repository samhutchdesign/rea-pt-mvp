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
import { cx } from '@/utils/cx';
import { ChevronDown, ChevronUp, MapPin, X } from 'lucide-react';
import type {
  Patient, ChartSession, PainPoint, RomEntry, StrengthEntry, ProblemListItem, GoalItem, PlanItem, InterventionItem,
  SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, EvaluationSection, JointMovementOption,
} from '@/lib/types';
import { JOINT_MOVEMENTS } from '@/lib/types';

const tableInputCls = 'w-full rounded border border-secondary px-1.5 py-1 text-xs text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300';
const th = 'px-3 py-3 text-left text-base font-normal text-primary whitespace-nowrap';
const td = 'px-3 py-3 align-top text-base text-primary';

function movementLabel(movement: JointMovementOption | '', movementOther: string): string {
  if (!movement) return '';
  return movement === 'Other' ? (movementOther || 'Other') : movement;
}

function MovementSelect({ movement, movementOther, onMovementChange, onMovementOtherChange }: {
  movement: JointMovementOption | ''; movementOther: string;
  onMovementChange: (v: JointMovementOption | '') => void; onMovementOtherChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <NativeSelect className="pl-2 pr-6 py-1 text-xs" value={movement} onChange={(e) => onMovementChange(e.target.value as JointMovementOption | '')}>
        <option value="">—</option>
        {JOINT_MOVEMENTS.map((m) => <option key={m} value={m}>{m}</option>)}
      </NativeSelect>
      {movement === 'Other' && (
        <input className={tableInputCls} placeholder="Specify movement" value={movementOther} onChange={(e) => onMovementOtherChange(e.target.value)} />
      )}
    </div>
  );
}

export const inputCls = 'w-full rounded-lg border border-secondary px-3 py-2 text-sm text-primary shadow-xs outline-none focus:ring-2 focus:ring-brand-300';

export const INTERVENTION_TYPES: InterventionItem['type'][] = ['Manual Therapy', 'Exercise', 'Modality', 'Education', 'Other'];

export const emptyPainPoint = (): PainPoint => ({ location: '', description: '', nprs: 0, nprsContext: '', pattern: 'intermittent', aggravating: '', easing: '', upPain: '', downPain: '' });
export const emptyRomEntry = (): RomEntry => ({
  jointName: '', movement: '', movementOther: '',
  leftArom: '', leftAromPain: '', leftProm: '', leftPromPain: '',
  rightArom: '', rightAromPain: '', rightProm: '', rightPromPain: '',
  endFeel: '',
});
export const emptyStrengthEntry = (): StrengthEntry => ({
  jointName: '', movement: '', movementOther: '', isometric: '', isometricPain: '', mmtMuscle: '',
});
export const emptyProblem = (): ProblemListItem => ({ bodyFunction: '', activityParticipation: '', environment: '' });
export const emptyGoal = (): GoalItem => ({ problem: '', shortTerm: '', longTerm: '' });
export const emptyPlanItem = (): PlanItem => ({ problemRef: '', treatment: '' });
export const emptyIntervention = (): InterventionItem => ({ type: 'Exercise', details: '' });

export const emptySubjective = (): SubjectiveSection => ({ painPoints: [], amSymptoms: '', pmSymptoms: '', nightPain: false, sleepingPosition: '', notes: '' });
export const emptyObjective = (): ObjectiveSection => ({
  generalObservation: '',
  posture: '', atrophyHypertrophy: '', edema: '', skinCondition: '', deformities: '', observationOther: '',
  mobility: [''], weightBearing: '', upOnToes: '', wbdf: '', torsionTest: '', squat: '', functionalOther: '',
  rom: [emptyRomEntry()], strengthUnaffectedSide: '', strengthUnaffectedNotes: '', strength: [emptyStrengthEntry()],
  notes: '',
});
export const emptyAnalysis = (): AnalysisSection => ({ bodyStructures: '', problemList: [emptyProblem()], ptDiagnosis: '', goals: [emptyGoal()], notes: '' });
export const emptyPlan = (): PlanSection => ({ items: [], frequency: '', reassessmentPlan: '', dischargePlan: '', consentObtained: true, notes: '' });
export const emptyEvaluation = (): EvaluationSection => ({ patientReaction: '', objectiveResponse: '' });

export function SectionCard({ label, defaultOpen = true, children }: { letter?: string; label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 border-b border-secondary bg-transparent px-2 py-4 border-x-0 border-t-0 cursor-pointer text-left"
      >
        <span className="font-display flex-1 text-2xl font-medium text-primary">{label}</span>
        {open ? <ChevronUp size={24} className="shrink-0 text-primary" /> : <ChevronDown size={24} className="shrink-0 text-primary" />}
      </button>
      {open && <div className="flex flex-col gap-6 pt-6">{children}</div>}
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
  isDictation?: boolean;
  subjective: SubjectiveSection;
  setSubjective: (updater: (s: SubjectiveSection) => SubjectiveSection) => void;
  objective: ObjectiveSection;
  setObjective: (updater: (o: ObjectiveSection) => ObjectiveSection) => void;
  analysis: AnalysisSection;
  setAnalysis: (updater: (a: AnalysisSection) => AnalysisSection) => void;
  plan: PlanSection;
  setPlan: (updater: (p: PlanSection) => PlanSection) => void;
  interventions: InterventionItem[];
  setInterventions: (items: InterventionItem[]) => void;
  interventionsRawText?: string;
  setInterventionsRawText?: (text: string) => void;
  evaluation: EvaluationSection;
  setEvaluation: (updater: (e: EvaluationSection) => EvaluationSection) => void;
}

export function ChartFormBody({
  isDictation, subjective, setSubjective, objective, setObjective,
  analysis, setAnalysis, plan, setPlan, interventions, setInterventions,
  interventionsRawText, setInterventionsRawText, evaluation, setEvaluation,
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

  const handleMovePainPoint = (index: number, x: number, y: number) => setSubjective((s) => ({
    ...s,
    painPoints: s.painPoints.map((p, i) => (i === index ? { ...p, x, y } : p)),
  }));

  const handleDeletePainPoint = (index: number) => setSubjective((s) => ({
    ...s,
    painPoints: s.painPoints.filter((_, i) => i !== index),
  }));

  const updateRom = (i: number, patch: Partial<RomEntry>) => setObjective((o) => ({ ...o, rom: o.rom.map((r, ri) => (ri === i ? { ...r, ...patch } : r)) }));
  const removeRom = (i: number) => setObjective((o) => ({ ...o, rom: o.rom.filter((_, ri) => ri !== i) }));
  const addRom = () => setObjective((o) => ({ ...o, rom: [...o.rom, emptyRomEntry()] }));

  const updateStrength = (i: number, patch: Partial<StrengthEntry>) => setObjective((o) => ({ ...o, strength: o.strength.map((s, si) => (si === i ? { ...s, ...patch } : s)) }));
  const removeStrength = (i: number) => setObjective((o) => ({ ...o, strength: o.strength.filter((_, si) => si !== i) }));
  const addStrength = () => setObjective((o) => ({ ...o, strength: [...o.strength, emptyStrengthEntry()] }));

  return (
    <>
      {/* Subjective */}
      <SectionCard letter="S" label="Subjective">
        {isDictation ? (
          <>
            <Field label="Pain Points">
              <BodyMap
                painPoints={subjective.painPoints}
                onCreate={handleCreate}
                onMove={handleMovePainPoint}
                onDelete={handleDeletePainPoint}
                simplified
              />
            </Field>
            <Field label="Subjective">
              <Textarea
                rows={8}
                value={subjective.rawText ?? ''}
                onChange={(e) => setSubjective((s) => ({ ...s, rawText: e.target.value }))}
                placeholder="Dictate or type everything the patient reports — pain points, AM/PM symptoms, sleeping position, night pain, etc…"
              />
            </Field>
          </>
        ) : (
          <>
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
                    <Field label="NPRS (0-10)">
                      <div className="flex gap-2 min-w-0">
                        <input type="number" min={0} max={10} placeholder="/10" className={cx(inputCls, 'w-16 shrink-0')} value={pp.nprs} onChange={(e) => update({ nprs: Number(e.target.value) })} />
                        <input className={cx(inputCls, 'min-w-0 flex-1 w-auto')} value={pp.nprsContext} onChange={(e) => update({ nprsContext: e.target.value })} />
                      </div>
                    </Field>
                    <Field label="Pattern">
                      <NativeSelect value={pp.pattern} onChange={(e) => update({ pattern: e.target.value as PainPoint['pattern'] })}>
                        <option value="constant">Constant</option>
                        <option value="intermittent">Intermittent</option>
                      </NativeSelect>
                    </Field>
                    <Field label="Aggravating Factors"><input className={inputCls} value={pp.aggravating} onChange={(e) => update({ aggravating: e.target.value })} /></Field>
                    <Field label="Easing Factors"><input className={inputCls} value={pp.easing} onChange={(e) => update({ easing: e.target.value })} /></Field>
                    <Field label="↑ P"><input className={inputCls} value={pp.upPain} onChange={(e) => update({ upPain: e.target.value })} /></Field>
                    <Field label="↓ P"><input className={inputCls} value={pp.downPain} onChange={(e) => update({ downPain: e.target.value })} /></Field>
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
        <Field label="Additional Notes">
          <Textarea rows={3} value={subjective.notes} onChange={(e) => setSubjective((s) => ({ ...s, notes: e.target.value }))} placeholder="Anything else the patient reports…" />
        </Field>
          </>
        )}
      </SectionCard>

      {/* Objective */}
      <SectionCard letter="O" label="Objective">
        {isDictation ? (
          <Field label="Observation & Functional Tests">
            <Textarea
              rows={6}
              value={objective.rawText ?? ''}
              onChange={(e) => setObjective((o) => ({ ...o, rawText: e.target.value }))}
              placeholder="Dictate or type general observation, posture, edema, skin condition, functional tests, etc…"
            />
          </Field>
        ) : (
          <>
        <Field label="General Observation"><Textarea rows={2} value={objective.generalObservation} onChange={(e) => setObjective((o) => ({ ...o, generalObservation: e.target.value }))} /></Field>

        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">Observation</span>
          <div className="flex flex-col gap-3">
            <Field label="Posture"><input className={inputCls} value={objective.posture} onChange={(e) => setObjective((o) => ({ ...o, posture: e.target.value }))} /></Field>
            <Field label="Atrophy/Hypertrophy (girth)"><input className={inputCls} value={objective.atrophyHypertrophy} onChange={(e) => setObjective((o) => ({ ...o, atrophyHypertrophy: e.target.value }))} /></Field>
            <Field label="Edema"><input className={inputCls} value={objective.edema} onChange={(e) => setObjective((o) => ({ ...o, edema: e.target.value }))} /></Field>
            <Field label="Skin condition, color, scar(s)"><input className={inputCls} value={objective.skinCondition} onChange={(e) => setObjective((o) => ({ ...o, skinCondition: e.target.value }))} /></Field>
            <Field label="Deformities"><input className={inputCls} value={objective.deformities} onChange={(e) => setObjective((o) => ({ ...o, deformities: e.target.value }))} /></Field>
            <Field label="Other"><input className={inputCls} value={objective.observationOther} onChange={(e) => setObjective((o) => ({ ...o, observationOther: e.target.value }))} /></Field>
          </div>
        </div>

        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">Functional Tests</span>
          <div className="flex flex-col gap-3">
            <Field label="Mobility (gait, transfer, stairs)">
              <div className="flex flex-col gap-2">
                {objective.mobility.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-tertiary">•</span>
                    <input
                      className={inputCls + ' max-w-[240px]'}
                      value={item}
                      onChange={(e) => setObjective((o) => ({ ...o, mobility: o.mobility.map((m, mi) => (mi === i ? e.target.value : m)) }))}
                    />
                    <button
                      type="button"
                      onClick={() => setObjective((o) => ({ ...o, mobility: o.mobility.filter((_, mi) => mi !== i) }))}
                      aria-label="Remove"
                      className="shrink-0 text-tertiary hover:text-error-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setObjective((o) => ({ ...o, mobility: [...o.mobility, ''] }))}
                  className="w-fit text-xs font-medium text-brand-600 hover:underline"
                >
                  + Add line
                </button>
              </div>
            </Field>
            <Field label="WB (unilateral, bilateral)"><input className={inputCls} value={objective.weightBearing} onChange={(e) => setObjective((o) => ({ ...o, weightBearing: e.target.value }))} /></Field>
            <Field label="Up on toes"><input className={inputCls} value={objective.upOnToes} onChange={(e) => setObjective((o) => ({ ...o, upOnToes: e.target.value }))} /></Field>
            <Field label="WBDF (weight bearing dorsiflexion)"><input className={inputCls} value={objective.wbdf} onChange={(e) => setObjective((o) => ({ ...o, wbdf: e.target.value }))} /></Field>
            <Field label="Torsion test (body torque)"><input className={inputCls} value={objective.torsionTest} onChange={(e) => setObjective((o) => ({ ...o, torsionTest: e.target.value }))} /></Field>
            <Field label="Squat"><input className={inputCls} value={objective.squat} onChange={(e) => setObjective((o) => ({ ...o, squat: e.target.value }))} /></Field>
            <Field label="Others"><input className={inputCls} value={objective.functionalOther} onChange={(e) => setObjective((o) => ({ ...o, functionalOther: e.target.value }))} /></Field>
          </div>
        </div>
          </>
        )}

        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">ROM</span>
          <div className="overflow-x-auto rounded-lg border border-secondary">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-secondary bg-secondary_alt">
                  <th className={th}>Joint</th>
                  <th className={th}>Movement</th>
                  <th className={th}>L AROM°</th>
                  <th className={th}>L PROM°</th>
                  <th className={th}>R AROM°</th>
                  <th className={th}>R PROM°</th>
                  <th className={th}>EF</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {objective.rom.map((r, i) => (
                  <tr key={i} className="border-b border-secondary last:border-0">
                    <td className={td}><input className={tableInputCls} style={{ width: 80 }} value={r.jointName} onChange={(e) => updateRom(i, { jointName: e.target.value })} /></td>
                    <td className={td} style={{ minWidth: 110 }}>
                      <MovementSelect
                        movement={r.movement} movementOther={r.movementOther}
                        onMovementChange={(movement) => updateRom(i, { movement })}
                        onMovementOtherChange={(movementOther) => updateRom(i, { movementOther })}
                      />
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <input className={tableInputCls} style={{ width: 44 }} placeholder="°" value={r.leftArom} onChange={(e) => updateRom(i, { leftArom: e.target.value })} />
                        <input type="number" min={0} max={10} className={tableInputCls} style={{ width: 44 }} placeholder="/10" value={r.leftAromPain} onChange={(e) => updateRom(i, { leftAromPain: e.target.value === '' ? '' : Number(e.target.value) })} />
                      </div>
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <input className={tableInputCls} style={{ width: 44 }} placeholder="°" value={r.leftProm} onChange={(e) => updateRom(i, { leftProm: e.target.value })} />
                        <input type="number" min={0} max={10} className={tableInputCls} style={{ width: 44 }} placeholder="/10" value={r.leftPromPain} onChange={(e) => updateRom(i, { leftPromPain: e.target.value === '' ? '' : Number(e.target.value) })} />
                      </div>
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <input className={tableInputCls} style={{ width: 44 }} placeholder="°" value={r.rightArom} onChange={(e) => updateRom(i, { rightArom: e.target.value })} />
                        <input type="number" min={0} max={10} className={tableInputCls} style={{ width: 44 }} placeholder="/10" value={r.rightAromPain} onChange={(e) => updateRom(i, { rightAromPain: e.target.value === '' ? '' : Number(e.target.value) })} />
                      </div>
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <input className={tableInputCls} style={{ width: 44 }} placeholder="°" value={r.rightProm} onChange={(e) => updateRom(i, { rightProm: e.target.value })} />
                        <input type="number" min={0} max={10} className={tableInputCls} style={{ width: 44 }} placeholder="/10" value={r.rightPromPain} onChange={(e) => updateRom(i, { rightPromPain: e.target.value === '' ? '' : Number(e.target.value) })} />
                      </div>
                    </td>
                    <td className={td}><input className={tableInputCls} style={{ width: 70 }} value={r.endFeel} onChange={(e) => updateRom(i, { endFeel: e.target.value })} /></td>
                    <td className={td}>
                      <button type="button" onClick={() => removeRom(i)} aria-label="Remove" className="text-tertiary hover:text-error-600">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addRom} className="mt-2 w-fit text-xs font-medium text-brand-600 hover:underline">+ Add Measurement</button>
        </div>

        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">Strength</span>
          <div className="mb-3 flex items-end gap-3">
            <div className="w-40 shrink-0">
              <span className="mb-1 block text-xs text-secondary">Unaffected Side</span>
              <NativeSelect
                value={objective.strengthUnaffectedSide}
                onChange={(e) => setObjective((o) => ({ ...o, strengthUnaffectedSide: e.target.value as ObjectiveSection['strengthUnaffectedSide'] }))}
              >
                <option value="">—</option>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </NativeSelect>
            </div>
            <div className="flex-1">
              <span className="mb-1 block text-xs text-secondary">Notes (if abnormal)</span>
              <input className={inputCls} value={objective.strengthUnaffectedNotes} onChange={(e) => setObjective((o) => ({ ...o, strengthUnaffectedNotes: e.target.value }))} />
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-secondary">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-secondary bg-secondary_alt">
                  <th className={th}>Joint</th>
                  <th className={th}>Movement</th>
                  <th className={th}>RISOM</th>
                  <th className={th}>Isometric Pain</th>
                  <th className={th}>MMT</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {objective.strength.map((s, i) => (
                  <tr key={i} className="border-b border-secondary last:border-0">
                    <td className={td}><input className={tableInputCls} style={{ width: 80 }} value={s.jointName} onChange={(e) => updateStrength(i, { jointName: e.target.value })} /></td>
                    <td className={td} style={{ minWidth: 110 }}>
                      <MovementSelect
                        movement={s.movement} movementOther={s.movementOther}
                        onMovementChange={(movement) => updateStrength(i, { movement })}
                        onMovementOtherChange={(movementOther) => updateStrength(i, { movementOther })}
                      />
                    </td>
                    <td className={td}>
                      <NativeSelect className="pl-2 pr-6 py-1 text-xs" value={s.isometric} onChange={(e) => updateStrength(i, { isometric: e.target.value as StrengthEntry['isometric'] })}>
                        <option value="">—</option>
                        <option value="strong">Strong</option>
                        <option value="weak">Weak</option>
                      </NativeSelect>
                    </td>
                    <td className={td}><input type="number" min={0} max={10} className={tableInputCls} style={{ width: 48 }} value={s.isometricPain} onChange={(e) => updateStrength(i, { isometricPain: e.target.value === '' ? '' : Number(e.target.value) })} /></td>
                    <td className={td}><input className={tableInputCls} style={{ width: 120 }} value={s.mmtMuscle} onChange={(e) => updateStrength(i, { mmtMuscle: e.target.value })} /></td>
                    <td className={td}>
                      <button type="button" onClick={() => removeStrength(i)} aria-label="Remove" className="text-tertiary hover:text-error-600">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addStrength} className="mt-2 w-fit text-xs font-medium text-brand-600 hover:underline">+ Add Measurement</button>
        </div>
        {!isDictation && (
          <Field label="Additional Notes"><Textarea rows={2} value={objective.notes} onChange={(e) => setObjective((o) => ({ ...o, notes: e.target.value }))} /></Field>
        )}
      </SectionCard>

      {/* Analysis */}
      <SectionCard letter="A" label="Analysis">
        {isDictation ? (
          <Field label="Analysis">
            <Textarea
              rows={6}
              value={analysis.rawText ?? ''}
              onChange={(e) => setAnalysis((a) => ({ ...a, rawText: e.target.value }))}
              placeholder="Dictate or type body structures, problem list, PT diagnosis, PT goals, etc…"
            />
          </Field>
        ) : (
          <>
        <Field label="Body Structure(s)"><input className={inputCls} value={analysis.bodyStructures} onChange={(e) => setAnalysis((a) => ({ ...a, bodyStructures: e.target.value }))} placeholder="Specific structure(s) that are the source of symptoms/limitations" /></Field>
        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">Problem List (by priority)</span>
          <RepeatableList
            items={analysis.problemList}
            onChange={(problemList) => setAnalysis((a) => ({ ...a, problemList }))}
            newItem={emptyProblem}
            addLabel="Add Problem"
            emptyLabel="No problems listed yet."
            reorderable
            renderRow={(p, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Body Function (impairment)"><input className={inputCls} value={p.bodyFunction} onChange={(e) => update({ bodyFunction: e.target.value })} /></Field>
                <Field label="Activity & Participation (limitation)"><input className={inputCls} value={p.activityParticipation} onChange={(e) => update({ activityParticipation: e.target.value })} /></Field>
                <Field label="Environment (barrier)"><input className={inputCls} value={p.environment} onChange={(e) => update({ environment: e.target.value })} /></Field>
              </div>
            )}
          />
        </div>
        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">PT Diagnosis</span>
          <Textarea rows={2} value={analysis.ptDiagnosis} onChange={(e) => setAnalysis((a) => ({ ...a, ptDiagnosis: e.target.value }))} placeholder="[age] y.o. [sex] presenting with [nature/severity/phase] dt [impairments] affecting [activity/participation limitations]." />
        </div>
        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">PT Goals</span>
          <RepeatableList
            items={analysis.goals}
            onChange={(goals) => setAnalysis((a) => ({ ...a, goals }))}
            newItem={emptyGoal}
            addLabel="Add Goal"
            emptyLabel="No goals set yet."
            reorderable
            renderRow={(g, update) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Problem"><input className={inputCls} value={g.problem} onChange={(e) => update({ problem: e.target.value })} /></Field>
                <Field label="Short-Term Goal"><input className={inputCls} value={g.shortTerm} onChange={(e) => update({ shortTerm: e.target.value })} /></Field>
                <Field label="Long-Term Goal"><input className={inputCls} value={g.longTerm} onChange={(e) => update({ longTerm: e.target.value })} /></Field>
              </div>
            )}
          />
        </div>
        <Field label="Additional Notes"><Textarea rows={2} value={analysis.notes} onChange={(e) => setAnalysis((a) => ({ ...a, notes: e.target.value }))} /></Field>
          </>
        )}
      </SectionCard>

      {/* Plan */}
      <SectionCard letter="P" label="Plan">
        {isDictation ? (
          <Field label="Plan">
            <Textarea
              rows={6}
              value={plan.rawText ?? ''}
              onChange={(e) => setPlan((p) => ({ ...p, rawText: e.target.value }))}
              placeholder="Dictate or type treatment plan, expected frequency, reassessment plan, discharge plan, etc…"
            />
          </Field>
        ) : (
          <>
        <div>
          <span className="mb-3 block text-sm font-semibold text-primary">Treatment Plan (per problem)</span>
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
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Expected Frequency"><input className={inputCls} value={plan.frequency} onChange={(e) => setPlan((p) => ({ ...p, frequency: e.target.value }))} placeholder="e.g. 6 sessions × 1×/wk" /></Field>
          <Field label="Reassessment Plan"><input className={inputCls} value={plan.reassessmentPlan} onChange={(e) => setPlan((p) => ({ ...p, reassessmentPlan: e.target.value }))} /></Field>
        </div>
        <Field label="Discharge Plan"><input className={inputCls} value={plan.dischargePlan} onChange={(e) => setPlan((p) => ({ ...p, dischargePlan: e.target.value }))} /></Field>
        <Field label="Additional Notes"><Textarea rows={2} value={plan.notes} onChange={(e) => setPlan((p) => ({ ...p, notes: e.target.value }))} /></Field>
          </>
        )}
        <div className="flex items-center gap-2">
          <input id="consent" type="checkbox" checked={plan.consentObtained} onChange={(e) => setPlan((p) => ({ ...p, consentObtained: e.target.checked }))} />
          <label htmlFor="consent" className="text-sm text-primary">Treatment plan explained, understood & accepted by client</label>
        </div>
      </SectionCard>

      {/* Interventions */}
      <SectionCard letter="I" label="Intervention">
        {isDictation ? (
          <Field label="Intervention">
            <Textarea
              rows={6}
              value={interventionsRawText ?? ''}
              onChange={(e) => setInterventionsRawText?.(e.target.value)}
              placeholder="Dictate or type interventions performed this session…"
            />
          </Field>
        ) : (
        <RepeatableList
          items={interventions}
          onChange={setInterventions}
          newItem={emptyIntervention}
          addLabel="Add Intervention"
          emptyLabel="No interventions recorded yet."
          reorderable
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
        )}
      </SectionCard>

      {/* Evaluation */}
      <SectionCard letter="E" label="Evaluation (post-intervention)">
        {isDictation ? (
          <Field label="Evaluation">
            <Textarea
              rows={6}
              value={evaluation.rawText ?? ''}
              onChange={(e) => setEvaluation((ev) => ({ ...ev, rawText: e.target.value }))}
              placeholder="Dictate or type post-session NPRS, patient's reaction to treatment, objective response, etc…"
            />
          </Field>
        ) : (
          <>
        <Field label="Post-Session NPRS (0-10)">
          <input type="number" min={0} max={10} className={inputCls + ' max-w-[120px]'} value={evaluation.postNprs ?? ''} onChange={(e) => setEvaluation((ev) => ({ ...ev, postNprs: e.target.value === '' ? undefined : Number(e.target.value) }))} />
        </Field>
        <Field label="Patient's Reaction to Treatment"><Textarea rows={3} value={evaluation.patientReaction} onChange={(e) => setEvaluation((ev) => ({ ...ev, patientReaction: e.target.value }))} /></Field>
        <Field label="Objective Response"><Textarea rows={2} value={evaluation.objectiveResponse} onChange={(e) => setEvaluation((ev) => ({ ...ev, objectiveResponse: e.target.value }))} /></Field>
          </>
        )}
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

/** Renders a dictation section's rawText as a real bulleted list — splits on newlines and strips any leading -/•/* marker. */
function ReadBulletedText({ text, emptyLabel }: { text?: string; emptyLabel: string }) {
  const lines = (text ?? '')
    .split('\n')
    .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean);
  if (lines.length === 0) return <ReadEmpty>{emptyLabel}</ReadEmpty>;
  return (
    <ul className="list-disc space-y-3 pl-6 text-base text-primary">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ul>
  );
}

function PainPointBadge({ index }: { index: number }) {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
      {index + 1}
    </div>
  );
}

interface ChartReadOnlyBodyProps {
  isDictation?: boolean;
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  analysis: AnalysisSection;
  plan: PlanSection;
  interventions: InterventionItem[];
  interventionsRawText?: string;
  evaluation: EvaluationSection;
}

export function ChartReadOnlyBody({ isDictation, subjective, objective, analysis, plan, interventions, interventionsRawText, evaluation }: ChartReadOnlyBodyProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Subjective */}
      <SectionCard letter="S" label="Subjective">
        {isDictation ? (
          <>
            {subjective.painPoints.some((p) => p.bodyView) && (
              <BodyMap painPoints={subjective.painPoints} interactive={false} />
            )}
            <ReadBulletedText text={subjective.rawText} emptyLabel="No subjective notes recorded." />
          </>
        ) : (
          <>
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
                  <ReadField label="NPRS" value={pp.nprsContext ? `${pp.nprs}/10 — ${pp.nprsContext}` : `${pp.nprs}/10`} />
                  <ReadField label="Pattern" value={pp.pattern} />
                  <ReadField label="Aggravating Factors" value={pp.aggravating} />
                  <ReadField label="Easing Factors" value={pp.easing} />
                  <ReadField label="↑ P" value={pp.upPain} />
                  <ReadField label="↓ P" value={pp.downPain} />
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
        <ReadField label="Additional Notes" value={subjective.notes} />
          </>
        )}
      </SectionCard>

      {/* Objective */}
      <SectionCard letter="O" label="Objective">
        {isDictation ? (
          <ReadBulletedText text={objective.rawText} emptyLabel="No observation notes recorded." />
        ) : (
          <>
        <ReadField label="General Observation" value={objective.generalObservation} />
        {(objective.posture || objective.atrophyHypertrophy || objective.edema || objective.skinCondition || objective.deformities || objective.observationOther) && (
          <div>
            <span className="mb-2 block text-xs text-secondary">Observation</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ReadField label="Posture" value={objective.posture} />
              <ReadField label="Atrophy/Hypertrophy (girth)" value={objective.atrophyHypertrophy} />
              <ReadField label="Edema" value={objective.edema} />
              <ReadField label="Skin condition, color, scar(s)" value={objective.skinCondition} />
              <ReadField label="Deformities" value={objective.deformities} />
              <ReadField label="Other" value={objective.observationOther} />
            </div>
          </div>
        )}
        {(objective.mobility.some(Boolean) || objective.weightBearing || objective.upOnToes || objective.wbdf || objective.torsionTest || objective.squat || objective.functionalOther) && (
          <div>
            <span className="mb-2 block text-xs text-secondary">Functional Tests</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {objective.mobility.filter(Boolean).length > 0 && (
                <div>
                  <span className="mb-0.5 block text-xs text-secondary">Mobility (gait, transfer, stairs)</span>
                  <ul className="list-disc pl-4 text-sm text-primary">
                    {objective.mobility.filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              <ReadField label="WB (unilateral, bilateral)" value={objective.weightBearing} />
              <ReadField label="Up on toes" value={objective.upOnToes} />
              <ReadField label="WBDF (weight bearing dorsiflexion)" value={objective.wbdf} />
              <ReadField label="Torsion test (body torque)" value={objective.torsionTest} />
              <ReadField label="Squat" value={objective.squat} />
              <ReadField label="Others" value={objective.functionalOther} />
            </div>
          </div>
        )}
          </>
        )}
        {objective.rom.length > 0 && (
          <div>
            <span className="font-display mb-3 block text-lg font-medium text-primary">ROM</span>
            <div className="overflow-x-auto rounded-lg border border-secondary">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-secondary bg-secondary_alt">
                    <th className={th}>Joint</th>
                    <th className={th}>Movement</th>
                    <th className={th}>L AROM°</th>
                    <th className={th}>L PROM°</th>
                    <th className={th}>R AROM°</th>
                    <th className={th}>R PROM°</th>
                    <th className={th}>EF</th>
                  </tr>
                </thead>
                <tbody>
                  {objective.rom.map((r, i) => (
                    <tr key={i} className="border-b border-secondary last:border-0">
                      <td className={td}>{r.jointName || '—'}</td>
                      <td className={td}>{movementLabel(r.movement, r.movementOther) || '—'}</td>
                      <td className={td}>{r.leftArom ? `${r.leftArom}° (${r.leftAromPain || 0}/10)` : '—'}</td>
                      <td className={td}>{r.leftProm ? `${r.leftProm}° (${r.leftPromPain || 0}/10)` : '—'}</td>
                      <td className={td}>{r.rightArom ? `${r.rightArom}° (${r.rightAromPain || 0}/10)` : '—'}</td>
                      <td className={td}>{r.rightProm ? `${r.rightProm}° (${r.rightPromPain || 0}/10)` : '—'}</td>
                      <td className={td}>{r.endFeel || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {(objective.strengthUnaffectedSide || objective.strengthUnaffectedNotes || objective.strength.length > 0) && (
          <div>
            <span className="font-display mb-3 block text-lg font-medium text-primary">Strength</span>
            <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ReadField label="Unaffected Side" value={objective.strengthUnaffectedSide} />
              <ReadField label="Notes" value={objective.strengthUnaffectedNotes} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-secondary">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-secondary bg-secondary_alt">
                    <th className={th}>Joint</th>
                    <th className={th}>Movement</th>
                    <th className={th}>RISOM</th>
                    <th className={th}>MMT</th>
                  </tr>
                </thead>
                <tbody>
                  {objective.strength.map((s, i) => (
                    <tr key={i} className="border-b border-secondary last:border-0">
                      <td className={td}>{s.jointName || '—'}</td>
                      <td className={td}>{movementLabel(s.movement, s.movementOther) || '—'}</td>
                      <td className={td}>{s.isometric ? `${s.isometric} (Pain ${s.isometricPain || 0}/10)` : '—'}</td>
                      <td className={td}>{s.mmtMuscle || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!isDictation && <ReadField label="Additional Notes" value={objective.notes} />}
        {!isDictation && !objective.generalObservation && !objective.posture && !objective.atrophyHypertrophy && !objective.edema && !objective.skinCondition && !objective.deformities && !objective.observationOther && !objective.mobility.some(Boolean) && !objective.weightBearing && !objective.upOnToes && !objective.wbdf && !objective.torsionTest && !objective.squat && !objective.functionalOther && !objective.notes && objective.rom.length === 0 && !objective.strengthUnaffectedSide && !objective.strengthUnaffectedNotes && objective.strength.length === 0 && (
          <ReadEmpty>Not recorded</ReadEmpty>
        )}
      </SectionCard>

      {/* Analysis */}
      <SectionCard letter="A" label="Analysis">
        {isDictation ? (
          <ReadBulletedText text={analysis.rawText} emptyLabel="No analysis notes recorded." />
        ) : (
          <>
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
            <span className="mb-2 block text-xs text-secondary">PT Goals</span>
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
          </>
        )}
      </SectionCard>

      {/* Plan */}
      <SectionCard letter="P" label="Plan">
        {isDictation ? (
          <ReadBulletedText text={plan.rawText} emptyLabel="No plan notes recorded." />
        ) : (
          <>
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
        <ReadField label="Additional Notes" value={plan.notes} />
          </>
        )}
        <div>
          <span className="font-display mb-2 block text-lg font-medium text-primary">Patient Consent</span>
          <span className="text-base text-primary">{plan.consentObtained ? 'Treatment plan explained, understood & accepted' : 'Not yet obtained'}</span>
        </div>
      </SectionCard>

      {/* Interventions */}
      <SectionCard letter="I" label="Intervention">
        {isDictation ? (
          <ReadBulletedText text={interventionsRawText} emptyLabel="No interventions recorded." />
        ) : interventions.length === 0 ? (
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
        {isDictation ? (
          <ReadBulletedText text={evaluation.rawText} emptyLabel="No evaluation notes recorded." />
        ) : (
          <>
        <ReadField label="Post-Session NPRS" value={evaluation.postNprs !== undefined ? `${evaluation.postNprs}/10` : undefined} />
        <ReadField label="Patient's Reaction to Treatment" value={evaluation.patientReaction} />
        <ReadField label="Objective Response" value={evaluation.objectiveResponse} />
        {evaluation.postNprs === undefined && !evaluation.patientReaction && !evaluation.objectiveResponse && <ReadEmpty>Not recorded</ReadEmpty>}
          </>
        )}
      </SectionCard>
    </div>
  );
}

/** Read-only body for a single chart session — Notes, History (intake only), H-SOAPIE sections,
 *  Signed card, and Amendments. Shared between the full-screen chart page and the inline Chart tab view. */
export function ChartSessionReadPanel({ patient, session }: { patient: Patient; session: ChartSession }) {
  const amendments = session.amendments ?? [];
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === session.signatureFontId);
  const isDictation = session.template === 'default-dictation';
  const [notesOpen, setNotesOpen] = useState(!isDictation);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-secondary bg-primary p-5">
        <button
          type="button"
          onClick={() => setNotesOpen((v) => !v)}
          className={cx('flex w-full items-center gap-2 bg-transparent border-none p-0 cursor-pointer text-left', notesOpen && 'mb-2')}
        >
          <span className="flex-1 text-sm font-semibold text-primary">Notes</span>
          <ChevronDown size={16} className={cx('shrink-0 text-tertiary transition-transform', notesOpen && 'rotate-180')} />
        </button>
        {notesOpen && (
          <span className="whitespace-pre-wrap text-sm text-secondary">{session.summary || 'No notes recorded.'}</span>
        )}
      </div>

      {session.isIntakeSession && <HistoryCard patient={patient} />}

      <ChartReadOnlyBody
        isDictation={session.template === 'default-dictation'}
        subjective={session.subjective}
        objective={session.objective}
        analysis={session.analysis}
        plan={session.plan}
        interventions={session.interventions}
        interventionsRawText={session.interventionsRawText}
        evaluation={session.evaluation}
      />

      {session.signedAt && (
        <div className="rounded-lg border border-secondary bg-primary p-7">
          <span className="font-display mb-3 block text-lg font-medium text-primary">Signature</span>
          <span style={{ fontFamily: signatureFont?.variable }} className="block text-3xl text-primary">
            {session.signedByName}
          </span>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:max-w-xs sm:grid-cols-2">
            <div>
              <span className="mb-2 block text-xs text-secondary">Date Signed</span>
              <span className="block text-xs text-primary">{new Date(session.signedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="mb-2 block text-xs text-secondary">Date of Session</span>
              <span className="block text-xs text-primary">
                {new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
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
