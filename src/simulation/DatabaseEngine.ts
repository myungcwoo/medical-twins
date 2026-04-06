import { set, get, keys, clear } from 'idb-keyval';
import type { AgentState } from './Agent';

export interface SimulationSnapshot {
  id: string; 
  ticks: number;
  agents: AgentState[];
  lastSaved: number;
}

export class DatabaseEngine {
  public static async saveSnapshot(ticks: number, agents: AgentState[]): Promise<void> {
    try {
      const snapshot: SimulationSnapshot = {
        id: `tick_${ticks}`,
        ticks,
        agents,
        lastSaved: Date.now()
      };
      await set('global_save', snapshot);
      await set(`tick_${ticks}`, snapshot);
    } catch (e) {
      console.error("IndexedDB Save Failed:", e);
    }
  }

  public static async loadSnapshot(): Promise<SimulationSnapshot | null> {
    try {
      const val = await get<SimulationSnapshot>('global_save');
      return val || null;
    } catch (e) {
      console.error("IndexedDB Load Failed:", e);
      return null;
    }
  }

  public static async loadTemporalSnapshot(ticks: number): Promise<SimulationSnapshot | null> {
    try {
      const val = await get<SimulationSnapshot>(`tick_${ticks}`);
      return val || null;
    } catch (e) {
      console.error(`IndexedDB Temporal Load Failed for tick ${ticks}:`, e);
      return null;
    }
  }

  public static async getAvailableCheckpoints(): Promise<number[]> {
    try {
      const allKeys = await keys();
      const tickKeys = allKeys.filter((k): k is string => typeof k === 'string' && k.startsWith('tick_'));
      const checkpoints = tickKeys.map(k => parseInt(k.replace('tick_', ''), 10));
      return checkpoints.sort((a,b) => a - b);
    } catch (e) {
      console.error("Failed fetching available checkpoints:", e);
      return [];
    }
  }

  public static async clearSnapshot(): Promise<void> {
    try {
      await clear();
    } catch (e) {
      console.error("IndexedDB Clear Failed:", e);
    }
  }
}
