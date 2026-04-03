import { ClinicalPathways } from './ClinicalPathways';
import { KnowledgeBase } from './KnowledgeNetwork';
import { PathologyEngine } from './PathologyEngine';
import { InferenceEngine } from './InferenceEngine';

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

    this.processNetworkLearning(currentTick);

    // 1. Gompertz-Makeham Exponential Age Decay (Rebalanced for ~82yr average lifespan)
    let agePenalty = 0.002; // Base Makeham parameter (accidents, baseline natural decay)
    if (this.state.age > 40) {
        // Gompertz exponential term: Risk doubles roughly every 8-9 years
        // At age 80, this drains ~2-3 health per year rapidly. At age 90, it's severe.
        agePenalty += 0.001 * Math.exp((this.state.age - 40) * 0.065);
    }
    this.state.baseHealth -= agePenalty;
    
    if (this.state.age > 50) {
      this.state.vitals.bpSystolic += 0.005;
      this.state.labs.cvHealth -= 0.01; 
    }

    // 2. Behavioral Mitigation (Preventative cardiovascular buffering, removed direct flat base health regeneration to prevent immortality)
    if (this.state.exerciseRoutine === 'High') {
      if (this.state.vitals.bmi > 20) this.state.vitals.bmi -= 0.01;
      if (this.state.vitals.heartRate > 55) this.state.vitals.heartRate -= 0.1;
      if (this.state.vitals.bpSystolic > 110) this.state.vitals.bpSystolic -= 0.1;
      this.state.stressLevel -= 0.15;
    } else if (this.state.exerciseRoutine === 'Moderate') {
      if (this.state.vitals.bmi > 22) this.state.vitals.bmi -= 0.005;
      if (this.state.vitals.heartRate > 60) this.state.vitals.heartRate -= 0.05;
      this.state.stressLevel -= 0.08;
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

    this.evaluateAutonomousPharmacotherapy(currentTick);

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

  private clampState() {
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

  // --- Clinical Decision Support System (CDSS) ---
  private evaluateAutonomousPharmacotherapy(currentTick: number) {
      if (this.state.medicalCompliance === 'Low' || currentTick % 52 !== 0) return;

      // 1. HYPERTENSION (JAMA / ACC Guidelines)
      if (this.state.vitals.bpSystolic > 140 || this.state.chronicConditions.includes('Hypertension')) {
          const hasACE = this.state.medications.includes('Lisinopril') || this.state.medications.includes('ACE_Inhibitor');
          const hasCCB = this.state.medications.includes('Amlodipine');
          const hasBB = this.state.medications.includes('Metoprolol') || this.state.medications.includes('Beta_Blocker');
          const hasDiuretic = this.state.medications.includes('Chlorthalidone');

          // Renoprotective requirement
          if ((this.state.chronicConditions.includes('Diabetes') || this.state.labs.egfr < 60) && !hasACE) {
              this.state.medications.push('Lisinopril');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Lisinopril (ACE-I) over standard CCBs strictly due to critical renoprotective indications secondary to compromised eGFR/Diabetes arrays.', impactHealth: 3, impactStress: -2 });
          } 
          // Cardioprotective requirement 
          else if ((this.state.chronicConditions.includes('CHF') || this.state.chronicConditions.includes('CAD')) && !hasBB) {
              this.state.medications.push('Metoprolol');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Metoprolol (Beta-Blocker) explicitly lowering myocardial oxygen demand for acquired Heart Failure trajectory.', impactHealth: 4, impactStress: -2 });
          }
          // Uncomplicated Essential HTN -> CCB
          else if (this.state.vitals.bpSystolic > 150 && !hasCCB && !hasDiuretic && !hasACE) {
              this.state.medications.push('Amlodipine');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Amlodipine (CCB) natively managing rising uncomplicated essential hypertension.', impactHealth: 2, impactStress: 0 });
          }
      }

      // 2. DIABETES & METABOLIC (ADA Guidelines)
      if (this.state.labs.a1c > 6.5 || this.state.chronicConditions.includes('Diabetes')) {
          const hasMetformin = this.state.medications.includes('Metformin');
          const hasSGLT2 = this.state.medications.includes('SGLT2_Inhibitor') || this.state.medications.includes('Empagliflozin');
          const hasGLP1 = this.state.medications.includes('GLP1_Agonist') || this.state.medications.includes('Semaglutide');
          const hasInsulin = this.state.medications.includes('Insulin');

          if (!hasMetformin) {
              this.state.medications.push('Metformin');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Initiating algorithmic definitive first-line therapy (Metformin) for baseline Type-II Diabetes.', impactHealth: 3, impactStress: 1 });
          }
          // EMPA-REG / DAPA-HF
          else if ((this.state.chronicConditions.includes('CHF') || this.state.labs.egfr < 60) && !hasSGLT2 && this.state.labs.egfr > 30) {
              this.state.medications.push('Empagliflozin');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Empagliflozin (SGLT2) acting on strict DAPA-HF outcome mandates averting immediate cardiovascular collapse.', impactHealth: 6, impactStress: -1 });
          }
          // STEP Trials
          else if (this.state.vitals.bmi > 30 && this.state.labs.a1c > 7.5 && !hasGLP1) {
              this.state.medications.push('Semaglutide');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Semaglutide (GLP-1) forcing intensive dual-therapy explicitly to neutralize uncontrolled obesity-driven metabolic collapse.', impactHealth: 5, impactStress: 0 });
          }
          // Pancreatic Burnout
          else if (this.state.labs.a1c > 9.5 && !hasInsulin) {
              this.state.medications.push('Insulin');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Basal Insulin. Oral therapy failure threshold breached indicating terminal pancreatic beta-cell depletion.', impactHealth: 4, impactStress: 8 });
          }
      }

      // 3. HYPERLIPIDEMIA (AHA/ACC)
      if (this.state.labs.ldlCholesterol > 130) {
          const hasModStatin = this.state.medications.includes('Atorvastatin');
          const hasHighStatin = this.state.medications.includes('Rosuvastatin');

          if ((this.state.chronicConditions.includes('CAD') || this.state.chronicConditions.includes('Diabetes')) && !hasHighStatin && this.state.labs.ldlCholesterol > 70) {
              if (hasModStatin) this.state.medications = this.state.medications.filter(m => m !== 'Atorvastatin'); 
              this.state.medications.push('Rosuvastatin');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Enforced Rosuvastatin (High-Intensity) upgrading lipid control dynamically due to highly dangerous ASCVD secondary prevention risk profiles.', impactHealth: 4, impactStress: 0 });
          } 
          else if (this.state.labs.ldlCholesterol > 160 && !hasModStatin && !hasHighStatin) {
              this.state.medications.push('Atorvastatin');
              this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Atorvastatin (Moderate) managing primary prevention hyperlipidemia constraints.', impactHealth: 2, impactStress: 0 });
          }
      }

      // 4. PSYCHIATRIC CARE (APA Guidelines)
      if (this.state.chronicConditions.includes('Schizophrenia') && !this.state.medications.includes('Olanzapine')) {
          this.state.medications.push('Olanzapine');
          this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Olanzapine (Atypical Antipsychotic). Stabilizes severe psychosis but generates immediate massive iatrogenic metabolic risk vectors.', impactHealth: 3, impactStress: -10 });
      }
      if (this.state.chronicConditions.includes('Bipolar Disorder') && !this.state.medications.includes('Lithium')) {
          this.state.medications.push('Lithium');
          this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Lithium stabilizing bipolar variance, acknowledging guaranteed long-term nephrotoxic decay.', impactHealth: 4, impactStress: -8 });
      }
      if ((this.state.chronicConditions.includes('Depression') || this.state.chronicConditions.includes('Anxiety')) && !this.state.medications.includes('Sertraline')) {
          this.state.medications.push('Sertraline');
          this.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Sertraline (SSRI) neutralizing baseline clinical anxiety constraints autonomously.', impactHealth: 2, impactStress: -15 });
      }
  }

  private processNetworkLearning(currentTick: number) {
    // 5. Broad Network Adoption
    // Generative Broadcasting handles ideas proactively in Engine.ts now.
    
    // 6. Natural Healing Mechanism vs Decay Factor (Bounded Recovery Bounds)iological Adoption
    if (Math.random() < 0.05 && KnowledgeBase.broadcasts.length > 0) {
      const bcast = KnowledgeBase.broadcasts[Math.floor(Math.random() * KnowledgeBase.broadcasts.length)];
      
      // If patient hasn't processed this exact idea meme before
      if (!this.state.memory.includes(bcast.template.id)) {
        this.state.memory.push(bcast.template.id);
        
        // Track the peer-to-peer communication topology
        if (!this.state.networkConnections!.includes(bcast.authorId) && bcast.authorId !== this.state.id) {
            this.state.networkConnections!.push(bcast.authorId);
        }
        
        const impact = bcast.template.impact;
        let success = true;
        let resTxt = impact.description;

        // Efficacy gating (Can't adopt meds you already take)
        if (impact.newMeds.length > 0) {
          const med = impact.newMeds[0];
          if (this.state.medications.includes(med)) {
            success = false;
            resTxt = `Idea rejected: Patient already adhering to ${med}.`;
          } else {
            this.state.medications.push(med);
          }
        }

        // Extremely low medical compliance agents occasionally fail to successfully adopt lifestyle habits correctly
        if (success && bcast.template.type === 'Lifestyle' && this.state.medicalCompliance === 'Low' && Math.random() < 0.3) {
          success = false;
          resTxt = `Protocol failed during execution: Patient's compliance was too low to sustain structural habit shift.`;
        }

        // SDOH Real-World Adherence Decay Pipeline
        let sdohMultiplier = 1.0;
        let sdohReason = '';
        
        if (impact.newMeds.length > 0 && this.state.wealth < 40) {
            sdohMultiplier *= 0.5; // Severe decay: patient cannot physically afford the copays, spacing out doses
            sdohReason += `[SDOH Penalty: -50% Medication Efficacy due to Low Wealth Adherence Decay] `;
        }
        if (bcast.template.type === 'Lifestyle' && this.state.foodDesert) {
            sdohMultiplier *= 0.3; // Impossible to buy high-quality organic produce natively
            sdohReason += `[SDOH Penalty: -70% Lifestyle Efficacy due to strict Food Desert Geographic Constraint] `;
        }
        if (this.state.medicalCompliance === 'Low') {
            sdohMultiplier *= 0.8; 
        }

        if (success) {
          const m = sdohMultiplier;
          this.state.baseHealth += (impact.healthDelta * m);
          this.state.stressLevel += (impact.stressDelta * ((m + 1)/2)); // Less physical stress shielding if non-adherent
          this.state.vitals.bpSystolic += (impact.bpDelta * m);
          this.state.labs.a1c += (impact.a1cDelta * m);
          this.state.labs.cvHealth += (impact.cvDelta * m);
          this.state.labs.egfr += (impact.egfrDelta * m);
          this.clampState();
          
          this.logEvent({
            tick: currentTick,
            type: 'Network Adoption',
            description: `Transferred protocol: ${bcast.template.title} from ${bcast.authorName} (${bcast.template.source}). ${sdohReason}${resTxt}`,
            impactHealth: impact.healthDelta * m,
            impactStress: impact.stressDelta * m,
          });
        }
        
        KnowledgeBase.logAdoption(this, bcast, success, resTxt, currentTick);
      }
    }
  }
}
