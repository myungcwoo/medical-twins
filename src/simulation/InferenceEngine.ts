import * as ort from 'onnxruntime-web';
import type { AgentState } from './Agent';

export class InferenceEngine {
    private static session: ort.InferenceSession | null = null;
    private static isInitialized = false;

    // No tokens required; we map natively to Floats in WASM
    static isOnline(): boolean {
        return this.session !== null && this.isInitialized;
    }

    static async initialize() {
        if (this.isInitialized) return;
        try {
            // Load the PyTorch exported ONNX weights directly from the Vite public folder
            this.session = await ort.InferenceSession.create(`/medical_twin_model.onnx?v=${Date.now()}`, {
                executionProviders: ['wasm'] // Use WebAssembly for fast CPU execution
            });
            this.isInitialized = true;
            console.log("Deep Learning Inference Engine Initialized (WASM)");
        } catch (e) {
            console.error("Failed to load ONNX model. Ensure model is exported.", e);
        }
    }

    static async predictNextTickDelta(state: AgentState): Promise<{ healthDelta: number, log: string, newPathologies?: string[] }> {
        if (!this.session) return { healthDelta: 0, log: "Model offline. Falling back to static routines." };

        try {
            // 1. Structural Engineering: Map the Twin's longitudinal lifespan into contiguous Memory Tensors
            const historyTrack = state.biometricHistory || [];
            const combinedTrack = historyTrack.length > 0 ? historyTrack : [state];
            
            const N = combinedTrack.length;
            const dims = 8;
            const inputFloatArray = new Float32Array(N * dims);
            
            for (let i = 0; i < N; i++) {
                const snap: any = combinedTrack[i];
                inputFloatArray[i*dims + 0] = snap.age || 40.0;
                inputFloatArray[i*dims + 1] = snap.vitals?.bmi || snap.bmi || 25.0;
                inputFloatArray[i*dims + 2] = snap.vitals?.bpSystolic || snap.bpSystolic || 120.0;
                inputFloatArray[i*dims + 3] = snap.labs?.a1c || snap.a1c || 5.5;
                inputFloatArray[i*dims + 4] = snap.labs?.cvHealth || snap.cvHealth || 80.0;
                inputFloatArray[i*dims + 5] = snap.labs?.ldlCholesterol || snap.ldlCholesterol || 100.0;
                inputFloatArray[i*dims + 6] = snap.stressLevel || snap.stress || 20.0;
                inputFloatArray[i*dims + 7] = snap.labs?.egfr || snap.egfr || 90.0;
            }
            
            // Physical memory mapping to WASM pointer using Dynamic Sequences! (Batch 1, Seq_Len N, dims 8)
            const tensor = new ort.Tensor('float32', inputFloatArray, [1, N, dims]);
            
            // Execute the computational graph
            const feeds: Record<string, ort.Tensor> = { vitals_input: tensor };
            const results = await this.session.run(feeds);
            
            // Output is 'hazard_preds' mapping to the four core PyTorch mortality output branches
            const outTensor = results.hazard_preds;
            
            if (!outTensor) {
                 return { healthDelta: 0, log: "ONNX executed but failed tensor output format." };
            }
            
            const data = outTensor.data as Float32Array;
            // Native mapping from api.py Target Vector: [stroke_risk, chf_risk, db_risk, copd_risk]
            const strokeRisk = data[0];
            const chfRisk = data[1];
            const dbRisk = data[2];
            const copdRisk = data[3];
            
            const maxRisk = Math.max(strokeRisk, chfRisk, dbRisk, copdRisk);
            let healthDelta = 0;
            const newPathologies: string[] = [];

            // True ML Pathological Inference governing disease acquisition!
            if (strokeRisk > 0.88) newPathologies.push('Stroke');
            if (chfRisk > 0.88) newPathologies.push('CHF');
            if (dbRisk > 0.88) newPathologies.push('Diabetes');
            if (copdRisk > 0.88) newPathologies.push('COPD');

            if (maxRisk > 0.8) {
                healthDelta -= 0.15;
                return { healthDelta, log: `[WASM SEQUENCE ALERT] Neural decay horizon reached. Max risk: ${(maxRisk*100).toFixed(1)}%.`, newPathologies };
            }
            
            if (maxRisk < 0.2) return { healthDelta: +0.05, log: `[WASM TENSOR CLEAR] Sequence trajectory clear. Max hazard: ${(maxRisk*100).toFixed(1)}%.` };

            return { healthDelta: 0, log: `WASM sequence execution completed.` };

        } catch (e) {
            console.error("ONNX Inference Exception:", e);
            return { healthDelta: 0, log: "WASM Inference sequence failed." };
        }
    }
}
