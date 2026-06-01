export interface UploadedPatientData {
  // Clinical
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  chiefComplaint: string;
  symptomDuration: string;
  medicalHistory: string;
  medications: string;
  treatmentGoals: string;
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
