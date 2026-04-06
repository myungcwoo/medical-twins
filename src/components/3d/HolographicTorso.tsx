import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { AgentState } from '../../simulation/Agent';

interface OrganProps {
  agent: AgentState;
  position: [number, number, number];
  type: 'brain' | 'heart' | 'kidneyL' | 'kidneyR';
}

const OrganMesh: React.FC<OrganProps> = ({ agent, position, type }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Derive biological degradation flags
  const hasStroke = agent.chronicConditions.includes('Stroke') || agent.chronicConditions.includes('Dementia');
  const hasChf = agent.chronicConditions.includes('CHF');
  const hasCkd = agent.chronicConditions.includes('CKD Progression') || agent.labs.egfr < 60;
  
  // Base metrics mapping
  const hrScalar = (agent.vitals.bpSystolic || 120) / 100;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Animate heart
    if (type === 'heart') {
        const beat = Math.sin(state.clock.elapsedTime * 5 * hrScalar);
        // Ventricle dilation if CHF
        const scaleBase = hasChf ? 1.4 : 1.0;
        meshRef.current.scale.setScalar(scaleBase + (beat * 0.05));
    }

    if (type === 'brain') {
        // Brain slight rotation
        meshRef.current.rotation.y += delta * 0.5;
        // Stroke/Dementia causes physical shrinkage
        if (hasStroke) meshRef.current.scale.setScalar(0.85);
    }
  });

  const getOrganColor = () => {
      if (agent.isDead) return '#333333';
      switch (type) {
          case 'brain': return hasStroke ? '#ef4444' : '#60a5fa'; // Red if stroke, Blue if healthy
          case 'heart': return hasChf ? '#ef4444' : '#f43f5e'; // Deep Red if CHF, pink healthy
          case 'kidneyL':
          case 'kidneyR': return hasCkd ? '#f59e0b' : '#34d399'; // Amber if CKD, Green healthy
          default: return '#ffffff';
      }
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      {type === 'brain' ? (
          <Sphere args={[0.5, 32, 32]} position={position} ref={meshRef}>
             <MeshTransmissionMaterial transmission={0.9} thickness={0.5} color={getOrganColor()} emissive={getOrganColor()} emissiveIntensity={hasStroke ? 2 : 0.5} roughness={0.2} clearcoat={1} />
          </Sphere>
      ) : type === 'heart' ? (
          <Sphere args={[0.3, 32, 32]} position={position} ref={meshRef}>
             <MeshTransmissionMaterial transmission={0.8} color={getOrganColor()} emissive={getOrganColor()} emissiveIntensity={hasChf ? 2 : 0.8} />
          </Sphere>
      ) : (
          <Box args={[0.2, 0.4, 0.2]} position={position} ref={meshRef}>
             <MeshTransmissionMaterial transmission={0.6} color={getOrganColor()} emissive={getOrganColor()} emissiveIntensity={hasCkd ? 1.5 : 0.4} />
          </Box>
      )}
    </Float>
  );
};

export const HolographicTorso: React.FC<{ agent: AgentState }> = ({ agent }) => {
  return (
    <div style={{ width: '100%', height: '350px', background: 'radial-gradient(circle at center, rgba(30,58,138,0.2) 0%, rgba(0,0,0,0.8) 100%)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', position: 'relative', overflow: 'hidden' }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={2} />
            
            <group position={[0, -0.5, 0]}>
                {/* Brain */}
                <OrganMesh agent={agent} position={[0, 2, 0]} type="brain" />
                
                {/* Heart */}
                <OrganMesh agent={agent} position={[-0.2, 0.7, 0.2]} type="heart" />
                
                {/* Kidneys */}
                <OrganMesh agent={agent} position={[-0.4, 0, -0.3]} type="kidneyL" />
                <OrganMesh agent={agent} position={[0.4, 0, -0.3]} type="kidneyR" />
                
                <gridHelper args={[10, 20, '#3b82f6', '#1e3a8a']} position={[0, -1.5, 0]} />
            </group>
            
            <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
        
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', pointerEvents: 'none' }}>
           <h3 style={{ margin: 0, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1rem' }}>Biological Hologram</h3>
           <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem' }}>ID: {agent.id.substring(0,8)}</div>
        </div>
        
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', pointerEvents: 'none', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
           <div style={{ color: agent.isDead ? '#ef4444' : '#34d399', fontWeight: 'bold' }}>{agent.isDead ? 'CRITICAL FAILURE' : 'SYSTEMS ACTIVE'}</div>
           <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Vital Integrity: {agent.baseHealth.toFixed(1)}%</div>
        </div>
    </div>
  );
};
