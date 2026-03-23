import { Agent } from './Agent';
import type { AgentState } from './Agent';
import { runGlobalEvents } from './Events';

export class SimulationEngine {
  agents: Agent[] = [];
  currentTick: number = 0; 
  isRunning: boolean = false;

  constructor(initialData: Omit<AgentState, 'history' | 'isDead'>[]) {
    this.agents = initialData.map(d => new Agent(d));
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
  }

  getAgents(): AgentState[] {
    return this.agents.map(a => a.state);
  }

  addAgent(rawPatient: Omit<AgentState, 'history' | 'isDead'>) {
    const newAgent = new Agent(rawPatient);
    this.agents.push(newAgent);
  }
}
