/** Hardcoded placeholder content simulating AI dictation + auto-populate. No real speech recognition or NLP. */

/** Intake scenario (isIntake === true) — dictation fills all six sections. */

/** ~300 words — approximates a 2-minute spoken dictation. Content deliberately mirrors the section stubs below, so "Add to Chart" reads as a structured breakout of what was just dictated rather than a non-sequitur. */
export const DICTATION_NOTES_STUB =
  "This is a follow-up session, week four of the plan of care. Patient reports urinary urgency continues to improve — down to one to two episodes per day, from four to five at intake. Denies leakage with coughing or sneezing this week. AM low back stiffness now resolving within about fifteen minutes of waking, down from thirty to forty minutes at the start. She's sleeping on her left side with a pillow between her knees, which has helped her comfort. No night pain. Overall she's feeling more confident with bladder control during exercise.\n\n" +
  "On exam, she's ambulating without an assistive device, normal gait. Mild anterior pelvic tilt, improved from baseline. No visible atrophy or edema; scar is well healed, mobile, non-tender. Held single-leg stance twenty seconds bilaterally without compensation. Weight-bearing dorsiflexion within normal limits. Squatted to about ninety degrees with good control, no pain. Transitioning sit-to-stand independently.\n\n" +
  "Structures we're addressing: pelvic floor musculature, transverse abdominis, low back paraspinals. Problem list is down to two things — mild pelvic floor weakness affecting bladder control with higher-impact activity, and residual AM low back stiffness. She's on track for her short-term goal of under one urgency episode a day within two weeks, and her long-term goal of returning to running without leakage within about six weeks.\n\n" +
  "Today's treatment: manual therapy to the low back paraspinals and QL, about ten minutes. Pelvic floor contraction and relaxation cycles, three sets of ten. Standing marches with pelvic floor coordination, two sets of ten. Bridge progression, three sets of twelve. Reviewed her bladder diary and pacing for impact activities, with verbal and tactile cueing throughout for pelvic floor activation.\n\n" +
  "Plan going forward: progress the home program, move core work into standing and dynamic positions, start light plyometric loading — marching, step-ups — as tolerated. Keep her at once a week for about four more weeks, then reassess with a repeat bladder diary and functional testing. If she keeps trending this way, looking at discharge within about six sessions total.\n\n" +
  "She tolerated everything well, no adverse response. Post-session pain down to a one out of ten, from a three out of ten at the start. Much better awareness of pelvic floor engagement — by the end of the session she held that contraction through single-leg stance without compensating, which she couldn't do reliably before.";

export const DICTATION_SUBJECTIVE_STUB =
  'Patient reports ↓ urinary urgency since last visit, now 1-2 episodes/day (down from 4-5). Denies leakage with coughing or sneezing this week. AM stiffness in low back resolves within 15 min of waking. Sleeping on left side with pillow between knees, improved comfort. No night pain reported. Overall feeling more confident with bladder control during exercise.';

export const DICTATION_OBJECTIVE_STUB =
  'General observation: patient ambulates without assistive device, normal gait pattern. Posture: mild anterior pelvic tilt, improved from prior session. No visible atrophy or edema. Scar well-healed, mobile, non-tender. Functional tests: able to perform single-leg stance 20s bilaterally without compensation. WBDF within normal limits. Squat to 90° with good control, no pain reported. Transitions sit-to-stand independently.';

export const DICTATION_ANALYSIS_STUB =
  'Body structures: pelvic floor musculature, transverse abdominis, low back paraspinals. Problem list: 1) mild pelvic floor muscle weakness affecting bladder control during high-impact activity, 2) residual low back stiffness limiting AM function. PT diagnosis: patient presenting with mild stress urinary incontinence and postural low back stiffness, improving with current POC. Goals: short-term — reduce urinary urgency episodes to <1/day within 2 weeks; long-term — return to running program without leakage within 6 weeks.';

export const DICTATION_PLAN_STUB =
  'Continue current HEP focusing on pelvic floor activation and coordination with breath. Progress core stability exercises to standing/dynamic positions. Add light plyometric loading (marching, step-ups) as tolerated. Expected frequency: 1×/wk for 4 more weeks, then reassess for discharge planning. Reassessment plan: repeat bladder diary and functional testing at week 4. Discharge plan: anticipate D/C within 6 sessions pending continued progress toward goals.';

export const DICTATION_INTERVENTION_STUB =
  'Manual therapy to low back paraspinals and QL, 10 min. Therapeutic exercise: pelvic floor contraction/relaxation cycles 3×10, standing marches with PF coordination 2×10, bridge progression 3×12. Patient education on bladder diary tracking and impact-activity pacing. Verbal and tactile cueing for proper pelvic floor activation throughout session.';

export const DICTATION_EVALUATION_STUB =
  "Post-session NPRS 1/10 (down from 3/10 at start of session). Patient tolerated all interventions well with no adverse response. Reports improved awareness of pelvic floor engagement during functional movement. Objective response: demonstrated improved coordination of PF contraction with exhalation by end of session, able to maintain contraction through single-leg stance without compensation.";

/**
 * Follow-up scenario (isIntake === false) — Analysis/Plan/Intervention/Evaluation are carried
 * forward from the previous chart instead (see dictation-carry-forward.ts), so dictation here
 * only needs to fill Subjective and Objective. Shorter than the intake dictation since there's
 * less ground to cover — a quick progress check-in rather than a full initial workup.
 */
export const DICTATION_FOLLOWUP_NOTES_STUB =
  "This is a follow-up, session three. Patient reports her scar tightness is essentially resolved now — no more pulling with twisting or reaching overhead, and the numbness around the incision keeps fading. She's kept up with the home massage two to three times a week without any trouble fitting it into her routine. No pain today, and she mentioned trying a light ab workout at home over the weekend without any issues, which she was excited about.\n\n" +
  "On exam, the scar is fully mobile now, no adhesion left even in that deeper medial section we'd been tracking. Skin looks healthy, no irritation. She demonstrated the modified curl-up with good form, no compensation, and tolerated adding a few reps of dead bug without any scar discomfort. No abdominal guarding like we saw early on, and she's moving through trunk rotation freely now.";

export const DICTATION_FOLLOWUP_SUBJECTIVE_STUB =
  'Patient reports scar tightness essentially resolved — no pulling sensation with twisting or reaching overhead. Residual numbness around the incision continuing to fade. Home scar massage maintained 2-3×/wk, easily incorporated into routine. No pain reported today. Attempted light ab workout at home over the weekend without issues or discomfort.';

export const DICTATION_FOLLOWUP_OBJECTIVE_STUB =
  'Scar fully mobile, no residual adhesion including previously noted deep medial third restriction. Skin healthy, no irritation. Demonstrated modified curl-up with good form, no compensation. Tolerated added dead bug reps without scar discomfort or pulling. No abdominal guarding observed. Full, comfortable trunk rotation — notably improved from intake presentation.';
