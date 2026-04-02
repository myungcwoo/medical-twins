import * as ort from 'onnxruntime-web';
import type { AgentState } from './Agent';

export class InferenceEngine {
    private static session: ort.InferenceSession | null = null;
    private static isInitialized = false;

    // No tokens required; we map natively to Floats in WASM

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
            // 1. Feature Engineering: Map Agent State into Model Tensors matching PyTorch output layer
            const age = state.age || 40.0;
            const bmi = state.vitals.bmi || 25.0;
            const bp = state.vitals.bpSystolic || 120.0;
            const a1c = state.labs.a1c || 5.5;
            const cvh = state.labs.cvHealth || 80.0;
            const ldl = state.labs.ldlCholesterol || 100.0;
            const stress = state.stressLevel || 20.0;
            const egfr = state.labs.egfr || 90.0;

            const inputFloatArray = new Float32Array([age, bmi, bp, a1c, cvh, ldl, stress, egfr]);
            
            // Physical memory mapping to WASM pointer
            const tensor = new ort.Tensor('float32', inputFloatArray, [1, 8]);
            
            // Execute the computational graph
            const feeds: Record<string, ort.Tensor> = { vitals_input: tensor };
            const results = await this.session.run(feeds);
            
            // Output is 'hazard_preds' mapping to the four core PyTorch mortality output branches
            const outTensor = results.hazard_preds;
            
            if (!outTensor) {
                 return { healthDelta: 0, log: "ONNX executed but failed tensor output format." };
            }
            
            const data = outTensor.data as Float32Array;
            const avgRisk = (data[0] + data[1] + data[2] + data[3]) / 4;
            const maxRisk = Math.max(...Array.from(data));

            // ML Guided Bounding: If Neural Output Risk is globally critical, apply physiological decay
            if (maxRisk > 0.8 || avgRisk > 0.5) return { healthDelta: -0.15, log: `[WASM TENSOR ALERT] Critical PyTorch mortality sequence. Max risk: ${(maxRisk*100).toFixed(1)}%. Accelerating organ damage.`};
            if (maxRisk < 0.2) return { healthDelta: +0.05, log: `[WASM TENSOR CLEAR] Neural prediction stable. Max risk: ${(maxRisk*100).toFixed(1)}%. Promoting natural tissue regeneration.`};

            return { healthDelta: 0, log: `WASM model execution completed. Stable gradients.` };

        } catch (e) {
            console.error("ONNX Inference Exception:", e);
            return { healthDelta: 0, log: "WASM Inference failed." };
        }
    }
}
