import { ClinicalPathways } from './ClinicalPathways';
import { PathologyEngine } from './PathologyEngine';
import { BiologicalDecayEngine } from './BiologicalDecayEngine';
import { InferenceEngine } from './InferenceEngine';
import { PharmacotherapyEngine } from './PharmacotherapyEngine';
import { NetworkAdoptionEngine } from './NetworkAdoptionEngine';

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

export class Agent {
  state: AgentState;

  constructor(initialState: Omit<AgentState, 'history' | 'isDead' | 'memory' | 'biometricHistory' | 'networkConnections' | 'imaging' | 'labs'> & { memory?: string[], networkConnections?: string[], labs?: Partial<Labs>, imaging?: Partial<Imaging> }) {
    
    // Generate organic baselines for older configurations / swarms missing explicit inputs
    const baseAge = initialState.age;
    const isSmoker = initialState.smoker;
    const hasHF = initialState.chronicConditions.includes('CHF');
    
    // Baseline Defaults generating biological approximations
    const fullLabs: Labs = {
       a1c: initialState.labs?.a1c || (initialState.vitals?.bmi > 30 ? 6.5 : 5.4),
       ldlCholesterol: initialState.labs?.ldlCholesterol || 110,
       egfr: initialState.labs?.egfr || Math.max(10, 120 - (baseAge * 0.4)),
       cvHealth: initialState.labs?.cvHealth || 85,
       ntProBNP: initialState.labs?.ntProBNP !== undefined ? initialState.labs.ntProBNP : (hasHF ? (baseAge > 60 ? 800 : 500) : (baseAge > 50 ? 50 : 20)),
       hsCRP: initialState.labs?.hsCRP !== undefined ? initialState.labs.hsCRP : (isSmoker ? 4.5 : 1.2),
       uacr: initialState.labs?.uacr !== undefined ? initialState.labs.uacr : (initialState.chronicConditions.includes('Diabetes') ? 80 : 15)
    };

    const fullImaging: Imaging = {
       lvef: initialState.imaging?.lvef !== undefined ? initialState.imaging.lvef : (hasHF ? 35 : 60), // HF < 40% typically, normal > 55%
       cacScore: initialState.imaging?.cacScore !== undefined ? initialState.imaging.cacScore : (baseAge > 50 ? (isSmoker ? 150 : 0) : 0) 
    };

    this.state = {
      ...initialState,
      labs: fullLabs,
      imaging: fullImaging,
      isDead: false,
      history: [],
      biometricHistory: [],
      memory: initialState.memory || [],
      networkConnections: initialState.networkConnections || [],
    };
  }

