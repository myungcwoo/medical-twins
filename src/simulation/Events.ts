import { Agent } from './Agent';
import { ClinicalPathways } from './ClinicalPathways';

export function runGlobalEvents(agent: Agent, currentTick: number) {
  if (agent.state.isDead) return;

  const r = Math.random();

  // 0. CATASTROPHIC CLINICAL SENTINEL CHECKS
  // End Stage Renal Disease Risk (Scaled down heavily from 5% to 0.5% per tick for realism)
  if (agent.state.chronicConditions.includes('ESRD') || agent.state.labs.egfr <= 15) {
    if (Math.random() < 0.005) {
      agent.state.isDead = true;
      agent.state.baseHealth = 0;
      agent.logEvent({
        tick: currentTick,
        type: 'Catastrophic Mortality (ESRD)',
        description: `Patient perished due to untreated End Stage Renal Disease. Systemic toxicity overwhelmed baseline reserves resulting in terminal cardiac arrest.`,
        impactHealth: 0,
        impactStress: 0,
        citation: "ADA Guidelines (Kidney Failure Mortality)",
        hazardRatio: 3.1
      });
      return;
    }
  }

  // HTN Triage Protocol (Evidence Engine)
  const crisisResult = ClinicalPathways.evaluateHypertensiveCrisis(agent, currentTick);
  if (crisisResult === 'HALT_SIMULATION') return;

  // 0.25 Catastrophic Cardiovascular Events (MI / Stroke)
  if (agent.state.vitals.bpSystolic > 175 || agent.state.labs.cvHealth < 25) {
      const strokeRisk = Math.max(0, (agent.state.vitals.bpSystolic - 170) * 0.0005) + Math.max(0, (25 - agent.state.labs.cvHealth) * 0.0005);
      if (Math.random() < strokeRisk) {
          agent.state.isDead = true;
          agent.state.baseHealth = 0;
          agent.logEvent({
            tick: currentTick,
            type: 'Sudden Catastrophic Mortality',
            description: `Patient perished from sudden fatal ${Math.random() > 0.5 ? 'Myocardial Infarction' : 'Ischemic Stroke'} directly linked to acute cardiovascular decompensation.`,
            impactHealth: 0,
            impactStress: 0
          });
          return;
      }
  }

  // 0.5 General Cumulative Mortality
  if (agent.state.baseHealth <= 0) {
    agent.state.isDead = true;
    agent.logEvent({
      tick: currentTick,
      type: 'Mortality',
      description: 'Systemic organ failure due to sustained exhaustion of baseline physiological reserves.',
      impactHealth: 0,
      impactStress: 0
    });
    return;
  }

  // 1. Illness Risk (Evidence-Based Hazard Ratios)
  let baseIllnessChance = 0.002; 
  // Escalating age-related immunocompromise and frailty risk
  if (agent.state.age > 65) {
      baseIllnessChance += 0.001 * Math.exp((agent.state.age - 65) * 0.08); 
  }
  let currentHR = 1.0;
  let activeCitation = "";

  if (agent.state.wealth < 40 && agent.state.foodDesert) {
    currentHR = 2.57; 
    activeCitation = "JAMA Intern Med. (SDOH All-Cause Mortality)";
  } else if (agent.state.wealth < 40) {
    currentHR = 1.71; 
  }

  if (agent.state.baseHealth < 50 || agent.state.stressLevel > 80) currentHR += 1.0; 
  if (agent.state.familyHistory.length > 0) currentHR += 0.5;
  if (agent.state.chronicConditions.includes('Cirrhosis') || agent.state.chronicConditions.includes('ESLD')) currentHR += 1.8;

  const finalIllnessChance = baseIllnessChance * currentHR;

  if (r < finalIllnessChance) {
    const poorAccess = agent.state.accessToCare < 40;
    const severityMulti = poorAccess ? 1.5 : 1.0;
    
    let reason = "Recorded clinical deterioration.";
    if (activeCitation) reason += " Multiplied severely by socio-environmental risk models.";

    agent.state.vitals.heartRate += 10;
    agent.state.vitals.bpSystolic += 5;

    agent.logEvent({
      tick: currentTick,
      type: 'Clinical Deterioration',
      description: reason,
      impactHealth: -1.5 * severityMulti * (currentHR / 1.5), // Reduced impact to prevent rapid spiraling
      impactStress: +5,
      citation: activeCitation || undefined,
      hazardRatio: currentHR > 1.0 ? currentHR : undefined
    });
  }

  // 2. Medication Non-Adherence
  if (agent.state.medications.length > 0 && Math.random() < 0.01) { // Reduced occurrence frequency
    if (agent.state.wealth < 40 || agent.state.accessToCare < 40) {
      
      const adherenceHR = 1.57;
      let reboundFx = "";

      if (agent.state.medications.includes("Lisinopril") || agent.state.medications.includes("Amlodipine")) {
        agent.state.vitals.bpSystolic += 10; 
        reboundFx += " Resulted in hypertensive rebound.";
      }
      if (agent.state.medications.includes("Insulin") || agent.state.medications.includes("Metformin")) {
        agent.state.labs.a1c += 0.2; 
        reboundFx += " Resulted in A1C glucose destabilization.";
      }

      agent.logEvent({
        tick: currentTick,
        type: 'Medication Missed',
        description: `Missed doses of ${agent.state.medications.join(', ')} due to affordability barriers.${reboundFx}`,
        impactHealth: -1 * adherenceHR, 
        impactStress: +3,
        citation: "AHA Journals (Non-adherence CVD Risk)",
        hazardRatio: adherenceHR
      });
    }
  }

  // 3. Routine Screenings & Surveillance
  let screeningChance = 0.002;
  if (agent.state.medicalCompliance === 'High') screeningChance += 0.01;

  if (Math.random() < screeningChance && agent.state.accessToCare > 40) {
    if (Math.random() > 0.5) {
      agent.logEvent({
        tick: currentTick,
        type: 'Routine Screening',
        description: 'Attended a scheduled preventative screening. Results came back "All Clear".',
        impactHealth: 0,
        impactStress: -5,
        citation: "CDC Guidelines"
      });
    } else {
      agent.state.vitals.bpSystolic -= 5;
      agent.state.labs.ldlCholesterol -= 10;
      if (agent.state.labs.a1c > 6.0) agent.state.labs.a1c -= 0.1;
      
      agent.logEvent({
        tick: currentTick,
        type: 'Early Detection',
        description: 'Routine screening detected asymptomatic abnormality. Medical advice successfully managed lab trajectories.',
        impactHealth: +3,
        impactStress: +2,
        citation: "CDC Interventions"
      });
    }
  }

  // 4. Lifestyle Interventions
  if (agent.state.exerciseRoutine === 'None' && Math.random() < 0.01) {
    if (agent.state.stressLevel < 50 && agent.state.vitals.bmi >= 25) {
      agent.state.exerciseRoutine = 'Moderate';
      agent.logEvent({
        tick: currentTick,
        type: 'Lifestyle Change',
        description: 'Patient successfully initiated moderate exercise/diet correction to combat BMI.',
        impactHealth: +2,
        impactStress: -3
      });
    }
  }
}
