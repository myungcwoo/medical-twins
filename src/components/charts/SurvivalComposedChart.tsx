import type { FC } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
    chartMode: 'Health' | 'BP' | 'A1c' | 'Stress' | 'Survival';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
}

export const SurvivalComposedChart: FC<ChartProps> = ({ chartMode, data }) => {
    let ylabel = "Base Health (%)";
    let dMeanC = "cH_mean", dRangeC = "cH_range";
    let dMeanO = "oH_mean", dRangeO = "oH_range";
    let domain = [0, 100];
    
    if (chartMode === 'BP') {
        ylabel = "Systolic Blood Pressure (mmHg)";
        dMeanC = "cBP_mean"; dRangeC = "cBP_range";
        dMeanO = "oBP_mean"; dRangeO = "oBP_range";
        domain = [90, 220];
    } else if (chartMode === 'A1c') {
        ylabel = "A1c Level (%)";
        dMeanC = "cA1c_mean"; dRangeC = "cA1c_range";
        dMeanO = "oA1c_mean"; dRangeO = "oA1c_range";
        domain = [4, 15];
    } else if (chartMode === 'Stress') {
        ylabel = "Daily Stress Threshold";
        dMeanC = "cS_mean"; dRangeC = "cS_range";
        dMeanO = "oS_mean"; dRangeO = "oS_range";
        domain = [0, 100];
    }
    
    if (chartMode === 'Survival') {
        return (
            <ResponsiveContainer width="100%" height={450}>
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: 'Survival (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' } }} />
                <Tooltip 
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                    labelFormatter={(label) => `Patient Age: ${Math.floor(Number(label))}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                <Line type="stepAfter" dataKey="cSurv" name="Control Survival %" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="oSurv" name="Optimized Survival %" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                </ComposedChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
            <YAxis domain={domain} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: ylabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' } }} />
            <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                labelFormatter={(label) => `Patient Age: ${Math.floor(Number(label))}`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Area type="monotone" dataKey={dRangeC} name={`Control ${ylabel} Bound`} fill="#f59e0b" stroke="none" fillOpacity={0.15} isAnimationActive={false} />
            <Line type="monotone" dataKey={dMeanC} name={`Control Mean ${ylabel}`} stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
            
            <Area type="monotone" dataKey={dRangeO} name={`Optimized ${ylabel} Bound`} fill="#10b981" stroke="none" fillOpacity={0.2} isAnimationActive={false} />
            <Line type="monotone" dataKey={dMeanO} name={`Optimized Mean ${ylabel}`} stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
        </ComposedChart>
        </ResponsiveContainer>
    );
};
