import type { Agent } from './Agent';

/**
 * The Evidence Engine
 * Instead of hardcoding physics directly into the main loop, real-world
 * guidelines and probabilities are housed here. This allows the ABM
 * to easily branch into off-label usages, reversals, and rare outcomes
 * based on medical literature cases.
 */
export const ClinicalPathways = {

  /**
   * Evaluates if a patient in crisis can be salvaged without an ICU admission.
   * Modifies the agent state directly and logs the events.
   * Returns 'HALT_SIMULATION' if the agent is admitted to the ICU or dies.
   */
  evaluateHypertensiveCrisis: (agent: Agent, currentTick: number): 'HALT_SIMULATION' | 'CONTINUE' => {
    // 1. Not in crisis
    if (agent.state.vitals.bpSystolic < 180 && agent.state.vitals.bpDiastolic < 120) {
      return 'CONTINUE';
    }

    const hasTargetOrganDamage = agent.state.labs.egfr < 60 || agent.state.labs.cvHealth < 50;

    // 2. EMERGENCY (Organ damage is active)
    if (hasTargetOrganDamage) {
      
      // OFF-LABEL SALVAGE ATTEMPT
      // Medical leeway: Not everyone goes to the ICU. ED can attempt intensive oral/IV off-label regimens.
      // 30% of critical patients get an off-label attempt
      if (Math.random() < 0.30) {
        
        // 60% chance the aggressive salvage works, averting the ICU.
        if (Math.random() < 0.60) {
          agent.state.vitals.bpSystolic -= 35; // Massively reduced
          agent.logEvent({
            tick: currentTick,
            type: 'ED Salvage Therapy (Success)',
            description: `Patient presented with a Hypertensive Emergency (Organ damage confirmed, eGFR < 60). ED physicians rapidly employed an aggressive off-label pharmacological regimen. The crisis was averted and ICU admission was successfully bypassed.`,
            impactHealth: -5, // Moderate strain
            impactStress: +20,
            citation: 'AHA Guidelines / FDA Off-Label Usage (ED Antihypertensive Salvage)',
            hazardRatio: undefined
          });
          return 'CONTINUE'; 
        } else {
          // 40% chance it fails, triggering a 44% higher risk adverse reaction.
          agent.state.baseHealth -= 15; // Adverse reaction penalty
          agent.logEvent({
            tick: currentTick,
            type: 'ED Salvage Therapy (Adverse Failure)',
            description: `Aggressive off-label therapy attempted in the ED to avert ICU admission failed. Patient suffered an acute adverse drug reaction, drastically dropping baseline health before ICU transfer.`,
            impactHealth: -15,
            impactStress: +10,
            citation: 'FDA Off-Label Stat Data (44% Higher Adverse Event Risk)'
          });
          // Falls through to standard ICU admission
        }
      }

      // STANDARD ICU ADMISSION
      let mortalityRisk = 0.099; // 9.9% base in-hospital mortality
      if (agent.state.age > 65) mortalityRisk *= 1.5;
      if (agent.state.baseHealth < 30) mortalityRisk *= 2.0;

      if (Math.random() < mortalityRisk) {
        agent.state.isDead = true;
        const previousSBP = agent.state.vitals.bpSystolic;
        const previousDBP = agent.state.vitals.bpDiastolic;
        agent.state.baseHealth = 0; 
        agent.logEvent({
          tick: currentTick,
          type: 'Catastrophic Mortality',
          description: `Patient suffered a fatal cardiovascular event in the ED due to severe Hypertensive Emergency (BP ${Math.round(previousSBP)}/${Math.round(previousDBP)}). Resuscitation efforts failed.`,
          impactHealth: 0,
          impactStress: 0,
          citation: "AHA Journals (Hypertensive Emergency Mortality Rates: In-hospital 9.9%)",
          hazardRatio: 1.46
        });
        return 'HALT_SIMULATION';
      } else {
        // Survived but Inpatient/ICU Hospitalized
        const previousSBP = agent.state.vitals.bpSystolic;
        const previousDBP = agent.state.vitals.bpDiastolic;
        agent.state.vitals.bpSystolic = 140; // intensive IV treatment
        agent.state.vitals.bpDiastolic = 90;
        
        agent.logEvent({
          tick: currentTick,
          type: 'Inpatient ICU Hospitalization',
          description: `Hypertensive Emergency triage (BP ${Math.round(previousSBP)}/${Math.round(previousDBP)}). Patient immediately admitted to ICU for parenteral medicine drips. Systemic strain sustained.`,
          impactHealth: -25, 
          impactStress: +30,
          citation: "AHA Guidelines (Hypertensive Emergency -> Mandatory Inpatient Admit)"
        });
        return 'HALT_SIMULATION';
      }

    } else {
      // 3. URGENCY (Vitals High, Organs Stable -> Discharge Outpatient)
      agent.state.vitals.bpSystolic -= 20; // Stabilized orally safely in ED
      agent.state.vitals.bpDiastolic -= 10;
      
      agent.logEvent({
        tick: currentTick,
        type: 'Emergency Dept (Hypertensive Urgency)',
        description: `Patient brought to ED with severe hypertension (BP > 180). Triage confirmed NO acute target organ damage. Treated orally and safely discharged against ICU admit.`,
        impactHealth: -5,
        impactStress: +15,
        citation: "AHA Guidelines (Hypertensive Urgency Triage & Safe Discharge)"
      });
      return 'CONTINUE';
    }
  },

  /**
   * Based on the AASK Trials, if a patient can mathematically sustain
   * their BP < 130 and A1C < 7.0 over significant periods of time, 
   * long-term organ damage (LVH, Nephropathy) is proven to be REVERSIBLE.
   */
  evaluateOrganRecovery: (agent: Agent) => {
    // A patient actively reversing their damage
    if (agent.state.vitals.bpSystolic <= 130 && agent.state.labs.a1c <= 7.0) {
      // Rebuild the nephrons (eGFR recovery)
      if (agent.state.labs.egfr < 90 && agent.state.labs.egfr > 15) {
        // AASK Trial Reversal Probability Mechanics
        // 50% chance each week to slowly regenerate 0.1 eGFR points
        if (Math.random() < 0.5) agent.state.labs.egfr += 0.1;
      }
      
      // Left Ventricular Hypertrophy (LVH) Regression
      if (agent.state.labs.cvHealth < 95) {
        if (Math.random() < 0.6) agent.state.labs.cvHealth += 0.2;
      }
    }

    // Condition Remission Dynamics
    const currentTick = agent.state.history.length > 0 ? agent.state.history[agent.state.history.length - 1].tick + 1 : 0;
    
    // Reverse Obesity
    if (agent.state.chronicConditions.includes('Obesity') && agent.state.vitals.bmi < 24.9) {
        agent.state.chronicConditions = agent.state.chronicConditions.filter(c => c !== 'Obesity');
        agent.logEvent({ tick: currentTick, type: 'Condition Remitted', description: 'Patient successfully dropped BMI below clinical obesity threshold. Diagnosis formally reversed.', impactHealth: 10, impactStress: -10 });
    }

    // Reverse Hypertension 
    if (agent.state.chronicConditions.includes('Hypertension') && agent.state.vitals.bpSystolic <= 115) {
        // 5% chance per evaluation cycle to definitively declare remission if maintained pristine
        if (Math.random() < 0.05) {
            agent.state.chronicConditions = agent.state.chronicConditions.filter(c => c !== 'Hypertension');
            agent.logEvent({ tick: currentTick, type: 'Condition Remitted', description: 'Unprecedented vascular remodeling. Blood pressure completely normalized organically. Hypertension formally reversed.', impactHealth: 10, impactStress: -10 });
        }
    }

    // Reverse Diabetes
    if (agent.state.chronicConditions.includes('Diabetes') && agent.state.labs.a1c <= 5.8 && !agent.state.medications.includes("Insulin")) {
        if (Math.random() < 0.02) {
            agent.state.chronicConditions = agent.state.chronicConditions.filter(c => c !== 'Diabetes');
            agent.logEvent({ tick: currentTick, type: 'Condition Remitted', description: 'Metabolic homeostasis achieved. A1c stably maintained in normal parameters. Type-II Diabetes officially mapped as in remission.', impactHealth: 12, impactStress: -15 });
        }
    }
  }

};
