import type { AgentState } from './Agent';

export interface RiskPrediction {
  disease: string;
  riskPercentage: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  mitigations: string[];
}

export const PredictiveEngine = {
  /**
   * Generates a dynamic 10-Year Clinical Forecast based on immediate physiological state.
   */
  getForecast(state: AgentState): RiskPrediction[] {
    return [
      this.calculateStrokeRisk(state),
      this.calculateChfRisk(state),
      this.calculateDiabetesRisk(state),
      this.calculateCopdRisk(state),
    ];
  },

  /**
   * Approximate model mimicking AHA PREVENT (2023) ASCVD Stroke / MI equations
   */
  calculateStrokeRisk(state: AgentState): RiskPrediction {
    let base = state.age > 65 ? 12 : state.age > 50 ? 5 : state.age > 40 ? 2 : 0.5;
    
    // Multipliers
    if (state.sex === 'Male') base *= 1.15;
    if (state.vitals.bpSystolic > 140) base *= 2.5;
    else if (state.vitals.bpSystolic > 130) base *= 1.5;
    if (state.labs.ldlCholesterol > 130) base *= 1.8;
    if (state.chronicConditions.includes('Diabetes') || state.labs.a1c >= 6.5) base *= 2.5;
    if (state.smoker) base *= 2.8;
    if (state.labs.egfr < 60) base *= 1.6;

    let risk = Math.min(99.9, base);
    
    const mitigations: string[] = [];
    if (state.vitals.bpSystolic > 130) mitigations.push("Initiate strict antihypertensive therapy to drive Systolic BP < 130.");
    if (state.labs.ldlCholesterol > 130) mitigations.push("Initiate statin therapy and dietary overhaul to arrest LDL-C < 100.");
    if (state.smoker) mitigations.push("Immediate smoking cessation counseling to halve catastrophic ASCVD hazard.");
    if (state.labs.egfr < 60) mitigations.push("Institute proven renal protection (ACE inhibitor) to stabilize nephropathy.");
    if (state.labs.a1c >= 6.5) mitigations.push("Intensive glycemic management (A1C < 7.0) to stave off vascular inflammation.");
    if (mitigations.length === 0) mitigations.push("Continue excellent preventative physiological lifestyle.");

    return {
      disease: 'ASCVD (Stroke / Heart Attack)',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  /**
   * Approximate model mimicking PCP-HF Heart Failure incident predictor
   */
  calculateChfRisk(state: AgentState): RiskPrediction {
    let base = state.age > 60 ? 8 : state.age > 45 ? 3 : 0.4;

    if (state.vitals.bmi > 30) base *= 2.2;
    if (state.vitals.bpSystolic > 130) base *= 1.7;
    if (state.labs.cvHealth < 70) base *= 3.0; // LVH modifier
    if (state.chronicConditions.includes('Diabetes') || state.labs.a1c >= 6.5) base *= 1.9;
    if (state.smoker) base *= 2.0;

    let risk = Math.min(99.9, base);

    const mitigations: string[] = [];
    if (state.vitals.bmi > 30) mitigations.push("Prescribe strict weight loss regimen (Target BMI < 25) to radically unload cardiac structural strain.");
    if (state.labs.cvHealth < 70) mitigations.push("Enforce high-intensity cardiovascular exercise to induce Left Ventricular Hypertrophy (LVH) regression.");
    if (state.smoker) mitigations.push("Cease smoking to prevent oxidative damage to myocardial architecture.");
    if (state.vitals.bpSystolic > 130) mitigations.push("Normalize hemodynamic load via ACE/ARBs to arrest hypertensive hypertensive heart disease progression.");
    if (mitigations.length === 0) mitigations.push("Cardiac reserves are structurally resilient.");

    return {
      disease: 'Heart Failure (CHF)',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  /**
   * Approximate ADA Type 2 Diabetes Risk Model
   */
  calculateDiabetesRisk(state: AgentState): RiskPrediction {
    if (state.chronicConditions.includes('Diabetes') || state.labs.a1c >= 6.5) {
      return {
        disease: 'Type 2 Diabetes',
        riskPercentage: 100,
        riskLevel: 'Critical',
        mitigations: ["Disease physically active. Strict focus on reversing organ damage via intense medication compliance, low glycemic load, and weight isolation."]
      };
    }

    let base = state.age > 45 ? 10 : 2;

    if (state.familyHistory.includes('Diabetes')) base *= 3.5;
    if (state.vitals.bmi >= 30) base *= 4.0;
    else if (state.vitals.bmi >= 25) base *= 2.0;
    if (state.exerciseRoutine === 'None') base *= 1.8;
    if (state.vitals.bpSystolic > 130) base *= 1.3;

    let risk = Math.min(99.9, base);

    const mitigations: string[] = [];
    if (state.vitals.bmi >= 25) mitigations.push("Implement comprehensive dietary and weight-loss intervention to shatter insulin resistance cycles.");
    if (state.exerciseRoutine === 'None') mitigations.push("Start moderate to high cardiovascular load exercise 3x/week to sensitize glucose pathways.");
    if (state.familyHistory.includes('Diabetes')) mitigations.push("Genetic predisposition severe; patient requires extreme diligence in prophylactic BMI maintenance.");
    if (mitigations.length === 0) mitigations.push("Metabolic panel perfectly balanced. Maintain current dietary and routine load.");

    return {
      disease: 'Type 2 Diabetes',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  /**
   * COPD Risk based on deprivation scaling and smoking
   */
  calculateCopdRisk(state: AgentState): RiskPrediction {
    // COPD requires massive insult, mostly age/smoking
    let base = state.age > 50 ? 2 : 0.1;

    if (state.smoker) base *= 15.0; // The single massive COPD predictor
    if (state.foodDesert && state.wealth < 40) base *= 1.8; // Lower SES / environmental pollution exposure

    let risk = Math.min(99.9, base);

    const mitigations: string[] = [];
    if (state.smoker) mitigations.push("EMERGENCY ACTION: Permanent smoking cessation required exactly immediately to halt alveolar destruction.");
    if (state.foodDesert) mitigations.push("Consider environmental exposure interventions (air purifiers / socio-environmental relocation) to avert particulate insult.");
    if (mitigations.length === 0) mitigations.push("Pulmonary tract safely distant from classic deprivation and smoking stressors.");

    return {
      disease: 'COPD',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  getRiskLevel(risk: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
    if (risk < 7.5) return 'Low';
    if (risk < 15) return 'Moderate';
    if (risk < 30) return 'High';
    return 'Critical';
  }
};
