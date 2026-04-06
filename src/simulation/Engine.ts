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
}
