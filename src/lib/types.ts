export type UserRole = 'owner' | 'admin' | 'staff';

export interface Physio {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicName: string;
  credentials: string;
  title: string;
  bio: string;
  avatarInitials: string;
  role: UserRole;
  clinicId: string;
  locationId: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  credentials: string;
  title: string;
  bio: string;
  role: UserRole;
  avatarInitials: string;
  patientIds: string[];
  clinicId: string;
  joinedAt: string;
  specialties: string[];
  archived: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logoInitials: string;
}

export interface ClinicLocation {
  id: string;
  orgId: string;
  name: string;
  city: string;
  regionCountry: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  employeeIds: string[];
}

export interface ExerciseTags {
  specialty: string[];
  condition: string[];
  surgery: string[];
  muscle: string[];
  bodyPart: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  commonMistakes: string[];
  tags: ExerciseTags;
  defaultSets: number;
  defaultReps: number;
  defaultHoldSecs: number;
  defaultFrequency: 'Daily' | '2x Daily' | 'Every Other Day' | '3x Weekly';
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  frequency: string;
  adherence: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  exercises: ProgramExercise[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export type PainLevel = 'No Pain' | 'Low Pain' | 'Moderate Pain' | 'High Pain';
export type AdherenceLevel = 'High Adherence' | 'Moderate Adherence' | 'Low Adherence';
export type ImprovementLevel = 'Significant Improvement' | 'Some Improvement' | 'No Improvement' | 'Worsening';

export interface ChartSession {
  id: string;
  patientId: string;
  date: string;
  isIntakeSession: boolean;
  summary: string;
  painLevel: PainLevel;
  adherenceLevel?: AdherenceLevel;
  improvementLevel?: ImprovementLevel;
  exercisesPerDay: number;
  soapie: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    intervention: string;
    evaluation: string;
    recommendations: string;
  };
}

export interface DocumentField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'checkbox' | 'dropdown' | 'textarea';
  options?: string[];
  value?: string;
}

export interface Document {
  id: string;
  name: string;
  fields: DocumentField[];
  isFavorite: boolean;
  isDefault: boolean;
  updatedAt: string;
}

export interface PatientDocument {
  documentId: string;
  submittedAt: string;
  fieldValues: Record<string, string>;
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
}

export interface PatientMetrics {
  age: number;
  sexAssignedAtBirth: string;
  height: string;
  weight: string;
  handDominance: string;
}

export interface InjuryHistory {
  mechanism: string;
  dateOfOnset: string;
  surgeryType: string;
  surgeryDate: string;
  symptomEvolution: string;
  functionalMobility: string;
  management: string;
  homeEquipment: string;
  painLevel?: string;
}

export interface ObstetricPelvicHealth {
  obstetricsHistory: string;
  bladderBowelSymptoms: string;
}

export interface PMHx {
  previousEpisode: string;
  pmhx: string;
  previousTreatments: string;
  medicationList: string;
  exams: string;
  allergies?: string;
  referringPhysician?: string;
  referralReason?: string;
}

export interface SOHx {
  job: string;
  hobbies: string;
  socialEnvironment: string;
  physicalEnvironment: string;
  clientGoals: string;
}

export interface LifestyleHabits {
  otherConditions: string;
  diet: string;
  exercise: string;
  smoker: string;
  alcohol: string;
}

export interface MedicalHistory {
  otherConditions: string;
  attachments: string[];
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  avatarInitials: string;
  status: 'new' | 'active' | 'inactive';
  lastModified: string;
  programId?: string;
  assignedEmployeeIds: string[];
  clinicId: string;
  archived: boolean;
  sessionsPerWeek: number;
  totalSessions: number;
  metrics?: PatientMetrics;
  injuryHistory?: InjuryHistory;
  obstetricPelvicHealth?: ObstetricPelvicHealth;
  pmhx?: PMHx;
  sohx?: SOHx;
  lifestyle?: LifestyleHabits;
  medicalHistory?: MedicalHistory;
  emergencyContact?: EmergencyContact;
  documents: PatientDocument[];
}

export interface AudioTrack {
  id: string;
  ownerId: string;
  ownerName: string;
  durationSecs: number;
  createdAt: string;
  blobUrl: string | null;
}

export interface PatientComment {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  createdAt: string;
  pinned?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  patientId?: string;
  patientName?: string;
  tab?: string;
  timestamp: string;
  read: boolean;
  type: 'document' | 'message' | 'alert';
}
