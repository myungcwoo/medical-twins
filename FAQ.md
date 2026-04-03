# Clinical AI Studio & Medical Twins: Comprehensive FAQ

This document serves as the master technical and conceptual reference for the Clinical AI Studio architecture and the flagship Medical Digital Twins deployment.

---

## 🟢 Concept & Vision

### What is the "Clinical AI Studio"?
The Clinical AI Studio is an overarching WebApplication environment that serves as a deployment hub. Rather than a static dashboard, it is designed as a dynamic gateway routing users into highly specialized, evidence-based Artificial Intelligence tools (such as Natural Language Parsing for provider notes, operational triage mapping, and predictive epidemiological sandboxes).

### What is the "Medical Digital Twins Sandbox"?
This is our primary production deployment. It is an advanced Agent-Based Modeling (ABM) system built in React that mathematically simulates the biological decay of a massive cohort of digital patient clones across multiple decades. It allows researchers to inject hypothetical Generative AI medical protocols into the population and visually measure the subsequent real-world impact on survival rates over time.

### Is this meant for real medical diagnosis?
**No.** This is an architectural and mathematical experiment explicitly designed to test the boundary of Deep Learning Edge Inference and LLM RAG integration. It acts as an educational and analytical visualization framework. It is strictly not intended for medical advice, prediction, or authentic diagnosis, and is not HIPAA compliant.

---

## 🧠 Edge Inference & Machine Learning

### How do you predict if an agent gets sick?
Originally, the platform used hardcoded heuristic fallbacks (e.g., standard math: *if stress > 80, subtract health*). We aggressively upgraded this to a purely data-driven model. The backend features a PyTorch **TransformerPredictor** that ingests the sequential time-series biometric data (Blood Pressure, Age, Stress, HR, Labs) of the agents. It uses multi-head attention to map longitudinal degradation and outputs precise probability risks for critical events like ASCVD (Strokes), Congestive Heart Failure, Type 2 Diabetes, and COPD.

### Do I need the Python server active to run the simulation?
**No!** We actively deployed Edge Computation logic. The Python backend compiles the trained PyTorch neural tensor into an `.onnx` (Open Neural Network Exchange) file. 
Our Frontend React app natively boots an `InferenceEngine` via WebAssembly (`onnxruntime-web`). The entire Neural Network is physically loaded into your local browser RAM upon rendering. Once booted, the React agents query the browser's local inference engine 60 times a second to get their pathological results without ever needing to hit an external REST API constraint.

---

## 🌐 Generative Knowledge (LLMs & RAG)

