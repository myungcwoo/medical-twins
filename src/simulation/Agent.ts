import { ClinicalPathways } from './ClinicalPathways';
import { KnowledgeBase } from './KnowledgeNetwork';
import { PathologyEngine } from './PathologyEngine';

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
  history: AgentEvent[];
  memory: string[]; // Tracked ideas
  isDead: boolean;
  comparativeGroup?: 'Control' | 'Intervention';
  pairedTwinId?: string;
}

export class Agent {
  state: AgentState;

  constructor(initialState: Omit<AgentState, 'history' | 'isDead' | 'memory'> & { memory?: string[] }) {
    this.state = {
      ...initialState,
      isDead: false,
      history: [],
      memory: initialState.memory || [],
    };
  }

  tick(currentTick: number) {
    if (this.state.isDead) return;

    // 0. Actuarial Epidemilogical Risk Assessment (Annual Check)
    PathologyEngine.evaluateAnnualRisk(this, currentTick);

    this.processNetworkLearning(currentTick);

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
      const hasMeds = this.state.medications.includes("Metformin") || this.state.medications.includes("Insulin") || this.state.medications.includes("SGLT2_Inhibitor") || this.state.medications.includes("Empagliflozin") || this.state.medications.includes("Semaglutide");

      let multiplier = hasMeds ? 0.02 : 0.08; 
      if (this.state.dietQuality < 50) conditionPenalty += multiplier;

      this.state.labs.a1c += 0.005; 
      if (this.state.dietQuality <= 50) this.state.labs.a1c += 0.01;
      if (hasMeds && this.state.labs.a1c > 6.0) this.state.labs.a1c -= 0.02; 
    }
    
    if (this.state.chronicConditions.includes("Hypertension")) {
      const hasMeds = this.state.medications.includes("Lisinopril") || this.state.medications.includes("Amlodipine") || this.state.medications.includes("ACE_Inhibitor") || this.state.medications.includes("Metoprolol") || this.state.medications.includes("Chlorthalidone");

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

        if (success) {
          this.state.baseHealth += impact.healthDelta;
          this.state.stressLevel += impact.stressDelta;
          this.state.vitals.bpSystolic += impact.bpDelta;
          this.state.labs.a1c += impact.a1cDelta;
          this.state.labs.cvHealth += impact.cvDelta;
          this.state.labs.egfr += impact.egfrDelta;
          this.clampState();
          
          this.logEvent({
            tick: currentTick,
            type: 'Network Adoption',
            description: `Transferred protocol: ${bcast.template.title} from ${bcast.authorName} (${bcast.template.source}). ${resTxt}`,
            impactHealth: impact.healthDelta,
            impactStress: impact.stressDelta,
          });
        }
        
        KnowledgeBase.logAdoption(this, bcast, success, resTxt, currentTick);
      }
    }
  }
}
