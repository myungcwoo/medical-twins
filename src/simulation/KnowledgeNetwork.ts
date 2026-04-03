import type { Agent } from './Agent';

export type IdeaSource = 'JAMA' | 'NEJM' | 'Nature' | 'CDC' | 'WHO' | 'AHA' | 'NKF' | 'ADA' | 'WebMD' | 'Reddit' | 'Personal' | 'PubMed';
export type IdeaType = 'Clinical' | 'Lifestyle';

export interface IdeaImpact {
  healthDelta: number;
  stressDelta: number;
  bpDelta: number;
  a1cDelta: number;
  cvDelta: number;
  egfrDelta: number;
  newMeds: string[];
  description: string;
}

export interface IdeaTemplate {
  id: string;   
  source: IdeaSource;
  type: IdeaType;
  title: string;
  impact: IdeaImpact;
  targetConditions?: string[];
}

export interface BroadcastedIdea {
  id: string; // Unique transmission ID
  templateId: string;
  authorId: string;
  authorName: string;
  template: IdeaTemplate;
  timestamp: number; 
}

export interface NetworkEvent {
  tick: number;
  agentName: string;
  agentRole: string;
  action: 'Broadcasted' | 'Adopted' | 'Failed Adoption';
  ideaTitle: string;
  source: IdeaSource;
  resultString: string;
  success: boolean;
}

export class KnowledgeBase {
  public static broadcasts: BroadcastedIdea[] = [];
  public static globalFeed: NetworkEvent[] = [];
  public static totalInteractions: number = 0;

  public static readonly CLINICAL_IDEAS: IdeaTemplate[] = [
    {
      id: 'c1_sglt2',
      source: 'NEJM',
      type: 'Clinical',
      title: 'SGLT2 Inhibitor Protocol for Heart Failure',
      impact: { healthDelta: 8, stressDelta: 0, bpDelta: -5, a1cDelta: -0.5, cvDelta: 15, egfrDelta: 2, newMeds: ['SGLT2_Inhibitor'], description: 'Radically reduced cardiovascular strain via sodium-glucose transport blockade.' },
      targetConditions: ['Hypertension', 'CHF', 'Diabetes']
    },
    {
      id: 'c2_ace',
      source: 'JAMA',
      type: 'Clinical',
      title: 'Aggressive ACE-Inhibitor Titration (AASK Trials)',
      impact: { healthDelta: 5, stressDelta: 0, bpDelta: -15, a1cDelta: 0, cvDelta: 5, egfrDelta: 5, newMeds: ['ACE_Inhibitor'], description: 'Forced systolic BP < 130, preserving nephron count.' },
      targetConditions: ['Hypertension', 'CKD']
    },
    {
      id: 'c3_statin',
      source: 'Nature',
      type: 'Clinical',
      title: 'High-Intensity Statin Therapy',
      impact: { healthDelta: 4, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 10, egfrDelta: 0, newMeds: ['Rosuvastatin'], description: 'Crushed LDL lipids to < 70 mg/dL, halting ASCVD progression.' },
      targetConditions: ['Hyperlipidemia', 'Diabetes']
    },
    {
      id: 'c4_glp1',
      source: 'NEJM',
      type: 'Clinical',
      title: 'GLP-1 Receptor Agonist (Semaglutide)',
      impact: { healthDelta: 10, stressDelta: 0, bpDelta: -6, a1cDelta: -1.2, cvDelta: 20, egfrDelta: 0, newMeds: ['GLP1_Agonist'], description: 'Aggressively dropped BMI and reduced composite cardiovascular risk by 20% (HR 0.80) per SELECT Trial guidelines.' },
      targetConditions: ['Obesity', 'Hypertension', 'Diabetes', 'CAD']
    }
  ];

  public static readonly LIFESTYLE_IDEAS: IdeaTemplate[] = [
    {
      id: 'l1_keto',
      source: 'Reddit',
      type: 'Lifestyle',
      title: 'Extreme Ketogenic Fasting',
      impact: { healthDelta: -2, stressDelta: 10, bpDelta: 0, a1cDelta: -1.5, cvDelta: -5, egfrDelta: -3, newMeds: [], description: 'Starved glucose pools, successfully lowering A1C but spiking cortisol stress and harming kidney filtration.' }
    },
    {
      id: 'l2_breathe',
      source: 'WebMD',
      type: 'Lifestyle',
      title: 'Box Breathing Protocol (4-4-4)',
      impact: { healthDelta: 2, stressDelta: -20, bpDelta: -8, a1cDelta: 0, cvDelta: 2, egfrDelta: 0, newMeds: [], description: 'Downregulated sympathetic nervous system, lowering immediate heart rate and hypertensive strain.' }
    },
    {
      id: 'l3_plunge',
      source: 'Reddit',
      type: 'Lifestyle',
      title: 'Daily Cold Plunges',
      impact: { healthDelta: 3, stressDelta: -15, bpDelta: 5, a1cDelta: 0, cvDelta: 0, egfrDelta: 0, newMeds: [], description: 'Improved subjective stress handling, though immediate BP spiked safely during immersion.' }
    }
  ];

  public static getTopValidatedProtocols(count = 3): IdeaTemplate[] {
    const trendMap = this.broadcasts.reduce((acc, b) => {
      // Base score incorporates raw health delta heuristics safely
      acc[b.template.title] = { template: b.template, score: b.template.impact.healthDelta };
      return acc;
    }, {} as Record<string, { template: IdeaTemplate, score: number }> );

    this.globalFeed.forEach(ev => {
      if (ev.ideaTitle && trendMap[ev.ideaTitle] && ev.action !== 'Broadcasted') {
        if (ev.success) trendMap[ev.ideaTitle].score += 1; // +1 mathematically for every successful biological adoption
        else trendMap[ev.ideaTitle].score -= 1; // Penalty for failed compliances / biological toxicities
      }
    });

    return Object.values(trendMap)
      .sort((a,b) => b.score - a.score)
      .slice(0, count)
      .map(x => x.template);
  }

  public static broadcast(author: Agent, template: IdeaTemplate, tick: number) {
    const bId = `bcast_${Math.random().toString(36).substr(2, 9)}`;
    const b: BroadcastedIdea = {
      id: bId,
      templateId: template.id,
      authorId: author.state.id,
      authorName: author.state.name,
      template,
      timestamp: tick
    };
    this.broadcasts.push(b);
    this.totalInteractions++;
    
    this.globalFeed.push({
      tick,
      agentName: author.state.name,
      agentRole: author.state.role,
      action: 'Broadcasted',
      ideaTitle: template.title,
      source: template.source,
      resultString: `Published new findings to the network!`,
      success: true
    });

    // Feed trim to avoid memory leaks
    if (this.globalFeed.length > 200) this.globalFeed.shift();
    if (this.broadcasts.length > 50) this.broadcasts.shift();
  }

  public static logAdoption(agent: Agent, broadcast: BroadcastedIdea, success: boolean, resultText: string, tick: number) {
    this.totalInteractions++;
    this.globalFeed.push({
      tick,
      agentName: agent.state.name,
      agentRole: agent.state.role,
      action: success ? 'Adopted' : 'Failed Adoption',
      ideaTitle: broadcast.template.title,
      source: broadcast.template.source,
      resultString: resultText,
      success
    });
    if (this.globalFeed.length > 200) this.globalFeed.shift();
  }
}
