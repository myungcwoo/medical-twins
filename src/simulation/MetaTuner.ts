import type { AgentState } from './Agent';

interface TuningHeuristic {
    vitalsVector: {
        bpLog: number;
        egfrNorm: number;
        bmiNorm: number;
        ageNorm: number;
    };
    pathology: string; // e.g. "CHF", "CKD Progression"
    delta: number; // e.g. -0.2 (reduce risk by 20%) or +0.4
    timestamp: number;
}

const STORAGE_KEY = 'meta_tuner_heuristics';

export class MetaTuner {
    private static heuristics: TuningHeuristic[] = [];
    private static loaded = false;

    private static load() {
        if (this.loaded) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                this.heuristics = JSON.parse(raw);
            }
        } catch (e) {
            console.error("MetaTuner load failed", e);
        }
        this.loaded = true;
    }

    private static save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.heuristics));
        } catch (e) {
            console.error("MetaTuner save failed", e);
        }
    }

    private static getVector(agent: AgentState) {
        return {
            bpLog: Math.log(agent.vitals?.bpSystolic || 120) / Math.log(200),
            egfrNorm: (agent.labs?.egfr || 80) / 120,
            bmiNorm: (agent.vitals?.bmi || 24) / 40,
            ageNorm: agent.age / 100
        };
    }

    private static euclideanDistance(v1: any, v2: any) {
        return Math.sqrt(
            Math.pow(v1.bpLog - v2.bpLog, 2) +
            Math.pow(v1.egfrNorm - v2.egfrNorm, 2) +
            Math.pow(v1.bmiNorm - v2.bmiNorm, 2) +
            Math.pow(v1.ageNorm - v2.ageNorm, 2)
        );
    }

    public static recordOverride(agent: AgentState, pathology: string, delta: number) {
        this.load();
        
        // Push gradient map
        this.heuristics.push({
            vitalsVector: this.getVector(agent),
            pathology,
            delta,
            timestamp: Date.now()
        });
        
        this.save();
    }

    /**
     * Mathematical layering for static edge inference.
     * KNN style meta-classification offset based on user overrides.
     */
    public static calculateAdjustedProbability(agent: AgentState, pathology: string, staticProb: number): number {
        this.load();
        
        const relevant = this.heuristics.filter(h => h.pathology === pathology);
        if (relevant.length === 0) return staticProb;

        const targetVector = this.getVector(agent);
        
        // Find nearest heuristic
        let minDistance = Infinity;
        let nearestDelta = 0;

        for (const h of relevant) {
            const dist = this.euclideanDistance(targetVector, h.vitalsVector);
            if (dist < minDistance) {
                minDistance = dist;
                nearestDelta = h.delta;
            }
        }

        // Apply distance decay - if someone is completely different biologically from the override, don't apply it strongly
        // If distance is 0, decay is 1 (full strength). If distance is 0.5 (~50% bio divergence), strength drops heavily.
        const decayAlpha = Math.max(0, 1 - (minDistance * 2)); 
        const appliedDelta = nearestDelta * decayAlpha;

        let finalProb = staticProb + appliedDelta;
        
        // Float clamps
        if (finalProb < 0) finalProb = 0;
        if (finalProb > 1) finalProb = 1;
        
        return finalProb;
    }

    public static clearOverrides() {
        this.heuristics = [];
        this.save();
    }
}
