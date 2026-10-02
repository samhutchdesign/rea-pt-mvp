'use client';
import { useState } from 'react';
import { BodyMap } from '@/components/charts/body-map';
import { HistoryCard } from '@/components/charts/chart-form-sections';
import { Avatar } from '@/components/base/avatar/avatar';
import { SIGNATURE_FONTS } from '@/lib/employeeSignatureStore';
import { cx } from '@/utils/cx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  Patient, ChartSession, PainPoint, RomEntry, StrengthEntry,
  SubjectiveSection, ObjectiveSection, AnalysisSection, PlanSection, InterventionItem, EvaluationSection,
  JointMovementOption,
} from '@/lib/types';

/** Restyled, read-only chart session view matching the Figma Chart tab design
 *  (node 2558:37120). Used only by the inline patient Chart tab — the full-screen
 *  single-session edit/view page keeps its existing detailed look untouched. */

const tableTh = 'px-3 py-3 text-left text-base font-normal text-primary whitespace-nowrap';
const tableTd = 'px-3 py-3 align-top text-base text-primary whitespace-nowrap';

function movementLabel(movement: JointMovementOption | '', movementOther: string): string {
  if (!movement) return '';
  return movement === 'Other' ? (movementOther || 'Other') : movement;
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean);
}

function subjectiveBullets(s: SubjectiveSection): string[] {
  if (s.rawText?.trim()) return splitLines(s.rawText);
  const bullets: string[] = [];
  s.painPoints.forEach((p, i) => {
    const head = [p.location, p.description].filter(Boolean).join(' — ') || `Pain point ${i + 1}`;
    bullets.push(`${head}: NPRS ${p.nprs}/10${p.nprsContext ? ` (${p.nprsContext})` : ''}`);
    if (p.aggravating) bullets.push(`Aggravating factors: ${p.aggravating}`);
    if (p.easing) bullets.push(`Easing factors: ${p.easing}`);
  });
  if (s.amSymptoms) bullets.push(`AM symptoms: ${s.amSymptoms}`);
  if (s.pmSymptoms) bullets.push(`PM symptoms: ${s.pmSymptoms}`);
  if (s.sleepingPosition) bullets.push(`Sleeping position: ${s.sleepingPosition}`);
  if (s.nightPain) bullets.push('Reports night pain.');
  if (s.notes) bullets.push(s.notes);
  return bullets;
}

function objectiveBullets(o: ObjectiveSection): string[] {
  if (o.rawText?.trim()) return splitLines(o.rawText);
  const bullets: string[] = [];
  if (o.generalObservation) bullets.push(o.generalObservation);
  if (o.posture) bullets.push(`Posture: ${o.posture}`);
  if (o.atrophyHypertrophy) bullets.push(`Atrophy/Hypertrophy: ${o.atrophyHypertrophy}`);
  if (o.edema) bullets.push(`Edema: ${o.edema}`);
  if (o.skinCondition) bullets.push(`Skin condition: ${o.skinCondition}`);
  if (o.deformities) bullets.push(`Deformities: ${o.deformities}`);
  if (o.observationOther) bullets.push(o.observationOther);
  o.mobility.filter(Boolean).forEach((m) => bullets.push(`Mobility: ${m}`));
  if (o.weightBearing) bullets.push(`Weight bearing: ${o.weightBearing}`);
  if (o.upOnToes) bullets.push(`Up on toes: ${o.upOnToes}`);
  if (o.wbdf) bullets.push(`WBDF: ${o.wbdf}`);
  if (o.torsionTest) bullets.push(`Torsion test: ${o.torsionTest}`);
  if (o.squat) bullets.push(`Squat: ${o.squat}`);
  if (o.functionalOther) bullets.push(o.functionalOther);
  if (o.notes) bullets.push(o.notes);
  return bullets;
}

function analysisBullets(a: AnalysisSection): string[] {
  if (a.rawText?.trim()) return splitLines(a.rawText);
  const bullets: string[] = [];
  if (a.bodyStructures) bullets.push(`Body structures: ${a.bodyStructures}`);
  a.problemList.forEach((p) => {
    const parts = [p.bodyFunction, p.activityParticipation, p.environment].filter(Boolean).join(' — ');
    if (parts) bullets.push(parts);
  });
  if (a.ptDiagnosis) bullets.push(`PT diagnosis: ${a.ptDiagnosis}`);
  a.goals.forEach((g) => {
    const parts = [g.shortTerm && `Short-term: ${g.shortTerm}`, g.longTerm && `Long-term: ${g.longTerm}`].filter(Boolean).join(' — ');
    if (parts) bullets.push(g.problem ? `${g.problem} — ${parts}` : parts);
  });
  if (a.notes) bullets.push(a.notes);
  return bullets;
}

