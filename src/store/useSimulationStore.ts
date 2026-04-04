import { create } from 'zustand';
import type { AgentState } from '../simulation/Agent';
import type { PhysicsModel } from '../simulation/Pharmacokinetics';

export const simulationWorker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), { type: 'module' });

// Add the top level listener to intercept SAVE_PAYLOAD_READY
simulationWorker.addEventListener('message', (e) => {
   if (e.data.type === 'SAVE_PAYLOAD_READY') {
      const payload = e.data.payload;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical_twins_sim_export_week_${payload.simulationEndTick}.json`;
      a.click();
      URL.revokeObjectURL(url);
   }
});

interface SimulationState {
  agents: AgentState[];
  customTwins: AgentState[];
  ticks: number;
  customTicks: number;
  
  isRunning: boolean;
  isCustomRunning: boolean;
  isCustomEnded: boolean;
  isEnded: boolean;
  
  fastForwardYears: number;
  autoResume: boolean;
  isFastForwarding: boolean;
  isCustomFastForwarding: boolean;
  
  physicsMode: PhysicsModel;

  // Actions
  setAgents: (agents: AgentState[]) => void;
  setCustomTwins: (twins: AgentState[]) => void;
  setTicks: (ticks: number) => void;
  setCustomTicks: (ticks: number) => void;
  setIsRunning: (running: boolean) => void;
  setIsCustomRunning: (running: boolean) => void;
  setIsCustomEnded: (ended: boolean) => void;
  setIsEnded: (ended: boolean) => void;
  setFastForwardYears: (years: number) => void;
  setAutoResume: (resume: boolean) => void;
  setIsFastForwarding: (ff: boolean) => void;
  setIsCustomFastForwarding: (ff: boolean) => void;
  setPhysicsMode: (mode: PhysicsModel) => void;
  
  handleFastForward: () => void;
  handleCustomFastForward: (years: number) => void;
  handleReset: () => Promise<void>;
  handleStartCustomTrial: (rawPayload: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>, selectedProtocols: any[]) => void;
  handleSaveSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  agents: [],
  customTwins: [],
  ticks: 0,
  customTicks: 0,
  
  isRunning: false,
  isCustomRunning: false,
  isCustomEnded: false,
  isEnded: false,
  
  fastForwardYears: 5,
  autoResume: true,
  isFastForwarding: false,
  isCustomFastForwarding: false,
  
  physicsMode: 'Linear',

  setAgents: (agents) => set({ agents }),
  setCustomTwins: (customTwins) => set({ customTwins }),
  setTicks: (ticks) => set({ ticks }),
  setCustomTicks: (customTicks) => set({ customTicks }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsCustomRunning: (isCustomRunning) => set({ isCustomRunning }),
  setIsCustomEnded: (isCustomEnded) => set({ isCustomEnded }),
  setIsEnded: (isEnded) => set({ isEnded }),
  setFastForwardYears: (fastForwardYears) => set({ fastForwardYears }),
  setAutoResume: (autoResume) => set({ autoResume }),
  setIsFastForwarding: (isFastForwarding) => set({ isFastForwarding }),
  setIsCustomFastForwarding: (isCustomFastForwarding) => set({ isCustomFastForwarding }),
  setPhysicsMode: (physicsMode) => set({ physicsMode }),

  handleFastForward: () => {
    const { fastForwardYears } = get();
    set({ isRunning: false, isFastForwarding: true });
    simulationWorker.postMessage({ type: 'FAST_FORWARD', payload: { years: fastForwardYears } });
  },

  handleCustomFastForward: (years) => {
    set({ isCustomRunning: false, isCustomFastForwarding: true });
    simulationWorker.postMessage({ type: 'FAST_FORWARD_CUSTOM', payload: { years } });
  },

  handleReset: async () => {
    if (window.confirm("Are you sure you want to reset the entire Sandbox? All biological data arrays and Network feed protocols will be permanently wiped.")) {
      set({
        agents: [],
        customTwins: [],
        ticks: 0,
        isEnded: false,
        isRunning: false,
        isCustomRunning: false,
        isCustomEnded: false,
      });
      simulationWorker.postMessage({ type: 'RESET' });
    }
  },

  handleStartCustomTrial: (rawPayload, selectedProtocols) => {
    const allPayloads = [];
    const baseTwinParams = { ...rawPayload, memory: [] };

    for (let c = 0; c < 50; c++) {
      allPayloads.push({
        ...baseTwinParams,
        id: crypto.randomUUID(),
        name: `${rawPayload.name} (Control ${c+1})`,
        comparativeGroup: 'Control'
      });
      
      allPayloads.push({
        ...baseTwinParams,
        id: crypto.randomUUID(),
        name: `${rawPayload.name} (Optimized ${c+1})`,
        comparativeGroup: 'Intervention'
      });
    }

    simulationWorker.postMessage({
        type: 'INIT_CUSTOM_ENGINE',
        payload: { agents: allPayloads, selectedProtocols }
    });

    set({
      isCustomEnded: false,
      isCustomRunning: true
    });
  },

  handleSaveSimulation: () => {
    simulationWorker.postMessage({ type: 'REQUEST_SAVE_PAYLOAD' });
  }
}));
