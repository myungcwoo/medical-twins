import React from 'react';

export const ReleaseNotesView: React.FC = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Historical Release Notes</h1>
        <p>A chronological history of Medical Digital Twins spanning architectural phases.</p>
      </div>

      <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>v1.7.1 (Phase 8.1: Architectural Hardening & Abstractions)</h2>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '1.5rem', display: 'inline-block' }}>Current Stable</span>
          
          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Major Features:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Simulation Types Matrix:</strong> Ripped out raw data interfaces from <code style={{color: '#f472b6'}}>Agent.ts</code> and centralized them into a universally accessible <code style={{color: '#f472b6'}}>src/types/Simulation.types.ts</code> matrix.</li>
            <li><strong>LLM Adapter Strategy:</strong> Extracted massive HTTP endpoints out of <code style={{color: '#f472b6'}}>LLMEngine.ts</code> into isolated, scalable Adapters (<code style={{color: '#f472b6'}}>OpenAIAdapter</code>, <code style={{color: '#f472b6'}}>GeminiAdapter</code>, <code style={{color: '#f472b6'}}>ClaudeAdapter</code>).</li>
            <li><strong>UI De-bloating:</strong> Sliced massive Recharts mathematical rendering logic out of main timeline components into localized wrappers.</li>
          </ul>

          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Minor Improvements:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <li>Globally patched and resolved strict TypeScript implicit `any` and unexported module parameters.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>v1.7.0 (Phase 7: Conversational Data Science Integration)</h2>
          <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', marginBottom: '1.5rem', display: 'inline-block' }}>Stable</span>
          
          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Major Features:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>A.I. Analytics Center:</strong> Integrated a conversational chat UI directly into the application Dashboard.</li>
            <li><strong>LLM Deterministic Engine:</strong> Upgraded <code style={{color: '#f472b6'}}>LLMEngine.ts</code> with <code style={{color: '#f472b6'}}>parseAnalyticsQuery</code> to strictly map natural language strings (e.g., "Plot age vs health for patients on Semaglutide") into absolute React Component configurations.</li>
            <li><strong>Dynamic Recharts Pipeline:</strong> Merged Gen-AI intent extraction natively into the <code style={{color: '#f472b6'}}>useSimulationStore</code>'s Array.filter(), creating flawlessly accurate Scatter, Line, Bar, and Pie mathematical mappings safely offline.</li>
          </ul>

          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Minor Improvements:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <li>Implemented strict TypeScript schema validation ensuring A.I. hallucinations never break the UI loop.</li>
             <li>Sandboxed API errors defensively to preserve system integrity offline.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>v1.6.0 (Phase 6: Edge Serialization & Semantic Matrices)</h2>
          <span className="tag" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', marginBottom: '1.5rem', display: 'inline-block' }}>Stable</span>
          
          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Major Features:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Hospital-Grade Electron Architecture:</strong> Completely wrapped the Vite application into an offline, `BrowserWindow`-sandboxed Electron instance, unlocking unrestricted Chromium processing memory.</li>
            <li><strong>Deep Semantic Embeddings:</strong> Intercepted the LLM Generative Pipeline to simultaneously ping models for High-Dimensional Vector Embeddings.</li>
            <li><strong>Semantic Topology Maps:</strong> Added dual-mode Matrix toggling ('Topology' vs 'Semantic') within KnowledgeGraphCanvas natively mapping euclidean matrices.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>v1.5.0 (Phase 5: Holographic Engines & Temporal Traversing)</h2>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '1.5rem', display: 'inline-block' }}>Stable</span>
          
          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Major Features:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Holographic Torso Visualization:</strong> Integrated @react-three/fiber processing interactive 3D human torso meshes mirroring specific pathologies.</li>
            <li><strong>Time-Scrubber Pipeline:</strong> Integrated idb-keyval (IndexedDB) to serialize structural twin snapshots chronologically, enabling users to seamlessly "Rewind" simulations.</li>
            <li><strong>Meta-Tuning Algorithms:</strong> Inserted MetaTuner edge-weighting overrides mapping localized AI overrides natively without retraining Python blocks.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>v1.4.0 (Phase 4: Deep Learning Edge Orchestration)</h2>
          <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', marginBottom: '1.5rem', display: 'inline-block' }}>Stable</span>
          
          <h3 style={{ marginTop: '1rem', color: '#94a3b8' }}>Major Features:</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>ONNX WebAssembly Engine:</strong> Shifted away from hardcoded survival formulas into an actual Transformer-Neural ODE hybridized AI inferencing mechanism executed directly on the Edge hardware.</li>
            <li><strong>Web Worker Parallelization:</strong> Farmed intense tensor mathematical threads entirely outside the UI execution context.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem', opacity: 0.8 }}>
          <h2 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>v1.3.0 - v1.0.0 (Phases 1-3: Foundations)</h2>
          <span className="tag" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', marginBottom: '1.5rem', display: 'inline-block' }}>Legacy Archive</span>
          <p style={{ color: '#cbd5e1' }}>
            Early deployments covering structural foundations (React/Zustand), integration of OpenAI/Gemini Generative endpoints, and formally hardcoding 20+ historical Clinical Evidence Matrix arrays bridging the base simulation loops.
          </p>
        </div>

      </div>
    </div>
  );
};
