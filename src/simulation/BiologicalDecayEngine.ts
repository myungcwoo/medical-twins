import type { Agent } from './Agent';

export class BiologicalDecayEngine {
  public static evaluate(agent: Agent, _currentTick: number) {
    // 1. Gompertz-Makeham Exponential Age Decay (Rebalanced for ~82yr average lifespan)
    let agePenalty = 0.002; // Base Makeham parameter (accidents, baseline natural decay)
    if (agent.state.age > 40) {
        // Gompertz exponential term: Risk doubles roughly every 8-9 years
        // At age 80, this drains ~2-3 health per year rapidly. At age 90, it's severe.
        agePenalty += 0.001 * Math.exp((agent.state.age - 40) * 0.065);
    }
    agent.state.baseHealth -= agePenalty;
    
    if (agent.state.age > 50) {
      agent.state.vitals.bpSystolic += 0.005;
      agent.state.labs.cvHealth -= 0.01; 
    }

    // 2. Behavioral Mitigation (Preventative cardiovascular buffering, removed direct flat base health regeneration to prevent immortality)
    if (agent.state.exerciseRoutine === 'High') {
      if (agent.state.vitals.bmi > 20) agent.state.vitals.bmi -= 0.01;
      if (agent.state.vitals.heartRate > 55) agent.state.vitals.heartRate -= 0.1;
      if (agent.state.vitals.bpSystolic > 110) agent.state.vitals.bpSystolic -= 0.1;
      agent.state.stressLevel -= 0.15;
    } else if (agent.state.exerciseRoutine === 'Moderate') {
      if (agent.state.vitals.bmi > 22) agent.state.vitals.bmi -= 0.005;
      if (agent.state.vitals.heartRate > 60) agent.state.vitals.heartRate -= 0.05;
      agent.state.stressLevel -= 0.08;
    }

    // 5. Stress impact & HR/BP drift
    if (agent.state.stressLevel > 70) {
      agent.state.baseHealth -= 0.02;
      agent.state.vitals.bpSystolic += 0.1;
      agent.state.vitals.heartRate += 0.1;
    } else if (agent.state.stressLevel < 30) {
      agent.state.baseHealth += 0.01;
      if (agent.state.vitals.bpSystolic > 110) agent.state.vitals.bpSystolic -= 0.1;
    }

    // 6. Diet impact & BMI / LDL drift
    if (agent.state.dietQuality < 40) {
      agent.state.baseHealth -= 0.02;
      agent.state.vitals.bmi += 0.01;
      agent.state.labs.ldlCholesterol += 0.1;
    } else if (agent.state.dietQuality > 70) {
      agent.state.baseHealth += 0.01;
      if (agent.state.vitals.bmi > 22) agent.state.vitals.bmi -= 0.005;
      if (agent.state.labs.ldlCholesterol > 100) agent.state.labs.ldlCholesterol -= 0.1;
    }
  }
}
