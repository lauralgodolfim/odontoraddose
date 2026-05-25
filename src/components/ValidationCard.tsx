"use client";

import { useTranslations } from "next-intl";
import { fmt } from "@/lib/num";
import { useVerdictMeta } from "@/lib/useVerdictMeta";
import { classifyDeviation, type Tolerance } from "@/lib/verdict";

export function ValidationCard({
	observed,
	observedLabel,
	expected,
	expectedLabel,
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
	const t = useTranslations("validation");
	const verdictMeta = useVerdictMeta();
	const obsLabel = observedLabel ?? "Calc";
	const expLabel = expectedLabel ?? t("label");
	if (expected === null || expected === 0) {
		return (
			<div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
				<span className="font-medium uppercase tracking-wider">
					{t("label")}
				</span>
				<span>{emptyHint}</span>
			</div>
		);
	}
	const deviation = observed / expected - 1;
	const verdict = classifyDeviation(deviation, tolerance);
	const meta = verdictMeta(verdict, tolerance);
	const pulse = verdict === "restricted" ? " animate-alert-pulse" : "";
	return (
		<div
			className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}${pulse}`}
		>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				{tolerance.reference}
			</span>
			<span className="text-2xl font-semibold">{meta.label}</span>
			<span className="font-mono text-sm tabular-nums">
				{t("deviation", { value: (deviation * 100).toFixed(1) })}
			</span>
			<span className="text-xs">
				{obsLabel} {fmt(observed)} vs {expLabel} {fmt(expected)} {unit}
			</span>
			<span className="text-[11px]">{meta.sub}</span>
		</div>
	);
}
