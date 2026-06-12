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

type CbctFormState = {
	exam: string;
	kermaHorizontal: string;
	kermaVertical: string;
	beamHeight: string;
	beamWidth: string;
	pkaMachine: string;
	pkaReference: string;
};

const cbctInitial: CbctFormState = {
	exam: "",
	kermaHorizontal: "",
	kermaVertical: "",
	beamHeight: "",
	beamWidth: "",
	pkaMachine: "",
	pkaReference: "",
};

function computeCbct(form: CbctFormState) {
	const horizontal = parse(form.kermaHorizontal);
	const vertical = parse(form.kermaVertical);
	const height = parse(form.beamHeight);
	const width = parse(form.beamWidth);

	if (
		horizontal === null ||
		vertical === null ||
		height === null ||
		width === null
	) {
		return null;
	}

	const kermaMean = (horizontal + vertical) / 2;
	const beamArea = height * width;
	const pkaEstimated = kermaMean * beamArea;
	return { kermaMean, beamArea, pkaEstimated };
}

export function CbctTab() {
	const t = useTranslations("extraoral");
	const tCommon = useTranslations("common");
	const equipment = useSelectedEquipment("extraoral");
	const [form, setForm] = useState<CbctFormState>(cbctInitial);

	const result = useMemo(() => {
		const base = computeCbct(form);
		if (!base) return null;
		const pkaMach = parse(form.pkaMachine);
		const pkaRef =
			parse(form.pkaReference) ?? parse(equipment?.referencePka ?? "");
		return { ...base, pkaMach, pkaRef };
	}, [form, equipment?.referencePka]);

	const update =
		(key: keyof CbctFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.measurement")}>
					<Field label={t("fields.exam")}>
						<input
							type="text"
							value={form.exam}
							onChange={update("exam")}
							placeholder={t("fields.examPlaceholder")}
							className={inputCls}
						/>
					</Field>
					<Field
						label={t("fields.kermaHorizontal")}
						hint={t("fields.kermaHorizontalHint")}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.kermaHorizontal}
							onChange={update("kermaHorizontal")}
							className={inputCls}
						/>
					</Field>
					<Field
						label={t("fields.kermaVertical")}
						hint={t("fields.kermaVerticalHint")}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.kermaVertical}
							onChange={update("kermaVertical")}
							className={inputCls}
						/>
					</Field>
				</Section>

				<Section title={t("sections.beamGeometry")}>
					<Field label={t("fields.beamHeight")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.beamHeight}
							onChange={update("beamHeight")}
							className={inputCls}
						/>
					</Field>
					<Field label={t("fields.cbctBeamWidth")}>
						<input
							type="number"
							inputMode="decimal"
							value={form.beamWidth}
							onChange={update("beamWidth")}
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
				</Section>

				<Section title={t("sections.manufacturerReference")}>
					<Field
						label={t("fields.pkaReference")}
						hint={
							equipment?.referencePka
								? t("fields.pkaReferenceDefault", {
										value: equipment.referencePka,
									})
								: t("fields.pkaReferenceHint")
						}
					>
						<input
							type="number"
							inputMode="decimal"
							value={form.pkaReference}
							onChange={update("pkaReference")}
							placeholder={equipment?.referencePka ?? ""}
							className={inputCls}
						/>
					</Field>
					<button
						type="button"
						onClick={() => setForm(cbctInitial)}
						className={clearBtnCls}
					>
						{tCommon("clear")}
					</button>
				</Section>
			</form>

			{result ? (
				<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<Stat
						label={t("stats.meanKerma")}
						value={result.kermaMean}
						unit="mGy"
					/>
					<Stat
						label={t("stats.beamArea")}
						value={result.beamArea}
						unit="cm²"
					/>
					<Stat
						label={t("stats.estimatedPka")}
						value={result.pkaEstimated}
						unit="mGy·cm²"
						emphasis
					/>
					<ValidationCard
						observed={result.pkaEstimated}
						observedLabel={t("validation.calc")}
						expected={result.pkaMach}
						expectedLabel={t("validation.machine")}
						unit="mGy·cm²"
						tolerance={IN_94_PKA}
						emptyHint={t("validation.hintMachine")}
					/>
					<ValidationCard
						observed={result.pkaEstimated}
						observedLabel={t("validation.calc")}
						expected={result.pkaRef}
						expectedLabel={t("validation.reference")}
						unit="mGy·cm²"
						tolerance={IN_94_PKA}
						emptyHint={t("validation.hintReference")}
					/>
				</section>
			) : null}

			{result ? (
				<ComparisonChart
					unit="mGy·cm²"
					series={[
						{
							label: t("validation.calc"),
							value: result.pkaEstimated,
							tone: "primary",
						},
						{
							label: t("validation.machine"),
							value: result.pkaMach,
							tone: "neutral",
						},
						{
							label: t("validation.reference"),
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
						__html: t.raw("empty.cbct") as string,
					}}
				/>
			)}

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p
					// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
					dangerouslySetInnerHTML={{
						__html: t.raw("footer.cbctFormula1") as string,
					}}
				/>
				<p
					// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
					dangerouslySetInnerHTML={{
						__html: t.raw("footer.cbctFormula2") as string,
					}}
				/>
				<p className="mt-1">{t("footer.cbctTolerance")}</p>
			</footer>
		</>
	);
}
