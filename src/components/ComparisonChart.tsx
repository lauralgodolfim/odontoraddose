"use client";

import { useTranslations } from "next-intl";
import { Fragment } from "react";
import {
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts";

import { fmt } from "@/lib/num";
import { pct, type Tolerance } from "@/lib/verdict";

export type ComparisonSeries = {
	label: string;
	value: number | null;
	tone?: "primary" | "neutral" | "equipment" | "machine";
};

const TONE_COLORS: Record<NonNullable<ComparisonSeries["tone"]>, string> = {
	primary: "var(--color-radiation-400)",
	neutral: "#71717a",
	equipment: "#10b981",
	machine: "#c084fc",
};

const BAND_COLORS = {
	fail: "#f59e0b",
	restricted: "#ea580c",
} as const;

type BandShapeProps = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

function makeBandShape(
	color: string,
	dashArray: string,
	opacity: number,
	tooltipText: string,
	delayMs = 0,
) {
	return function BandLine(props: BandShapeProps) {
		return (
			<g
				style={{
					animation: `chartBandIn 360ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
					transformBox: "fill-box",
					transformOrigin: "center",
				}}
			>
				<line
					x1={props.x1}
					y1={props.y1}
					x2={props.x2}
					y2={props.y2}
					stroke="transparent"
					strokeWidth={14}
					pointerEvents="stroke"
				>
					<title>{tooltipText}</title>
				</line>
				<line
					x1={props.x1}
					y1={props.y1}
					x2={props.x2}
					y2={props.y2}
					stroke={color}
					strokeOpacity={opacity}
					strokeDasharray={dashArray}
					strokeWidth={1.25}
					pointerEvents="none"
				/>
			</g>
		);
	};
}

export function ComparisonChart({
	series,
	unit,
	tolerance,
	threshold,
	thresholdLabel,
	title,
}: {
	series: ComparisonSeries[];
	unit: string;
	tolerance?: Tolerance;
	threshold?: number;
	thresholdLabel?: string;
	title?: string;
}) {
	const t = useTranslations("chart");

	const primary = series.find(
		(s): s is ComparisonSeries & { value: number } =>
			s.tone === "primary" && s.value !== null,
	);
	const comparisons = series
		.filter(
			(s): s is ComparisonSeries & { value: number } =>
				s.tone !== "primary" && s.value !== null,
		)
		.map((s) => ({
			label: s.label,
			value: s.value,
			tone: s.tone ?? "neutral",
			color: TONE_COLORS[s.tone ?? "neutral"],
		}));

	if (!primary || (comparisons.length === 0 && threshold === undefined))
		return null;

	const tabValue = primary.value;

	const bounds: number[] = [tabValue];
	for (const c of comparisons) {
		if (c.tone === "equipment" || !tolerance) {
			bounds.push(c.value);
		} else {
			bounds.push(
				c.value * (1 - tolerance.restricted),
				c.value * (1 + tolerance.restricted),
			);
		}
	}
	if (threshold !== undefined) bounds.push(threshold);
	const min = Math.min(...bounds);
	const max = Math.max(...bounds);
	const span = max - min || Math.max(Math.abs(max), 1);
	const padding = span * 0.08;
	const domain: [number, number] = [Math.max(0, min - padding), max + padding];

	return (
		<section className="animate-fade-up rounded-lg border border-zinc-200 bg-white p-4 dark:border-radiation-400/20 dark:bg-zinc-950">
			<div className="mb-2 flex items-baseline justify-between gap-2">
				<h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					{title ?? t("title")}
				</h3>
				<span className="text-[11px] text-zinc-500 dark:text-zinc-400">
					{unit}
				</span>
			</div>
			<ResponsiveContainer width="100%" height={280}>
				<ScatterChart margin={{ top: 16, right: 32, bottom: 16, left: 16 }}>
					<XAxis type="number" dataKey="x" hide domain={[0, 1]} />
					<YAxis
						type="number"
						dataKey="y"
						domain={domain}
						tickFormatter={(v: number) => fmt(v)}
						tick={{ fill: "currentColor", fontSize: 11 }}
						axisLine={{ stroke: "currentColor", strokeOpacity: 0.2 }}
						tickLine={{ stroke: "currentColor", strokeOpacity: 0.2 }}
						width={56}
					/>
					{comparisons.map((c, ci) => {
						const base = ci * 120;
						if (c.tone === "equipment" || !tolerance) {
							return (
								<ReferenceLine
									key={c.label}
									y={c.value}
									shape={makeBandShape(
										c.color,
										"0",
										0.95,
										`${c.label}: ${fmt(c.value)} ${unit}`,
										base,
									)}
								/>
							);
						}
						const lowerRestricted = c.value * (1 - tolerance.restricted);
						const lowerFail = c.value * (1 - tolerance.fail);
						const upperFail = c.value * (1 + tolerance.fail);
						const upperRestricted = c.value * (1 + tolerance.restricted);
						const refTip = `${c.label}: ${fmt(c.value)} ${unit}`;
						const tip = (sign: string, value: number, level: number) =>
							`${refTip} · ${sign}${pct(level)}: ${fmt(value)} ${unit}`;
						return (
							<Fragment key={c.label}>
								{c.tone === "machine" && (
									<ReferenceLine
										y={c.value}
										shape={makeBandShape(c.color, "0", 0.95, refTip, base)}
									/>
								)}
								<ReferenceLine
									y={lowerRestricted}
									shape={makeBandShape(
										BAND_COLORS.restricted,
										"2 4",
										0.75,
										tip("−", lowerRestricted, tolerance.restricted),
										base,
									)}
								/>
								<ReferenceLine
									y={lowerFail}
									shape={makeBandShape(
										BAND_COLORS.fail,
										"4 3",
										0.9,
										tip("−", lowerFail, tolerance.fail),
										base + 60,
									)}
								/>
								<ReferenceLine
									y={upperFail}
									shape={makeBandShape(
										BAND_COLORS.fail,
										"4 3",
										0.9,
										tip("+", upperFail, tolerance.fail),
										base + 60,
									)}
								/>
								<ReferenceLine
									y={upperRestricted}
									shape={makeBandShape(
										BAND_COLORS.restricted,
										"2 4",
										0.75,
										tip("+", upperRestricted, tolerance.restricted),
										base,
									)}
								/>
							</Fragment>
						);
					})}
					{threshold !== undefined && (
						<ReferenceLine
							y={threshold}
							stroke="#f59e0b"
							strokeDasharray="4 3"
							label={{
								value: thresholdLabel ?? `${fmt(threshold)} ${unit}`,
								position: "insideTopRight",
								fill: "#b45309",
								fontSize: 11,
							}}
						/>
					)}
					<Scatter
						data={[{ x: 0.5, y: tabValue }]}
						fill={TONE_COLORS.primary}
						shape="circle"
						isAnimationActive
						animationDuration={420}
						animationBegin={Math.max(comparisons.length, 1) * 120 + 80}
						animationEasing="ease-out"
					/>
				</ScatterChart>
			</ResponsiveContainer>
			<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-600 dark:text-zinc-400">
				<span className="inline-flex items-center gap-1.5">
					<span
						aria-hidden
						className="inline-block h-2.5 w-2.5 rounded-full"
						style={{ background: TONE_COLORS.primary }}
					/>
					<span className="font-medium">{primary.label}</span>
					<span className="font-mono tabular-nums">{fmt(tabValue)}</span>
				</span>
				{tolerance && (
					<>
						<span className="inline-flex items-center gap-1.5">
							<span
								aria-hidden
								className="inline-block h-0.5 w-4"
								style={{ background: BAND_COLORS.fail }}
							/>
							<span>±{pct(tolerance.fail)}</span>
						</span>
						<span className="inline-flex items-center gap-1.5">
							<span
								aria-hidden
								className="inline-block h-0.5 w-4"
								style={{ background: BAND_COLORS.restricted }}
							/>
							<span>±{pct(tolerance.restricted)}</span>
						</span>
					</>
				)}
				{comparisons.map((c) => (
					<span key={c.label} className="inline-flex items-center gap-1.5">
						<span className="font-medium" style={{ color: c.color }}>
							{c.label}
						</span>
						<span className="font-mono tabular-nums">{fmt(c.value)}</span>
					</span>
				))}
			</div>
		</section>
	);
}
