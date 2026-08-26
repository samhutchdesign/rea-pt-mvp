import type { ChartSession, Patient } from './types';
import { renderBodyMapSnapshot } from './bodyMapSnapshot';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const H2 = 'font-size:15px;font-weight:700;margin:20px 0 8px;color:#111;';
const LABEL = 'font-weight:600;';
const SUBBOX = 'margin:8px 0;padding:8px 12px;border:1px solid #ddd;border-radius:6px;';

function htmlField(label: string, value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '';
  return `<p style="margin:3px 0;"><span style="${LABEL}">${esc(label)}:</span> ${esc(String(value))}</p>`;
}

function textField(label: string, value?: string | number | null): string | null {
  if (value === undefined || value === null || value === '') return null;
  return `${label}: ${value}`;
}

/** Builds both a plain-text and an HTML representation of everything shown under the H-SOAPIE chart, for clipboard export. */
export function buildChartExport(
  session: ChartSession,
  patient: Patient,
  titleLabel: string,
  bodyMapImages?: { front?: string | null; back?: string | null }
): { text: string; html: string } {
  const text: string[] = [];
  const html: string[] = [];

  const title = `${patient.firstName} ${patient.lastName}'s Chart - ${titleLabel}`;
  const dateStr = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  text.push(title, dateStr, '');
  html.push(
    `<h1 style="font-size:20px;font-weight:700;margin:0 0 2px;color:#111;">${esc(title)}</h1>`,
    `<p style="color:#666;margin:0 0 16px;font-size:13px;">${esc(dateStr)}</p>`
  );

  // Notes
  if (session.summary) {
    text.push('NOTES', session.summary, '');
    html.push(`<h2 style="${H2}">Notes</h2><p style="margin:4px 0;">${esc(session.summary)}</p>`);
  }

  // History (intake only)
  if (session.isIntakeSession) {
    const rows: [string, string | undefined][] = [
      ['Reason for consultation / referral', patient.pmhx?.referralReason],
      ['Referring physician', patient.pmhx?.referringPhysician],
      ['Mechanism / onset', patient.injuryHistory?.mechanism],
      ['Date of onset', patient.injuryHistory?.dateOfOnset],
      ['Symptom evolution', patient.injuryHistory?.symptomEvolution],
      ['Management to date', patient.injuryHistory?.management],
      ['PMHx', patient.pmhx?.pmhx],
      ['Medications', patient.pmhx?.medicationList],
      ['Obstetric / pelvic health history', patient.obstetricPelvicHealth?.obstetricsHistory],
      ['Bladder / bowel symptoms', patient.obstetricPelvicHealth?.bladderBowelSymptoms],
      ['Job / hobbies', [patient.sohx?.job, patient.sohx?.hobbies].filter(Boolean).join(' · ') || undefined],
      ["Client's goals", patient.sohx?.clientGoals],
    ].filter((r): r is [string, string] => !!r[1]);
    if (rows.length > 0) {
      text.push('HISTORY');
      rows.forEach(([l, v]) => text.push(`${l}: ${v}`));
      text.push('');
      html.push(`<h2 style="${H2}">History</h2>`, rows.map(([l, v]) => htmlField(l, v)).join(''));
    }
  }

  // Subjective
  {
    const s = session.subjective;
    text.push('S — SUBJECTIVE');
    html.push(`<h2 style="${H2}">S — Subjective</h2>`);
    if (bodyMapImages?.front) {
      html.push(`<img src="${bodyMapImages.front}" alt="Pain diagram — Front" style="display:block;max-width:140px;width:100%;height:auto;margin:0 0 8px;" />`);
    }
    if (bodyMapImages?.back) {
      html.push(`<img src="${bodyMapImages.back}" alt="Pain diagram — Back" style="display:block;max-width:140px;width:100%;height:auto;margin:0 0 8px;" />`);
    }
    if (s.painPoints.length === 0) {
      text.push('No pain points reported.');
    } else {
      s.painPoints.forEach((p, i) => {
        const lines = [
          textField('Location', p.location),
          textField('Description', p.description),
          `NPRS: ${p.nprs}/10${p.nprsContext ? ` — ${p.nprsContext}` : ''}`,
          textField('Pattern', p.pattern),
          textField('Aggravating Factors', p.aggravating),
          textField('Easing Factors', p.easing),
          textField('↑ P', p.upPain),
          textField('↓ P', p.downPain),
        ].filter((l): l is string => !!l);
        text.push(`  P${i + 1}: ${lines.join(' | ')}`);
        html.push(`<div style="${SUBBOX}"><strong>P${i + 1}</strong> ${[
          htmlField('Location', p.location), htmlField('Description', p.description), htmlField('NPRS', `${p.nprs}/10${p.nprsContext ? ` — ${p.nprsContext}` : ''}`),
          htmlField('Pattern', p.pattern), htmlField('Aggravating Factors', p.aggravating), htmlField('Easing Factors', p.easing),
          htmlField('↑ P', p.upPain), htmlField('↓ P', p.downPain),
        ].join('')}</div>`);
      });
    }
    [
      textField('AM Symptoms', s.amSymptoms), textField('PM Symptoms', s.pmSymptoms),
      textField('Sleeping Position', s.sleepingPosition), `Night Pain: ${s.nightPain ? 'Yes' : 'No'}`,
      textField('Additional Notes', s.notes),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('AM Symptoms', s.amSymptoms), htmlField('PM Symptoms', s.pmSymptoms),
      htmlField('Sleeping Position', s.sleepingPosition), htmlField('Night Pain', s.nightPain ? 'Yes' : 'No'),
      htmlField('Additional Notes', s.notes),
    );
    text.push('');
  }

  // Objective
  {
    const o = session.objective;
    const mobility = o.mobility.filter(Boolean).join('; ');
    text.push('O — OBJECTIVE');
    html.push(`<h2 style="${H2}">O — Objective</h2>`);
    [
      textField('General Observation', o.generalObservation),
      textField('Posture', o.posture), textField('Atrophy/Hypertrophy (girth)', o.atrophyHypertrophy),
      textField('Edema', o.edema), textField('Skin condition, color, scar(s)', o.skinCondition),
      textField('Deformities', o.deformities), textField('Observation — Other', o.observationOther),
      textField('Mobility (gait, transfer, stairs)', mobility), textField('WB (unilateral, bilateral)', o.weightBearing),
      textField('Up on toes', o.upOnToes), textField('WBDF (weight bearing dorsiflexion)', o.wbdf),
      textField('Torsion test (body torque)', o.torsionTest), textField('Squat', o.squat),
      textField('Functional Tests — Others', o.functionalOther),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('General Observation', o.generalObservation),
      htmlField('Posture', o.posture), htmlField('Atrophy/Hypertrophy (girth)', o.atrophyHypertrophy),
      htmlField('Edema', o.edema), htmlField('Skin condition, color, scar(s)', o.skinCondition),
      htmlField('Deformities', o.deformities), htmlField('Observation — Other', o.observationOther),
      htmlField('Mobility (gait, transfer, stairs)', mobility), htmlField('WB (unilateral, bilateral)', o.weightBearing),
      htmlField('Up on toes', o.upOnToes), htmlField('WBDF (weight bearing dorsiflexion)', o.wbdf),
      htmlField('Torsion test (body torque)', o.torsionTest), htmlField('Squat', o.squat),
      htmlField('Functional Tests — Others', o.functionalOther),
    );
    const movementLabel = (movement: string, movementOther: string) => (movement === 'Other' ? movementOther || 'Other' : movement);
    const entryLabel = (jointName: string, movement: string, movementOther: string) => [jointName, movementLabel(movement, movementOther)].filter(Boolean).join(' — ') || 'Entry';
    if (o.rom.length > 0) {
      text.push('ROM:');
      o.rom.forEach((r) => text.push(`  ${entryLabel(r.jointName, r.movement, r.movementOther)}: ${[
        r.leftArom && `L AROM ${r.leftArom}° (Pain ${r.leftAromPain || 0}/10)`,
        r.rightArom && `R AROM ${r.rightArom}° (Pain ${r.rightAromPain || 0}/10)`,
        r.leftProm && `L PROM ${r.leftProm}° (Pain ${r.leftPromPain || 0}/10)`,
        r.rightProm && `R PROM ${r.rightProm}° (Pain ${r.rightPromPain || 0}/10)`,
        r.endFeel && `EF ${r.endFeel}`,
      ].filter(Boolean).join(' | ')}`));
      html.push(`<p style="${LABEL}margin:8px 0 4px;">ROM</p><ul style="margin:0;padding-left:20px;">${o.rom.map((r) => `<li>${esc(entryLabel(r.jointName, r.movement, r.movementOther))}: ${esc([
        r.leftArom && `L AROM ${r.leftArom}° (Pain ${r.leftAromPain || 0}/10)`,
        r.rightArom && `R AROM ${r.rightArom}° (Pain ${r.rightAromPain || 0}/10)`,
        r.leftProm && `L PROM ${r.leftProm}° (Pain ${r.leftPromPain || 0}/10)`,
        r.rightProm && `R PROM ${r.rightProm}° (Pain ${r.rightPromPain || 0}/10)`,
        r.endFeel && `EF ${r.endFeel}`,
      ].filter(Boolean).join(' — '))}</li>`).join('')}</ul>`);
    }
    if (o.strengthUnaffectedSide || o.strengthUnaffectedNotes || o.strength.length > 0) {
      text.push('Strength:');
      if (o.strengthUnaffectedSide) text.push(`  Unaffected Side: ${o.strengthUnaffectedSide}${o.strengthUnaffectedNotes ? ` — ${o.strengthUnaffectedNotes}` : ''}`);
      o.strength.forEach((s) => text.push(`  ${entryLabel(s.jointName, s.movement, s.movementOther)}: ${[
        s.isometric && `Isometric ${s.isometric} (Pain ${s.isometricPain || 0}/10)`,
        s.mmtMuscle && `MMT ${s.mmtMuscle}`,
      ].filter(Boolean).join(' | ')}`));
      html.push(`<p style="${LABEL}margin:8px 0 4px;">Strength</p>${o.strengthUnaffectedSide ? `<p style="margin:2px 0;">${esc(`Unaffected Side: ${o.strengthUnaffectedSide}${o.strengthUnaffectedNotes ? ` — ${o.strengthUnaffectedNotes}` : ''}`)}</p>` : ''}<ul style="margin:0;padding-left:20px;">${o.strength.map((s) => `<li>${esc(entryLabel(s.jointName, s.movement, s.movementOther))}: ${esc([
        s.isometric && `Isometric ${s.isometric} (Pain ${s.isometricPain || 0}/10)`,
        s.mmtMuscle && `MMT ${s.mmtMuscle}`,
      ].filter(Boolean).join(' — '))}</li>`).join('')}</ul>`);
    }
    if (o.notes) { text.push(`Additional Notes: ${o.notes}`); html.push(htmlField('Additional Notes', o.notes)); }
    text.push('');
  }

  // Analysis
  {
    const a = session.analysis;
    text.push('A — ANALYSIS');
    html.push(`<h2 style="${H2}">A — Analysis</h2>`);
    if (a.bodyStructures) { text.push(`Body Structure(s): ${a.bodyStructures}`); html.push(htmlField('Body Structure(s)', a.bodyStructures)); }
    if (a.problemList.length > 0) {
      text.push('Problem List:');
      a.problemList.forEach((p) => text.push(`  ${[p.bodyFunction, p.activityParticipation, p.environment].filter(Boolean).join(' | ')}`));
      html.push(`<p style="${LABEL}margin:8px 0 4px;">Problem List</p><ul style="margin:0;padding-left:20px;">${a.problemList.map((p) => `<li>${esc([p.bodyFunction, p.activityParticipation, p.environment].filter(Boolean).join(' — '))}</li>`).join('')}</ul>`);
    }
    if (a.ptDiagnosis) { text.push(`PT Diagnosis: ${a.ptDiagnosis}`); html.push(htmlField('PT Diagnosis', a.ptDiagnosis)); }
    if (a.goals.length > 0) {
      text.push('Goals:');
      a.goals.forEach((g) => text.push(`  ${[g.problem, g.shortTerm, g.longTerm].filter(Boolean).join(' | ')}`));
      html.push(`<p style="${LABEL}margin:8px 0 4px;">Goals</p><ul style="margin:0;padding-left:20px;">${a.goals.map((g) => `<li>${esc([g.problem, g.shortTerm, g.longTerm].filter(Boolean).join(' — '))}</li>`).join('')}</ul>`);
    }
    if (a.notes) { text.push(`Additional Notes: ${a.notes}`); html.push(htmlField('Additional Notes', a.notes)); }
    text.push('');
  }

  // Plan
  {
    const p = session.plan;
    text.push('P — PLAN');
    html.push(`<h2 style="${H2}">P — Plan</h2>`);
    if (p.items.length > 0) {
      p.items.forEach((item) => text.push(`  ${item.problemRef ? `#${item.problemRef}: ` : ''}${item.treatment}`));
      html.push(`<ul style="margin:0 0 8px;padding-left:20px;">${p.items.map((item) => `<li>${item.problemRef ? `<strong>#${esc(item.problemRef)}:</strong> ` : ''}${esc(item.treatment)}</li>`).join('')}</ul>`);
    }
    [
      textField('Expected Frequency', p.frequency), textField('Reassessment Plan', p.reassessmentPlan),
      textField('Discharge Plan', p.dischargePlan), `Client Consent: ${p.consentObtained ? 'Explained, understood & accepted' : 'Not yet obtained'}`,
      textField('Additional Notes', p.notes),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('Expected Frequency', p.frequency), htmlField('Reassessment Plan', p.reassessmentPlan),
      htmlField('Discharge Plan', p.dischargePlan), htmlField('Client Consent', p.consentObtained ? 'Explained, understood & accepted' : 'Not yet obtained'),
      htmlField('Additional Notes', p.notes),
    );
    text.push('');
  }

  // Interventions
  {
    text.push('I — INTERVENTION');
    html.push(`<h2 style="${H2}">I — Intervention</h2>`);
    if (session.interventions.length === 0) {
      text.push('None recorded.');
    } else {
      session.interventions.forEach((iv) => text.push(`  [${iv.type}] ${iv.details}`));
      html.push(`<ul style="margin:0;padding-left:20px;">${session.interventions.map((iv) => `<li><strong>${esc(iv.type)}:</strong> ${esc(iv.details)}</li>`).join('')}</ul>`);
    }
    text.push('');
  }

  // Evaluation
  {
    const e = session.evaluation;
    text.push('E — EVALUATION');
    html.push(`<h2 style="${H2}">E — Evaluation</h2>`);
    [
      e.postNprs !== undefined ? `Post-Session NPRS: ${e.postNprs}/10` : null,
      textField("Patient's Reaction to Treatment", e.patientReaction), textField('Objective Response', e.objectiveResponse),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('Post-Session NPRS', e.postNprs !== undefined ? `${e.postNprs}/10` : undefined),
      htmlField("Patient's Reaction to Treatment", e.patientReaction), htmlField('Objective Response', e.objectiveResponse),
    );
    text.push('');
  }

  // Signed
  if (session.signedAt) {
    text.push('SIGNED', `${session.signedByName} — ${new Date(session.signedAt).toLocaleString()}`, '');
    html.push(`<h2 style="${H2}">Signed</h2><p style="margin:4px 0;font-style:italic;">${esc(session.signedByName ?? '')}</p><p style="margin:0;color:#666;font-size:13px;">${esc(new Date(session.signedAt).toLocaleString())}</p>`);
  }

  // Amendments
  const amendments = session.amendments ?? [];
  if (amendments.length > 0) {
    text.push('AMENDMENTS');
    html.push(`<h2 style="${H2}">Amendments</h2>`);
    amendments.forEach((a) => {
      text.push(`  ${a.authorName} — ${new Date(a.createdAt).toLocaleString()}: ${a.text}`);
      html.push(`<div style="${SUBBOX}background:#fffbeb;border-color:#fde68a;"><strong>${esc(a.authorName)}</strong> <span style="color:#92400e;font-size:12px;">${esc(new Date(a.createdAt).toLocaleString())}</span><p style="margin:4px 0 0;">${esc(a.text)}</p></div>`);
    });
  }

  return {
    text: text.join('\n').trim() + '\n',
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222;max-width:640px;">${html.join('')}</div>`,
  };
}

/** Renders the body-map pain-diagram snapshots and copies the full chart (text + HTML) to the clipboard. */
export async function copyChartSessionToClipboard(session: ChartSession, patient: Patient, titleLabel: string): Promise<void> {
  const painPoints = session.subjective.painPoints;
  const pinsFor = (view: 'front' | 'back') =>
    painPoints
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.bodyView === view && p.x !== undefined && p.y !== undefined)
      .map(({ p, i }) => ({ x: p.x!, y: p.y!, label: String(i + 1) }));

  const frontPins = pinsFor('front');
  const backPins = pinsFor('back');
  const [frontImg, backImg] = await Promise.all([
    frontPins.length > 0 ? renderBodyMapSnapshot('/body-map/front.svg', frontPins) : Promise.resolve(null),
    backPins.length > 0 ? renderBodyMapSnapshot('/body-map/back.svg', backPins) : Promise.resolve(null),
  ]);

  const { text, html } = buildChartExport(session, patient, titleLabel, { front: frontImg, back: backImg });
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      }),
    ]);
  } else {
    await navigator.clipboard.writeText(text);
  }
}
