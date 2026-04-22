import type { Agent } from './Agent';
import { KnowledgeBase } from './KnowledgeNetwork';

export class NetworkAdoptionEngine {
  public static processNetworkLearning(agent: Agent, currentTick: number) {
    // Natural Healing Mechanism vs Decay Factor (Bounded Recovery Bounds)iological Adoption
    if (Math.random() < 0.05 && KnowledgeBase.broadcasts.length > 0) {
      const bcast = KnowledgeBase.broadcasts[Math.floor(Math.random() * KnowledgeBase.broadcasts.length)];
      
      // If patient hasn't processed this exact idea meme before
      if (!agent.state.memory.includes(bcast.template.id)) {
        agent.state.memory.push(bcast.template.id);
        
        // Track the peer-to-peer communication topology
        if (!agent.state.networkConnections!.includes(bcast.authorId) && bcast.authorId !== agent.state.id) {
            agent.state.networkConnections!.push(bcast.authorId);
        }
        
        const impact = bcast.template.impact;
        let success = true;
        let resTxt = impact.description;

        // Efficacy gating (Can't adopt meds you already take)
        if (impact.newMeds && impact.newMeds.length > 0) {
          const med = impact.newMeds[0];
          if (agent.state.medications.includes(med)) {
            success = false;
            resTxt = `Idea rejected: Patient already adhering to ${med}.`;
          } else {
            agent.state.medications.push(med);
          }
        }

        // Contraindications checking
        let contraindicationHit = false;
        if (success && impact.contraindications && impact.contraindications.length > 0) {
           const hasContra = impact.contraindications.some(c => 
              agent.state.medications.includes(c) || agent.state.chronicConditions.includes(c)
           );
           if (hasContra) {
               contraindicationHit = true;
               resTxt = `[CRITICAL WARNING] Severe Adverse Cascade Triggered: Protocol violated documented contraindications.`;
           }
        }

        // Synergies checking
        let synergyMultiplier = 1.0;
        if (success && impact.synergies && impact.synergies.length > 0) {
           const hasSynergy = impact.synergies.some(s => 
              agent.state.medications.includes(s) || agent.state.memory.includes(s)
           );
           if (hasSynergy) {
               synergyMultiplier = 1.5; // 50% boost to positive deltas
               resTxt += ` [SYNERGY BONUS] Protocol resonated powerfully with existing regimen.`;
           }
        }

        // Extremely low medical compliance agents occasionally fail to successfully adopt lifestyle habits correctly
        if (success && !contraindicationHit && bcast.template.type === 'Lifestyle' && agent.state.medicalCompliance === 'Low' && Math.random() < 0.3) {
          success = false;
          resTxt = `Protocol failed during execution: Patient's compliance was too low to sustain structural habit shift.`;
        }

        // SDOH Real-World Adherence Decay Pipeline
        let sdohMultiplier = 1.0;
        let sdohReason = '';
        
        if (impact.newMeds && impact.newMeds.length > 0 && agent.state.wealth < 40) {
            sdohMultiplier *= 0.5; // Severe decay: patient cannot physically afford the copays, spacing out doses
            sdohReason += `[SDOH Penalty: -50% Medication Efficacy due to Low Wealth Adherence Decay] `;
        }
        if (bcast.template.type === 'Lifestyle' && agent.state.foodDesert) {
            sdohMultiplier *= 0.3; // Impossible to buy high-quality organic produce natively
            sdohReason += `[SDOH Penalty: -70% Lifestyle Efficacy due to strict Food Desert Geographic Constraint] `;
        }
        if (agent.state.medicalCompliance === 'Low') {
            sdohMultiplier *= 0.8; 
        }

        if (success) {
          let m = sdohMultiplier * synergyMultiplier;
          let actualHealthDelta = impact.healthDelta * m;
          let actualStressDelta = impact.stressDelta * ((m + 1)/2);
          
          if (contraindicationHit) {
              actualHealthDelta = -20; // Severe penalty
              actualStressDelta = 25;
          }

          agent.state.baseHealth += actualHealthDelta;
          agent.state.stressLevel += actualStressDelta; // Less physical stress shielding if non-adherent
          agent.state.vitals.bpSystolic += (impact.bpDelta * m);
          agent.state.labs.a1c += (impact.a1cDelta * m);
          agent.state.labs.cvHealth += (impact.cvDelta * m);
          agent.state.labs.egfr += (impact.egfrDelta * m);
          agent.clampState();
          
          agent.logEvent({
            tick: currentTick,
            type: contraindicationHit ? 'Adverse Drug Event' : 'Network Adoption',
            description: `Transferred protocol: ${bcast.template.title} from ${bcast.authorName} (${bcast.template.source}). ${sdohReason}${resTxt}`,
            impactHealth: actualHealthDelta,
            impactStress: actualStressDelta,
          });
        }
        
        KnowledgeBase.logAdoption(agent, bcast, success, resTxt, currentTick);
      }
    }
  }
}
