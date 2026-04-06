import React, { useState, useEffect } from 'react';
import { Network, Server, Wifi, Radio, XOctagon } from 'lucide-react';
import { FederationEngine } from '../simulation/FederationEngine';
import type { FederationStatus } from '../simulation/FederationEngine';

export const FederationPanel: React.FC = () => {
    const [status, setStatus] = useState<FederationStatus>('offline');
    const [peerId, setPeerId] = useState<string>('');
    const [joinInput, setJoinInput] = useState<string>('');

    useEffect(() => {
        const unsub = FederationEngine.subscribe((s, id) => {
            setStatus(s);
            if (id) setPeerId(id);
        });
        return () => { unsub(); };
    }, []);

    const renderOffline = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <button
                onClick={() => FederationEngine.hostSession()}
                style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
                <Server size={18} /> Host Deep Learning Lobby
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={joinInput}
                    onChange={e => setJoinInput(e.target.value)}
                    placeholder="Enter Remote Peer ID"
                    style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '4px' }}
                />
                <button
                    onClick={() => FederationEngine.joinSession(joinInput)}
                    disabled={!joinInput}
                    style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: joinInput ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Network size={18} /> Join
                </button>
            </div>
        </div>
    );

    const renderActive = () => (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', border: `1px solid ${status === 'hosting' ? '#ec4899' : '#10b981'}`, marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: status === 'hosting' ? '#ec4899' : '#10b981' }}>
                    <Radio size={18} />
                    <strong style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {status === 'hosting' ? 'Awaiting P2P Link...' : 'Datalink Established'}
                    </strong>
                </div>
                <button
                    onClick={() => FederationEngine.terminate()}
                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                >
                    <XOctagon size={14} /> Sever
                </button>
            </div>
            
            <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR SECURE PEER IDENTIFIER:</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '0.3rem' }}>
                    <code style={{ color: '#fff', fontSize: '0.85rem' }}>{peerId}</code>
                    <button 
                        onClick={() => navigator.clipboard.writeText(peerId)}
                        style={{ background: '#334155', border: 'none', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                        Copy
                    </button>
                </div>
            </div>
            {status === 'hosting' && (
                <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    Give this ID to a second researcher. Once they connect, AI-generated protocols will automatically sync across both your browsers!
                </p>
            )}
        </div>
    );

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                <Wifi size={20} color="#a855f7" /> WebRTC Telemetry Pool
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Bypass centralized REST nodes. Broadcast your active clinical protocols directly to other Digital Twin instances across the globe.
            </p>
            
            {status === 'offline' ? renderOffline() : renderActive()}
        </div>
    );
};
