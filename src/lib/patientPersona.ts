import { mockPatients } from './mock-data';

/**
 * The single mock patient the "User: Patient" demo role shows.
 *
 * In a real app the patient-facing portal would be scoped to whichever
 * patient is signed in; this MVP has no auth, so the demo role is pinned to
 * one existing patient record. Dana Kuipers was chosen because her assigned
 * program (`prog5`, Diastasis Recti Recovery) has 8 daily exercises, matching
 * the Figma reference designs exactly.
 */
export const PATIENT_PERSONA_ID = 'pat_uth35';

export function getPatientPersona() {
  return mockPatients.find((p) => p.id === PATIENT_PERSONA_ID) ?? mockPatients[0];
}
