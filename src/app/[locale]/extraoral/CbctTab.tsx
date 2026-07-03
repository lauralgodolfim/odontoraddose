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
import { IN_94 } from "@/lib/verdict";

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
		(key: keyof CbctFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.measurement")}>
					<Field label={t("fields.exam")}>
						<Input
							type="text"
							value={form.exam}
							onChange={update("exam")}
							placeholder={t("fields.examPlaceholder")}
						/>
					</Field>
					<Field
						label={t("fields.kermaHorizontal")}
						hint={t("fields.kermaHorizontalHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.kermaHorizontal}
							onChange={update("kermaHorizontal")}
						/>
					</Field>
					<Field
						label={t("fields.kermaVertical")}
						hint={t("fields.kermaVerticalHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.kermaVertical}
							onChange={update("kermaVertical")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.beamGeometry")}>
					<Field label={t("fields.beamHeight")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.beamHeight}
							onChange={update("beamHeight")}
						/>
					</Field>
					<Field label={t("fields.cbctBeamWidth")}>
						<Input
							type="number"
							inputMode="decimal"
							value={form.beamWidth}
							onChange={update("beamWidth")}
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
						<Input
							type="number"
							inputMode="decimal"
							value={form.pkaReference}
							onChange={update("pkaReference")}
							placeholder={equipment?.referencePka ?? ""}
						/>
					</Field>
					<ClearButton onClick={() => setForm(cbctInitial)} />
				</Section>
			</form>

			<Reveal when={!!result}>
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
							tolerance={IN_94}
							emptyHint={t("validation.hintMachine")}
						/>
						<ValidationCard
							observed={result.pkaEstimated}
							observedLabel={t("validation.calc")}
							expected={result.pkaRef}
							expectedLabel={t("validation.reference")}
							unit="mGy·cm²"
							tolerance={IN_94}
							emptyHint={t("validation.hintReference")}
						/>
					</section>
				) : null}
			</Reveal>

			<Reveal when={!!result}>
				{result ? (
					<ComparisonChart
						unit="mGy·cm²"
						tolerance={IN_94}
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
				) : null}
			</Reveal>
			<Reveal when={!result}>
				<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
					{t.rich("empty.cbct", richTags)}
				</section>
			</Reveal>

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p>{t.rich("footer.cbctFormula1", richTags)}</p>
				<p>{t.rich("footer.cbctFormula2", richTags)}</p>
				<p className="mt-1">{t("footer.cbctTolerance")}</p>
			</footer>
		</>
	);
}
