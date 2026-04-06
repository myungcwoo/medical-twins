import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ChartData {
    tick: number;
    year: number;
    age: number;
    health?: number | null;
    bp?: number | null;
    a1c?: number | null;
    controlHealth?: number | null;
    optHealth?: number | null;
    controlBP?: number | null;
    optBP?: number | null;
    controlA1c?: number | null;
    optA1c?: number | null;
}

interface Props {
    chartData: ChartData[];
    isPaired: boolean;
}

export const ComparativeLineChart: React.FC<Props> = ({ chartData, isPaired }) => {
    const [chartMetric, setChartMetric] = useState<'Health' | 'BP' | 'A1C'>('Health');
    
    if (chartData.length === 0) return null;

    return (
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem', marginTop: '2rem', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.3rem' }}>Deep-Dive Biological Output Trajectory</h3>
                <select 
                    value={chartMetric} 
                    onChange={e => setChartMetric(e.target.value as 'Health' | 'BP' | 'A1C')}
                    style={{ background: 'rgba(15, 23, 42, 0.9)', color: 'white', border: '1px solid #3b82f6', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="Health">Overall Health % Axis</option>
                    <option value="BP">Systolic BP (Hypertension) Axis</option>
                    <option value="A1C">HbA1c (Glycemic) Axis</option>
                </select>
            </div>
            
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
                    <YAxis 
                        domain={chartMetric === 'Health' ? [0, 100] : chartMetric === 'BP' ? [90, 220] : [4.0, 15.0]} 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                        labelFormatter={(label) => `Age: ${Math.floor(Number(label))}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {isPaired ? (
                        <>
                        {chartMetric === 'Health' && (
                            <>
                                <Line type="monotone" dataKey="controlHealth" name="Control Health %" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="optHealth" name="Optimized Health %" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                            </>
                        )}
                        {chartMetric === 'BP' && (
                            <>
                                <Line type="monotone" dataKey="controlBP" name="Control Systolic BP" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="optBP" name="Optimized Systolic BP" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                            </>
                        )}
                        {chartMetric === 'A1C' && (
                            <>
                                <Line type="monotone" dataKey="controlA1c" name="Control HbA1c" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="optA1c" name="Optimized HbA1c" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                            </>
                        )}
                        </>
                    ) : (
                        <>
                            {chartMetric === 'Health' && <Line type="monotone" dataKey="health" name="Base Health %" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />}
                            {chartMetric === 'BP' && <Line type="monotone" dataKey="bp" name="Systolic BP" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />}
                            {chartMetric === 'A1C' && <Line type="monotone" dataKey="a1c" name="HbA1c" stroke="#a855f7" strokeWidth={3} dot={false} isAnimationActive={false} />}
                        </>
                    )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
