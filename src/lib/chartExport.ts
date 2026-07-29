import type { ChartSession, Patient } from './types';

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

/** Builds both a plain-text and an HTML representation of everything shown under the H-SOAPIER chart, for clipboard export. */
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
      html.push(`<img src="${bodyMapImages.front}" alt="Pain diagram — Front" style="display:block;max-width:200px;width:100%;height:auto;border:1px solid #ddd;border-radius:8px;margin:0 0 8px;" />`);
    }
    if (bodyMapImages?.back) {
      html.push(`<img src="${bodyMapImages.back}" alt="Pain diagram — Back" style="display:block;max-width:200px;width:100%;height:auto;border:1px solid #ddd;border-radius:8px;margin:0 0 8px;" />`);
    }
    if (s.painPoints.length === 0) {
      text.push('No pain points reported.');
    } else {
      s.painPoints.forEach((p, i) => {
        const lines = [
          textField('Location', p.location),
          textField('Description', p.description),
          `NPRS: ${p.nprs}/10`,
          textField('Pattern', p.pattern),
          textField('Aggravating Factors', p.aggravating),
          textField('Easing Factors', p.easing),
        ].filter((l): l is string => !!l);
        text.push(`  P${i + 1}: ${lines.join(' | ')}`);
        html.push(`<div style="${SUBBOX}"><strong>P${i + 1}</strong> ${[
          htmlField('Location', p.location), htmlField('Description', p.description), htmlField('NPRS', `${p.nprs}/10`),
          htmlField('Pattern', p.pattern), htmlField('Aggravating Factors', p.aggravating), htmlField('Easing Factors', p.easing),
        ].join('')}</div>`);
      });
    }
    [
      textField('AM Symptoms', s.amSymptoms), textField('PM Symptoms', s.pmSymptoms),
      textField('Sleeping Position', s.sleepingPosition), `Night Pain: ${s.nightPain ? 'Yes' : 'No'}`,
      textField('Bladder / Bowel Update', s.bladderBowelUpdate), textField('Additional Notes', s.notes),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('AM Symptoms', s.amSymptoms), htmlField('PM Symptoms', s.pmSymptoms),
      htmlField('Sleeping Position', s.sleepingPosition), htmlField('Night Pain', s.nightPain ? 'Yes' : 'No'),
      htmlField('Bladder / Bowel Update', s.bladderBowelUpdate), htmlField('Additional Notes', s.notes),
    );
    text.push('');
  }

  // Objective
  {
    const o = session.objective;
    const pf = o.pelvicFloorExam;
    text.push('O — OBJECTIVE');
    html.push(`<h2 style="${H2}">O — Objective</h2>`);
    const hasPf = pf.power || pf.endurance || pf.repetitions || pf.fastContractions || pf.tone || pf.tenderness;
    if (hasPf) {
      [
        pf.power ? `Power: ${pf.power}/5` : null, pf.endurance ? `Endurance: ${pf.endurance} sec` : null,
        pf.repetitions ? `Repetitions: ${pf.repetitions}` : null, pf.fastContractions ? `Fast Contractions: ${pf.fastContractions}` : null,
        textField('Tone', pf.tone), textField('Tenderness', pf.tenderness),
      ].filter((l): l is string => !!l).forEach((l) => text.push(l));
      html.push(
        htmlField('Power', pf.power ? `${pf.power}/5` : undefined), htmlField('Endurance', pf.endurance ? `${pf.endurance} sec` : undefined),
        htmlField('Repetitions', pf.repetitions || undefined), htmlField('Fast Contractions', pf.fastContractions || undefined),
        htmlField('Tone', pf.tone), htmlField('Tenderness', pf.tenderness),
      );
    }
    [
      textField('Prolapse Grade', o.prolapseGrade), textField('Diastasis Recti', o.diastasisRecti),
      textField('Special Tests', o.specialTests), textField('Palpation / Circulation / Sensation', o.palpation),
      textField('Observation', o.observation), textField('Functional Tests', o.functionalTests),
    ].filter((l): l is string => !!l).forEach((l) => text.push(l));
    html.push(
      htmlField('Prolapse Grade', o.prolapseGrade), htmlField('Diastasis Recti', o.diastasisRecti),
      htmlField('Special Tests', o.specialTests), htmlField('Palpation / Circulation / Sensation', o.palpation),
      htmlField('Observation', o.observation), htmlField('Functional Tests', o.functionalTests),
    );
    if (o.romStrength.length > 0) {
      text.push('ROM / Strength Screen:');
      o.romStrength.forEach((r) => text.push(`  ${[r.joint, r.side, r.aromNotes, r.strengthNotes].filter(Boolean).join(' | ')}`));
      html.push(`<p style="${LABEL}margin:8px 0 4px;">ROM / Strength Screen</p><ul style="margin:0;padding-left:20px;">${o.romStrength.map((r) => `<li>${esc([r.joint, r.side, r.aromNotes, r.strengthNotes].filter(Boolean).join(' — '))}</li>`).join('')}</ul>`);
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

  // Recommendations
  {
    text.push('R — RECOMMENDATIONS');
    html.push(`<h2 style="${H2}">R — Recommendations</h2>`);
    if (session.recommendations.length === 0) {
      text.push('None recorded.');
    } else {
      session.recommendations.forEach((r) => text.push(`  • ${r}`));
      html.push(`<ul style="margin:0;padding-left:20px;">${session.recommendations.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`);
    }
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
