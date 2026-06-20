"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ClearButton } from "@/components/ClearButton";
import { ComparisonChart } from "@/components/ComparisonChart";
import { useSelectedEquipment } from "@/components/EquipmentProvider";
import { Field, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { Input } from "@/components/ui/input";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { richTags } from "@/lib/rich";
import { IN_94 } from "@/lib/verdict";

type DfovFormState = {
	ka: string;
	a: string;
	b: string;
	c: string;
	d: string;
	reference: string;
};

const dfovInitial: DfovFormState = {
	ka: "",
	a: "",
	b: "",
	c: "",
	d: "",
	reference: "",
};

const DFOV_ACTION_LEVEL_MGY = 50;

export function DfovTab() {
	const t = useTranslations("extraoral");
	const equipment = useSelectedEquipment("extraoral");
	const [form, setForm] = useState<DfovFormState>(dfovInitial);

	const result = useMemo(() => {
		const ka = parse(form.ka);
		const a = parse(form.a);
		const b = parse(form.b);
		const c = parse(form.c);
		const d = parse(form.d);
		const reference =
			parse(form.reference) ?? parse(equipment?.referenceDfov ?? "");

		if (ka === null || a === null || b === null || c === null || d === null) {
			return null;
		}
		if (a === 0 || c === 0) return null;

		const dfov = ka * (b / a) * (d / c);
		return { dfov, reference };
	}, [form, equipment?.referenceDfov]);

	const update =
		(key: keyof DfovFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.beamAndGeometry")}>
					<Field label={t("fields.ka")} hint={t("fields.kaHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.ka}
							onChange={update("ka")}
						/>
					</Field>
					<Field label={t("fields.a")} hint={t("fields.aHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.a}
							onChange={update("a")}
						/>
					</Field>
					<Field label={t("fields.b")} hint={t("fields.bHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.b}
							onChange={update("b")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.fieldOfView")}>
					<Field label={t("fields.c")} hint={t("fields.cHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.c}
							onChange={update("c")}
						/>
					</Field>
					<Field label={t("fields.d")} hint={t("fields.dHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.d}
							onChange={update("d")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.manufacturerReference")}>
					<Field
						label={t("fields.reference")}
						hint={
							equipment?.referenceDfov
								? t("fields.referenceDefault", {
										value: equipment.referenceDfov,
									})
								: undefined
						}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.reference}
							onChange={update("reference")}
							placeholder={equipment?.referenceDfov ?? ""}
						/>
					</Field>
					<ClearButton onClick={() => setForm(dfovInitial)} />
				</Section>
			</form>

			<Reveal when={!!result}>
				{result ? (
					<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Stat
							label={t("stats.dfov")}
							value={result.dfov}
							unit="mGy"
							emphasis
						/>
						<ValidationCard
							observed={result.dfov}
							observedLabel={t("validation.calc")}
							expected={result.reference}
							expectedLabel={t("validation.reference")}
							unit="mGy"
							tolerance={IN_94}
							emptyHint={t("validation.hintDfovRef")}
						/>
						<ActionLevelCard dfov={result.dfov} />
					</section>
				) : null}
			</Reveal>

			<Reveal when={!!result}>
				{result ? (
					<ComparisonChart
						unit="mGy"
						threshold={DFOV_ACTION_LEVEL_MGY}
						thresholdLabel={t("actionLevel.label")}
						series={[
							{
								label: t("validation.calc"),
								value: result.dfov,
								tone: "primary",
							},
							{
								label: t("validation.reference"),
								value: parse(form.reference),
								tone: "neutral",
							},
							{
								label: t("validation.equipment"),
								value: parse(equipment?.referenceDfov ?? ""),
								tone: "equipment",
							},
						]}
					/>
				) : null}
			</Reveal>
			<Reveal when={!result}>
				<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
					{t.rich("empty.dfov", richTags)}
				</section>
			</Reveal>

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p>{t("footer.dfovFormula")}</p>
				<p className="mt-1">{t("footer.dfovTolerance")}</p>
				<p>{t("footer.dfovAction", { threshold: DFOV_ACTION_LEVEL_MGY })}</p>
			</footer>
		</>
	);
}

function ActionLevelCard({ dfov }: { dfov: number }) {
	const t = useTranslations("extraoral.actionLevel");
	const compliant = dfov < DFOV_ACTION_LEVEL_MGY;
	const tone = compliant
		? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
		: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
	return (
		<div className={`flex flex-col gap-1 rounded-lg border p-4 ${tone}`}>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				{t("label")}
			</span>
			<span className="text-2xl font-semibold">
				{compliant ? t("compliant") : t("aboveActionLevel")}
			</span>
			<span className="font-mono text-sm tabular-nums">
				DFOV {fmt(dfov)} mGy {compliant ? "<" : "≥"} {DFOV_ACTION_LEVEL_MGY} mGy
			</span>
			<span className="text-[11px]">
				{t("threshold", { threshold: DFOV_ACTION_LEVEL_MGY })}
			</span>
		</div>
	);
}
