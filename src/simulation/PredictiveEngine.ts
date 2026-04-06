import type {  AgentState  } from '../types/Simulation.types';

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
      this.calculateRenalFailureRisk(state),
      this.calculateDiabetesRisk(state),
      this.calculateCopdRisk(state),
    ];
  },

  /**
   * AHA PREVENT (2023) ASCVD Stroke / MI Equations
   * ----------------------------------------------
   * Calculates annualized likelihood of massive atherosclerotic ruptures.
   * Leverages Coronary Artery Calcium (CAC) imaging as the apex multiplier (e.g., "The Power of Zero").
   */
  calculateStrokeRisk(state: AgentState): RiskPrediction {
    let base = state.age > 65 ? 12 : state.age > 50 ? 5 : state.age > 40 ? 2 : 0.5;
    
    // Core Risk Multipliers
    if (state.sex === 'Male') base *= 1.15;
    if (state.vitals.bpSystolic > 140) base *= 2.5;
    if (state.labs.ldlCholesterol > 130) base *= 1.8;
    if (state.chronicConditions.includes('Diabetes') || state.labs.a1c >= 6.5) base *= 2.5;
    if (state.smoker) base *= 2.8;

    // Advanced Diagnostics (Imaging & Biomarkers)
    if (state.imaging.cacScore === 0) {
        base *= 0.3; // Massively protective. The "Power of Zero"
    } else if (state.imaging.cacScore > 100) {
        base *= 3.5; // High plaque burden
    } else if (state.imaging.cacScore > 400) {
        base *= 6.0; // Severe, imminent rupture risk
    }

    if (state.labs.hsCRP > 3.0) base *= 1.4; // High systemic inflammation vascular risk
    
    const risk = Math.min(99.9, base);
    
    const mitigations: string[] = [];
    if (state.imaging.cacScore > 100) mitigations.push(`CRITICAL: CAC Score of ${state.imaging.cacScore} discovered. Initiate immediate high-intensity Statin regardless of baseline LDL.`);
    if (state.labs.hsCRP > 3.0) mitigations.push("Elevated hs-CRP detected. Systemic vascular inflammation active; implement aggressive dietary intervention.");
    if (state.vitals.bpSystolic > 130) mitigations.push("Initiate strict antihypertensive therapy to drive Systolic BP < 130.");
    if (state.smoker) mitigations.push("Immediate smoking cessation counseling to halve catastrophic ASCVD hazard.");
    if (mitigations.length === 0) mitigations.push("Atherosclerotic profile highly stable. Plaque burden controlled.");

    return {
      disease: 'ASCVD (Stroke / Heart Attack)',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  /**
   * Advanced Heart Failure (CHF) Predictor
   * --------------------------------------
   * Differentiates between HFrEF (Ejection Fraction < 40) vs HFpEF (Preserved EF but high NT-proBNP).
   * Models myocardial stretch explicitly via NT-proBNP biomarker assays.
   */
  calculateChfRisk(state: AgentState): RiskPrediction {
    let base = state.age > 60 ? 4 : state.age > 45 ? 1 : 0.2;

    if (state.vitals.bmi > 30) base *= 2.0;
    if (state.vitals.bpSystolic > 140) base *= 2.5;

    // Structural Imaging & Advanced Labs logic
    let type = "Imminent Structural Risk";
    if (state.imaging.lvef < 40) {
        base *= 5.0; // HFrEF active
        type = "HFrEF (Reduced Ejection Fraction)";
    } else if (state.imaging.lvef < 50) {
        base *= 2.5; // HFmrEF
    } else if (state.labs.ntProBNP > 400 && state.imaging.lvef >= 50) {
        base *= 3.0; // HFpEF (Preserved EF but massive decompensation biomarker)
        type = "HFpEF (Preserved Ejection Fraction w/ High filling pressures)";
    }

    if (state.labs.ntProBNP > 1000) base *= 4.0; // Massive acute stretch severity
    if (state.labs.ntProBNP < 100) base *= 0.4; // Strong rule-out bounds

    const risk = Math.min(99.9, base);

    const mitigations: string[] = [];
    if (state.imaging.lvef < 40) mitigations.push(`CRITICAL: LVEF of ${state.imaging.lvef}% dictates initiation of ARNI (Entresto), Beta Blockers, and Spironolactone immediately (GDMT).`);
    if (state.labs.ntProBNP > 400) mitigations.push(`NT-proBNP elevated at ${state.labs.ntProBNP} pg/mL indicating active volume overload. Titrate loop diuretics to dry weight.`);
    if (state.vitals.bpSystolic > 130) mitigations.push("Normalize hemodynamic load entirely via ACE/ARBs to arrest hypertensive myocardial damage.");
    if (mitigations.length === 0) mitigations.push("Myocardial structures functionally capable. Filling pressures are nominally balanced.");

    return {
      disease: state.imaging.lvef < 50 || state.labs.ntProBNP > 400 ? `Heart Failure (${type})` : 'Heart Failure (CHF)',
      riskPercentage: risk,
      riskLevel: this.getRiskLevel(risk),
      mitigations
    };
  },

  /**
   * Chronic Kidney Disease progression model mapping UACR and eGFR decline trajectories
   */
  calculateRenalFailureRisk(state: AgentState): RiskPrediction {
    let base = 0.5;
    
    if (state.labs.egfr < 60) base += 10;
    if (state.labs.egfr < 30) base += 40; // G4 stage
    if (state.labs.egfr < 15) base += 85; // G5 Terminal ESRD
    
    // Explicit Nephropathy damage vector
    if (state.labs.uacr > 300) {
        base *= 3.5; // Macroalbuminuria - glomeruli are structurally dead
    } else if (state.labs.uacr > 30) {
        base *= 2.0; // Microalbuminuria - warning zone
    }

    if (state.chronicConditions.includes('Diabetes') && state.labs.a1c > 8.0) base *= 2.0;
    if (state.vitals.bpSystolic > 140) base *= 1.8;

    const risk = Math.min(99.9, base);
    const mitigations: string[] = [];
    
    if (state.labs.uacr > 30) mitigations.push(`UACR of ${state.labs.uacr} mg/g confirms active protein spillage. Initiate ACE inhibitors or SGLT2 inhibitors sequentially to explicitly relieve intraglomerular pressure.`);
    if (state.labs.egfr < 60) mitigations.push(`Avoid all NSAIDs and explicit nephrotoxins to preserve remaining eGFR bandwidth (${Math.round(state.labs.egfr)}).`);
    if (state.labs.egfr < 15) mitigations.push("EMERGENCY ACTION: Prepare for emergent hemodialysis access placement (Fistula).");
    if (mitigations.length === 0) mitigations.push("Glomerular filtration architecture structurally perfect. No active macro/micro protein bridging detected.");

    return {
      disease: 'End-Stage Renal Disease (ESRD Progression)',
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

    const risk = Math.min(99.9, base);

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

    const risk = Math.min(99.9, base);

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
