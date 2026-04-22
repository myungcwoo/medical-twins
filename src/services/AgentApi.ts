export interface AgentRunState {
    id: number;
    query_id: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result_synthesis: string | null;
    created_at: string;
    updated_at: string;
}

const API_BASE = 'http://127.0.0.1:8000/api';

export class AgentApi {
    /**
     * Triggers a new agent run on the Clinical Agents Hub
     */
    static async startRun(query: string, agentId: string = 'pubmed_analyst'): Promise<AgentRunState> {
        try {
            const response = await fetch(`${API_BASE}/runs?clinical_query=${encodeURIComponent(query)}&agent_id=${encodeURIComponent(agentId)}`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error("Failed to start agent run:", e);
            throw e;
        }
    }

    /**
     * Polls the status of an active agent run
     */
    static async getRunStatus(runId: number): Promise<AgentRunState> {
        // We will fetch all runs and filter for now since we didn't add a strict GET /runs/{id} endpoint yet
        // In a real app we would hit GET /runs/{id}
        try {
            const response = await fetch(`${API_BASE}/runs`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const runs: AgentRunState[] = await response.json();
            const run = runs.find(r => r.id === runId);
            if (!run) throw new Error("Run not found.");
            return run;
        } catch (e) {
            console.error("Failed to poll agent run status:", e);
            throw e;
        }
    }
    
    /**
     * Resolves the long-polling 
     */
    static async pollUntilComplete(runId: number, onTick?: (status: string) => void): Promise<AgentRunState> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const run = await this.getRunStatus(runId);
                    if (onTick) onTick(run.status);
                    
                    if (run.status === 'completed' || run.status === 'failed') {
                        clearInterval(interval);
                        resolve(run);
                    }
                } catch (e) {
                    clearInterval(interval);
                    reject(e);
                }
            }, 2500); // Poll every 2.5 seconds
        });
    }
}
