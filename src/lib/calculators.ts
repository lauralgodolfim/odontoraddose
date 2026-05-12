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
		title: "Extraoral — PKA / DFOV CBCT",
		description:
			"PKA from measured PKL (IN 56/2019) plus DFOV for CBCT against manufacturer reference and DIN 6868-161.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "intraoral",
		title: "Intraoral — ESD",
		description:
			"Entrance skin dose at the cone tip with backscatter, optionally compared against a local protocol limit.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "tomography",
		title: "Tomography (CBCT/CT) — CTDI / DLP / E",
		description:
			"Weighted CTDI from center + peripheral readings, scaled to CTDIvol, then DLP and effective dose.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "conventional",
		title: "Conventional — ESD",
		description:
			"Per-exam entrance skin dose for conventional radiography against IN 90/2021 Annex II references.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "mammography",
		title: "Mammography — MGD",
		description:
			"Mean glandular dose with g·c and S-factor lookup; IN 54 conformity by PMMA thickness.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "fluoroscopy",
		title: "Fluoroscopy",
		description:
			"Entrance dose-rate during fluoroscopy with IN 91 / RDC 330 caps for manual / automatic / high-rate modes.",
		phase: 1,
		status: "implemented",
		category: "dose",
	},
	{
		slug: "qc/kvp",
		title: "kVp accuracy",
		description:
			"Per-shot kVp deviation and reproducibility across the shot series; IN 56 tolerances.",
		phase: 2,
		status: "implemented",
		category: "qc",
	},
	{
		slug: "qc/hvl",
		title: "HVL — half-value layer",
		description:
			"Compare measured HVL against the IN 56 minimum for kVp and rectifier type.",
		phase: 2,
		status: "implemented",
		category: "qc",
	},
	{
		slug: "qc/output",
		title: "Tube output",
		description:
			"Tube output normalised to 1 m and reference kVp; compared to the IN 56 / IN 90 conventional range.",
		phase: 2,
		status: "implemented",
		category: "qc",
	},
	{
		slug: "qc/timer",
		title: "Exposure timer",
		description:
			"Per-shot timer accuracy and reproducibility across the shot series; IN 56 tolerances.",
		phase: 2,
		status: "implemented",
		category: "qc",
	},
	{
		slug: "qc/leakage",
		title: "Leakage radiation",
		description:
			"Leakage dose-rate at 1 m from the tube housing under maximum-load conditions.",
		phase: 3,
		status: "implemented",
		category: "safety",
	},
	{
		slug: "qc/accessories",
		title: "Lead aprons & accessories",
		description:
			"Pass/fail scoring for lead aprons, thyroid collars, and gonadal shields.",
		phase: 3,
		status: "implemented",
		category: "safety",
	},
	{
		slug: "qc/displays",
		title: "Light box & monitor luminance",
		description:
			"Light-box luminance and uniformity, plus diagnostic-monitor luminance and ambient illuminance.",
		phase: 3,
		status: "implemented",
		category: "safety",
	},
	{
		slug: "qc/ct-number",
		title: "CT number & uniformity",
		description:
			"CT-number accuracy (water = 0 HU), uniformity, and noise from a water phantom.",
		phase: 4,
		status: "implemented",
		category: "imaging",
	},
	{
		slug: "qc/mammography-phantom",
		title: "Mammography phantom",
		description:
			"ACR phantom scoring (fibres, masses, speck groups) with the ≥ 4/3/3 acceptance thresholds.",
		phase: 4,
		status: "implemented",
		category: "imaging",
	},
	{
		slug: "qc/ultrasound",
		title: "Ultrasound",
		description:
			"Probe QC against per-probe baselines: penetration, axial/lateral resolution, dead zone, plus pass/fail visual checks.",
		phase: 4,
		status: "implemented",
		category: "imaging",
	},
	{
		slug: "qc/mri",
		title: "MRI",
		description:
			"ACR phantom QC: geometric accuracy, slice thickness, SNR, PIU, PSG, low-contrast.",
		phase: 4,
		status: "implemented",
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
