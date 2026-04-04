import { describe, it, expect } from 'vitest';
import { BiologicalDecayEngine } from '../simulation/BiologicalDecayEngine';
import { Agent } from '../simulation/Agent';

const getMockAgent = (age: number = 30) => {
    return new Agent({
        id: '1',
        name: 'Test Patient',
        age: age,
        sex: 'Female',
        role: 'Patient',
        baseHealth: 100,
        stressLevel: 30,
        dietQuality: 80,
        wealth: 80,
        accessToCare: 80,
        foodDesert: false,
        chronicConditions: [],
        familyHistory: [],
        surgicalHistory: [],
        medications: [],
        smoker: false,
        exerciseRoutine: 'Moderate',
        medicalCompliance: 'High',
        vitals: {
            bpSystolic: 115,
            bpDiastolic: 75,
            heartRate: 65,
            bmi: 22,
        }
    });
};

describe('BiologicalDecayEngine - Core Physiological Entropy', () => {

    it('inflicts minor decay on young healthy adults (preventing immortality)', () => {
        const agent = getMockAgent(30);
        agent.state.dietQuality = 50; // Neutral diet so it doesn't give a buff
        agent.state.stressLevel = 50; // Prevent stress buffer from dropping below 30 and giving a buff
        const startHealth = agent.state.baseHealth;

        BiologicalDecayEngine.evaluate(agent, 1);

        expect(agent.state.baseHealth).toBeLessThan(startHealth);
        // at age 30, penalty should just be baseline `0.002`
    });

    it('radically accelerates Gompertz-Makeham mortality decay in elderly patients', () => {
        const elderlyAgent = getMockAgent(85);
        elderlyAgent.state.dietQuality = 50; // Prevent +0.01 buff
        elderlyAgent.state.exerciseRoutine = 'None'; 
        const expectedBaseDropRate = 0.001 * Math.exp((85 - 40) * 0.065);
        
        elderlyAgent.state.baseHealth = 70; // Cap
        BiologicalDecayEngine.evaluate(elderlyAgent, 1);

        // Elderly agents should lose significant health due to the exponential term
        expect(elderlyAgent.state.baseHealth).toBeLessThan(70 - expectedBaseDropRate * 0.9);
    });

    it('buffers stress and BP through intensive cardiovascular exercise', () => {
        const agent = getMockAgent(45);
        agent.state.exerciseRoutine = 'High';
        agent.state.stressLevel = 60; // Not high enough to trigger the +0.1 penalizing buffer
        agent.state.vitals.bpSystolic = 130;
        agent.state.vitals.heartRate = 80;

        BiologicalDecayEngine.evaluate(agent, 1);

        // High exercise buffers should drop metrics
        expect(agent.state.stressLevel).toBeLessThan(80);
        expect(agent.state.vitals.bpSystolic).toBeLessThan(130);
        expect(agent.state.vitals.heartRate).toBeLessThan(80);
    });

    it('drifts vascular load and BMI destructively if diet is severely poor', () => {
        const agent = getMockAgent(40);
        agent.state.dietQuality = 20; // Very poor diet
        
        const startHealth = agent.state.baseHealth;
        const startBmi = agent.state.vitals.bmi;

        BiologicalDecayEngine.evaluate(agent, 1);

        expect(agent.state.baseHealth).toBeLessThan(startHealth);
        expect(agent.state.vitals.bmi).toBeGreaterThan(startBmi);
        expect(agent.state.labs.ldlCholesterol).toBeGreaterThan(110);
    });

});
