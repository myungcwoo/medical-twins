import type { AgentState } from './Agent';

export interface SimulationSnapshot {
  id: string; // usually 'global_save'
  ticks: number;
  agents: AgentState[];
  lastSaved: number;
}

const DB_NAME = 'MedicalTwinsDB';
const STORE_NAME = 'SimStateStore';
const DB_VERSION = 1;

export class DatabaseEngine {
  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => reject(event);

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  public static async saveSnapshot(ticks: number, agents: AgentState[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const snapshot: SimulationSnapshot = {
          id: 'global_save',
          ticks,
          agents,
          lastSaved: Date.now()
        };

        const request = store.put(snapshot);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB Save Failed:", e);
    }
  }

  public static async loadSnapshot(): Promise<SimulationSnapshot | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.get('global_save');

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result as SimulationSnapshot);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB Load Failed:", e);
      return null;
    }
  }

  public static async clearSnapshot(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.delete('global_save');

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB Clear Failed:", e);
    }
  }
}
