import { useState } from 'react';
import type { FC } from 'react';

export const BackendTrainer: FC = () => {
    const [apiUrl, setApiUrl] = useState('http://localhost:8000/train');
    const [payload, setPayload] = useState<any>(null);
    const [log, setLog] = useState<string[]>(['[DEV] Ready to feed JSON payloads to local PyTorch Model.']);
    const [isTraining, setIsTraining] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLog(prev => [`[${new Date().toLocaleTimeString()}] Parsing payload: ${file.name}...`, ...prev]);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const raw = JSON.parse(event.target?.result as string);
                setPayload(raw);
                setLog(prev => [`[${new Date().toLocaleTimeString()}] Successfully parsed ${Array.isArray(raw) ? raw.length : 1} records. Ready to transmit.`, ...prev]);
            } catch (error: any) {
                setLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: Invalid JSON file.`, ...prev]);
            }
        };
        reader.readAsText(file);
    };

    const handleMockGeneration = () => {
        setLog(prev => [`[${new Date().toLocaleTimeString()}] Generating mock trajectory...`, ...prev]);
        const mockData = {
            patient_id: crypto.randomUUID(),
            sequence_length: 15,
            conditions: ['Hypertension', 'Diabetes'],
            vitals: { hr: 80, bp: '120/80', a1c: 7.2 }
        };
        setPayload(mockData);
        setLog(prev => [`[${new Date().toLocaleTimeString()}] Bound mock trajectory payload to buffer.`, ...prev]);
    }

    const triggerTraining = async () => {
        if (!payload) return;
        setIsTraining(true);
        setLog(prev => [`[${new Date().toLocaleTimeString()}] POST request initiating to ${apiUrl}...`, ...prev]);
        
        try {
            // For now, since the Python API might not be running, we will try to fetch and catch
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const data = await response.json();
                setLog(prev => [`[${new Date().toLocaleTimeString()}] SUCCESS: ${JSON.stringify(data)}`, ...prev]);
            } else {
                setLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: PyTorch API replied with status ${response.status}`, ...prev]);
            }
        } catch (e: any) {
            setLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: Network Error. Is the Python backend running at ${apiUrl}? (${e.message})`, ...prev]);
        } finally {
            setIsTraining(false);
        }
    };

    if (!import.meta.env.DEV) return null; // Failsafe for production

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', border: '1px solid rgba(236, 72, 153, 0.4)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(236, 72, 153, 0.2)', paddingBottom: '1rem' }}>
             <div>
                <h2 style={{ color: '#ec4899', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span role="img" aria-label="tools">🛠️</span> Deep DL Training UI [DEV ONLY]
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                    Send payloads (telemetry / EHR events) directly into the Python PyTorch training loop. 
                    This UI is automatically stripped in production build pipelines via Vite ENV.
                </p>
             </div>
             <div>
                <span style={{ background: '#ec4899', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DEV_MODE: ACTIVE</span>
             </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px' }}>
                    <h4 style={{ color: '#f8fafc', margin: '0 0 0.8rem 0' }}>Data Injection</h4>
                    <label style={{ display: 'inline-block', background: 'transparent', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(96, 165, 250, 0.4)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Upload Real-Time JSON Payload
                        <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <br />
                    <button onClick={handleMockGeneration} style={{ background: 'transparent', color: '#a78bfa', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(167, 139, 250, 0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Generate Mock Telemetry
                    </button>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px' }}>
                    <h4 style={{ color: '#f8fafc', margin: '0 0 0.8rem 0' }}>API Configuration</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Python PyTorch Target URL:</label>
                        <input 
                            type="text" 
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}
                        />
                        <button 
                            disabled={!payload || isTraining}
                            onClick={triggerTraining}
                            style={{ 
                                marginTop: '0.8rem', 
                                padding: '0.8rem', 
                                background: (!payload || isTraining) ? '#4b5563' : '#ec4899', 
                                color: 'white', 
                                fontWeight: 'bold', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: (!payload || isTraining) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isTraining ? 'Transmitting...' : 'Post Payload to Model Trajectory'}
                        </button>
                    </div>
                </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'stretch' }}>
               <div>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>Data Stream</h4>
                  <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', height: '250px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      {log.map((l, i) => (
                          <div key={i} style={{ marginBottom: '0.5rem' }}>&gt; {l}</div>
                      ))}
                  </div>
               </div>
               
               <div>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>Neural Graphical Engine</h4>
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '8px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      {isTraining ? (
                         <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                             {/* Mock Transformer Animation */}
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 {[1,2,3,4].map(n => <div key={n} style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#ec4899', animation: `pulseGlow ${0.5 + (n*0.2)}s infinite alternate` }} />)}
                             </div>
                             
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#ec4899' }}>
                                 <div style={{ borderBottom: '2px solid #ec4899', width: '80px', animation: 'flowRight 1s infinite linear' }}></div>
                                 <div style={{ borderBottom: '2px solid #ec4899', width: '80px', animation: 'flowRight 1s infinite linear reverse' }}></div>
                             </div>
                             
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                 {[1,2].map(n => <div key={n} style={{ width: '40px', height: '40px', background: '#8b5cf6', borderRadius: '8px', border: '2px solid #c4b5fd', animation: `pulseGlow ${1 + (n*0.5)}s infinite alternate` }} />)}
                             </div>
                             
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#8b5cf6' }}>
                                 <div style={{ borderBottom: '2px solid #8b5cf6', width: '80px', animation: 'flowRight 1s infinite linear' }}></div>
                             </div>
                             
                             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--health-good)', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', animation: 'pulseGlow 2s infinite' }}>
                                🧠
                             </div>
                         </div>
                      ) : (
                         <span style={{ color: 'var(--text-muted)' }}>Idle. Feed PyTorch Payload to engage.</span>
                      )}
                  </div>
               </div>
           </div>
        </div>
    );
};
