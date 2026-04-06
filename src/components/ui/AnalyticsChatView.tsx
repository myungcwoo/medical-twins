import React, { useState, useMemo } from 'react';
import { LLMEngine, type AnalyticsConfig } from '../../simulation/LLMEngine';
import type { AgentState } from '../../simulation/Agent';
import { useSimulationStore } from '../../store/useSimulationStore';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    config?: AnalyticsConfig;
    error?: string;
}

export const AnalyticsChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // We bind directly to the Zustand store here so that updates flow contextually
    const agents = useSimulationStore((state: any) => state.agents as AgentState[]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const query = input;
        setInput('');

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const config = await LLMEngine.parseAnalyticsQuery(query);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: config.narrative,
                config
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "I couldn't process your request. Ensure LLM credentials are valid.",
                error: err instanceof Error ? err.message : String(err)
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(15, 23, 42, 0.8)', color: '#38bdf8', fontWeight: 'bold' }}>
                A.I. Analytics Center: Medical AI Twin Simulator
            </div>

            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                        Ask a question about the twin population (e.g. "Plot age vs health for patients on Semaglutide")
                    </div>
                )}
                
                {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                            background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${msg.role === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                            padding: '1rem', borderRadius: '8px', maxWidth: '80%', color: '#f8fafc' 
                        }}>
                            <div style={{ marginBottom: msg.config ? '1rem' : '0' }}>{msg.text}</div>
                            {msg.error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{msg.error}</div>}
                            
                            {msg.config && (
                                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', width: '100%', overflow: 'hidden' }}>
                                    <DataScientistChartRenderer config={msg.config} agents={agents} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div style={{ color: '#10b981', fontStyle: 'italic', fontSize: '0.9rem' }}>Data Scientist is compiling data...</div>
                )}
            </div>

            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Enter natural language query..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}
                />
            </div>
        </div>
    );
};

// Extracted Component to purely map JSON configs to Recharts deterministically
const DataScientistChartRenderer: React.FC<{ config: AnalyticsConfig, agents: AgentState[] }> = ({ config, agents }) => {
    
    const filteredData = useMemo(() => {
        let pool = agents.filter(a => !a.isDead);
        if (config.filterSubject && config.filterSubject !== 'ALL') {
             pool = pool.filter(a => {
                const query = config.filterSubject.toLowerCase();
                const hasMed = a.medications.some(m => m.toLowerCase().includes(query));
                const hasCond = a.chronicConditions.some(c => c.toLowerCase().includes(query));
                return hasMed || hasCond;
             });
        }
        return pool.map(a => ({
            age: a.age,
            baseHealth: a.baseHealth,
            stressLevel: a.stressLevel,
            bpSystolic: a.vitals.bpSystolic,
            a1c: a.labs.a1c,
            egfr: a.labs.egfr
        }));
    }, [agents, config.filterSubject]);

    if (filteredData.length === 0) {
        return <div style={{ color: 'var(--text-muted)' }}>No data found matching filter: {config.filterSubject}</div>;
    }

    const { chartType, xAxisMetric, yAxisMetric } = config;

    const renderChart = () => {
        switch (chartType) {
            case 'Scatter':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey={xAxisMetric} type="number" name={xAxisMetric} stroke="#94a3b8" />
                            <YAxis dataKey={yAxisMetric} type="number" name={yAxisMetric} stroke="#94a3b8" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} itemStyle={{ color: 'black' }} />
                            <Scatter name="Twins" data={filteredData} fill="#10b981" />
                        </ScatterChart>
                    </ResponsiveContainer>
                );
            case 'Bar':
            case 'Line':
                // For Bar/Line, we usually aggregate or just map sequentially if sorted. Let's sort by X.
                const sorted = [...filteredData].sort((a,b) => a[xAxisMetric] - b[xAxisMetric]);
                if (chartType === 'Bar') {
                    return (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={sorted.slice(0, 50)} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey={xAxisMetric} stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip itemStyle={{ color: 'black' }} />
                                <Bar dataKey={yAxisMetric} fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    );
                } else {
                    return (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sorted} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey={xAxisMetric} stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip itemStyle={{ color: 'black' }} />
                                <Line type="monotone" dataKey={yAxisMetric} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    );
                }
            case 'Pie':
                // Pie implies aggregation. We'll aggregate by XAxis (bucketed).
                const buckets: Record<string, number> = {};
                filteredData.forEach((d: any) => {
                    const key = Math.floor(d[xAxisMetric] / 10) * 10;
                    buckets[`${key}-${key+9}`] = (buckets[`${key}-${key+9}`] || 0) + 1;
                });
                const pieData = Object.entries(buckets).map(([k,v]) => ({ name: k, value: v }));
                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ef4444'];
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip itemStyle={{ color: 'black' }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return <div>Unsupported Chart Type</div>;
        }
    };

    return (
        <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                X: {xAxisMetric.toUpperCase()} | Y: {yAxisMetric.toUpperCase()} | FILTER: {config.filterSubject.toUpperCase()} | {filteredData.length} Agents
            </div>
            {renderChart()}
        </div>
    );
};
