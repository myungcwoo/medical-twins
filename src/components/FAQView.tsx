import type { FC } from 'react';

export const FAQView: FC = () => {
  return (
    <div className="explanation-container glass-panel" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', overflowY: 'auto', maxHeight: '100%' }}>
      <h2 style={{ color: '#a78bfa', marginBottom: '1.5rem', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '0.5rem', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>Comprehensive Technical FAQ</h2>
      <p style={{ color: '#e2e8f0', lineHeight: 1.6, fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '800px' }}>
        This document serves as the master deep-dive reference for the Clinical AI Studio architecture and the Medical Digital Twins deployment. It details exactly how Deep Learning (PyTorch), Generative AI (LLMs), and progressive web routing coalesce to form a functional Agent-Based Model (ABM).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* Section 1: Concept & Vision */}
        <section>
            <h3 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '0.5rem' }}>🟢 Concept & Core Vision</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>What is the &quot;Medical Digital Twins Sandbox&quot;?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    It is an advanced Agent-Based Modeling (ABM) system built in React. Rather than viewing flat statistics, it mathematically simulates the biological decay of massive digital patient cohorts frame-by-frame across several decades. Researchers can actively inject hypothetical Generative AI protocols and visually measure survival deltas.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>Why are SDoH (Social Determinants of Health) weighted so heavily?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Standard models assume humans are biologically isolated. Our clones track metrics like Food Desert status and Income Percentiles. If an AI generates an incredibly expensive prescription protocol, a low-income clone natively rejects it due to built-in Medical Compliance friction, forcing the Gen-AI to re-think cost-effective treatments.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>Are real patient data points used in this tracking?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    <strong>Absolutely Not.</strong> The ecosystem relies 100% on synthetic data generation. This prevents HIPAA infractions. While the PyTorch backend trains on realistic biomedical associations (e.g., High BMI + High A1C = Diabetes), the actual entities walking through your simulation are mathematically generated ghosts.
                </p>
            </div>
        </section>

        {/* Section 2: Edge Inference */}
        <section>
            <h3 style={{ color: '#f59e0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '0.5rem' }}>🧠 Edge Inference (WASM)</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the Edge ONNX module outperform traditional REST APIs?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    If 100 agents querying a remote datacenter endpoint 50 times a second occurred over standard networks, it would bottleneck the Chrome browser completely. By converting neural tensor models to an `.onnx` graph and mapping it into WebAssembly (`wasm32`), we achieve sub-millisecond, zero-latency inference directly on your local CPU without touching the internet.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How are edge ML models trained?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    The entire model training pipeline operates through the standalone `TrainingDashboard.tsx` UI via `TrainingEngine.ts`. It acts as an Empirical Hazard normalizer by cross-referencing massive unstructured Real-World Data (RWD) chronologies like Medical Claims and Labs, directly extracting predictive model weights totally locally within your browser!
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>What specifies a &quot;Critical Event&quot;?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    At every tick, the inference array spits out normalized probability thresholds. If `stroke_risk` or `chf_risk` eclipses severe local boundaries, the Agent registers a &quot;Mortality Event&quot;—triggering either instant death (shutting off their physics processing) or an emergency dispatch to the LLM Knowledge Network.
                </p>
            </div>
        </section>

        {/* Section 3: Gen-AI & RAG */}
        <section>
            <h3 style={{ color: '#3b82f6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '0.5rem' }}>🌐 Generative Knowledge (LLMs/RAG)</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the RAG barrier stop LLM Hallucinations?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Raw LLMs guess tokens, which is fatal in medical architectures. The `LLMEngine.ts` injects a rigorous System Prompt (Retrieval-Augmented Generation context) forcing the AI to strictly anchor claims against American Heart Association (AHA) and CDC standard practice bounds, explicitly denying theoretical &quot;crystal healing&quot; or unverified pharmacological suggestions.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the clinical generator fetch trials?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Generative models only know data up to their cut-off date. To bypass this, the browser leverages `LLMEngine.ts` to seamlessly generate authentic clinical JSON schemas natively within the active RAG sandbox. The AI agent acts strictly as an architectural literature synthesizer directly embedded in the React UI!
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does &quot;Protocol Dispersion&quot; work?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    When one agent is dying, it pulls an intervention from the LLM. If the intervention successfully lowers their biometric risk during the following ticks, the protocol is mathematically broadcasted across the WebGL graph to structurally identical agents (Paired Twins), actively mapping how peer-to-peer survival strategies execute in real life.
                </p>
            </div>
        </section>

        {/* Section 4: Web UI & Aesthetics */}
        <section>
            <h3 style={{ color: '#ec4899', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(236, 72, 153, 0.2)', paddingBottom: '0.5rem' }}>🖥️ Cybernetic UI & Mobile Rendering</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ec4899', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the WebGL graph prevent browser meltdown?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Instead of updating standard HTML elements for 100 moving nodes, the Knowledge Dispersion network is rendered via `react-force-graph-2d`. It natively routes the node trajectory calculations straight to an HTML5 &lt;canvas&gt;, bypassing the harsh DOM layout recalculations standard React components demand.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ec4899', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the UI physically adapt to Mobile PWAs?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Using intensive CSS `@media` querying, the application avoids horizontal overflow on phones. The massive Desktop Sidebar structurally detaches and locks as a fixed Bottom Nav menu on mobile. Simultaneously, the Floating Time Island maps cleanly to the absolute top of the screen to give your thumbs zero-friction access.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>Why are Autopsy Modals absolute overlays?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Longitudinal SVG Line Charts created by `recharts` require massive horizontal pixel space to display age-curves logically. Rather than squeezing them into a right-hand sidebar, clicking an agent generates an opaque Dark-Glass focal blur across the rest of the application, rendering a beautiful full-screen modal without tearing the user out of the active dashboard!
                </p>
            </div>
        </section>

        {/* Section 5: Persistence */}
        <section>
            <h3 style={{ color: '#a855f7', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '0.5rem' }}>💾 State Management & Ticks</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #a855f7', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>What exactly defines a chronological &quot;Tick&quot;?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Because Medical Biology moves relatively slowly, the global clock processes time using &quot;Weeks&quot;. Therefore, 52 Ticks equals exactly One Year of simulated human exposure to systemic risk bounds.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #a855f7', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>How does the IndexedDB Database Engine work?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    If you crash your browser containing 50 years of telemetry, doing it via a cloud-database like Firestore would be incredibly expensive to persist locally every 5 seconds. `DatabaseEngine.ts` bridges standard browser IndexedDB APIs, dumping the massive `AgentArray[]` into flat browser cache asynchronously without halting the main thread.
                </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.05rem' }}>What if I hit &quot;Reset&quot; on the terminated simulation screen?</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    Hitting Reset explicitly executes an override inside `DatabaseEngine.ts` to clear the `MedicalTwinsDB` snapshot payload to NULL. When the application forces a hard-reload upon reset, it initializes entirely fresh randomly-generated Agents rather than pulling your terminated population out of cache memory!
                </p>
            </div>
        </section>

      </div>
    </div>
  );
};
