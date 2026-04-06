import { Agent } from './Agent';
import { TrainingEngine } from './TrainingEngine';
import { InferenceEngine } from './InferenceEngine';

export class PathologyEngine {
  /**
   * Evaluates clinical disease acquisition probabilities strictly once per year (52 ticks).
   * Maps empirical CDC/AHA Relative Risk (RR) and baseline incidence formulas against the Twin's current biometric profile.
   */
  /**
   * Evaluates the compounding multiorgan damage cycle on each tick.
   */
  public static evaluateMultifactorialDamage(agent: Agent) {
    const { state } = agent;

    if (state.labs.a1c > 7.0) state.labs.egfr -= 0.02 * (state.labs.a1c - 7.0); 
    if (state.vitals.bpSystolic > 140) state.labs.egfr -= 0.02;
    
    if (state.labs.egfr < 60) {
      state.vitals.bpSystolic += 0.1; 
      state.labs.cvHealth -= 0.02; 
    }

    if (state.labs.ldlCholesterol > 130 || state.vitals.bpSystolic > 140) {
      state.labs.cvHealth -= 0.05;
    }
  }

  /**
   * Evaluates clinical disease acquisition probabilities strictly once per year (52 ticks).
   * Maps empirical CDC/AHA Relative Risk (RR) and baseline incidence formulas against the Twin's current biometric profile.
   */
  public static evaluateAnnualRisk(agent: Agent, currentTick: number) {
    if (currentTick % 52 !== 0 && currentTick !== 1) return; // Process annually

    const { state } = agent;
    
    // Non-linear comorbidity compounding: Each existing chronic condition amplifies all new baseline acquisition risks by +15% exponentially.
    const comorbidityMultiplier = Math.pow(1.15, state.chronicConditions.length);
    
    // PubMed Empirical Hazard Ratios (HR) Modifiers
    const hasSGLT2 = state.medications.includes('SGLT2_Inhibitor');
    const hasGLP1 = state.medications.includes('GLP1_Agonist');
    
    // Evaluate Adverse Effects FIRST (If severe side effect triggers, patient immediately drops drug via non-compliance)
    if (hasSGLT2 && Math.random() < 0.005) { // 0.5% Annual DKA / Urogenital Infection Risk (EMPA-REG)
        agent.logEvent({ tick: currentTick, type: 'Adverse Drug Event', description: 'Suffered Life-Threatening Euglycemic Diabetic Ketoacidosis from SGLT2 Inhibitor. Stopping medication immediately.', impactHealth: -25, impactStress: 40 });
        state.medications = state.medications.filter(m => m !== 'SGLT2_Inhibitor');
        state.medicalCompliance = 'Low';
    }
    if (hasGLP1 && Math.random() < 0.006) { // 0.6% Severe Gastroparesis / Ileus Risk
        agent.logEvent({ tick: currentTick, type: 'Adverse Drug Event', description: 'Developed severe Gastroparesis (Gastric Paralysis) secondary to GLP-1 Agonists. Abandoning protocol.', impactHealth: -15, impactStress: 30 });
        state.medications = state.medications.filter(m => m !== 'GLP1_Agonist');
        state.medicalCompliance = 'Low';
    }

    // Socioeconomic Determinants of Health (SDOH) Non-Adherence
    // High-cost drugs fail aggressively in low-wealth or food-desert environments
    if ((hasSGLT2 || hasGLP1) && (state.wealth < 40 || state.foodDesert)) {
        if (Math.random() < 0.80) { // 80% discontinuation rate for low wealth
            agent.logEvent({ tick: currentTick, type: 'Protocol Abandoned', description: 'Agent discontinued GLP-1 / SGLT2 interventions due to prohibitive copay costs and socioeconomic non-adherence.', impactHealth: -2, impactStress: 15 });
            state.medications = state.medications.filter(m => m !== 'SGLT2_Inhibitor' && m !== 'GLP1_Agonist');
            state.medicalCompliance = 'Low';
        }
    }

    const getCompoundRisk = (condition: string, defaultVal: number) => {
        return TrainingEngine.getEmpiricalWeight(condition, defaultVal) * comorbidityMultiplier;
    };
    
    // 1. Diabetes -> Chronic Kidney Disease (CKD)
    // Baseline CKD incidence for diabetics: ~2.0% annually.
    // RR ~3.0. Modifiers: A1c > 8.0 (x2.0), BP > 140 (x1.5).
    if (state.chronicConditions.includes('Diabetes') && !state.chronicConditions.includes('CKD')) {
      let risk = getCompoundRisk('CKD', 0.02);
      if (state.labs.a1c > 8.0) risk *= 2.0;
      if (state.vitals.bpSystolic > 140) risk *= 1.5;
      if (state.age > 60) risk *= 1.2;
      
      // EMPA-KIDNEY Trial HR
      if (hasSGLT2) risk *= 0.63; 

      if (Math.random() < risk) {
        state.chronicConditions.push('CKD');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Diagnosed with Chronic Kidney Disease secondary to progressive diabetic nephropathy.',
          impactHealth: -5,
          impactStress: 10
        });
      }
    }

    // 2. Hypertension -> Congestive Heart Failure (CHF)
    // Base incidence ~1.5% annually. RR ~1.71. +28% risk per 20mmHg over 120.
    const mlActive = InferenceEngine.isOnline();
    
    if (!mlActive && state.chronicConditions.includes('Hypertension') && !state.chronicConditions.includes('CHF')) {
      let risk = getCompoundRisk('CHF', 0.015);
      const excessBP = Math.max(0, state.vitals.bpSystolic - 120);
      const bpMultiplier = 1 + (Math.floor(excessBP / 20) * 0.28);
      risk *= bpMultiplier;

      if (state.age > 65) risk *= 1.5;
      if (state.vitals.bmi > 30) risk *= 1.5;
      
      // DAPA-HF / EMPA-REG Trial HR
      if (hasSGLT2) risk *= 0.65;

      if (Math.random() < risk) {
        state.chronicConditions.push('CHF');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Diagnosed with Congestive Heart Failure secondary to prolonged hypertensive ventricular strain.',
          impactHealth: -10,
          impactStress: 15
        });
      }
    }

    // 3. Smoking/Asthma -> COPD
    // Base incidence ~2.0% annually per CDC data for current smokers. 
    if (!mlActive && (state.smoker || state.chronicConditions.includes('Asthma')) && !state.chronicConditions.includes('COPD')) {
      let risk = getCompoundRisk('COPD', 0.02);
      if (state.age > 50) risk *= 1.5;
      if (state.smoker && state.chronicConditions.includes('Asthma')) risk *= 3.0; // Synergistic destruction

      if (Math.random() < risk) {
        state.chronicConditions.push('COPD');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Diagnosed with COPD strictly linked to chronic tobacco exposure and alveolar destruction.',
          impactHealth: -8,
          impactStress: 10
        });
      }
    }

    // 4. Obesity -> Hypertension
    // For every 5 kg/m² increase in BMI over 25, Risk spikes 49%
    if (state.vitals.bmi > 25 && !state.chronicConditions.includes('Hypertension')) {
      let risk = getCompoundRisk('Hypertension', 0.01);
      const excessBMI = state.vitals.bmi - 25;
      const bmiMultiplier = 1 + (Math.floor(excessBMI / 5) * 0.49);
      risk *= bmiMultiplier;

      // SELECT Trial Secondary Prevention
      if (hasGLP1) risk *= 0.80;

      if (Math.random() < risk) {
        state.chronicConditions.push('Hypertension');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Developed primary Hypertension directly correlated with progressive obesity and vascular load.',
          impactHealth: -3,
          impactStress: 5
        });
      }
    }
    
    // 5. Hepatitis -> Cirrhosis
    // ~2% Annual conversion rate for unmonitored viral hepatitis
    if (state.chronicConditions.includes('Hepatitis') && !state.chronicConditions.includes('Cirrhosis')) {
      let risk = getCompoundRisk('Cirrhosis', 0.02); 
      if (state.medicalCompliance === 'Low') risk *= 2.0;
      
      if (Math.random() < risk) {
        state.chronicConditions.push('Cirrhosis');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Hepatic progression: Hepatitis has advanced to permanent Cirrhosis.',
          impactHealth: -15,
          impactStress: 20
        });
      }
    }

    // 6. High Cholesterol -> Coronary Artery Disease (CAD)
    if (state.chronicConditions.includes('High Cholesterol') && !state.chronicConditions.includes('CAD')) {
      let risk = getCompoundRisk('CAD', 0.02);
      if (state.vitals.bmi > 30) risk *= 1.5;
      
      // SELECT Trial Primary Cardiovascular Prevention
      if (hasGLP1) risk *= 0.80;
      
      if (Math.random() < risk) {
        state.chronicConditions.push('CAD');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Hyperlipidemia has caused severe arterial plaque modeling resulting in Coronary Artery Disease (CAD).',
          impactHealth: -8,
          impactStress: 10
        });
      }
    }
    
    // 6.5 CAD -> Myocardial Infarction (Heart Attack)
    if (state.chronicConditions.includes('CAD') && !state.history.some(h => h.type === 'Myocardial Infarction')) {
      let risk = getCompoundRisk('MI', 0.03); // High baseline risk for established CAD
      if (state.vitals.bpSystolic > 150) risk *= 2.0;
      if (state.smoker) risk *= 1.8;
      
      if (Math.random() < risk) {
        state.chronicConditions.push('Post-MI Syndrome');
        agent.logEvent({
          tick: currentTick,
          type: 'Myocardial Infarction',
          description: 'Sustained a major Myocardial Infarction due to occlusive CAD, causing irreversible myocardial scarring.',
          impactHealth: -25,
          impactStress: 40
        });
        
        // Immediate cascaded consequence
        if (!state.chronicConditions.includes('CHF')) {
            state.chronicConditions.push('CHF');
            agent.logEvent({
              tick: currentTick,
              type: 'Pathology Acquired',
              description: 'Ischemic damage precipitated rapid-onset Congestive Heart Failure.',
              impactHealth: -10,
              impactStress: 20
            });
        }
      }
    }

    // 6.6 CKD -> End Stage Renal Disease (ESRD)
    if (state.chronicConditions.includes('CKD') && state.labs.egfr < 30) {
      if (Math.random() < getCompoundRisk('ESRD', 0.05)) {
        state.chronicConditions.push('ESRD');
        agent.logEvent({
          tick: currentTick,
          type: 'Pathology Acquired',
          description: 'Chronic Kidney Disease progressed to critical End Stage Renal Disease. Dialysis baseline required.',
          impactHealth: -20,
          impactStress: 35
        });
      }
    }

    // 7. General Psychiatric Profiles (Depression, Anxiety)
    if (!state.chronicConditions.includes('Depression') && Math.random() < getCompoundRisk('Depression', 0.06)) {
        state.chronicConditions.push('Depression');
        agent.logEvent({ tick: currentTick, type: 'Pathology Acquired', description: 'Diagnosed with Clinical Depression. Medical compliance trending severely downward.', impactHealth: -2, impactStress: 25 });
        if (Math.random() > 0.5) state.medicalCompliance = 'Low';
    }
    
    if (!state.chronicConditions.includes('Anxiety') && Math.random() < getCompoundRisk('Anxiety', 0.05)) {
        state.chronicConditions.push('Anxiety');
        agent.logEvent({ tick: currentTick, type: 'Pathology Acquired', description: 'Diagnosed with Generalized Anxiety Disorder.', impactHealth: -1, impactStress: 20 });
    }

    // 8. Severe Psychiatric & Cognitive Decline (Schizophrenia, Bipolar, Dementia)
    if (!state.chronicConditions.includes('Schizophrenia') && state.age < 35 && Math.random() < getCompoundRisk('Schizophrenia', 0.003)) {
        state.chronicConditions.push('Schizophrenia');
        state.medicalCompliance = 'Low'; // Hard override
        agent.logEvent({ tick: currentTick, type: 'Pathology Acquired', description: 'Diagnosed with Schizophrenia. Severe cognitive load completely overriding standard medical compliance.', impactHealth: -5, impactStress: 40 });
    }

    // Bipolar dynamic compliance shifting
    if (state.chronicConditions.includes('Bipolar Disorder')) {
        const phases = ['High', 'Low'] as const;
        state.medicalCompliance = phases[Math.floor(Math.random() * phases.length)];
    } else if (state.age < 30 && Math.random() < getCompoundRisk('Bipolar Disorder', 0.005)) {
        state.chronicConditions.push('Bipolar Disorder');
        agent.logEvent({ tick: currentTick, type: 'Pathology Acquired', description: 'Diagnosed with Bipolar Disorder. Inducing extreme cyclical erraticism in preventative care compliance.', impactHealth: -2, impactStress: 30 });
    }

    // Late-stage Dementia
    if (!state.chronicConditions.includes('Dementia') && state.age > 65) {
        let risk = getCompoundRisk('Dementia', 0.01);
        if (state.age > 80) risk *= 4.0;
        
        if (Math.random() < risk) {
            state.chronicConditions.push('Dementia');
            state.medicalCompliance = 'Low'; // Hard override
            agent.logEvent({ tick: currentTick, type: 'Pathology Acquired', description: 'Progressive Dementia onset natively overriding autonomous capabilities. Prevents isolated medical compliance.', impactHealth: -10, impactStress: 15 });
        }
    }

  }
}
