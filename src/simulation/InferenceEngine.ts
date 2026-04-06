import * as ort from 'onnxruntime-web';
import type {  AgentState  } from '../types/Simulation.types';
import { MetaTuner } from './MetaTuner';

export class InferenceEngine {
    private static cardioSession: ort.InferenceSession | null = null;
    private static renalSession: ort.InferenceSession | null = null;
    private static neuroSession: ort.InferenceSession | null = null;
    private static isInitialized = false;

    static isOnline(): boolean {
        return this.cardioSession !== null && this.isInitialized;
    }

    static async initialize() {
        if (this.isInitialized) return;
        try {
            const opts = { executionProviders: ['wasm'] };
            const v = Date.now();
            this.cardioSession = await ort.InferenceSession.create(`/cardio_model.onnx?v=${v}`, opts);
            this.renalSession  = await ort.InferenceSession.create(`/renal_model.onnx?v=${v}`, opts);
            this.neuroSession  = await ort.InferenceSession.create(`/neuro_model.onnx?v=${v}`, opts);
            this.isInitialized = true;
            console.log("Multi-Modal Deep Learning Inference Engines Initialized (WASM)");
        } catch (e) {
            console.error("Failed to load Multi-Modal ONNX graphs. Ensure they are exported.", e);
        }
    }

    static async predictNextTickDelta(state: AgentState): Promise<{ healthDelta: number, log: string, newPathologies?: string[] }> {
        if (!this.cardioSession || !this.renalSession || !this.neuroSession) {
            return { healthDelta: 0, log: "Models offline. Falling back to static routines." };
        }

        try {
            const historyTrack = state.biometricHistory || [];
            const combinedTrack = historyTrack.length > 0 ? historyTrack : [state];
            const N = combinedTrack.length;

            const cardioArray = new Float32Array(N * 4);
            const renalArray  = new Float32Array(N * 3);
            const neuroArray  = new Float32Array(N * 3);
            
            for (let i = 0; i < N; i++) {
                const snap: any = combinedTrack[i];
                // Cardio: Age, BP, CVHealth, LDL
                cardioArray[i*4 + 0] = snap.age || 40.0;
                cardioArray[i*4 + 1] = snap.vitals?.bpSystolic || snap.bpSystolic || 120.0;
                cardioArray[i*4 + 2] = snap.labs?.cvHealth || snap.cvHealth || 80.0;
                cardioArray[i*4 + 3] = snap.labs?.ldlCholesterol || snap.ldlCholesterol || 100.0;
                
                // Renal: A1c, eGFR, UACR (mock uacr if missing via egfr drop)
                renalArray[i*3 + 0] = snap.labs?.a1c || snap.a1c || 5.5;
                renalArray[i*3 + 1] = snap.labs?.egfr || snap.egfr || 90.0;
                renalArray[i*3 + 2] = snap.labs?.uacr || snap.uacr || (100 - (snap.labs?.egfr || 90.0));
                
                // Neuro: Age, BMI, Stress
                neuroArray[i*3 + 0] = snap.age || 40.0;
                neuroArray[i*3 + 1] = snap.vitals?.bmi || snap.bmi || 25.0;
                neuroArray[i*3 + 2] = snap.stressLevel || snap.stress || 20.0;
            }
            
            const cardioTensor = new ort.Tensor('float32', cardioArray, [1, N, 4]);
            const renalTensor  = new ort.Tensor('float32', renalArray, [1, N, 3]);
            const neuroTensor  = new ort.Tensor('float32', neuroArray, [1, N, 3]);
            
            const [cardioRes, renalRes, neuroRes] = await Promise.all([
                this.cardioSession.run({ vitals_input: cardioTensor }),
                this.renalSession.run({ vitals_input: renalTensor }),
                this.neuroSession.run({ vitals_input: neuroTensor })
            ]);
            
            const cardioData = cardioRes.hazard_preds.data as Float32Array; // [Stroke, CHF]
            const renalData  = renalRes.hazard_preds.data as Float32Array;  // [Renal Failure]
            const neuroData  = neuroRes.hazard_preds.data as Float32Array;  // [Dementia]
            
            const strokeRisk = MetaTuner.calculateAdjustedProbability(state, 'Stroke', cardioData[0]);
            const chfRisk    = MetaTuner.calculateAdjustedProbability(state, 'CHF', cardioData[1]);
            const renalRisk  = MetaTuner.calculateAdjustedProbability(state, 'CKD Progression', renalData[0]);
            const neuroRisk  = MetaTuner.calculateAdjustedProbability(state, 'Dementia', neuroData[0]);
            
            const maxRisk = Math.max(strokeRisk, chfRisk, renalRisk, neuroRisk);
            let healthDelta = 0;
            const newPathologies: string[] = [];

            if (strokeRisk > 0.88) newPathologies.push('Stroke');
            if (chfRisk > 0.88) newPathologies.push('CHF');
            if (renalRisk > 0.88) newPathologies.push('CKD Progression');
            if (neuroRisk > 0.88) newPathologies.push('Dementia');

            // Harder decay for Multi-Modal collision
            if (maxRisk > 0.8) {
                healthDelta -= 0.2;
                return { healthDelta, log: `[WASM MULTI-MODAL ALERT] Cross-system decay horizon reached. Max risk: ${(maxRisk*100).toFixed(1)}%.`, newPathologies };
            }
            
            if (maxRisk < 0.2) return { healthDelta: +0.05, log: `[WASM TENSOR CLEAR] Multi-Modal sequence clear. Max hazard: ${(maxRisk*100).toFixed(1)}%.` };

            return { healthDelta: 0, log: `WASM Multi-Modal sequence mapped successfully.` };

        } catch (e) {
            console.error("Multi-Modal ONNX Inference Exception:", e);
            return { healthDelta: 0, log: "WASM Inference sequence failed." };
        }
    }
}
