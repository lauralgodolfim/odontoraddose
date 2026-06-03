"use client";

import { useTranslations } from "next-intl";
import {
	Bar,
	BarChart,
	Cell,
	LabelList,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

import { fmt } from "@/lib/num";

export type ComparisonSeries = {
	label: string;
	value: number | null;
	tone?: "primary" | "neutral" | "equipment";
};

const TONE_COLORS: Record<NonNullable<ComparisonSeries["tone"]>, string> = {
	primary: "var(--color-radiation-400)",
	neutral: "#71717a",
	equipment: "#10b981",
};

export function ComparisonChart({
	series,
	unit,
	threshold,
	thresholdLabel,
}: {
	series: ComparisonSeries[];
	unit: string;
	threshold?: number;
	thresholdLabel?: string;
}) {
	const t = useTranslations("chart");
	const data = series
		.filter((s): s is ComparisonSeries & { value: number } => s.value !== null)
		.map((s) => ({
			label: s.label,
			value: s.value,
			fill: TONE_COLORS[s.tone ?? "neutral"],
		}));

	if (data.length < 2) return null;

	return (
		<section className="animate-fade-up rounded-lg border border-zinc-200 bg-white p-4 dark:border-radiation-400/20 dark:bg-zinc-950">
			<div className="mb-2 flex items-baseline justify-between gap-2">
				<h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					{t("title")}
				</h3>
				<span className="text-[11px] text-zinc-500 dark:text-zinc-400">
					{unit}
				</span>
			</div>
			<ResponsiveContainer width="100%" height={48 + data.length * 44}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
				>
					<XAxis
						type="number"
						hide
						domain={[0, (max: number) => Math.max(max, threshold ?? 0) * 1.1]}
					/>
					<YAxis
						type="category"
						dataKey="label"
						width={110}
						tick={{ fill: "currentColor", fontSize: 12 }}
						axisLine={false}
						tickLine={false}
					/>
					<Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
						{data.map((entry) => (
							<Cell key={entry.label} fill={entry.fill} />
						))}
						<LabelList
							dataKey="value"
							position="right"
							formatter={(value) =>
								typeof value === "number" ? fmt(value) : ""
							}
							className="fill-zinc-700 dark:fill-zinc-200"
							style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}
						/>
					</Bar>
					{threshold !== undefined && (
						<ReferenceLine
							x={threshold}
							stroke="#f59e0b"
							strokeDasharray="4 3"
							label={{
								value: thresholdLabel ?? `${fmt(threshold)} ${unit}`,
								position: "top",
								fill: "#b45309",
								fontSize: 11,
							}}
						/>
					)}
				</BarChart>
			</ResponsiveContainer>
		</section>
	);
}
