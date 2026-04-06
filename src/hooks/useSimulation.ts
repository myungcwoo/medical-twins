import { useEffect } from 'react';
import { useSimulationStore, simulationWorker } from '../store/useSimulationStore';
import { InferenceEngine } from '../simulation/InferenceEngine';
import { DatabaseEngine } from '../simulation/DatabaseEngine';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';
import { initialAgents } from '../simulation/InitialData';

export function useSimulationLifecycle() {
  const { 
    isRunning, 
    isCustomRunning, 
    setAgents, 
    setTicks, 
    setCustomTwins, 
    setCustomTicks
  } = useSimulationStore();

  useEffect(() => {
    // Setup Worker event listener robustly
    const handleWorkerMessage = (e: MessageEvent) => {
      const { type, payload } = e.data;
      console.log(`[IPC] Received ${type} from Worker`, payload);
      const state = useSimulationStore.getState();
      
      switch (type) {
        case 'ENGINE_READY':
        case 'FAST_FORWARD_COMPLETE':
        case 'TICK_COMPLETE':
          setAgents(payload.agents);
          setTicks(payload.ticks);
          if (payload.globalFeed) {
             KnowledgeBase.globalFeed = payload.globalFeed;
             KnowledgeBase.broadcasts = payload.broadcasts;
             KnowledgeBase.totalInteractions = payload.totalInteractions;
          }
          
          if (type === 'FAST_FORWARD_COMPLETE') {
              useSimulationStore.setState({ isFastForwarding: false });
              if (state.autoResume && !state.isEnded) {
                useSimulationStore.setState({ isRunning: true });
              }
          }
          break;

        case 'CUSTOM_ENGINE_READY':
        case 'FAST_FORWARD_CUSTOM_COMPLETE':
        case 'TICK_CUSTOM_COMPLETE':
          setCustomTwins(payload.customTwins);
          setCustomTicks(payload.customTicks);
          
          if (type === 'FAST_FORWARD_CUSTOM_COMPLETE') {
              useSimulationStore.setState({ isCustomFastForwarding: false });
              if (state.autoResume && !state.isCustomEnded) {
                useSimulationStore.setState({ isCustomRunning: true });
              }
          }
          break;
          
        case 'RESET_COMPLETE':
          simulationWorker.postMessage({ type: 'INIT_ENGINE', payload: { initialAgents } });
          break;
      }
    };
    
    simulationWorker.addEventListener('message', handleWorkerMessage);
    return () => {
        simulationWorker.removeEventListener('message', handleWorkerMessage);
    };
  }, [setAgents, setTicks, setCustomTwins, setCustomTicks]);

  useEffect(() => {
    const hydrator = async () => {
      await InferenceEngine.initialize();
      
      const provider = localStorage.getItem('llm_provider') || 'OpenAI';
      const apiKey = localStorage.getItem('llm_key') || null;
      const modelStr = localStorage.getItem('llm_model') || null;
      const isEnabled = localStorage.getItem('llm_enabled') !== 'false';
      simulationWorker.postMessage({ type: 'SYNC_LLM', payload: { provider, apiKey, modelStr, isEnabled } });

      const persisted = await DatabaseEngine.loadSnapshot();
      if (persisted && persisted.agents && persisted.agents.length > 0) {
          simulationWorker.postMessage({ type: 'INIT_ENGINE', payload: { initialAgents: persisted.agents, ticks: persisted.ticks } });
          console.log("[IndexedDB] Simulation completely restored to Week " + persisted.ticks);
      } else {
          simulationWorker.postMessage({ type: 'INIT_ENGINE', payload: { initialAgents } });
      }
    };
    hydrator();
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning || isCustomRunning) {
      interval = window.setInterval(() => {
        if (isRunning) {
          simulationWorker.postMessage({ type: 'TICK' });
        }
        if (isCustomRunning) {
          simulationWorker.postMessage({ type: 'TICK_CUSTOM' });
        }
      }, 500);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCustomRunning]);
}
