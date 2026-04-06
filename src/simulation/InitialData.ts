import type {  AgentState, Sex, ExerciseRoutine, MedicalCompliance, AgentRole  } from '../types/Simulation.types';

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Carlos", "Maria", "Ali", "Fatima", "Chen", "Wei", "Hiroshi", "Yuki", "Kwame", "Aisha"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;

const generateAgent = (idNum: number): Omit<AgentState, 'history' | 'isDead' | 'biometricHistory' | 'networkConnections'> => {
  const age = Math.floor(randomRange(25, 85));
  const sex = randomChoice<Sex>(['Male', 'Female']);
  const smoker = Math.random() < 0.2;
  const foodDesert = Math.random() < 0.3;
  const wealth = Math.floor(randomRange(10, 100));
  
  // Base parameters
  const baseHealth = age > 65 ? randomRange(40, 80) : randomRange(70, 100);
  const stressLevel = randomRange(10, 90);
  const dietQuality = foodDesert ? randomRange(10, 50) : randomRange(30, 90);
  const accessToCare = wealth < 40 ? randomRange(10, 50) : randomRange(50, 100);
  
  // Biological tracking
  const sysBp = age > 50 ? randomRange(120, 160) : randomRange(110, 130);
  const diaBp = sysBp * 0.6;
  const hr = randomRange(60, 90);
  const bmi = randomRange(18.5, 38);
  
  const a1c = randomRange(4.5, bmi > 30 ? 8.5 : 6.0);
  const ldl = randomRange(80, 180);
  const egfr = age > 60 ? randomRange(45, 90) : randomRange(90, 120);
  const cvHealth = age > 60 ? randomRange(40, 80) : randomRange(80, 100);

  // Conditions
  const conditions: string[] = [];
  const meds: string[] = [];
  const fhx: string[] = [];
  
  if (age > 40 && Math.random() < 0.3) fhx.push("Diabetes");
  if (age > 50 && Math.random() < 0.4) fhx.push("Heart Disease");

  if (a1c >= 6.5) {
    conditions.push("Diabetes");
    if (Math.random() < 0.6) meds.push("Metformin");
    if (a1c > 8.0 && Math.random() < 0.3) meds.push("Insulin");
  }
  
  if (sysBp >= 140) {
    conditions.push("Hypertension");
    if (Math.random() < 0.5) meds.push(randomChoice(["Lisinopril", "Amlodipine"]));
  }

  if (egfr < 60 && egfr > 15) {
    conditions.push("CKD");
  } else if (egfr <= 15) {
    conditions.push("ESRD");
  }

  if (cvHealth < 50 && Math.random() < 0.5) {
    conditions.push("CHF");
  }

  if (smoker && age > 50 && Math.random() < 0.4) {
    conditions.push("COPD");
  } else if (Math.random() < 0.1) {
    conditions.push("Asthma");
  }

  if (Math.random() < 0.05) {
    conditions.push("Hepatitis");
    if (Math.random() < 0.2) conditions.push("Cirrhosis");
  }

  const exerciseRoutine = randomChoice<ExerciseRoutine>(['None', 'Moderate', 'High']);
  const medicalCompliance = randomChoice<MedicalCompliance>(['Low', 'Moderate', 'High']);
  const role = randomChoice<AgentRole>(['Patient', 'Patient', 'Patient', 'Patient', 'Patient', 'Patient', 'Researcher', 'WebSurfer', 'WebSurfer']);

  return {
    id: `agent_${idNum}`,
    name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
    age, sex, role, baseHealth, stressLevel, dietQuality, wealth, accessToCare, foodDesert, smoker,
    chronicConditions: conditions,
    familyHistory: fhx,
    surgicalHistory: Math.random() < 0.2 ? [randomChoice(["Appendectomy", "Cholecystectomy", "Knee Replacement", "CABG"])] : [],
    medications: meds,
    exerciseRoutine,
    medicalCompliance,
    vitals: { bpSystolic: sysBp, bpDiastolic: diaBp, heartRate: hr, bmi },
    labs: { a1c, ldlCholesterol: ldl, egfr, cvHealth, ntProBNP: conditions.includes("CHF") ? 800 : 50, hsCRP: smoker ? 4.5 : 1.5, uacr: a1c > 7 ? 80 : 15 },
    imaging: { lvef: conditions.includes("CHF") ? 35 : 60, cacScore: smoker && age > 50 ? 150 : 0 },
    memory: []
  };
};

export const initialAgents: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory' | 'networkConnections'>[] = Array.from({ length: 100 }, (_, i) => generateAgent(i + 1));