function planBullets(p: PlanSection): string[] {
  if (p.rawText?.trim()) return splitLines(p.rawText);
  const bullets: string[] = [];
  p.items.forEach((item) => {
    if (item.treatment) bullets.push(item.problemRef ? `${item.problemRef}: ${item.treatment}` : item.treatment);
  });
  if (p.frequency) bullets.push(`Expected frequency: ${p.frequency}`);
  if (p.reassessmentPlan) bullets.push(`Reassessment: ${p.reassessmentPlan}`);
  if (p.dischargePlan) bullets.push(`Discharge plan: ${p.dischargePlan}`);
  if (p.notes) bullets.push(p.notes);
  return bullets;
}

function interventionBullets(interventions: InterventionItem[], rawText?: string): string[] {
  if (rawText?.trim()) return splitLines(rawText);
  return interventions.filter((i) => i.details).map((i) => `${i.type}: ${i.details}`);
}

function evaluationBullets(e: EvaluationSection): string[] {
  if (e.rawText?.trim()) return splitLines(e.rawText);
  const bullets: string[] = [];
  if (e.postNprs !== undefined) bullets.push(`Post-session NPRS: ${e.postNprs}/10`);
  if (e.patientReaction) bullets.push(`Patient's reaction: ${e.patientReaction}`);
  if (e.objectiveResponse) bullets.push(`Objective response: ${e.objectiveResponse}`);
  return bullets;
}

function BulletList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) return <span className="text-sm italic text-tertiary">{emptyLabel}</span>;
  return (
    <ul className="list-disc space-y-4 pl-6 text-base leading-6 text-primary">
      {items.map((line, i) => <li key={i}>{line}</li>)}
    </ul>
  );
}

