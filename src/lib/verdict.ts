export type Verdict = "pass" | "fail" | "restricted";

/**
 * - `two-sided` (default): symmetric — failures count in both directions
 *   from the expected value. Use for accuracy/reproducibility checks.
 * - `cap`: upper bound — only deviations *above* the expected value count.
 *   Use when "expected" is the maximum permitted (e.g. CTDIvol cap).
 * - `floor`: lower bound — only deviations *below* the expected value
 *   count. Use when "expected" is the minimum required (e.g. HVL minimum).
 */
export type ToleranceKind = "two-sided" | "cap" | "floor";

export type Tolerance = {
	/** Threshold above which the result fails (e.g. 0.2 = 20%). */
	fail: number;
	/** Threshold above which the result is restricted (e.g. 0.4 = 40%). */
	restricted: number;
	/** Regulation or standard reference (e.g. "IN 56/2019"). */
	reference: string;
	/** Defaults to "two-sided" if omitted. */
	kind?: ToleranceKind;
};

export const IN_94: Tolerance = {
	fail: 0.2,
	restricted: 0.4,
	reference: "IN 94",
};

export const IN_56_KVP: Tolerance = {
	fail: 0.1,
	restricted: 0.2,
	reference: "IN 56/2019",
};

export const DIN_6868_161_DFOV: Tolerance = {
	fail: 0.2,
	restricted: 0.4,
	reference: "DIN 6868-161",
};

export function classifyDeviation(deviation: number, t: Tolerance): Verdict {
	const kind = t.kind ?? "two-sided";
	let metric: number;
	if (kind === "two-sided") metric = Math.abs(deviation);
	else if (kind === "cap") metric = Math.max(deviation, 0);
	else metric = Math.max(-deviation, 0);
	if (metric > t.restricted) return "restricted";
	if (metric > t.fail) return "fail";
	return "pass";
}

export const verdictTones: Record<Verdict, string> = {
	pass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	fail: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	restricted:
		"border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function pct(x: number): string {
	return `${(x * 100).toFixed(0)}%`;
}

/**
 * English fallback meta. Use {@link useVerdictMeta} from
 * `@/lib/useVerdictMeta` in client components for translated labels.
 * Kept for compatibility with any caller that needs verdict text outside a
 * React tree.
 */
export const verdictMeta: Record<
	Verdict,
	{ label: string; sub: (t: Tolerance) => string; tone: string }
> = {
	pass: {
		label: "Pass",
		sub: (t) => `Deviation ≤ ${pct(t.fail)} — within ${t.reference} tolerance.`,
		tone: verdictTones.pass,
	},
	fail: {
		label: "Fail",
		sub: (t) =>
			`Deviation between ${pct(t.fail)} and ${pct(t.restricted)} — outside ${t.reference} tolerance.`,
		tone: verdictTones.fail,
	},
	restricted: {
		label: "Restricted",
		sub: (t) =>
			`Deviation above ${pct(t.restricted)} — usage restriction recommended.`,
		tone: verdictTones.restricted,
	},
};