### How do agents find "cures" or interventions?
When an agent is flagged by the ONNX Inference Engine as critically ill (e.g., suffering a stroke), they autonomously query the **Knowledge Network**. If no mapped protocol exists to save them, the simulation triggers the `LLMEngine`. 
The application securely requests an intervention protocol from an LLM (like Google's Gemini). The LLM synthesizes a biomedical routine to alter the agent's physics parameters natively.

### How do you prevent the AI from generating dangerous or hallucinatory medical advice?
We enforce a strict **RAG (Retrieval-Augmented Generation) Architecture**. The LLM prompt is heavily shielded. We enforce strict instructions that the AI *must* cross-reference and synthesize its protocols utilizing standard guidelines from authoritative groups exclusively, such as the *American Heart Association (AHA)*, the *WHO*, and the *CDC*.

### What is the PubMed Harvester?
To further ground the Knowledge Base, the Python `/model_training` backend contains a live web scraper hook directly mapping to the NIH PubMed servers. It can actively query real-world published FDA clinical trials and inject the authoritative abstracts back into the local Network feed, bridging the gap between theoretical generative algorithms and peer-reviewed reality.

---

## 💾 App State & Architecture

### How does the app not crash when simulating thousands of weeks of data?
Running 100 independent clones tracking 5-10 biometric fields every tick across 50 years equals millions of state changes. React's `useState` memory would instantly bloat and collapse.
To resolve this, we integrated an **Asynchronous Backbone**. `DatabaseEngine.ts` actively intercepts the React state arrays and injects them natively into standard browser `IndexedDB`. 
This acts as a persistent save file. If you refresh the window or close your `<localhost>` tab entirely, the app natively hydrates and restores your sandbox down to the precise millisecond when you reopen it.

### What are "Deep-Dive Autopsy Modals"?
Rather than awkwardly cramping critical multi-decade trajectory curves into a tiny 300px sidebar, we opted for sterile, evidence-based focus. 
When selecting a twin from the active database, the entire dashboard is blurred and overlaid by an absolute **Dark-Glass Modal**. This gives you full, unrestricted ultra-wide monitor horizontal length to scrutinize the `recharts` comparative longitudinal lines overlapping their Control counterparts vs. their Protocol Counterparts.

### How do I map the protocol transfers visually?
If you navigate to your Dashboard Overview, there is a glowing neon UI block powered by `react-force-graph-2d`. This WebGL engine renders a live **Physics Graph Topology**. It represents every digital twin as a gravitational node (colored by vitality). When an LLM framework identifies a protocol, it broadcasts it. You can literally watch the data dispersion map the UI dynamically syncing across the population.

---

## 🖥️ Web User Interface (UI/UX)

### What technology powers the Frontend?
The entire visualization layer is built using **React 19** bundled by **Vite** and explicitly strictly-typed with **TypeScript**. For rendering the dense thousands of data points for physiological output, we natively utilize **`recharts`**—allowing the React ecosystem to fluidly map massive trajectory lines (SVGs) across multi-decade simulation periods flawlessly at 60 frames per second without stutter.

### How does the architecture handle massive data tracking on screen?
We utilized a unified "Cybernetic Dashboard" motif. 
Instead of forcing users through multiple disconnected pages, everything runs on a centralized SPA (Single Page Application) router linked via a permanent Sidebar. The active components (Population Database, Network Feed, Heatmaps) actively stack within a fluid grid container (`grid-template-columns`). 
A specialized **Floating Command Island** is absolutely positioned over the views. This isolates chronologic control (Play, Pause, Fast-Forward 20 Years) so that no matter how deep you scroll into an Autopsy Modal or Heatmap, you always have terminal access to the timeline ticking mechanism.

### Is the Sandbox mobile-accessible?
Absolutely. We deployed extreme Progressive Web App (PWA) methodology into the base architectural stylesheet (`index.css`). 
When opening the Clinical AI Sandbox on an iPhone or Android device, structural `@media` overrides instantly detach the massive Desktop Sidebar and transform it into a highly efficient **Swipeable Bottom Navigation Menu**. Heavy flexbox grids immediately drop their width minimums and snap into vertical columns (`1fr`), forcing a beautiful top-to-bottom layout scrolling without any horizontal clipping.

### Why use "Dark Glass" styling instead of traditional wireframes?
Clinical data is notoriously overwhelming. By utilizing a "Dark Mode Glassmorphism" motif (`backdrop-filter: blur()`, subdued neon active states, deep `#0f172a` foundations), we intentionally mitigate visual exhaustion. The dark background allows critical PyTorch risk alerts (`#ef4444` red) and optimal physiology readings (`#10b981` green) to structurally command instant visual priority without relying on intrusive popups.

---

## ⚡ Setup & Navigation

### How do I run the entire stack?
The project separates the frontend deployment from the PyTorch training mechanics.

**To run the Visual Dashboard (Frontend):**
```bash
cd medical-twins
npm install
npm run dev
```
Navigate to `http://localhost:5173`. We highly optimized this component for PWA workflows. It natively collapses perfectly whether you view it on an Ultrawide 4k Monitor or a standard mobile smartphone via native Swipeable Bottom Nav Bars.

**To run the Deep Learning Backbone / PubMed Scraper (Backend):**
```bash
cd model_training
pip install torch fastapi uvicorn onnx onnxruntime onnxscript
uvicorn api:app --reload
```
Once booted, the React application's "ML Diagnostics" console will actively link and allow you to view the raw tensor calculations natively!
