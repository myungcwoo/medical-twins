import * as ort from 'onnxruntime-web';
import type { AgentState } from './Agent';

export class InferenceEngine {
    private static session: ort.InferenceSession | null = null;
    private static isInitialized = false;

    // A mapping from ICD/NDC strings to the embedding integers the model was trained on
    private static tokenDictionary: Record<string, number> = {
        'Hypertension': 101, 'Diabetes': 102, 'Obesity': 103, 'CKD': 104,
        'Lisinopril': 201, 'Metformin': 202, 'Semaglutide': 203,
        // (This would be 50,000+ entries in reality)
    };

    static async initialize() {
        if (this.isInitialized) return;
        try {
            // Load the PyTorch exported ONNX weights directly from the Vite public folder
            this.session = await ort.InferenceSession.create('/medical_twin_model.onnx', {
                executionProviders: ['wasm'] // Use WebAssembly for fast CPU execution
            });
            this.isInitialized = true;
            console.log("Deep Learning Inference Engine Initialized (WASM)");
        } catch (e) {
            console.error("Failed to load ONNX model. Ensure model is exported.", e);
        }
    }

    static async predictNextTickDelta(state: AgentState): Promise<{ healthDelta: number, log: string }> {
        if (!this.session) return { healthDelta: 0, log: "Model offline. Falling back to static routines." };

        try {
            // 1. Feature Engineering: Convert Agent State into Model Tensors
            // For this skeleton, we construct a seq_len of 5 (last 5 years)
            const seq_len = 5;
            
            // Map known conditions & meds into our simulated embedding space
            const discreteTokensArray = new BigInt64Array(seq_len).fill(0n);
            let tokenIdx = Math.max(0, seq_len - state.chronicConditions.length - state.medications.length);
            
            state.chronicConditions.forEach(cond => {
                if (tokenIdx < seq_len) discreteTokensArray[tokenIdx++] = BigInt(this.tokenDictionary[cond] || 0);
            });
            state.medications.forEach(med => {
                if (tokenIdx < seq_len) discreteTokensArray[tokenIdx++] = BigInt(this.tokenDictionary[med] || 0);
            });

            // Map continuous variables with explicit missingness masks
            // We assume a schema of: [SysBP, DiaBP, HR, BMI, A1C, LDL, eGFR, cvHealth, 0, 0] (size 10)
            const continuousArray = new Float32Array(seq_len * 10).fill(0);
            const maskArray = new Float32Array(seq_len * 10).fill(0); // 0 = missing

            // Let's populate the *latest* step (idx = seq_len - 1) with current vitals
            const lastStepOffset = (seq_len - 1) * 10;
            const currentVitals = [
                state.vitals.bpSystolic, state.vitals.bpDiastolic, state.vitals.heartRate, state.vitals.bmi,
                state.labs.a1c, state.labs.ldlCholesterol, state.labs.egfr, state.labs.cvHealth, 0, 0
            ];
            
            currentVitals.forEach((val, i) => {
                continuousArray[lastStepOffset + i] = val;
                maskArray[lastStepOffset + i] = 1.0; // Mark 1.0 because we are providing the data explicitly now!
            });

            // Time deltas (1 year between each sequence step for simplicity)
            const timeDeltasArray = new Float32Array(seq_len).fill(1.0);

            // 2. Wrap into ONNX Tensors
            const tensors = {
                discrete_tokens: new ort.Tensor('int64', discreteTokensArray, [1, seq_len]),
                continuous_vals: new ort.Tensor('float32', continuousArray, [1, seq_len, 10]),
                missing_masks: new ort.Tensor('float32', maskArray, [1, seq_len, 10]),
                time_deltas: new ort.Tensor('float32', timeDeltasArray, [1, seq_len])
            };

            // 3. Inference Run
            const results = await this.session.run(tensors);
            
            // 4. Decode Outputs
            const healthDelta = results.health_delta.data[0] as number;
            
            // Log interpretation
            const reason = "ML Inference: Processed " + state.chronicConditions.length + " conditions, predicting a delta of " + healthDelta.toFixed(3);

            return { 
                healthDelta: (isNaN(healthDelta) || !isFinite(healthDelta)) ? 0 : healthDelta, 
                log: reason 
            };
            
        } catch (e) {
            console.error("Inference Error:", e);
            return { healthDelta: 0, log: "ML Inference Failed." };
        }
    }
}
