import { Agent } from './Agent';

import type {  AgentState  } from '../types/Simulation.types';
import { runGlobalEvents } from './Events';
import { LLMEngine } from './LLMEngine';
import { KnowledgeBase } from './KnowledgeNetwork';

export class SimulationEngine {
  agents: Agent[] = [];
  currentTick: number = 0; 
  isRunning: boolean = false;

  constructor(initialData: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>[]) {
    this.agents = initialData.map(d => new Agent(JSON.parse(JSON.stringify(d))));
  }

  tick() {
    this.currentTick++;
    this.agents.forEach(agent => {
      agent.tick(this.currentTick);
      runGlobalEvents(agent, this.currentTick);

      if (this.currentTick % 52 === 0) {
        agent.state.age++;
      }
    });

    // Accelerated Throttled Artificial Intelligence Injection (Generative Network Evolution)
    if (this.currentTick % 12 === 0) {
      const potentialAuthors = this.agents.filter(a => !a.state.isDead && (a.state.role === 'Researcher' || a.state.role === 'WebSurfer'));
      if (potentialAuthors.length > 0) {
        const electedAuthor = potentialAuthors[Math.floor(Math.random() * potentialAuthors.length)];
        
        if (LLMEngine.isEnabled && LLMEngine.apiKey && !LLMEngine.isGenerating) {
            LLMEngine.generateProtocolAsync(electedAuthor, this.currentTick);
        } else if (!LLMEngine.isEnabled || !LLMEngine.apiKey) {
            // Unauthenticated Safe Fallback: Ping native PubMed E-Utilities REST Scraper!
            if (!(this as any).isHarvesting) {
                (this as any).isHarvesting = true;
                fetch('http://127.0.0.1:8000/harvest_literature')
                    .then(res => res.json())
                    .then(data => {
                         if (data.id && data.title) {
                             KnowledgeBase.broadcast(electedAuthor, data, this.currentTick);
                         }
                    })
                    .catch(e => {
                         console.warn("PubMed Gateway Timeout. Falling back to static arrays.", e);
                         const fallbackArray = electedAuthor.state.role === 'Researcher' ? KnowledgeBase.CLINICAL_IDEAS : KnowledgeBase.LIFESTYLE_IDEAS;
                         const fallbackIdea = fallbackArray[Math.floor(Math.random() * fallbackArray.length)];
                         KnowledgeBase.broadcast(electedAuthor, fallbackIdea, this.currentTick);
                    })
                    .finally(() => { (this as any).isHarvesting = false; });
            }
        }
      }
    }
  }

  getAgents(): AgentState[] {
    return this.agents.map(a => a.state);
  }

  addAgent(rawPatient: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>) {
    const newAgent = new Agent(rawPatient);
    this.agents.push(newAgent);
  }

  branchAgent(agentId: string, modifications: Partial<AgentState>) {
    const target = this.agents.find(a => a.state.id === agentId);
    if (!target || target.state.isDead) return null;

    // Deep copy the state up to the current tick
    const clonedState = JSON.parse(JSON.stringify(target.state)) as AgentState;
    
    // Assign new Multiverse Identity
    const newId = `VAR-${crypto.randomUUID().substring(0,6)}`;
    clonedState.id = newId;
    clonedState.name = `${clonedState.name} (Variant)`;
    clonedState.comparativeGroup = 'Intervention';
    clonedState.pairedTwinId = target.state.id;

    // Ensure the original agent tracks this variant as its pair for charting
    target.state.comparativeGroup = 'Control';
    target.state.pairedTwinId = newId;

    // Inject "What-If" modifications
    if (modifications.medications) {
        // Add new meds distinctively without wiping old history
        modifications.medications.forEach(m => {
             if (!clonedState.medications.includes(m)) clonedState.medications.push(m);
        });
    }

    if (modifications.exerciseRoutine) clonedState.exerciseRoutine = modifications.exerciseRoutine;
    if (modifications.smoker !== undefined) clonedState.smoker = modifications.smoker;

    // Log the divergence point in the timeline
    clonedState.history.push({
         tick: this.currentTick,
         type: 'MULTIVERSE BRANCH',
         description: `Chronological fork executed. New interventions mapped.`,
         impactHealth: 0,
         impactStress: 0
    });

    const branchedAgent = new Agent(clonedState as any);
    // Explicitly maintain history by overwriting constructor reset
    branchedAgent.state = clonedState;
    this.agents.push(branchedAgent);

    return branchedAgent.state;
  }
}
