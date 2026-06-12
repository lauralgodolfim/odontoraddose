"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ComparisonChart } from "@/components/ComparisonChart";
import { useSelectedEquipment } from "@/components/EquipmentProvider";
import { clearBtnCls, Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { parse } from "@/lib/num";
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
	const tCommon = useTranslations("common");
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
		(key: keyof PkaFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.identification")}>
					<Field label={t("fields.exam")}>
						<input
							type="text"
							value={form.exam}
							onChange={update("exam")}
							placeholder={t("fields.examPlaceholder")}
							className={inputCls}
						/>
					</Field>
					<Field label={t("fields.mode")}>
						<input
							type="text"
							value={form.mode}
							onChange={update("mode")}
							placeholder={t("fields.modePlaceholder")}
							className={inputCls}
						/>
					</Field>
					<div className="grid grid-cols-3 gap-3">
						<Field label={t("fields.kvp")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.kvp}
								onChange={update("kvp")}
								className={inputCls}
							/>
						</Field>
						<Field label={t("fields.mA")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.mA}
								onChange={update("mA")}
								className={inputCls}
							/>
						</Field>
						<Field label={t("fields.s")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.s}
								onChange={update("s")}
								className={inputCls}
							/>
						</Field>
					</div>
				</Section>

				<Section title={t("sections.beamGeometry")}>
					<Field
						label={t("fields.dFocusReceptor")}
						hint={t("fields.dFocusReceptorHint")}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.dFocusReceptor}
							onChange={update("dFocusReceptor")}
							className={inputCls}
						/>
					</Field>
					<Field
						label={t("fields.dFocusDetector")}
						hint={t("fields.dFocusDetectorHint")}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.dFocusDetector}
							onChange={update("dFocusDetector")}
							className={inputCls}
						/>
					</Field>
					<Field label={t("fields.fieldHeight")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.fieldHeight}
							onChange={update("fieldHeight")}
							className={inputCls}
						/>
					</Field>
					<Field label={t("fields.beamWidth")} hint={t("fields.beamWidthHint")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.beamWidth}
							onChange={update("beamWidth")}
							className={inputCls}
						/>
					</Field>
				</Section>

				<Section title={t("sections.measurement")}>
					<Field label={t("fields.pklMeasured")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.pklMeasured}
							onChange={update("pklMeasured")}
							className={inputCls}
						/>
					</Field>
					<Field
						label={t("fields.correctionFactor")}
						hint={t("fields.correctionFactorHint")}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.correctionFactor}
							onChange={update("correctionFactor")}
							className={inputCls}
						/>
					</Field>
				</Section>

				<Section title={t("sections.equipmentIndicator")}>
					<Field label={t("fields.pkaMachine")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.pkaMachine}
							onChange={update("pkaMachine")}
							className={inputCls}
						/>
					</Field>
					<button
						type="button"
						onClick={() => setForm(pkaInitial)}
						className={clearBtnCls}
					>
						{tCommon("clear")}
					</button>
				</Section>
			</form>

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
			) : (
				<section
					className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <sub> markup
					dangerouslySetInnerHTML={{
						__html: t.raw("empty.pka") as string,
					}}
				/>
			)}

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p
					// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
					dangerouslySetInnerHTML={{
						__html: t.raw("footer.pkaFormula1") as string,
					}}
				/>
				<p
					// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
					dangerouslySetInnerHTML={{
						__html: t.raw("footer.pkaFormula2") as string,
					}}
				/>
				<p className="mt-1">{t("footer.pkaTolerance")}</p>
			</footer>
		</>
	);
}
