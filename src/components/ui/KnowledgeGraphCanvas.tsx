import React, { useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { AgentState } from '../../types/Simulation.types';
import { KnowledgeBase } from '../../simulation/KnowledgeNetwork';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface KnowledgeGraphProps {
   agents: AgentState[];
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   liveGraphData: any;
   isFastForwarding: boolean;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   hoverNode: any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   setHoverNode: (node: any) => void;
   onSelectAgent: (id: string) => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   graphRef: any;
   getHealthColor: (health: number) => string;
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphProps> = ({
    agents,
    liveGraphData,
    isFastForwarding,
    hoverNode,
    setHoverNode,
    onSelectAgent,
    graphRef,
    getHealthColor
}) => {
    const [mode, setMode] = useState<'Topology' | 'Semantic'>('Topology');

    const semanticGraphData = useMemo(() => {
        if (mode !== 'Semantic') return null;

        const uniqueTemplates = new Map();
        KnowledgeBase.broadcasts.forEach(b => {
            if (!uniqueTemplates.has(b.template.id)) {
                uniqueTemplates.set(b.template.id, { ...b.template, adoptCount: 1 });
            } else {
                uniqueTemplates.get(b.template.id).adoptCount++;
            }
        });

        const semanticNodes = Array.from(uniqueTemplates.values()).map(t => ({
            id: t.id,
            title: t.title,
            type: t.type,
            source: t.source,
            adoptCount: t.adoptCount,
            embedding: t.embedding,
            isSemantic: true
        }));

        const semanticLinks = [];
        for (let i = 0; i < semanticNodes.length; i++) {
            for (let j = i + 1; j < semanticNodes.length; j++) {
                const e1 = semanticNodes[i].embedding;
                const e2 = semanticNodes[j].embedding;
                if (e1 && e2) {
                    let dotProduct = 0;
                    for (let k = 0; k < Math.min(e1.length, e2.length); k++) {
                        dotProduct += e1[k] * e2[k];
                    }
                    if (dotProduct > 0.8) { 
                        semanticLinks.push({ source: semanticNodes[i].id, target: semanticNodes[j].id, value: dotProduct });
                    }
                }
            }
        }

        return { nodes: semanticNodes, links: semanticLinks };
    }, [mode, KnowledgeBase.broadcasts.length]);

    const activeGraphData = mode === 'Semantic' ? semanticGraphData : liveGraphData;

    return (
        <div style={{ flexShrink: 0, width: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)', position: 'relative', background: '#000' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', background: 'rgba(0,0,0,0.8)' }}>
                <button 
                    onClick={() => setMode('Topology')}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: mode === 'Topology' ? 'rgba(139, 92, 246, 0.4)' : 'transparent', color: mode === 'Topology' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Topology
                </button>
                <button 
                    onClick={() => setMode('Semantic')}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: mode === 'Semantic' ? 'rgba(16, 185, 129, 0.4)' : 'transparent', color: mode === 'Semantic' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Semantic
                </button>
            </div>
            {isFastForwarding ? (
                <div style={{ width: '280px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginTop: '1.5rem', fontSize: '1rem', letterSpacing: '0.05em' }}>COMPUTING DATA</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', padding: '0 1rem' }}>
                        Topology mapping suspended during Fast-Forward.
                    </div>
                </div>
            ) : (
                <ForceGraph2D 
                ref={graphRef}
                width={280}
                height={280}
                backgroundColor="#000000"
                graphData={activeGraphData}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeVal={(node: any) => {
                    if (mode === 'Semantic') return Math.max(2, node.adoptCount || 2);
                    return Math.max(0.5, (node.health || 50) / 40);
                }}
                nodeRelSize={3}
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodePointerAreaPaint={(node: any, color: any, ctx: any) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                    ctx.fill();
                }}
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeColor={(node: any) => {
                    if (mode === 'Semantic') {
                        if (hoverNode && node.id === hoverNode.id) return '#10b981';
                        return node.type === 'Clinical' ? '#3b82f6' : '#f59e0b';
                    }

                    if (hoverNode) {
                        if (node === hoverNode) return '#fbbf24'; 
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const isConnected = liveGraphData.links.some((l: any) => 
                            (l.source.id === node.id && l.target.id === hoverNode.id) || 
                            (l.target.id === node.id && l.source.id === hoverNode.id) ||
                            (l.source === node.id && l.target === hoverNode.id) || 
                            (l.target === node.id && l.source === hoverNode.id)
                        );
                        
                        if (isConnected) return '#f472b6'; 
                        return 'rgba(255, 255, 255, 0.05)'; 
                    }
                    return node.isDead ? 'rgba(239, 68, 68, 0.4)' : '#3b82f6';
                }}
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkColor={(link: any) => {
                    if (hoverNode) {
                        const isLinkActive = (link.source.id === hoverNode.id || link.target.id === hoverNode.id) ||
                                                (link.source === hoverNode.id || link.target === hoverNode.id);
                        return isLinkActive ? 'rgba(244, 114, 182, 0.8)' : 'rgba(255, 255, 255, 0.02)';
                    }
                    return 'rgba(139, 92, 246, 0.2)';
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkWidth={(link: any) => {
                    if (hoverNode) {
                        const isLinkActive = (link.source.id === hoverNode.id || link.target.id === hoverNode.id) ||
                                                (link.source === hoverNode.id || link.target === hoverNode.id);
                        return isLinkActive ? 2 : 1;
                    }
                    return 1;
                }}
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nodeLabel={(node: any) => {
                    if (mode === 'Semantic') {
                        return `
                            <div style="background: rgba(15, 23, 42, 0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3); font-family: Inter, sans-serif; pointer-events: none;">
                                <div style="color: #10b981; font-weight: bold; font-size: 0.9rem; margin-bottom: 4px;">${node.title || 'Untitled Protocol'}</div>
                                <div style="color: #94a3b8; font-size: 0.75rem;">Source: ${node.source}</div>
                                <div style="margin-top: 4px; font-size: 0.8rem; color: #e2e8f0;">Adoption Rate: ${node.adoptCount} Agent(s)</div>
                            </div>
                        `;
                    }

                    const live = agents.find(a => a.id === node.id);
                    if (!live) return '';
                    return `
                        <div style="background: rgba(15, 23, 42, 0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.3); font-family: Inter, sans-serif; pointer-events: none; backdrop-filter: blur(4px);">
                        <div style="color: #60a5fa; font-weight: bold; font-size: 0.9rem; margin-bottom: 4px;">${live.name}</div>
                        <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">${live.role}</div>
                        <div style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                            <div><span style="color: #94a3b8">Health:</span> <span style="color: ${getHealthColor(live.baseHealth)}">${live.baseHealth.toFixed(1)}</span></div>
                            <div><span style="color: #94a3b8">Network:</span> <span style="color: white">${(live.networkConnections || []).length} connections</span></div>
                        </div>
                        ${live.isDead ? '<div style="color: #ef4444; font-size: 0.7rem; margin-top: 4px; font-weight: bold;">TERMINATED</div>' : ''}
                        </div>
                    `;
                }}
                
                onNodeHover={(node) => setHoverNode(node)}
                onNodeClick={(node) => {
                    if (mode === 'Topology') onSelectAgent(node.id);
                }}
                
                onEngineStop={() => {
                    if (liveGraphData && liveGraphData.nodes) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        liveGraphData.nodes.forEach((node: any) => {
                            if (node.x !== undefined && node.y !== undefined) {
                                node.fx = node.x;
                                node.fy = node.y;
                            }
                        });
                    }
                }}
                />
            )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Knowledge Dispersion Graph</div>
        </div>
        </div>
    )
}
