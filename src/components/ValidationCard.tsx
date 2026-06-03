"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAudio } from "@/lib/AudioProvider";
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
	const { playVerdict } = useAudio();
	const obsLabel = observedLabel ?? "Calc";
	const expLabel = expectedLabel ?? t("label");

	const hasVerdict = expected !== null && expected !== 0;
	const verdict = hasVerdict
		? classifyDeviation(observed / (expected as number) - 1, tolerance)
		: null;

	useEffect(() => {
		if (!verdict) return;
		playVerdict(verdict);
	}, [verdict, playVerdict]);

	if (!hasVerdict || verdict === null) {
		return (
			<div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
				<span className="font-medium uppercase tracking-wider">
					{t("vsLabel", { label: expLabel })}
				</span>
				<span>{emptyHint}</span>
			</div>
		);
	}

	const deviation = observed / (expected as number) - 1;
	const meta = verdictMeta(verdict, tolerance);
	const pulse = verdict === "restricted" ? " animate-alert-pulse" : "";
	return (
		<div
			className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}${pulse}`}
		>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				{tolerance.reference} · {t("vsLabel", { label: expLabel })}
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
