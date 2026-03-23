import { ClinicalPathways } from './ClinicalPathways';

export interface AgentEvent {
  tick: number;
  type: string;
  description: string;
  impactHealth: number;
  impactStress: number;
  citation?: string;
  hazardRatio?: number;
}

export type Sex = 'Male' | 'Female';
export type ExerciseRoutine = 'None' | 'Moderate' | 'High';
export type MedicalCompliance = 'Low' | 'Moderate' | 'High';

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
}

export interface AgentState {
  id: string;
  name: string;
  age: number;
  sex: Sex;
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
  history: AgentEvent[];
  isDead: boolean;
}

export class Agent {
  state: AgentState;

  constructor(initialState: Omit<AgentState, 'history' | 'isDead'>) {
    this.state = {
      ...initialState,
      isDead: false,
      history: [],
    };
  }

  tick(_currentTick: number) {
    if (this.state.isDead) return;

    // 1. Natural Age Decay (Drastically slowed down for realism)
    let agePenalty = 0;
    if (this.state.age > 60) agePenalty = (this.state.age - 60) * 0.001 + 0.01;
    else if (this.state.age > 40) agePenalty = (this.state.age - 40) * 0.0005;
    this.state.baseHealth -= agePenalty;
    
    if (this.state.age > 50) {
      this.state.vitals.bpSystolic += 0.005;
      this.state.labs.cvHealth -= 0.01; 
    }

    // 2. Behavioral Mitigation
    if (this.state.exerciseRoutine === 'High') {
      this.state.vitals.bmi -= 0.01;
      this.state.vitals.heartRate -= 0.1;
      this.state.vitals.bpSystolic -= 0.1;
      this.state.stressLevel -= 0.1;
      this.state.baseHealth += 0.02;
    } else if (this.state.exerciseRoutine === 'Moderate') {
      this.state.vitals.bmi -= 0.005;
      this.state.vitals.heartRate -= 0.05;
      this.state.stressLevel -= 0.05;
      this.state.baseHealth += 0.01;
    }

    // 3. MULTIFACTORIAL ORGAN DAMAGE (The Vicious Cycle)
    if (this.state.labs.a1c > 7.0) this.state.labs.egfr -= 0.02 * (this.state.labs.a1c - 7.0); 
    if (this.state.vitals.bpSystolic > 140) this.state.labs.egfr -= 0.02;
    
    if (this.state.labs.egfr < 60) {
      this.state.vitals.bpSystolic += 0.1; 
      this.state.labs.cvHealth -= 0.02; 
    }

    if (this.state.labs.ldlCholesterol > 130 || this.state.vitals.bpSystolic > 140) {
      this.state.labs.cvHealth -= 0.05;
    }

    ClinicalPathways.evaluateOrganRecovery(this);

    // 4. Broad Condition Matrix (Phase 12 Expansion)
    let conditionPenalty = 0;
    
    // Metabolic & Cardiac
    if (this.state.chronicConditions.includes("Diabetes")) {
      const hasMeds = this.state.medications.includes("Metformin") || this.state.medications.includes("Insulin");
      let multiplier = hasMeds ? 0.02 : 0.08; 
      if (this.state.dietQuality < 50) conditionPenalty += multiplier;

      this.state.labs.a1c += 0.005; 
      if (this.state.dietQuality <= 50) this.state.labs.a1c += 0.01;
      if (hasMeds && this.state.labs.a1c > 6.0) this.state.labs.a1c -= 0.02; 
    }
    
    if (this.state.chronicConditions.includes("Hypertension")) {
      const hasMeds = this.state.medications.includes("Lisinopril") || this.state.medications.includes("Amlodipine");
      let multiplier = hasMeds ? 0.02 : 0.06;
      if (this.state.stressLevel > 60) conditionPenalty += multiplier;

      this.state.vitals.bpSystolic += 0.03;
      if (hasMeds) {
        if (this.state.vitals.bpSystolic > 120) this.state.vitals.bpSystolic -= 0.1;
        if (this.state.vitals.bpDiastolic > 80) this.state.vitals.bpDiastolic -= 0.05;
      }
    }

    if (this.state.chronicConditions.includes("CHF")) {
      this.state.labs.cvHealth -= 0.03;
      if (this.state.dietQuality < 50) {
        this.state.labs.cvHealth -= 0.05; // Salt/Fluid overload
        conditionPenalty += 0.1;
      }
    }

    // Renal
    if (this.state.chronicConditions.includes("CKD")) {
      if (this.state.vitals.bpSystolic > 130) this.state.labs.egfr -= 0.04;
    }
    
    if (this.state.chronicConditions.includes("ESRD")) {
      this.state.labs.egfr = Math.min(this.state.labs.egfr, 14); // Locked active failure
      conditionPenalty += 0.2; // Massive toxic strain
    }

    // Pulmonary
    if (this.state.chronicConditions.includes("Asthma")) {
      if (this.state.foodDesert) this.state.stressLevel += 0.1; // Proxy for environmental poor air quality
      if (this.state.smoker) {
        conditionPenalty += 0.05;
        if (!this.state.chronicConditions.includes("COPD") && Math.random() < 0.005) {
          this.state.chronicConditions.push("COPD");
        }
      }
    }

    if (this.state.chronicConditions.includes("COPD")) {
      this.state.vitals.heartRate += 0.05;
      this.state.stressLevel += 0.05;
      conditionPenalty += 0.08;
      if (this.state.smoker) conditionPenalty += 0.15; // Active destruction
    }

    // Hepatology
    if (this.state.chronicConditions.includes("Hepatitis")) {
      conditionPenalty += 0.05;
      if (this.state.medicalCompliance === 'Low' && Math.random() < 0.005) {
        if (!this.state.chronicConditions.includes("Cirrhosis")) this.state.chronicConditions.push("Cirrhosis");
      }
    }

    if (this.state.chronicConditions.includes("Cirrhosis") || this.state.chronicConditions.includes("ESLD")) {
      conditionPenalty += 0.15;
      // Unpredictable liver toxicity slashing lab stability natively
      if (Math.random() < 0.05) {
        this.state.labs.a1c += Math.random() > 0.5 ? 0.1 : -0.1;
        this.state.vitals.bpSystolic += Math.random() > 0.5 ? 2 : -2;
      }
    }
    
    // Apply environmental and gender-based acceleration 
    if (this.state.sex === 'Male' && this.state.age < 60 && conditionPenalty > 0) conditionPenalty *= 1.1;
    if (this.state.foodDesert && conditionPenalty > 0) conditionPenalty *= 1.5; 
    
    // Divide final condition penalty by 5 to drastically slow catastrophic cascades
    this.state.baseHealth -= (conditionPenalty / 5);

    // 5. Stress impact & HR/BP drift
    if (this.state.stressLevel > 70) {
      this.state.baseHealth -= 0.02;
      this.state.vitals.bpSystolic += 0.1;
      this.state.vitals.heartRate += 0.1;
    } else if (this.state.stressLevel < 30) {
      this.state.baseHealth += 0.01;
      if (this.state.vitals.bpSystolic > 110) this.state.vitals.bpSystolic -= 0.1;
    }

    // 6. Diet impact & BMI / LDL drift
    if (this.state.dietQuality < 40) {
      this.state.baseHealth -= 0.02;
      this.state.vitals.bmi += 0.01;
      this.state.labs.ldlCholesterol += 0.1;
    } else if (this.state.dietQuality > 70) {
      this.state.baseHealth += 0.01;
      if (this.state.vitals.bmi > 22) this.state.vitals.bmi -= 0.005;
      if (this.state.labs.ldlCholesterol > 100) this.state.labs.ldlCholesterol -= 0.1;
    }

    this.clampState();
  }

  logEvent(event: AgentEvent) {
    this.state.history.push(event);
    this.state.baseHealth += event.impactHealth;
    this.state.stressLevel += event.impactStress;
    this.clampState();
  }

  private clampState() {
    this.state.baseHealth = Math.max(0, Math.min(100, this.state.baseHealth));
    this.state.stressLevel = Math.max(0, Math.min(100, this.state.stressLevel));
    this.state.dietQuality = Math.max(0, Math.min(100, this.state.dietQuality));
    
    this.state.vitals.bmi = Math.max(15, this.state.vitals.bmi);
    this.state.vitals.bpSystolic = Math.max(90, this.state.vitals.bpSystolic);
    this.state.vitals.bpDiastolic = Math.max(50, this.state.vitals.bpDiastolic);
    this.state.vitals.heartRate = Math.max(40, this.state.vitals.heartRate);
    this.state.labs.a1c = Math.max(4.0, this.state.labs.a1c);
    this.state.labs.ldlCholesterol = Math.max(40, this.state.labs.ldlCholesterol);
    this.state.labs.egfr = Math.max(0, Math.min(120, this.state.labs.egfr));
    this.state.labs.cvHealth = Math.max(0, Math.min(100, this.state.labs.cvHealth));
  }
}
