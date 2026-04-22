import { SimulationEngine } from '../simulation/Engine';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';
import { DatabaseEngine } from '../simulation/DatabaseEngine';
import { LLMEngine } from '../simulation/LLMEngine';

let engine: SimulationEngine | null = null;
let customEngine: SimulationEngine | null = null;

console.log("[Worker] Worker script successfully evaluated and started.");

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  console.log(`[Worker] Received message type: ${type}`, payload != null);

  switch (type) {
    case 'INIT_ENGINE': {
      engine = new SimulationEngine(payload.initialAgents);
      if (payload.ticks) {
          engine.currentTick = payload.ticks;
      }
      self.postMessage({ type: 'ENGINE_READY', payload: {
        agents: engine.getAgents(),
        ticks: engine.currentTick,
        globalFeed: KnowledgeBase.globalFeed,
        broadcasts: KnowledgeBase.broadcasts,
        totalInteractions: KnowledgeBase.totalInteractions
      }});
      break;
    }

    case 'SYNC_LLM': {
        LLMEngine.provider = payload.provider;
        LLMEngine.apiKey = payload.apiKey;
        if (payload.modelStr) LLMEngine.activeModel = payload.modelStr;
        LLMEngine.isEnabled = payload.isEnabled;
        break;
    }
    
    case 'TICK': {
      if (!engine) return;
      engine.tick();
      self.postMessage({ type: 'TICK_COMPLETE', payload: {
        agents: engine.getAgents(),
        ticks: engine.currentTick,
        globalFeed: KnowledgeBase.globalFeed,
        broadcasts: KnowledgeBase.broadcasts,
        totalInteractions: KnowledgeBase.totalInteractions
      }});
      break;
    }
    
    case 'TICK_CUSTOM': {
      if (!customEngine) return;
      customEngine.tick();
      self.postMessage({ type: 'TICK_CUSTOM_COMPLETE', payload: {
        customTwins: customEngine.getAgents(),
        customTicks: customEngine.currentTick
      }});
      break;
    }
    
    case 'INIT_CUSTOM_ENGINE': {
      customEngine = new SimulationEngine(payload.agents);
      
      // Apply protocols
      const fullTwinState = customEngine.agents;
      payload.selectedProtocols.forEach((p: any) => {
        fullTwinState.forEach((actor: any) => {
          if (actor.state.comparativeGroup === 'Intervention') {
            if (p.type === 'Clinical' && p.newMeds) {
              p.newMeds.forEach((m: string) => {
                if (!actor.state.medications.includes(m)) actor.state.medications.push(m);
              });
            }
            if (p.id && !actor.state.memory.includes(p.id)) {
              actor.state.memory.push(p.id);
            }
            if (p.type === 'Lifestyle') {
              if (p.impact.healthDelta > 0) actor.state.baseHealth += p.impact.healthDelta;
              if (p.impact.stressDelta < 0) actor.state.stressLevel += p.impact.stressDelta;
              if (p.impact.bpDelta < 0) actor.state.vitals.bpSystolic += p.impact.bpDelta;
            }
          }
        });
      });

      self.postMessage({ type: 'CUSTOM_ENGINE_READY', payload: {
        customTwins: customEngine.getAgents(),
        customTicks: customEngine.currentTick
      }});
      break;
    }

    case 'FAST_FORWARD': {
      if (!engine) return;
      const { years } = payload;
      for (let i = 0; i < years * 52; i++) {
        engine.tick();
        // Native Timeline Snapshot every 5 years (260 ticks) to prevent IDB ballooning
        if (engine.currentTick % 260 === 0) {
            DatabaseEngine.saveSnapshot(engine.currentTick, engine.getAgents());
        }
      }
      self.postMessage({ type: 'FAST_FORWARD_COMPLETE', payload: {
        agents: engine.getAgents(),
        ticks: engine.currentTick
      }});
      // Always guarantee terminal snapshot
      DatabaseEngine.saveSnapshot(engine.currentTick, engine.getAgents());
      break;
    }
    
    case 'FAST_FORWARD_CUSTOM': {
      if (!customEngine) return;
      const { years } = payload;
      for (let i = 0; i < years * 52; i++) {
        customEngine.tick();
      }
      self.postMessage({ type: 'FAST_FORWARD_CUSTOM_COMPLETE', payload: {
        customTwins: customEngine.getAgents(),
        customTicks: customEngine.currentTick
      }});
      break;
    }
    
    case 'RESET': {
      await DatabaseEngine.clearSnapshot();
      KnowledgeBase.globalFeed = [];
      KnowledgeBase.broadcasts = [];
      KnowledgeBase.totalInteractions = 0;
      
      engine = null;
      customEngine = null;
      
      self.postMessage({ type: 'RESET_COMPLETE' });
      break;
    }
    
    case 'FETCH_CHECKPOINTS': {
        const points = await DatabaseEngine.getAvailableCheckpoints();
        self.postMessage({ type: 'CHECKPOINTS_READY', payload: points });
        break;
    }

    case 'REWIND_TO_TICK': {
        const { targetTick } = payload;
        const snapshot = await DatabaseEngine.loadTemporalSnapshot(targetTick);
        if (snapshot && snapshot.agents) {
            engine = new SimulationEngine(snapshot.agents);
            engine.currentTick = snapshot.ticks;
            
            // Trim global feed to simulate true timeline reset
            KnowledgeBase.globalFeed = KnowledgeBase.globalFeed.filter(ev => ev.tick <= snapshot.ticks);
            
            self.postMessage({ type: 'REWIND_COMPLETE', payload: {
                agents: engine.getAgents(),
                ticks: engine.currentTick,
                globalFeed: KnowledgeBase.globalFeed,
                broadcasts: KnowledgeBase.broadcasts,
                totalInteractions: KnowledgeBase.totalInteractions
            }});
        } else {
            console.error(`[Worker] Rewind failed. Temporal Tick ${targetTick} missing.`);
        }
        break;
    }
    
    case 'REQUEST_SAVE_PAYLOAD': {
      if (!engine) return;
      const payloadObj = {
        simulationEndTick: engine.currentTick,
        totalInteractions: KnowledgeBase.totalInteractions,
        survivingAgents: engine.getAgents().filter(a => !a.isDead).length,
        protocolEfficiencyMap: KnowledgeBase.globalFeed
      };
      self.postMessage({ type: 'SAVE_PAYLOAD_READY', payload: payloadObj });
      break;
    }
    
    case 'FORK_AGENT': {
      if (!engine) return;
      const { sourceId, modifications } = payload;
      const newlyBranchedTwin = engine.branchAgent(sourceId, modifications);
      if (newlyBranchedTwin) {
          self.postMessage({ type: 'FORK_AGENT_COMPLETE', payload: {
            branchedTwin: newlyBranchedTwin,
            agents: engine.getAgents()
          }});
      }
      break;
    }
  }
};
