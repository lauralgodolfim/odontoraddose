import { fmt } from "@/lib/num";
import {
  classifyDeviation,
  type Tolerance,
  verdictMeta,
} from "@/lib/verdict";

export function ValidationCard({
  observed,
  observedLabel = "Calc",
  expected,
  expectedLabel = "Reference",
  unit,
  tolerance,
  emptyHint,
}: {
  observed: number;
  observedLabel?: string;
  expected: number | null;
  expectedLabel?: string;
  unit: string;
  tolerance: Tolerance;
  emptyHint: string;
}) {
  if (expected === null || expected === 0) {
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <span className="font-medium uppercase tracking-wider">Validation</span>
        <span>{emptyHint}</span>
      </div>
    );
  }
  const deviation = observed / expected - 1;
  const verdict = classifyDeviation(deviation, tolerance);
  const meta = verdictMeta[verdict];
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}`}>
      <span className="text-[11px] font-medium uppercase tracking-wider">
        {tolerance.reference}
      </span>
      <span className="text-2xl font-semibold">{meta.label}</span>
      <span className="font-mono text-sm tabular-nums">
        Deviation {(deviation * 100).toFixed(1)}%
      </span>
      <span className="text-xs">
        {observedLabel} {fmt(observed)} vs {expectedLabel} {fmt(expected)}{" "}
        {unit}
      </span>
      <span className="text-[11px]">{meta.sub(tolerance)}</span>
    </div>
  );
}