function ChartTabAccordion({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex w-full flex-col gap-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 border-b border-secondary bg-transparent px-2 py-4 cursor-pointer text-left"
      >
        <span className="font-display text-xl leading-[32px] font-medium text-primary">{title}</span>
        {open ? <ChevronUp size={24} className="shrink-0 text-primary" strokeWidth={1.25} /> : <ChevronDown size={24} className="shrink-0 text-primary" strokeWidth={1.25} />}
      </button>
      {open && <div className="flex w-full flex-col gap-6">{children}</div>}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <span className="font-display text-lg leading-5 font-medium tracking-[0.1px] text-primary">{children}</span>;
}

function PainDiagramCard({ painPoints }: { painPoints: PainPoint[] }) {
  if (!painPoints.some((p) => p.bodyView)) return null;
  return (
    <div className="flex w-full flex-col items-center rounded-xl bg-primary px-10 pt-10 pb-7">
      <BodyMap painPoints={painPoints} interactive={false} />
    </div>
  );
}

function RomSection({ rom }: { rom: RomEntry[] }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <SubHeading>ROM</SubHeading>
      <div className="w-full overflow-hidden rounded-lg border border-tertiary">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-secondary">
              <th className={tableTh}>Joint</th>
              <th className={tableTh}>Movement</th>
              <th className={tableTh}>L AROM°</th>
              <th className={tableTh}>R AROM°</th>
              <th className={tableTh}>L PROM°</th>
              <th className={tableTh}>R PROM°</th>
              <th className={tableTh}>EF</th>
            </tr>
          </thead>
          <tbody>
            {rom.map((r, i) => (
              <tr key={i} className="border-b border-secondary last:border-0">
                <td className={tableTd}>{r.jointName || '—'}</td>
                <td className={tableTd}>{movementLabel(r.movement, r.movementOther) || '—'}</td>
                <td className={tableTd}>{r.leftArom ? `${r.leftArom}° (${r.leftAromPain || 0}/10)` : '—'}</td>
                <td className={tableTd}>{r.rightArom ? `${r.rightArom}° (${r.rightAromPain || 0}/10)` : '—'}</td>
                <td className={tableTd}>{r.leftProm ? `${r.leftProm}° (${r.leftPromPain || 0}/10)` : '—'}</td>
                <td className={tableTd}>{r.rightProm ? `${r.rightProm}° (${r.rightPromPain || 0}/10)` : '—'}</td>
                <td className={tableTd}>{r.endFeel || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StrengthSection({ strength }: { strength: StrengthEntry[] }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <SubHeading>Strength</SubHeading>
      <div className="w-full overflow-hidden rounded-lg border border-tertiary">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-secondary">
              <th className={tableTh}>Joint</th>
              <th className={tableTh}>Movement</th>
              <th className={tableTh}>RISOM</th>
              <th className={tableTh}>Isometric Pain</th>
              <th className={tableTh}>MMT</th>
            </tr>
          </thead>
          <tbody>
            {strength.map((s, i) => (
              <tr key={i} className="border-b border-secondary last:border-0">
                <td className={tableTd}>{s.jointName || '—'}</td>
                <td className={tableTd}>{movementLabel(s.movement, s.movementOther) || '—'}</td>
                <td className={tableTd}>{s.isometric || '—'}</td>
                <td className={tableTd}>{s.isometricPain !== '' && s.isometricPain !== undefined ? `${s.isometricPain}/10` : '—'}</td>
                <td className={tableTd}>{s.mmtMuscle || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SignatureCard({ session }: { session: ChartSession }) {
  const signatureFont = SIGNATURE_FONTS.find((f) => f.id === session.signatureFontId);
  return (
    <div className="w-full rounded-lg border border-secondary bg-primary p-7">
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-3">
          <SubHeading>Signature</SubHeading>
          <span style={{ fontFamily: signatureFont?.variable }} className="block text-3xl text-primary">
            {session.signedByName}
          </span>
        </div>
        <div className="flex items-start gap-[60px]">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-secondary">Date Signed</span>
            <span className="text-xs text-primary">
              {new Date(session.signedAt!).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-secondary">Date of Session</span>
            <span className="text-xs text-primary">
              {new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChartTabSessionPanel({ patient, session }: { patient: Patient; session: ChartSession }) {
  const amendments = session.amendments ?? [];

  return (
    <div className="flex w-full flex-col gap-12">
      {session.isIntakeSession && <HistoryCard patient={patient} />}

      <ChartTabAccordion title="Subjective">
        <PainDiagramCard painPoints={session.subjective.painPoints} />
        <BulletList items={subjectiveBullets(session.subjective)} emptyLabel="No subjective notes recorded." />
      </ChartTabAccordion>

      <ChartTabAccordion title="Objective">
        <BulletList items={objectiveBullets(session.objective)} emptyLabel="No objective notes recorded." />
        {session.objective.rom.length > 0 && <RomSection rom={session.objective.rom} />}
        {session.objective.strength.length > 0 && <StrengthSection strength={session.objective.strength} />}
      </ChartTabAccordion>

      <ChartTabAccordion title="Analysis">
        <BulletList items={analysisBullets(session.analysis)} emptyLabel="No analysis notes recorded." />
      </ChartTabAccordion>

      <ChartTabAccordion title="Plan">
        <BulletList items={planBullets(session.plan)} emptyLabel="No plan notes recorded." />
        <div className="flex w-full flex-col gap-4">
          <SubHeading>Patient Consent</SubHeading>
          <span className="text-base text-primary">
            {session.plan.consentObtained ? 'Treatment plan explained, understood & accepted' : 'Not yet obtained'}
          </span>
        </div>
      </ChartTabAccordion>

      <ChartTabAccordion title="Intervention">
        <BulletList items={interventionBullets(session.interventions, session.interventionsRawText)} emptyLabel="No interventions recorded." />
      </ChartTabAccordion>

      <ChartTabAccordion title="Evaluation">
        <BulletList items={evaluationBullets(session.evaluation)} emptyLabel="Not recorded." />
      </ChartTabAccordion>

      {session.signedAt && <SignatureCard session={session} />}

      {amendments.length > 0 && (
        <div className={cx('flex w-full flex-col gap-3', session.signedAt && '-mt-6')}>
          <p className="text-base font-semibold text-primary">Amendments</p>
          {amendments.map((a) => (
            <div key={a.id} className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Avatar initials={a.authorInitials} size="xs" />
                <span className="text-xs font-semibold text-amber-900">{a.authorName}</span>
                <span className="text-xs text-amber-700">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-base text-amber-900">{a.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
