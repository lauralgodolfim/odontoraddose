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
import { parse } from "@/lib/num";
import { richTags } from "@/lib/rich";
import { IN_94_PKA } from "@/lib/verdict";

type PkaInputs = {
	pklMeasured: string;
	dFocusDetector: string;
	dFocusReceptor: string;
	fieldHeight: string;
	correctionFactor: string;
};

function computePka(form: PkaInputs) {
	const pkl = parse(form.pklMeasured);
	const dDet = parse(form.dFocusDetector);
	const dRec = parse(form.dFocusReceptor);
	const height = parse(form.fieldHeight);
	const factor = parse(form.correctionFactor) ?? 1;

	if (pkl === null || dDet === null || dRec === null || height === null) {
		return null;
	}
	if (dRec === 0) return null;

	const pklCorrected = pkl * (dDet / dRec) ** 2;
	const pkaArea = pklCorrected * height;
	const pkaCalc = pkaArea * factor;
	return { pklCorrected, pkaArea, pkaCalc };
}

type PkaFormState = PkaInputs & {
	exam: string;
	mode: string;
	kvp: string;
	mA: string;
	s: string;
	beamWidth: string;
	pkaMachine: string;
};

const pkaInitial: PkaFormState = {
	exam: "",
	mode: "",
	kvp: "",
	mA: "",
	s: "",
	dFocusReceptor: "",
	dFocusDetector: "",
	fieldHeight: "",
	beamWidth: "",
	correctionFactor: "1",
	pklMeasured: "",
	pkaMachine: "",
};

export function PkaTab() {
	const t = useTranslations("extraoral");
	const equipment = useSelectedEquipment("extraoral");
	const [form, setForm] = useState<PkaFormState>(pkaInitial);

	const result = useMemo(() => {
		const base = computePka(form);
		if (!base) return null;
		const pkaMach = parse(form.pkaMachine);
		const pkaRef = parse(equipment?.referencePka ?? "");
		return { ...base, pkaMach, pkaRef };
	}, [form, equipment?.referencePka]);

	const update =
		(key: keyof PkaFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.identification")}>
					<Field label={t("fields.exam")}>
						<Input
							type="text"
							value={form.exam}
							onChange={update("exam")}
							placeholder={t("fields.examPlaceholder")}
						/>
					</Field>
					<Field label={t("fields.mode")}>
						<Input
							type="text"
							value={form.mode}
							onChange={update("mode")}
							placeholder={t("fields.modePlaceholder")}
						/>
					</Field>
					<div className="grid grid-cols-3 gap-3">
						<Field label={t("fields.kvp")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.kvp}
								onChange={update("kvp")}
							/>
						</Field>
						<Field label={t("fields.mA")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.mA}
								onChange={update("mA")}
							/>
						</Field>
						<Field label={t("fields.s")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.s}
								onChange={update("s")}
							/>
						</Field>
					</div>
				</Section>

				<Section title={t("sections.beamGeometry")}>
					<Field
						label={t("fields.dFocusReceptor")}
						hint={t("fields.dFocusReceptorHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.dFocusReceptor}
							onChange={update("dFocusReceptor")}
						/>
					</Field>
					<Field
						label={t("fields.dFocusDetector")}
						hint={t("fields.dFocusDetectorHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.dFocusDetector}
							onChange={update("dFocusDetector")}
						/>
					</Field>
					<Field label={t("fields.fieldHeight")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.fieldHeight}
							onChange={update("fieldHeight")}
						/>
					</Field>
					<Field label={t("fields.beamWidth")} hint={t("fields.beamWidthHint")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.beamWidth}
							onChange={update("beamWidth")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.measurement")}>
					<Field label={t("fields.pklMeasured")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.pklMeasured}
							onChange={update("pklMeasured")}
						/>
					</Field>
					<Field
						label={t("fields.correctionFactor")}
						hint={t("fields.correctionFactorHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.correctionFactor}
							onChange={update("correctionFactor")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.equipmentIndicator")}>
					<Field label={t("fields.pkaMachine")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.pkaMachine}
							onChange={update("pkaMachine")}
						/>
					</Field>
					<ClearButton onClick={() => setForm(pkaInitial)} />
				</Section>
			</form>

			<Reveal when={!!result}>
				{result ? (
					<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<Stat
							label={t("stats.correctedPkl")}
							value={result.pklCorrected}
							unit="mGy·cm"
						/>
						<Stat
							label={t("stats.doseAreaPka")}
							value={result.pkaArea}
							unit="mGy·cm²"
						/>
						<Stat
							label={t("stats.calculatedPka")}
							value={result.pkaCalc}
							unit="mGy·cm²"
							emphasis
						/>
						<ValidationCard
							observed={result.pkaCalc}
							observedLabel={t("validation.calc")}
							expected={result.pkaMach}
							expectedLabel={t("validation.machine")}
							unit="mGy·cm²"
							tolerance={IN_94_PKA}
							emptyHint={t("validation.hintMachine")}
						/>
						<ValidationCard
							observed={result.pkaCalc}
							observedLabel={t("validation.calc")}
							expected={result.pkaRef}
							expectedLabel={t("validation.equipment")}
							unit="mGy·cm²"
							tolerance={IN_94_PKA}
							emptyHint={t("validation.hintEquipment")}
						/>
					</section>
				) : null}
			</Reveal>

			<Reveal when={!!result}>
				{result ? (
					<ComparisonChart
						unit="mGy·cm²"
						series={[
							{
								label: t("validation.calc"),
								value: result.pkaCalc,
								tone: "primary",
							},
							{
								label: t("validation.machine"),
								value: result.pkaMach,
								tone: "neutral",
							},
							{
								label: t("validation.equipment"),
								value: result.pkaRef,
								tone: "equipment",
							},
						]}
					/>
				) : null}
			</Reveal>
			<Reveal when={!result}>
				<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
					{t.rich("empty.pka", richTags)}
				</section>
			</Reveal>

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p>{t.rich("footer.pkaFormula1", richTags)}</p>
				<p>{t.rich("footer.pkaFormula2", richTags)}</p>
				<p className="mt-1">{t("footer.pkaTolerance")}</p>
			</footer>
		</>
	);
}
