export type CalculatorPhase = 0 | 1 | 2 | 3 | 4;
export type CalculatorStatus = "implemented" | "planned";
export type CalculatorCategory = "dose" | "qc" | "safety" | "imaging";

export type Calculator = {
  /** Slug used as the route segment (e.g. "extraoral" → /extraoral/). */
  slug: string;
  /** Short title shown in lists and page headers. */
  title: string;
  /** One-sentence pitch for the home-page index. */
  description: string;
  phase: CalculatorPhase;
  status: CalculatorStatus;
  category: CalculatorCategory;
};

export const calculators: Calculator[] = [
  {
    slug: "extraoral",
    title: "Extraoral — PKA (DAP)",
    description:
      "Compute PKA from the measured PKL and validate against the machine-reported value.",
    phase: 1,
    status: "implemented",
    category: "dose",
  },
  {
    slug: "intraoral",
    title: "Intraoral — DEP",
    description:
      "Entrance skin dose at the cone tip for intraoral exams, validated against IN 56 reference doses.",
    phase: 1,
    status: "planned",
    category: "dose",
  },
  {
    slug: "tomografia",
    title: "Tomografia (CBCT/CT) — CTDI / DLP / E",
    description:
      "Weighted CTDI from center + peripheral readings, scaled to CTDIvol, then DLP and effective dose.",
    phase: 1,
    status: "planned",
    category: "dose",
  },
  {
    slug: "convencional",
    title: "Convencional — DEP",
    description:
      "Per-exam entrance skin dose for conventional radiography against Anexo II IN 90/2021 references.",
    phase: 1,
    status: "planned",
    category: "dose",
  },
  {
    slug: "mamografia",
    title: "Mamografia — DGM (LiF)",
    description:
      "Mean glandular dose from LiF dosimeters with G·c and S-factor lookup; IN 54 conformity.",
    phase: 1,
    status: "planned",
    category: "dose",
  },
  {
    slug: "fluoroscopia",
    title: "Fluoroscopia",
    description:
      "Entrance dose-rate (mGy/min) at typical kVp settings; IN 56 dose-rate caps for low/normal/boost.",
    phase: 1,
    status: "planned",
    category: "dose",
  },
  {
    slug: "qc/kvp",
    title: "kVp accuracy",
    description: "Measured kVp vs nominal across kVp settings; ±10% IN 56 tolerance.",
    phase: 2,
    status: "planned",
    category: "qc",
  },
  {
    slug: "qc/hvl",
    title: "HVL — camada semirredutora",
    description:
      "Compute HVL minimum from kVp and rectifier type; compare to measured HVL.",
    phase: 2,
    status: "planned",
    category: "qc",
  },
  {
    slug: "qc/rendimento",
    title: "Rendimento (tube output)",
    description: "Dose per mAs at reference distance with reproducibility (CV) and linearity checks.",
    phase: 2,
    status: "planned",
    category: "qc",
  },
  {
    slug: "qc/timer",
    title: "Exposure timer",
    description: "Measured exposure time vs nominal across the timer range.",
    phase: 2,
    status: "planned",
    category: "qc",
  },
  {
    slug: "qc/leakage",
    title: "Leakage (LR e FUGA)",
    description:
      "Leakage dose-rate at 1 m from the tube housing under maximum-load conditions.",
    phase: 3,
    status: "planned",
    category: "safety",
  },
  {
    slug: "qc/acessorios",
    title: "Lead aprons & accessories",
    description: "Pass/fail scoring for lead aprons, thyroid collars, and gonadal shields.",
    phase: 3,
    status: "planned",
    category: "safety",
  },
  {
    slug: "qc/displays",
    title: "Negatoscope & monitor luminance",
    description:
      "Negatoscope luminance and uniformity, plus diagnostic-monitor luminance and ambient illuminance.",
    phase: 3,
    status: "planned",
    category: "safety",
  },
  {
    slug: "qc/ct-number",
    title: "CT number & uniformity",
    description: "CT-number accuracy (water = 0 HU), uniformity, and noise from a CT phantom.",
    phase: 4,
    status: "planned",
    category: "imaging",
  },
  {
    slug: "qc/fantoma-mama",
    title: "Mammography phantom",
    description:
      "Daily/periodic phantom-image scoring (fibers, masses, specks visible) for mammography.",
    phase: 4,
    status: "planned",
    category: "imaging",
  },
  {
    slug: "qc/ultrassom",
    title: "Ultrassom",
    description:
      "Penetration depth, axial/lateral resolution, dead zone, anechoic/hyperechoic targets, uniformity.",
    phase: 4,
    status: "planned",
    category: "imaging",
  },
  {
    slug: "qc/ressonancia",
    title: "Ressonância",
    description: "ACR-phantom QC: SNR, geometric accuracy, slice thickness, spatial linearity.",
    phase: 4,
    status: "planned",
    category: "imaging",
  },
];

export const phaseLabels: Record<CalculatorPhase, string> = {
  0: "Infrastructure",
  1: "Dose calculators",
  2: "Foundational QC",
  3: "Safety & environment",
  4: "Extended QC",
};

export const categoryLabels: Record<CalculatorCategory, string> = {
  dose: "Dose",
  qc: "QC",
  safety: "Safety",
  imaging: "Imaging QC",
};
