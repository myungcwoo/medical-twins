# 🧬 Clinical AI Studio: Generative Medical Digital Twins

An advanced, edge-compute open-source framework designed to simulate the longitudinal biological decay and interventional recovery of massive digital patient cohorts. By blending **Generative RAG AI** with deterministic **Deep Learning** pipelines, the Clinical AI Studio generates, visualizes, and treats hypothetical chronic diseases entirely within an offline Chromium desktop interface securely.

> 🌟 **Read the sweeping architectural timeline mapping v1.0.0 through v1.7.0 in [RELEASE_NOTES.md](./RELEASE_NOTES.md)**

![Overview](/hero_bg.png)

---

## ⚡ Core Mathematical Architecture

The simulation is anchored by four deeply intertwined inference boundaries to guarantee clinical fidelity, decoupling massive statistical workloads from the UI thread using an asynchronous architecture.

### 1. High-Performance Deterministic Orchestration (Web Workers & Zustand)
- The application offloads all physiological chronologic ticking (`SimulationEngine`) into a detached **Web Worker** (`simulation.worker.ts`). Event loops calculate the multidimensional math for 1,000+ digital twins at 60 FPS without ever blocking the React UI thread.
- Inter-Process Communication (IPC) is bridged via a strict **Zustand global store**, allowing granular slice-based re-renders instead of monolithic prop-drilling.
- The React layer utilizes an **Atomic UI Component Architecture** (`<StatCard>`, `<RangeSlider>`) to maintain structural purity while visualizing real-time deeply isolated state variables (e.g., eGFR decline, CAC scoring, NT-proBNP fluctuations).
- Core biological regressions are entirely isolated and deterministically locked via **Vitest** test harnesses.

### 2. Pharmacokinetics & Network Biology
Biological systems cannot scale therapies linearly indefinitely. We utilize advanced quantitative systems biology logic:
- **Gompertz-Makeham Mortality Law**: Age-based generic health ceilings have been eliminated. Replaced with complex compound exponential decay distributions governing sudden death mechanics organically.
- **Polypharmacy Threshold Toxicity**: Dynamic adverse event generation triggers if impaired metabolic agents (e.g. Geriatric or Renal limited) are administered over 5 contemporaneous medications.
- **Markov Chain Disease Progression**: Pathology engines simulate time-dependent cascades (e.g., CAD → Myocardial Infarction → Congestive Heart Failure; CKD → ESRD), replacing simple independent randomized incidences with longitudinal causality maps.
- **Bliss Independence & Asymptotics**: Computes overlapping biological efficacies (`P(A U B)`) while using Michaelis-Menten derivatives to simulate drug saturation.

### 3. Edge Inference (WASM / ONNX)
- The raw framework of disease progression is continuously benchmarked against a custom PyTorch **TransformerPredictor**. 
- Using standard `onnx` graph pipelines, the backend `.pt` tensor weights natively bridge across WebAssembly to the client (`InferenceEngine.ts`). 
- When an agent physically logs a lifetime 'Tick', the Edge Engine natively leverages Multi-Layer Perceptrons targeting `[Stroke, CHF, Diabetes, COPD]` likelihoods locally.

### 4. Autonomous Knowledge Generation & Conversational AI
- **Generative LLM Sandbox (RAG)**: Built-in Agentic Nodes dynamically execute targeted prompts against OpenAI/Gemini/Claude directly inside the simulation. 
- **A.I. Analytics Center**: Embedded Data Scientist AI allowing users to map natural language queries (e.g., *"Plot age vs health for patients on Semaglutide"*) into strict JSON parsing configurations, rendering perfect D3 Recharts math locally without LLM hallucination risk.
- **Deep Semantic Matrices**: Real-time Machine Learning Vector extractions (`text-embedding-3`) cluster generated theoretical trials dynamically onto the canvas using simple Euclidean thresholds, visually grouping similar knowledge paths away from contrasting pathways.

---

## 🚀 Development & Orchestration

### 1. Booting the Hospital-Grade Desktop Simulation
The core application has been mapped strictly to an offline, edge-secured Electron instance to drop computational browser constraints.

```bash
npm install
npm run electron:serve
```
*(You may optionally run the legacy web build via `npm run dev`)*
Navigate to `http://localhost:5173`. Jump directly into the `Dashboard`, view the `Algorithmic Whitepaper`, or upload specific JSON data structures into the `Data Ingestion` tab.

### 2. Edge Training Environments
The codebase ships with a native, local machine learning trainer accessible directly inside the UI (`TrainingDashboard.tsx`). There is no need to stand up separate databases or REST target APIs—the system trains predictive models directly over unstructured JSON patient histories using standard browser threads and exports static Neural Weights instantly.

---

## ⚖️ Legal Disclaimer
*This repository is composed entirely as a high-performance architectural and mathematical framework experiment. It is firmly NOT intended for medical advice, prediction, or authentic diagnosis. It is NOT HIPAA/HITECH compliant and must never intercept, process, or interpret Real Patient Health Information (PHI).*
