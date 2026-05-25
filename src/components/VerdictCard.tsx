"use client";

import { useVerdictMeta } from "@/lib/useVerdictMeta";
import type { Tolerance, Verdict } from "@/lib/verdict";

export function VerdictCard({
	title,
	verdict,
	tolerance,
}: {
	title: string;
	verdict: Verdict;
	tolerance: Tolerance;
}) {
	const verdictMeta = useVerdictMeta();
	const meta = verdictMeta(verdict, tolerance);
	return (
		<div className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}`}>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				{title}
			</span>
			<span className="text-2xl font-semibold">{meta.label}</span>
			<span className="text-[11px]">{meta.sub}</span>
		</div>
	);
}
