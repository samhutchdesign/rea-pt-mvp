export type UserRole = 'owner' | 'admin' | 'editor' | 'limited';

export interface Physio {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicName: string;
  credentials: string;
  specialty?: string;
  title: string;
  bio: string;
  avatarInitials: string;
  avatarUrl?: string;
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
  avatarUrl?: string;
  patientIds: string[];
  clinicId: string;
  locationIds: string[];
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

export const MOVEMENT_TYPES = [
  'Flexion', 'Extension', 'Hyperextension', 'Lateral Flexion',
  'Rotation', 'Internal Rotation', 'External Rotation',
  'Protraction', 'Retraction', 'Elevation', 'Depression',
  'Upward Rotation', 'Downward Rotation',
  'Abduction', 'Adduction', 'Horizontal Abduction', 'Horizontal Adduction',
  'Circumduction', 'Dorsiflexion', 'Plantarflexion',
  'Pronation', 'Supination', 'Inversion', 'Eversion', 'Opposition',
] as const;

export type MovementType = typeof MOVEMENT_TYPES[number];

export const EFFORT_TYPES = [
  'Concentric', 'Eccentric', 'Isometric', 'Isotonic', 'Isokinetic',
  'Ballistic / Explosive', 'Plyometric', 'Static Hold', 'Assisted', 'Resisted',
] as const;

export type EffortType = typeof EFFORT_TYPES[number];

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  instructions: string[];
  commonMistakes: string[];
  tags: ExerciseTags;
  movementTypes: MovementType[];
  effortTypes: EffortType[];
  defaultSets: number;
  defaultReps: number;
  defaultHoldSecs: number;
  defaultFrequency: 'Daily' | '2x Daily' | 'Every Other Day' | '3x Weekly';
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  defaultName?: string;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  variationGroup?: string;
  userUploaded?: boolean;
}

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  holdSecs: number;
  cue?: string;
  adherence: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  frequency: string;
  exercises: ProgramExercise[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  userCreated?: boolean;
  createdByEmpId?: string;
}

export interface ExerciseComment {
  id: string;
  exerciseId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  createdAt: string;
  pinned: boolean;
}

export interface HepHistoryEntry {
  id: string;
  programId: string;
  programName: string;
  frequency: string;
  exercises: ProgramExercise[];
  assignedAt: string;
  endedAt: string;
}

export type PainLevel = 'No Pain' | 'Low Pain' | 'Moderate Pain' | 'High Pain';
export type AdherenceLevel = 'High Adherence' | 'Moderate Adherence' | 'Low Adherence';
export type ImprovementLevel = 'Significant Improvement' | 'Some Improvement' | 'No Improvement' | 'Worsening';

export interface PainPoint {
  location: string;
  description: string;
  nprs: number;
  pattern: 'constant' | 'intermittent';
  aggravating: string;
  easing: string;
  bodyView?: 'front' | 'back';
  x?: number;
  y?: number;
}

export interface SubjectiveSection {
  painPoints: PainPoint[];
  amSymptoms: string;
  pmSymptoms: string;
  nightPain: boolean;
  sleepingPosition: string;
  bladderBowelUpdate: string;
  notes: string;
}

export interface PelvicFloorExam {
  power: number;
  endurance: number;
  repetitions: number;
  fastContractions: number;
  tone: 'hypertonic' | 'normal' | 'hypotonic' | '';
  tenderness: string;
}

export interface RomEntry {
  joint: string;
  side: string;
  aromNotes: string;
  strengthNotes: string;
}

export interface ObjectiveSection {
  observation: string;
  functionalTests: string;
  romStrength: RomEntry[];
  pelvicFloorExam: PelvicFloorExam;
  prolapseGrade: string;
  diastasisRecti: string;
  specialTests: string;
  palpation: string;
  notes: string;
}

export interface ProblemListItem {
  bodyFunction: string;
  activityParticipation: string;
  environment: string;
}

export interface GoalItem {
  problem: string;
  shortTerm: string;
  longTerm: string;
}

export interface AnalysisSection {
  bodyStructures: string;
  problemList: ProblemListItem[];
  ptDiagnosis: string;
  goals: GoalItem[];
  notes: string;
}

export interface PlanItem {
  problemRef: string;
  treatment: string;
}

export interface PlanSection {
  items: PlanItem[];
  frequency: string;
  reassessmentPlan: string;
  dischargePlan: string;
  consentObtained: boolean;
  notes: string;
}

export interface InterventionItem {
  type: 'Manual Therapy' | 'Exercise' | 'Modality' | 'Education' | 'Other';
  details: string;
}

export interface EvaluationSection {
  postNprs?: number;
  patientReaction: string;
  objectiveResponse: string;
}

export interface ChartAmendment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  text: string;
  createdAt: string;
}

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
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  analysis: AnalysisSection;
  plan: PlanSection;
  interventions: InterventionItem[];
  evaluation: EvaluationSection;
  recommendations: string[];
  signedAt?: string;
  signedByEmpId?: string;
  signedByName?: string;
  signedByInitials?: string;
  signatureFontId?: string;
  amendments?: ChartAmendment[];
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
  createdAt: string;
  lastModified: string;
  programId?: string;
  programAssignedAt?: string;
  hepHistory?: HepHistoryEntry[];
  assignedEmployeeId?: string;
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
