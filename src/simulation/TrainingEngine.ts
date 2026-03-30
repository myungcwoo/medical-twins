export interface RawClaim {
  patientId: string;
  date: string; // ISO date string (e.g. "2021-04-15")
  icd10: string[];
  ndc: string[];
}

export interface RawLab {
  patientId: string;
  date: string;
  loinc: string;
  value: number;
}

interface TrainedWeight {
  condition: string;
  sourcePopulation: number;
  totalExposureYears: number;
  observedIncidenceRate: number; // Annualized probability
  cdcBaseline: number;
  hazardDifferential: number; // x times multiplier compared to CDC
}

export class TrainingEngine {
  static currentTrainedModel: Record<string, TrainedWeight> = {};

  // Standard Dictionary defining root prefixes for all targeted chronic pathology trajectories
  static icd10Dictionary: Record<string, string[]> = {
    'Hypertension': ['I10', 'I11', 'I12', 'I13', 'I14', 'I15'],
    'High Cholesterol': ['E78'],
    'Diabetes': ['E08', 'E09', 'E10', 'E11', 'E13'],
    'Obesity': ['E66'],
    'Asthma': ['J45'],
    'COPD': ['J44'],
    'CHF': ['I50'],
    'CKD': ['N18'],
    'Depression': ['F32', 'F33'],
    'Anxiety': ['F41'],
    'Bipolar Disorder': ['F31'],
    'Schizophrenia': ['F20'],
    'Dementia': ['F03', 'G30'],
    'Cirrhosis': ['K74'],
    'Hepatitis': ['B15', 'B16', 'B17', 'B18', 'B19'],
    'CAD': ['I20', 'I21', 'I22', 'I24', 'I25']
  };

  static initialize() {
    const localWeights = localStorage.getItem('abm_trained_weights');
    if (localWeights) {
      try {
        this.currentTrainedModel = JSON.parse(localWeights);
      } catch (e) {
        console.error("Failed to parse local ABM weights", e);
      }
    }
  }

  // Purely Mathematical Client-Side ETL Pipeline
  static processDisparateData(claims: RawClaim[], labs: RawLab[] = []): Record<string, TrainedWeight> {
    const targets = Object.keys(this.icd10Dictionary);
    const analysisMap: Record<string, { atRisk: number, totalYears: number, conversions: number }> = {};
    targets.forEach(t => analysisMap[t] = { atRisk: 0, totalYears: 0, conversions: 0 });

    // Step 1: Map all longitudinal data purely to distinct patient nodes
    const patientTimelines: Record<string, { claims: RawClaim[], labs: RawLab[] }> = {};
    
    claims.forEach(c => {
      if (!patientTimelines[c.patientId]) patientTimelines[c.patientId] = { claims: [], labs: [] };
      patientTimelines[c.patientId].claims.push(c);
    });
    
    labs.forEach(l => {
        if (!patientTimelines[l.patientId]) patientTimelines[l.patientId] = { claims: [], labs: [] };
        patientTimelines[l.patientId].labs.push(l);
    });

    // Step 2: Iterate across every resolved timeline to deduce baseline vs acquired states probabilistically
    Object.keys(patientTimelines).forEach(pid => {
       const timeline = patientTimelines[pid];
       // Sort chronologically
       timeline.claims.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
       
       if (timeline.claims.length === 0) return;

       const firstDate = new Date(timeline.claims[0].date).getTime();
       const lastDate = new Date(timeline.claims[timeline.claims.length - 1].date).getTime();
       const exposureYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);

       if (exposureYears <= 0) return; // Need actual chronological depth to run incidence models

       const baselineCutoff = firstDate + (1000 * 60 * 60 * 24 * 180); // 180 Days (6 Months) == Baseline 

       const baselineConditions: string[] = [];
       const acquiredConditions: string[] = [];

       targets.forEach(target => {
           const matchPrefixes = this.icd10Dictionary[target];
           const seenDates: Set<string> = new Set();
           const firstSeenDates: number[] = [];

           // Extract all valid hits mapping strictly to the Dictionary
           timeline.claims.forEach(claim => {
               const hasCode = claim.icd10.some(code => matchPrefixes.some(prefix => code.startsWith(prefix)));
               if (hasCode) {
                   seenDates.add(claim.date);
                   firstSeenDates.push(new Date(claim.date).getTime());
               }
           });

           // Rule: Active Management Filter -> Must see the ICD block on at least 2 disparate encounter dates to confirm pathology
           if (seenDates.size >= 2) {
               firstSeenDates.sort((a,b) => a - b);
               const earliestHit = firstSeenDates[0];

               if (earliestHit <= baselineCutoff) {
                   baselineConditions.push(target);
               } else {
                   acquiredConditions.push(target);
               }
           }
       });

       // Assign into Poisson Incidence Array
       targets.forEach(target => {
           // If they had it at baseline, they weren't 'at-risk' of acquiring it during the observation window
           if (baselineConditions.includes(target)) return;
           
           analysisMap[target].atRisk += 1;
           analysisMap[target].totalYears += exposureYears;

           if (acquiredConditions.includes(target)) {
               analysisMap[target].conversions += 1;
           }
       });
    });

    const newWeights: Record<string, TrainedWeight> = {};

    // Standard theoretical base literature (AHA/CDC) roughly annualized across generic adults
    const cdcBaselines: Record<string, number> = {
      'Hypertension': 0.04,
      'High Cholesterol': 0.045,
      'Diabetes': 0.02,
      'Obesity': 0.05,
      'Asthma': 0.015,
      'CHF': 0.015,
      'CKD': 0.01,
      'COPD': 0.008,
      'CAD': 0.02,
      'Depression': 0.06,
      'Anxiety': 0.05,
      'Bipolar Disorder': 0.005,
      'Schizophrenia': 0.003,
      'Dementia': 0.01,
      'Cirrhosis': 0.007,
      'Hepatitis': 0.001
    };

    targets.forEach(target => {
      if (analysisMap[target].totalYears > 0) {
        let air = analysisMap[target].conversions / analysisMap[target].totalYears;
        if (air > 0.5) air = 0.5; // Cap catastrophic structural blowouts
        if (air === 0) return; // Don't wipe models if dataset just lacked these completely

        newWeights[target] = {
          condition: target,
          sourcePopulation: analysisMap[target].atRisk,
          totalExposureYears: analysisMap[target].totalYears,
          observedIncidenceRate: air,
          cdcBaseline: cdcBaselines[target] || 0.02,
          hazardDifferential: air / (cdcBaselines[target] || 0.02)
        };
      }
    });

    this.currentTrainedModel = { ...this.currentTrainedModel, ...newWeights };
    localStorage.setItem('abm_trained_weights', JSON.stringify(this.currentTrainedModel));
    
    return this.currentTrainedModel;
  }

  static wipeModel() {
    this.currentTrainedModel = {};
    localStorage.removeItem('abm_trained_weights');
  }

  static getEmpiricalWeight(condition: string, cdcFallback: number): number {
    if (this.currentTrainedModel[condition] && this.currentTrainedModel[condition].observedIncidenceRate > 0) {
      return this.currentTrainedModel[condition].observedIncidenceRate;
    }
    return cdcFallback;
  }
}

TrainingEngine.initialize();
