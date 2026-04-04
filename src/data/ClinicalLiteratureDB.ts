export const STATIC_LITERATURE_DB = [
    {
        id: 'LIT-SELECT-01',
        title: "SELECT Trial: Semaglutide Effects on Cardiovascular Outcomes in People With Overweight or Obesity",
        source: "NEJM",
        year: 2023,
        intervention: "GLP-1 Agonist Protocol",
        phenotype: "Obesity + Cardiovascular Risk",
        hazardRatio: 0.80,
        findings: "Demonstrated a 20% relative risk reduction (HR 0.80) in major adverse cardiovascular events (death, MI, stroke) compared to placebo.",
        mathMapping: "Multiplies baseline CAD and Hypertension acquisition probabilities by 0.80.",
        adverseEffects: [
            { risk: "Severe", type: "Gastroparesis", probability: "0.2% Annual" },
            { risk: "Moderate", type: "Cholelithiasis", probability: "1.5% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: -1, bpDelta: -3, a1cDelta: -0.5, cvDelta: 4, egfrDelta: 0 },
        targetConditions: ["Hyperlipidemia", "Hypertension", "Diabetes"]
    },
    {
        id: 'LIT-DAPA-HF-02',
        title: "DAPA-HF: Dapagliflozin in Patients with Heart Failure and Reduced Ejection Fraction",
        source: "NEJM",
        year: 2019,
        intervention: "SGLT2 Inhibitor Protocol",
        phenotype: "Congestive Heart Failure",
        hazardRatio: 0.74,
        findings: "Aggressive reduction in worsening heart failure or cardiovascular death (HR 0.74).",
        mathMapping: "Applies a massive 0.74 probability multiplier to CHF fatal exacerbation thresholds.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "DKA", probability: "0.1% Annual" },
            { risk: "Severe", type: "Genital Mycotic Infections", probability: "2.0% Annual" }
        ],
        impact: { healthDelta: 2, stressDelta: 0, bpDelta: -2, a1cDelta: -0.2, cvDelta: 5, egfrDelta: 2 },
        targetConditions: ["CHF", "Diabetes", "CKD"]
    },
    {
        id: 'LIT-PARADIGM-03',
        title: "PARADIGM-HF: Angiotensin-Neprilysin Inhibition versus Enalapril in Heart Failure",
        source: "NEJM",
        year: 2014,
        intervention: "ARNI / Entresto",
        phenotype: "Heart Failure (HFrEF)",
        hazardRatio: 0.80,
        findings: "Sacubitril-valsartan reduced the risk of death from cardiovascular causes or hospitalization for heart failure by 20% (HR 0.80).",
        mathMapping: "Applies a 0.80 scaling factor over vascular mortality vectors.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Angioedema", probability: "0.2% Annual" },
            { risk: "Severe", type: "Symptomatic Hypotension", probability: "1.4% Annual" }
        ],
        impact: { healthDelta: 2, stressDelta: 0, bpDelta: -6, a1cDelta: 0, cvDelta: 4, egfrDelta: 0 },
        targetConditions: ["CHF", "Hypertension"]
    },
    {
        id: 'LIT-SPRINT-04',
        title: "SPRINT: A Randomized Trial of Intensive versus Standard Blood-Pressure Control",
        source: "NEJM",
        year: 2015,
        intervention: "Intensive BP Control (<120 mmHg)",
        phenotype: "Hypertension (High CV Risk)",
        hazardRatio: 0.75,
        findings: "Targeting a systolic blood pressure of less than 120 mm Hg resulted in lower rates of fatal and nonfatal major cardiovascular events (HR 0.75).",
        mathMapping: "Reduces acute stroke/MI physiological cascade probability by 25%.",
        adverseEffects: [
            { risk: "Severe", type: "Syncope / Injurious Falls", probability: "1.2% Annual" },
            { risk: "Moderate", type: "Acute Kidney Injury", probability: "2.1% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: -15, a1cDelta: 0, cvDelta: 3, egfrDelta: -1 },
        targetConditions: ["Hypertension"]
    },
    {
        id: 'LIT-FOURIER-05',
        title: "FOURIER: Evolocumab and Clinical Outcomes in Patients with Cardiovascular Disease",
        source: "NEJM",
        year: 2017,
        intervention: "PCSK9 Inhibitor",
        phenotype: "Atherosclerotic CV Disease",
        hazardRatio: 0.85,
        findings: "Addition of evolocumab to statin therapy significantly reduced the risk of cardiovascular events by 15%.",
        mathMapping: "Multiplies Hyperlipidemia exacerbation threshold by 0.85.",
        adverseEffects: [
            { risk: "Moderate", type: "Injection Site Reactions", probability: "2.1% Annual" },
            { risk: "Severe", type: "Neurocognitive Events", probability: "0.3% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 3, egfrDelta: 0 },
        targetConditions: ["Hyperlipidemia", "CHF"]
    },
    {
        id: 'LIT-FIDELIO-06',
        title: "FIDELIO-DKD: Finerenone in Patients with Chronic Kidney Disease and Type 2 Diabetes",
        source: "NEJM",
        year: 2020,
        intervention: "Non-steroidal MRA",
        phenotype: "CKD + Diabetes",
        hazardRatio: 0.82,
        findings: "Finerenone reduced the risk of CKD progression and cardiovascular events by 18%.",
        mathMapping: "Slows the continuous physiological decay of eGFR by 18%.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Hyperkalemia", probability: "1.2% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: -2, a1cDelta: 0, cvDelta: 2, egfrDelta: 3 },
        targetConditions: ["CKD", "Diabetes"]
    },
    {
        id: 'LIT-RELY-07',
        title: "RE-LY: Dabigatran versus Warfarin in Patients with Atrial Fibrillation",
        source: "NEJM",
        year: 2009,
        intervention: "Direct Oral Anticoagulant (DOAC)",
        phenotype: "Atrial Fibrillation",
        hazardRatio: 0.66,
        findings: "Dabigatran 150mg was associated with lower rates of stroke and systemic embolism (HR 0.66).",
        mathMapping: "Substrates 34% off the baseline embolic stroke probability inherent to Atrial Fibrillation.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Major Hemorrhage / ICH", probability: "1.5% Annual" },
            { risk: "Moderate", type: "Dyspepsia", probability: "5.0% Annual" }
        ],
        impact: { healthDelta: 0, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 2, egfrDelta: 0 },
        targetConditions: ["Atrial Fibrillation"]
    },
    {
        id: 'LIT-JUPITER-08',
        title: "JUPITER: Rosuvastatin to Prevent Vascular Events in Men and Women with Elevated C-Reactive Protein",
        source: "NEJM",
        year: 2008,
        intervention: "High-Intensity Statin",
        phenotype: "Primary Prevention",
        hazardRatio: 0.56,
        findings: "Massive 44% reduction in first major cardiovascular events in patients with normal LDL but elevated hsCRP.",
        mathMapping: "Applies a universal 0.56 risk barrier to the initial onset of CHF or CAD.",
        adverseEffects: [
            { risk: "Severe", type: "Rhabdomyolysis", probability: "0.1% Annual" },
            { risk: "Moderate", type: "Myalgia", probability: "4.0% Annual" },
            { risk: "Moderate", type: "Incident Diabetes Progression", probability: "0.8% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: 0, a1cDelta: 0.1, cvDelta: 4, egfrDelta: 0 },
        targetConditions: ["Hyperlipidemia"]
    },
    {
        id: 'LIT-RALES-09',
        title: "RALES: The Effect of Spironolactone on Morbidity and Mortality in Patients with Severe Heart Failure",
        source: "NEJM",
        year: 1999,
        intervention: "Aldosterone Antagonist",
        phenotype: "Severe Heart Failure",
        hazardRatio: 0.70,
        findings: "30% reduction in the risk of death from all causes in patients with severe heart failure receiving spironolactone.",
        mathMapping: "Cuts exponential Gompertz death spiral by 30% when CHF reaches terminal vector.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Severe Hyperkalemia", probability: "1.0% Annual" },
            { risk: "Moderate", type: "Gynecomastia", probability: "5.0% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: -3, a1cDelta: 0, cvDelta: 2, egfrDelta: -1 },
        targetConditions: ["CHF"]
    },
    {
        id: 'LIT-LEADER-10',
        title: "LEADER: Liraglutide and Cardiovascular Outcomes in Type 2 Diabetes",
        source: "NEJM",
        year: 2016,
        intervention: "Liraglutide Protocol",
        phenotype: "Diabetes + High CV Risk",
        hazardRatio: 0.87,
        findings: "13% reduction in major adverse cardiovascular events compared to placebo.",
        mathMapping: "Decreases metabolic vascular strain logic by 13%.",
        adverseEffects: [
            { risk: "Severe", type: "Pancreatitis", probability: "0.3% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: -1, bpDelta: -2, a1cDelta: -1.0, cvDelta: 1, egfrDelta: 0 },
        targetConditions: ["Diabetes"]
    },
    {
        id: 'LIT-UPLIFT-11',
        title: "UPLIFT: Tiotropium in COPD",
        source: "NEJM",
        year: 2008,
        intervention: "LAMA Bronchodilator",
        phenotype: "COPD",
        hazardRatio: 0.86,
        findings: "14% reduction in the risk of COPD exacerbations (HR 0.86). Did not significantly alter rate of FEV1 decline.",
        mathMapping: "Reduces suffocative exacerbation frequency by 14%.",
        adverseEffects: [
            { risk: "Moderate", type: "Dry Mouth", probability: "3.5% Annual" },
            { risk: "Severe", type: "Urinary Retention", probability: "0.8% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: -1, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0 },
        targetConditions: ["COPD"]
    },
    {
        id: 'LIT-SMART-12',
        title: "SMART: Salmeterol Multicenter Asthma Research Trial",
        source: "Chest",
        year: 2006,
        intervention: "LABA Monotherapy",
        phenotype: "Severe Asthma",
        hazardRatio: 4.37,
        findings: "WARNING: Salmeterol monotherapy significantly increased the risk of asthma-related death and life-threatening experiences.",
        mathMapping: "DANGEROUS PROTOCOL: Increases Asthma fatal execution limit by 4x. Forces discontinuation if not paired with ICS.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Fatal Asthma Exacerbation", probability: "2.1% Annual" }
        ],
        impact: { healthDelta: -2, stressDelta: 1, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0 },
        targetConditions: ["Asthma"]
    },
    {
        id: 'LIT-AFFIRM-13',
        title: "AFFIRM: Rate Control versus Rhythm Control for Atrial Fibrillation",
        source: "NEJM",
        year: 2002,
        intervention: "Rate Control Strategy",
        phenotype: "Atrial Fibrillation",
        hazardRatio: 1.0,
        findings: "No survival advantage to rhythm control over rate control. Rate control showed lower adverse drug effects.",
        mathMapping: "Standardizes mortality risk logic. Halts usage of toxic antiarrhythmics like Amiodarone.",
        adverseEffects: [
            { risk: "Severe", type: "Bradycardia", probability: "0.5% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 1, egfrDelta: 0 },
        targetConditions: ["Atrial Fibrillation"]
    },
    {
        id: 'LIT-DAPAC-14',
        title: "DAPA-CKD: Dapagliflozin in Patients with Chronic Kidney Disease",
        source: "NEJM",
        year: 2020,
        intervention: "Dapagliflozin Protocol",
        phenotype: "CKD (Stage 2-4)",
        hazardRatio: 0.61,
        findings: "Massive 39% reduction in the primary outcome of sustained decline in eGFR, ESRD, or death.",
        mathMapping: "Drastically preserves native kidney filtration geometry per tick by 39%.",
        adverseEffects: [
            { risk: "Severe", type: "Bacterial UTIs", probability: "1.8% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 1, egfrDelta: 5 },
        targetConditions: ["CKD"]
    },
    {
        id: 'LIT-CREDO-15',
        title: "CREDO: Clopidogrel for the Reduction of Events During Observation",
        source: "JAMA",
        year: 2002,
        intervention: "DAPT / Clopidogrel",
        phenotype: "Post-PCI / Artery Stenting",
        hazardRatio: 0.73,
        findings: "27% relative risk reduction in death, MI, or stroke over 1 year.",
        mathMapping: "Lowers instant CAD occlusion probability by 27%.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Major Hemorrhage", probability: "1.2% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 3, egfrDelta: 0 },
        targetConditions: ["CHF", "Hyperlipidemia"]
    },
    {
        id: 'LIT-EMPA-16',
        title: "EMPA-REG OUTCOME: Empagliflozin, Cardiovascular Outcomes, and Mortality in T2D",
        source: "NEJM",
        year: 2015,
        intervention: "Empagliflozin / SGLT2",
        phenotype: "T2D + ASCVD",
        hazardRatio: 0.62,
        findings: "38% relative risk reduction in death from cardiovascular causes. The first diabetes drug to universally prove CV survival benefit.",
        mathMapping: "Splices dual survival benefits over baseline A1c and CHF metrics simultaneously.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Fournier's Gangrene", probability: "0.05% Annual" }
        ],
        impact: { healthDelta: 2, stressDelta: 0, bpDelta: -2, a1cDelta: -0.6, cvDelta: 4, egfrDelta: 1 },
        targetConditions: ["Diabetes", "CKD"]
    },
    {
        id: 'LIT-STARD-17',
        title: "STAR*D: Sequenced Treatment Alternatives to Relieve Depression",
        source: "Am J Psychiatry",
        year: 2006,
        intervention: "Citalopram (SSRI)",
        phenotype: "Major Depressive Disorder",
        hazardRatio: 0.67,
        findings: "Roughly 33% remission rate on first-step SSRI. Required multiple steps (augment/switch) to achieve cumulative 67% population remission.",
        mathMapping: "Probabilistic. 33% chance to clear 'Depression' state per tick constraint.",
        adverseEffects: [
            { risk: "Severe", type: "Suicidal Ideation (Aged < 24)", probability: "1.0% Annual" },
            { risk: "Moderate", type: "Sexual Dysfunction", probability: "9.0% Annual" }
        ],
        impact: { healthDelta: 0, stressDelta: -5, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0 },
        targetConditions: ["Depression", "Anxiety"]
    },
    {
        id: 'LIT-ALLHAT-18',
        title: "ALLHAT: Major Outcomes in High-Risk Hypertensive Patients Randomized to ACEi vs Calcium Channel Blocker vs Diuretic",
        source: "JAMA",
        year: 2002,
        intervention: "Chlorthalidone (Thiazide)",
        phenotype: "Essential Hypertension",
        hazardRatio: 1.0,
        findings: "Thiazide-type diuretics are superior in preventing 1 or more major forms of CVD and are less expensive. They remain the gold standard first line.",
        mathMapping: "Generates massive baseline BP reduction without activating severe metabolic complications.",
        adverseEffects: [
            { risk: "Moderate", type: "Hypokalemia", probability: "2.4% Annual" },
            { risk: "Moderate", type: "New-Onset Diabetes", probability: "0.6% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: -10, a1cDelta: 0, cvDelta: 1, egfrDelta: 0 },
        targetConditions: ["Hypertension"]
    },
    {
        id: 'LIT-AHEFT-19',
        title: "A-HeFT: Combination of Isosorbide Dinitrate and Hydralazine in Black Patients with Heart Failure",
        source: "NEJM",
        year: 2004,
        intervention: "Hydralazine / ISDN",
        phenotype: "Advanced CHF",
        hazardRatio: 0.57,
        findings: "The addition of fixed-dose isosorbide dinitrate and hydralazine resulted in a 43% reduction in mortality.",
        mathMapping: "43% deceleration (HR 0.57) towards cardiovascular endpoints.",
        adverseEffects: [
            { risk: "Severe", type: "Drug-Induced Lupus", probability: "0.5% Annual" },
            { risk: "Moderate", type: "Severe Headache", probability: "15.0% Annual" }
        ],
        impact: { healthDelta: 1, stressDelta: 0, bpDelta: -8, a1cDelta: 0, cvDelta: 2, egfrDelta: 0 },
        targetConditions: ["CHF", "Hypertension"]
    },
    {
        id: 'LIT-SDOH-20',
        title: "Meta-Analysis: Socioeconomic Determinants in Long-Term Pharmacological Adherence",
        source: "AHA Journals",
        year: 2022,
        intervention: "Systemic Protocol Adherence Drop",
        phenotype: "Low SDOH / 'Food Deserts'",
        hazardRatio: 2.15,
        findings: "Patients prescribed highly efficacious modern treatments exhibit an 80% discontinuation rate within 12 months if impoverished.",
        mathMapping: "Agents with 'Wealth' < 40 and 'Food Desert' triggers will automatically drop compliance, reversing all 19 other trials' benefits.",
        adverseEffects: [],
        impact: { healthDelta: -3, stressDelta: 5, bpDelta: 2, a1cDelta: 0.5, cvDelta: -2, egfrDelta: -1 },
        targetConditions: ["Hypertension", "Hyperlipidemia", "Diabetes", "CHF", "CKD"]
    }
];
