export type Verdict = "pass" | "fail" | "restricted";

export type Tolerance = {
  /** Absolute deviation above which the result fails (e.g. 0.2 = 20%). */
  fail: number;
  /** Absolute deviation above which the result is restricted (e.g. 0.4 = 40%). */
  restricted: number;
  /** Regulation or standard reference (e.g. "IN 56/2019"). */
  reference: string;
};

export const IN_56_PKA: Tolerance = {
  fail: 0.2,
  restricted: 0.4,
  reference: "IN 56/2019",
};

export const IN_56_KVP: Tolerance = {
  fail: 0.1,
  restricted: 0.2,
  reference: "IN 56/2019",
};

export function classifyDeviation(deviation: number, t: Tolerance): Verdict {
  const a = Math.abs(deviation);
  if (a > t.restricted) return "restricted";
  if (a > t.fail) return "fail";
  return "pass";
}

export const verdictMeta: Record<
  Verdict,
  { label: string; sub: (t: Tolerance) => string; tone: string }
> = {
  pass: {
    label: "Pass",
    sub: (t) =>
      `Deviation ≤ ${pct(t.fail)} — within ${t.reference} tolerance.`,
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  fail: {
    label: "Fail",
    sub: (t) =>
      `Deviation between ${pct(t.fail)} and ${pct(t.restricted)} — outside ${t.reference} tolerance.`,
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  restricted: {
    label: "Restricted",
    sub: (t) =>
      `Deviation above ${pct(t.restricted)} — usage restriction recommended.`,
    tone: "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

function pct(x: number): string {
  return `${(x * 100).toFixed(0)}%`;
}
