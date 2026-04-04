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

export interface TrainedWeight {
  condition: string;
  sourcePopulation: number;
  totalExposureYears: number;
  observedIncidenceRate: number; // Annualized probability
  cdcBaseline: number;
  hazardDifferential: number; // x times multiplier compared to CDC
}