  tick(currentTick: number) {
    if (this.state.isDead) return;

    // 0. Actuarial Epidemilogical Risk Assessment (Annual Check)
    PathologyEngine.evaluateAnnualRisk(this, currentTick);

    NetworkAdoptionEngine.processNetworkLearning(this, currentTick);

    // 1. Biological Decay & Lifestyle Vectors
    BiologicalDecayEngine.evaluate(this, currentTick);

    // 2. Multiorgan Damage Combos
    PathologyEngine.evaluateMultifactorialDamage(this);

    ClinicalPathways.evaluateOrganRecovery(this);

    // 4. ML Sequence Prediction (Replacing Hardcoded Condition Bounding)
    // We fire this asynchronously so it doesn't block the React render loop.
    InferenceEngine.predictNextTickDelta(this.state).then(res => {
        if (res.healthDelta !== 0) {
            this.state.baseHealth += res.healthDelta;
            this.clampState();
            // Optional: Log deep learning interventions into history occasionally
            if (currentTick % 26 === 0 && Math.abs(res.healthDelta) > 0.05) {
               this.logEvent({
                 tick: currentTick,
                 type: 'AI Sequence Engine',
                 description: res.log,
                 impactHealth: res.healthDelta,
                 impactStress: 0
               });
            }
        }
        
        // Machine Learning Native Pathology Assignment
        if (res.newPathologies && res.newPathologies.length > 0) {
            res.newPathologies.forEach(pathology => {
                if (!this.state.chronicConditions.includes(pathology)) {
                    this.state.chronicConditions.push(pathology);
                    this.logEvent({
                        tick: currentTick,
                        type: 'Pathology Acquired',
                        description: `[WASM PREDICTION ALIGNMENT] Neural Sequence strictly forecasted onset of ${pathology}.`,
                        impactHealth: -10,
                        impactStress: 15
                    });
                }
            });
        }
    });

    PharmacotherapyEngine.evaluateAutonomousPharmacotherapy(this, currentTick);

    // 7. Active Protocol Divergences (Extreme Physician-Level Decay Resistance & Adverse Effects)
    if (this.state.medications.includes("Rosuvastatin") || this.state.medications.includes("Atorvastatin")) {
        if (this.state.labs.ldlCholesterol > 65) this.state.labs.ldlCholesterol -= 0.5;
        this.state.labs.cvHealth += 0.05;
        this.state.baseHealth += 0.02; 
    }
    
    // Metabolic Advanced Therapeutics
    if (this.state.medications.includes("Semaglutide") || this.state.medications.includes("GLP1_Agonist")) {
        // STEP Trials: Massive BMI stripping, cardioprotection
        if (this.state.vitals.bmi > 22) this.state.vitals.bmi -= 0.08; 
        if (this.state.labs.a1c > 5.5) this.state.labs.a1c -= 0.03;
        if (this.state.vitals.bpSystolic > 115) this.state.vitals.bpSystolic -= 0.1;
        this.state.labs.cvHealth += 0.05;
        this.state.baseHealth += 0.03;
    }
    
    if (this.state.medications.includes("Empagliflozin") || this.state.medications.includes("SGLT2_Inhibitor")) {
        // EMPA-REG: Preserves eGFR, massive CHF offloading
        if (this.state.labs.a1c > 6.0) this.state.labs.a1c -= 0.01;
        if (this.state.vitals.bpSystolic > 120) this.state.vitals.bpSystolic -= 0.05;
        if (this.state.labs.egfr > 30) this.state.labs.egfr += 0.01; // Renal preservation
        this.state.labs.cvHealth += 0.08;
    }
    
    if (this.state.medications.includes("Lisinopril") || this.state.medications.includes("ACE_Inhibitor")) {
        if (this.state.vitals.bpSystolic > 115) this.state.vitals.bpSystolic -= 0.1;
        this.state.labs.egfr += 0.01; // Slower explicit renal preserving
    }

    if (this.state.medications.includes("Metoprolol") || this.state.medications.includes("Amlodipine")) {
        if (this.state.vitals.bpSystolic > 110) this.state.vitals.bpSystolic -= 0.15;
        if (this.state.vitals.heartRate > 60) this.state.vitals.heartRate -= 0.2; // Beta block execution
    }

    if (this.state.medications.includes("Insulin")) {
        if (this.state.labs.a1c > 6.5) this.state.labs.a1c -= 0.05;
        this.state.vitals.bmi += 0.02; // Standard insulin weight gain penalty
    }

    // Psychiatric Complexities
    if (this.state.medications.includes("Olanzapine")) {
        // Atypical antipsychotic: Solves psychosis stress, absolutely destroys metabolic baseline
        this.state.vitals.bmi += 0.05;
        this.state.labs.a1c += 0.01; 
        this.state.labs.ldlCholesterol += 0.2;
        this.state.stressLevel -= 0.2;
    }
    if (this.state.medications.includes("Lithium")) {
        this.state.stressLevel -= 0.15;
        this.state.labs.egfr -= 0.02; // Long term nephrotoxicity
    }
    if (this.state.medications.includes("Sertraline")) {
        this.state.stressLevel -= 0.1;
    }

    // Explicit Lifestyle Protocol Damping
    if (this.state.memory.includes('l2_breathe')) {
        this.state.stressLevel -= 0.2;
        if (this.state.vitals.bpSystolic > 115) this.state.vitals.bpSystolic -= 0.05;
    }
    if (this.state.memory.includes('l1_keto')) {
        if (this.state.labs.a1c > 4.5) this.state.labs.a1c -= 0.02;
        this.state.labs.egfr -= 0.01; // Friction
    }
    if (this.state.memory.includes('l3_plunge')) {
        this.state.stressLevel -= 0.1;
        this.state.baseHealth += 0.02;
    }

    if (currentTick % 4 === 0) { // Take snapshot once a month for chronological charting
      this.state.biometricHistory.push({
        tick: currentTick,
        age: this.state.age,
        health: this.state.baseHealth,
        stress: this.state.stressLevel,
        bpSystolic: this.state.vitals.bpSystolic,
        a1c: this.state.labs.a1c
      });
    }

    this.clampState();
  }

  logEvent(event: AgentEvent) {
    this.state.history.push(event);
    this.state.baseHealth += event.impactHealth;
    this.state.stressLevel += event.impactStress;
    this.clampState();
  }

  public clampState() {
    // Hard Biological Age Ceiling
    let maxBaseHlth = 100;
    if (this.state.age > 65) maxBaseHlth = 100 - (this.state.age - 65) * 1.5; // e.g. at 85, max potential health is 70
    maxBaseHlth = Math.max(10, maxBaseHlth); // Absolute floor to the ceiling
    
    this.state.baseHealth = Math.max(0, Math.min(maxBaseHlth, this.state.baseHealth));
    this.state.stressLevel = Math.max(0, Math.min(100, this.state.stressLevel));
    this.state.dietQuality = Math.max(0, Math.min(100, this.state.dietQuality));
    
    this.state.vitals.bmi = Math.max(15, this.state.vitals.bmi);
    this.state.vitals.bpSystolic = Math.max(90, this.state.vitals.bpSystolic);
    this.state.vitals.bpDiastolic = Math.max(50, this.state.vitals.bpDiastolic);
    this.state.vitals.heartRate = Math.max(40, this.state.vitals.heartRate);
    this.state.labs.a1c = Math.max(4.0, this.state.labs.a1c);
    this.state.labs.ldlCholesterol = Math.max(40, this.state.labs.ldlCholesterol);
    this.state.labs.egfr = Math.max(0, Math.min(130, this.state.labs.egfr));
    this.state.labs.cvHealth = Math.max(0, Math.min(100, this.state.labs.cvHealth));
    
    // Advanced Diagnostic Clamps
    this.state.imaging.lvef = Math.max(10, Math.min(85, this.state.imaging.lvef)); // Normal is 50-70. Below 10 is lethal.
    this.state.imaging.cacScore = Math.max(0, Math.min(5000, this.state.imaging.cacScore)); // CAC is 0 (perfect) to thousands
    this.state.labs.ntProBNP = Math.max(0, this.state.labs.ntProBNP);
    this.state.labs.hsCRP = Math.max(0, this.state.labs.hsCRP);
    this.state.labs.uacr = Math.max(0, this.state.labs.uacr);
  }
}
