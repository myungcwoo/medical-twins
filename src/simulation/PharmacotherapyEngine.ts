import type { Agent } from './Agent';

export class PharmacotherapyEngine {
  public static evaluateAutonomousPharmacotherapy(agent: Agent, currentTick: number) {
      if (agent.state.medicalCompliance === 'Low' || currentTick % 52 !== 0) return;

      // 1. HYPERTENSION (JAMA / ACC Guidelines)
      if (agent.state.vitals.bpSystolic > 140 || agent.state.chronicConditions.includes('Hypertension')) {
          const hasACE = agent.state.medications.includes('Lisinopril') || agent.state.medications.includes('ACE_Inhibitor');
          const hasCCB = agent.state.medications.includes('Amlodipine');
          const hasBB = agent.state.medications.includes('Metoprolol') || agent.state.medications.includes('Beta_Blocker');
          const hasDiuretic = agent.state.medications.includes('Chlorthalidone');

          // Renoprotective requirement
          if ((agent.state.chronicConditions.includes('Diabetes') || agent.state.labs.egfr < 60) && !hasACE) {
              agent.state.medications.push('Lisinopril');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Lisinopril (ACE-I) over standard CCBs strictly due to critical renoprotective indications secondary to compromised eGFR/Diabetes arrays.', impactHealth: 3, impactStress: -2 });
          } 
          // Cardioprotective requirement 
          else if ((agent.state.chronicConditions.includes('CHF') || agent.state.chronicConditions.includes('CAD')) && !hasBB) {
              agent.state.medications.push('Metoprolol');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Metoprolol (Beta-Blocker) explicitly lowering myocardial oxygen demand for acquired Heart Failure trajectory.', impactHealth: 4, impactStress: -2 });
          }
          // Uncomplicated Essential HTN -> CCB
          else if (agent.state.vitals.bpSystolic > 150 && !hasCCB && !hasDiuretic && !hasACE) {
              agent.state.medications.push('Amlodipine');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Amlodipine (CCB) natively managing rising uncomplicated essential hypertension.', impactHealth: 2, impactStress: 0 });
          }
      }

      // 2. DIABETES & METABOLIC (ADA Guidelines)
      if (agent.state.labs.a1c > 6.5 || agent.state.chronicConditions.includes('Diabetes')) {
          const hasMetformin = agent.state.medications.includes('Metformin');
          const hasSGLT2 = agent.state.medications.includes('SGLT2_Inhibitor') || agent.state.medications.includes('Empagliflozin');
          const hasGLP1 = agent.state.medications.includes('GLP1_Agonist') || agent.state.medications.includes('Semaglutide');
          const hasInsulin = agent.state.medications.includes('Insulin');

          if (!hasMetformin) {
              agent.state.medications.push('Metformin');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Initiating algorithmic definitive first-line therapy (Metformin) for baseline Type-II Diabetes.', impactHealth: 3, impactStress: 1 });
          }
          // EMPA-REG / DAPA-HF
          else if ((agent.state.chronicConditions.includes('CHF') || agent.state.labs.egfr < 60) && !hasSGLT2 && agent.state.labs.egfr > 30) {
              agent.state.medications.push('Empagliflozin');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Empagliflozin (SGLT2) acting on strict DAPA-HF outcome mandates averting immediate cardiovascular collapse.', impactHealth: 6, impactStress: -1 });
          }
          // STEP Trials
          else if (agent.state.vitals.bmi > 30 && agent.state.labs.a1c > 7.5 && !hasGLP1) {
              agent.state.medications.push('Semaglutide');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Semaglutide (GLP-1) forcing intensive dual-therapy explicitly to neutralize uncontrolled obesity-driven metabolic collapse.', impactHealth: 5, impactStress: 0 });
          }
          // Pancreatic Burnout
          else if (agent.state.labs.a1c > 9.5 && !hasInsulin) {
              agent.state.medications.push('Insulin');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Basal Insulin. Oral therapy failure threshold breached indicating terminal pancreatic beta-cell depletion.', impactHealth: 4, impactStress: 8 });
          }
      }

      // 3. HYPERLIPIDEMIA (AHA/ACC)
      if (agent.state.labs.ldlCholesterol > 130) {
          const hasModStatin = agent.state.medications.includes('Atorvastatin');
          const hasHighStatin = agent.state.medications.includes('Rosuvastatin');

          if ((agent.state.chronicConditions.includes('CAD') || agent.state.chronicConditions.includes('Diabetes')) && !hasHighStatin && agent.state.labs.ldlCholesterol > 70) {
              if (hasModStatin) agent.state.medications = agent.state.medications.filter((m: string) => m !== 'Atorvastatin'); 
              agent.state.medications.push('Rosuvastatin');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Enforced Rosuvastatin (High-Intensity) upgrading lipid control dynamically due to highly dangerous ASCVD secondary prevention risk profiles.', impactHealth: 4, impactStress: 0 });
          } 
          else if (agent.state.labs.ldlCholesterol > 160 && !hasModStatin && !hasHighStatin) {
              agent.state.medications.push('Atorvastatin');
              agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Atorvastatin (Moderate) managing primary prevention hyperlipidemia constraints.', impactHealth: 2, impactStress: 0 });
          }
      }

      // 4. PSYCHIATRIC CARE (APA Guidelines)
      if (agent.state.chronicConditions.includes('Schizophrenia') && !agent.state.medications.includes('Olanzapine')) {
          agent.state.medications.push('Olanzapine');
          agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Olanzapine (Atypical Antipsychotic). Stabilizes severe psychosis but generates immediate massive iatrogenic metabolic risk vectors.', impactHealth: 3, impactStress: -10 });
      }
      if (agent.state.chronicConditions.includes('Bipolar Disorder') && !agent.state.medications.includes('Lithium')) {
          agent.state.medications.push('Lithium');
          agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Lithium stabilizing bipolar variance, acknowledging guaranteed long-term nephrotoxic decay.', impactHealth: 4, impactStress: -8 });
      }
      if ((agent.state.chronicConditions.includes('Depression') || agent.state.chronicConditions.includes('Anxiety')) && !agent.state.medications.includes('Sertraline')) {
          agent.state.medications.push('Sertraline');
          agent.logEvent({ tick: currentTick, type: 'Physician Intervention', description: 'CDSS Core: Prescribed Sertraline (SSRI) neutralizing baseline clinical anxiety constraints autonomously.', impactHealth: 2, impactStress: -15 });
      }

      // 5. POLYPHARMACY TOXICITY (Beer's Criteria / Renal Clearance Constraints)
      if (agent.state.medications.length >= 5) {
          const isGeriatric = agent.state.age >= 65;
          const isRenalImpaired = agent.state.labs.egfr < 45;
          
          if (isGeriatric || isRenalImpaired) {
              // Calculate a compounding toxicity risk
              const excessMeds = agent.state.medications.length - 4;
              const toxicityProbability = 0.02 * excessMeds; // 2% per extra med
              
              if (Math.random() < toxicityProbability) {
                  // Induce an Adverse Drug Event (ADE) from polypharmacy
                  const severity = isRenalImpaired ? -8 : -4;
                  agent.logEvent({ 
                      tick: currentTick, 
                      type: 'Adverse Drug Event', 
                      description: `Polypharmacy Toxicity: Compromised metabolic clearance (Age/eGFR) resulted in compounded systemic toxicity from managing ${agent.state.medications.length} simultaneous active prescriptions.`, 
                      impactHealth: severity, 
                      impactStress: 15 
                  });
              }
          }
      }
  }
}
