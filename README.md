# 🧬 Clinical AI Studio: Generative Medical Digital Twins

An advanced, end-to-end framework built to simulate the longitudinal biological decay of massive digital patient cohorts. Blending **Generative AI** with autonomous **Deep Learning**, the Clinical AI Studio acts as an Edge-Compute powerhouse—generating, visualizing, and treating hypothetical chronic diseases inside the browser natively.

![Architecture Layout](/hero_bg.png)

---

## ⚡ Core Architecture

The architecture maps four distinct computing layers seamlessly into a single environment without requiring expensive persistence cloud layers.

### 1. Edge Inference (WASM / ONNX)
- The raw mathematical framework of disease progression is built on a custom PyTorch **TransformerPredictor**. 
- Using standard `onnx` graph pipelines, the backend `.pt` tensor weights are instantly bridged across WebAssembly natively to the client (`InferenceEngine.ts`). 
- When an agent physically logs a tick of its lifetime, it bypasses static math for real, client-side, multi-layer Neural Network prediction targeting `[Stroke, CHF, Diabetes, COPD]` likelihoods!

### 2. Autonomous Knowledge Layer (LLM + RAG)
- Agents autonomously query networked LLMs to ask for protocol interventions designed to counter their trajectory.
- We constructed a massive **RAG (Retrieval-Augmented Generation)** prompt forcing the LLM to ground *every* intervention into authoritative AHA and CDC documentation, eliminating medical hallucinations. 
- Integrated a live **PubMed REST Scraper** connecting to the NIH servers, acting as a fallback data hook if LLM API keys are disabled.

### 3. Asynchronous Backbone (IndexedDB)
- Massive grid simulations require extreme persistence memory.
- Using native, deeply integrated `IndexedDB` queues, the massive array blocks (`Agent[]`) snapshot recursively. 
- You can physically close the active browser tab, reboot, and the UI will `Initialize()` WASM and instantly hydrate your exact mathematical week seamlessly—no Supabase or Firebase required.

### 4. Cohort Heatmap UI
- Using `recharts` and deeply reactive state flows, the UI projects side-by-side multiverses. 
- Enter the **Simulate Me** tool to drop your own biometric data in, and visually witness an AI protocol group vastly outlive a standard cohort inside an auto-scaling chronologic Pathological Heatmap!

---

## 🚀 Getting Started

### 1. Booting the Frontend Simulation
The core application runs locally via Vite.
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173`. You can immediately jump into the `Command Center` or `Simulate Me` tabs.

### 2. Booting the Deep Learning Server
If you want to re-train the neural network weights from new JSON populations, you must boot the backend REST API:
```bash
cd model_training

# Ensure you have torch and onnx pipelines
pip install torch fastapi uvicorn onnx onnxscript onnxruntime requests

# Boot the API
uvicorn api:app --reload
```
Once this starts, the frontend's **ML Diagnostics / PyTorch DEV** footer tab will establish a handshake, letting you visually inject 100-Agent timelines right into PyTorch backpropagation. 

## ⚖️ Legal Disclaimer
*This application is composed entirely as an architectural and mathematical experiment. It is firmly NOT intended for medical advice, prediction, or authentic diagnosis. It is NOT HIPAA compliant and must never interpret real Patient Health Information (PHI).*
