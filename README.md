# 🧬 Clinical AI Studio: Generative Medical Digital Twins

An advanced, edge-compute open-source framework designed to simulate the longitudinal biological decay and interventional recovery of massive digital patient cohorts. By blending **Generative RAG AI** with deterministic **Deep Learning** pipelines, the Clinical AI Studio generates, visualizes, and treats hypothetical chronic diseases entirely within the browser securely.

![Overview](/hero_bg.png)

---

## ⚡ Core Mathematical Architecture

The simulation is anchored by four deeply intertwined inference boundaries to guarantee clinical fidelity, decoupling massive statistical workloads from the UI thread using an asynchronous architecture.

### 1. High-Performance Deterministic Orchestration (Web Workers & Zustand)
- The application offloads all physiological chronologic ticking (`SimulationEngine`) into a detached **Web Worker** (`simulation.worker.ts`). Event loops calculate the multidimensional math for 1,000+ digital twins at 60 FPS without ever blocking the React UI thread.
- Inter-Process Communication (IPC) is bridged via a strict **Zustand global store**, allowing granular slice-based re-renders instead of monolithic prop-drilling.
- The React layer utilizes an **Atomic UI Component Architecture** (`<StatCard>`, `<RangeSlider>`) to maintain structural purity while visualizing real-time deeply isolated state variables (e.g., eGFR decline, CAC scoring, NT-proBNP fluctuations).
- Core biological regressions are entirely isolated and deterministically locked via **Vitest** test harnesses.

### 2. Pharmacokinetics & Synergy Matrices
Biological systems cannot scale therapies linearly indefinitely. We utilize advanced quantitative systems pharmacology limits:
- **Bliss Independence Model**: Computes multidrug overlapping likelihoods (`P(A U B) = P(A) + P(B) - P(A)P(B)`) ensuring physiological bounds.
- **Asymptotic/Michaelis-Menten Curves**: Models receptor saturation using `E_max * (1 - e^(-k * dose))` physics for diminishing returns.
- **AHA PREVENT Forecasts**: Injects deterministic multipliers for Atherosclerotic Cardiovascular Disease (ASCVD) tied to live imaging benchmarks.

### 3. Edge Inference (WASM / ONNX)
- The raw framework of disease progression is continuously benchmarked against a custom PyTorch **TransformerPredictor**. 
- Using standard `onnx` graph pipelines, the backend `.pt` tensor weights natively bridge across WebAssembly to the client (`InferenceEngine.ts`). 
- When an agent physically logs a lifetime 'Tick', the Edge Engine natively leverages Multi-Layer Perceptrons targeting `[Stroke, CHF, Diabetes, COPD]` likelihoods locally.

### 4. Autonomous Knowledge Generation (LLM RAG)
- Built-in **Agentic Researcher Nodes** dynamically ping networking LLMs to devise new intervention protocols.
- We constructed a massive **RAG (Retrieval-Augmented Generation) Vector Instruction** forcing every synthesized intervention to structurally anchor upon real, identifiable guidelines (AHA, CDC, WHO, NEJM, JAMA).
- **Graceful Degradation:** A custom native Python REST API PubMed Scraper serves as a strict fallback if LLM constraints fail.

---

## 🚀 Development & Orchestration

### 1. Booting the Frontend Simulation
The core application runs locally via Vite and completely isolates its local IndexedDB to guarantee persistence.

```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173`. Jump directly into the `Dashboard`, view the `Algorithmic Whitepaper`, or upload specific JSON data structures into the `Data Ingestion` tab.

### 2. Booting the PyTorch Model Server
To re-train the neural network weights from new `.json` population arrays, boot the backend API:

```bash
cd model_training

# Provision virtual environments and dependencies
pip install torch fastapi uvicorn onnx onnxscript onnxruntime requests

# Boot the Training API
uvicorn api:app --reload
```
Once deployed, the `ML Diagnostics / PyTorch DEV` tab on the frontend natively hooks into this backend, visualizing real-time Loss gradients and Tensor weights backpropagating over standard HTTP/REST.

---

## ⚖️ Legal Disclaimer
*This repository is composed entirely as a high-performance architectural and mathematical framework experiment. It is firmly NOT intended for medical advice, prediction, or authentic diagnosis. It is NOT HIPAA/HITECH compliant and must never intercept, process, or interpret Real Patient Health Information (PHI).*
