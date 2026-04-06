export interface AgentEvent {
  tick: number;
  type: string;
  description: string;
  impactHealth: number;
  impactStress: number;
  citation?: string;
  hazardRatio?: number;
}

export interface BiometricSnapshot {
  tick: number;
  age: number;
  health: number;
  stress: number;
  bpSystolic: number;
  a1c: number;
}

export type Sex = 'Male' | 'Female';
export type ExerciseRoutine = 'None' | 'Moderate' | 'High';
export type MedicalCompliance = 'Low' | 'Moderate' | 'High';
export type AgentRole = 'Patient' | 'Researcher' | 'WebSurfer';

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  bmi: number;
}

export interface Labs {
  a1c: number;
  ldlCholesterol: number;
  egfr: number;      
  cvHealth: number;  
  ntProBNP: number;
  hsCRP: number;
  uacr: number;
}

export interface Imaging {
  lvef: number;
  cacScore: number;
}

export interface AgentState {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  role: AgentRole;
  baseHealth: number;       
  stressLevel: number;      
  dietQuality: number;      
  wealth: number;           
  accessToCare: number;     
  foodDesert: boolean;
  chronicConditions: string[];
  familyHistory: string[];
  surgicalHistory: string[];
  medications: string[];
  smoker: boolean;
  exerciseRoutine: ExerciseRoutine;
  medicalCompliance: MedicalCompliance;
  vitals: Vitals;
  labs: Labs;
  imaging: Imaging;
  history: AgentEvent[];
  biometricHistory: BiometricSnapshot[];
  memory: string[]; // Tracked ideas
  networkConnections?: string[]; // Tracked authors communicated with
  isDead: boolean;
  comparativeGroup?: 'Control' | 'Intervention';
  pairedTwinId?: string;
}
