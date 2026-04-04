import { describe, it, expect } from 'vitest';
import { PredictiveEngine } from '../simulation/PredictiveEngine';
import { Agent } from '../simulation/Agent';

const getMockState = () => {
    const rawAgent = new Agent({
        id: '1',
        name: 'Test Patient',
        age: 45,
        sex: 'Male',
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
        imaging: {
            cacScore: 0,
            lvef: 65,
        },
        labs: {
            a1c: 5.2,
            ldlCholesterol: 100,
            hsCRP: 1.0,
            ntProBNP: 50,
            egfr: 90,
            uacr: 10,
        },
        vitals: {
            bpSystolic: 120,
            bpDiastolic: 80,
            heartRate: 60,
            bmi: 24,
        }
    });
    return rawAgent.state;
};

describe('PredictiveEngine - Mathematical Determinism', () => {

    it('calculates low ASCVD stroke risk for a healthy young patient', () => {
        const state = getMockState();
        const strokeRisk = PredictiveEngine.calculateStrokeRisk(state);
        
        expect(strokeRisk.riskLevel).toBe('Low');
        expect(strokeRisk.riskPercentage).toBeLessThan(5);
        expect(strokeRisk.disease).toBe('ASCVD (Stroke / Heart Attack)');
    });

    it('exponentially scales ASCVD risk for uncontrolled hypertension and smoking', () => {
        const state = getMockState();
        state.smoker = true;
        state.vitals.bpSystolic = 160;
        state.imaging.cacScore = 200; // Must remove the '0 CAC' protective base=0.3 blanket
        
        const baselineRisk = PredictiveEngine.calculateStrokeRisk(getMockState()).riskPercentage;
        const crisisRisk = PredictiveEngine.calculateStrokeRisk(state).riskPercentage;

        expect(crisisRisk).toBeGreaterThan(baselineRisk * 3);
        expect(crisisRisk).toBeGreaterThan(20);
    });

    it('calculates imminent structural risk for HFrEF patients with low LVEF', () => {
        const state = getMockState();
        state.age = 65; // High base age to hit critical multiplier
        state.imaging.lvef = 35; // HFrEF active
        state.labs.ntProBNP = 1500; // Massive overload
        state.vitals.bpSystolic = 150;
        
        const chfRisk = PredictiveEngine.calculateChfRisk(state);
        
        expect(chfRisk.disease).toContain('Heart Failure (HFrEF');
        expect(chfRisk.riskLevel).toBe('Critical');
        expect(chfRisk.mitigations.some(m => m.includes('GDMT'))).toBe(true);
    });

    it('accurately escalates renal failure boundaries upon protein spillage', () => {
        const state = getMockState();
        state.labs.egfr = 25; // Trigger the base += 40 + 10 addition to hit high threshold
        state.labs.uacr = 400; // Macroalbuminuria
        state.vitals.bpSystolic = 150;
        
        const renalRisk = PredictiveEngine.calculateRenalFailureRisk(state);
        expect(renalRisk.riskPercentage).toBeGreaterThan(10);
        expect(renalRisk.mitigations.some(m => m.includes('ACE inhibitors'))).toBe(true);
    });

    it('detects COPD strictly through massive insults (smoking/food desert)', () => {
         const state = getMockState();
         state.smoker = true;
         state.age = 65;
         
         const copdRisk = PredictiveEngine.calculateCopdRisk(state);
         expect(copdRisk.riskPercentage).toBeGreaterThan(20);
         expect(copdRisk.mitigations.some(m => m.includes('smoking cessation'))).toBe(true);
    });
});
