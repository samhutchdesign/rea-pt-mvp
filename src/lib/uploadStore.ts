export interface UploadedPatientData {
  // Basic
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  occupation: string;
  // Chief complaint & symptoms
  chiefComplaint: string;
  symptomDuration: string;
  symptomEvolution: string;
  painLevel: string;
  functionalMobility: string;
  // Medical & obstetric history
  medicalHistory: string;
  previousPhysio: string;
  obstetricsHistory: string;
  bladderBowelSymptoms: string;
  // Medications & allergies
  medications: string;
  allergies: string;
  // Treatment & referral
  treatmentGoals: string;
  additionalNotes: string;
  referringPhysician: string;
  referralReason: string;
  // Lifestyle
  diet: string;
  exercise: string;
  smoker: string;
  alcohol: string;
  socialEnvironment: string;
  // Contact
  phone: string;
  address: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
}

const uploadedMap = new Map<string, UploadedPatientData>();

export function getUploadedData(patientId: string): UploadedPatientData | null {
  return uploadedMap.get(patientId) ?? null;
}

export function saveUploadedData(patientId: string, data: UploadedPatientData): void {
  uploadedMap.set(patientId, data);
}

export function clearUploadedData(patientId: string): void {
  uploadedMap.delete(patientId);
}
