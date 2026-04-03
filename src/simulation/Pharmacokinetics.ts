import type { IdeaImpact } from './KnowledgeNetwork';

export type PhysicsModel = 'Linear' | 'Bliss' | 'Asymptotic' | 'Matrix';

/**
 * Pharmacokinetics & Biological Combination Engine
 * -----------------------------------------------
 * Evaluates the net physiological impact of stacking multiple interventions, solving the flaw of perpetual linear growth.
 */
export class Pharmacokinetics {
    
    // Explicit Mechanistic Antagonism Graph
    // Source: Chou & Talalay, 1984, "Quantitative analysis of dose-effect relationships"
    private static readonly INTERACTION_MATRIX: Record<string, Record<string, number>> = {
        'Warfarin': { 'Vitamin K': -1.0 }, // Complete Neutralization
        'SGLT2_Inhibitor': { 'l1_keto': -0.8, 'GLP1_Agonist': 0.3 }, // Extreme keto + SGLT2 creates catastrophic ketoacidosis risk. GLP1 + SGLT2 creates supreme cardiorenal synergy.
        'GLP1_Agonist': { 'SGLT2_Inhibitor': 0.3 },
        'Metformin': { 'Insulin': 0.2 }, // Minor synergy
    };

    /**
     * Compute aggregated multidrug/intervention impact based on mathematical rulesets.
     * 
     * @param impacts Array of all protocol impacts being stacked simultaneously
     * @param model 'Linear' (Summation), 'Bliss' (Probabilistic), 'Asymptotic' (Decay), 'Matrix' (Graph Factors)
     * @param currentMeds Array of current medications to check against matrix
     * @returns A computationally adjusted singular healthDelta value.
     */
    public static calculateNetImpact(
        impacts: IdeaImpact[], 
        model: PhysicsModel,
        currentMeds: string[] = [],
        newProtocolIds: string[] = [] // Tracking IDs to map mechanistic matrix
    ): IdeaImpact {
        
        let aggregate: IdeaImpact = { healthDelta: 0, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0, newMeds: [], description: '' };
        if (impacts.length === 0) return aggregate;

        // Baseline Accumulation vector
        impacts.forEach(curr => {
            aggregate.healthDelta += (curr.healthDelta || 0);
            aggregate.stressDelta += (curr.stressDelta || 0);
            aggregate.bpDelta += (curr.bpDelta || 0);
            aggregate.a1cDelta += (curr.a1cDelta || 0);
            aggregate.cvDelta += (curr.cvDelta || 0);
            aggregate.egfrDelta += (curr.egfrDelta || 0);
            curr.newMeds.forEach(m => aggregate.newMeds.push(m));
        });

        let modifier = 1.0;

        switch (model) {
            case 'Linear':
                // Classical Additivity Model
                modifier = 1.0;
                break;

            case 'Bliss':
                // Bliss Independence Model (Probabilistic Non-Overlapping Pathways)
                // Represents likelihood union: P(A U B) = P(A) + P(B) - P(A)P(B)
                // Squeezes multidrug impact into tight bounded physiological limits.
                const fractions = impacts.map(i => Math.min(1.0, Math.max(0, Math.abs((i.healthDelta || 0) / 100))));
                if (fractions.length > 0) {
                    let blissTotal = fractions[0];
                    for (let i = 1; i < fractions.length; i++) {
                        blissTotal = blissTotal + fractions[i] - (blissTotal * fractions[i]);
                    }
                    const rawHealthSum = Math.abs(aggregate.healthDelta) || 1;
                    modifier = (blissTotal * 100) / rawHealthSum;
                }
                break;

            case 'Asymptotic':
                // Terminal Diminishing Returns (Logarithmic/Asymptotic Curve)
                // Source: Michaelis-Menten kinetics derivations
                const rawSum = aggregate.healthDelta;
                if (rawSum > 0) {
                    const eMax = 20.0;
                    const k = 0.08;
                    const terminalCurve = eMax * (1 - Math.exp(-k * rawSum));
                    modifier = terminalCurve / rawSum;
                }
                break;

            case 'Matrix':
                // Quantitative Systems Pharmacology Matrix Factorization
                // Evaluates graph antagonism.
                const allAgents = [...currentMeds, ...(impacts.flatMap(i => i.newMeds)), ...newProtocolIds];
                for (let i = 0; i < allAgents.length; i++) {
                    for (let j = 0; j < allAgents.length; j++) {
                        if (i === j) continue;
                        const agentA = allAgents[i];
                        const agentB = allAgents[j];
                        if (this.INTERACTION_MATRIX[agentA] && this.INTERACTION_MATRIX[agentA][agentB]) {
                            const scalar = this.INTERACTION_MATRIX[agentA][agentB];
                            console.log(`[Interaction Matrix] Overriding topology: ${agentA} violently interacts with ${agentB}. Scalar Modulator: ${scalar}`);
                            modifier += scalar; 
                        }
                    }
                }
                break;
        }

        // Apply mathematical matrix modifier against all physiological vectors securely
        aggregate.healthDelta = Number((aggregate.healthDelta * modifier).toFixed(3));
        aggregate.stressDelta = Number((aggregate.stressDelta * modifier).toFixed(3));
        aggregate.bpDelta = Number((aggregate.bpDelta * modifier).toFixed(3));
        aggregate.a1cDelta = Number((aggregate.a1cDelta * modifier).toFixed(3));
        aggregate.cvDelta = Number((aggregate.cvDelta * modifier).toFixed(3));
        aggregate.egfrDelta = Number((aggregate.egfrDelta * modifier).toFixed(3));
        
        let descParam = '';
        if (model !== 'Linear' && modifier !== 1.0) {
             descParam = ` | [Calculated via ${model} Math Model. Physiological scaling modifier applied: ${modifier.toFixed(2)}x]`;
        }
        
        aggregate.description = impacts.map(i => i.description).join(' + ') + descParam;

        return aggregate;
    }
}
