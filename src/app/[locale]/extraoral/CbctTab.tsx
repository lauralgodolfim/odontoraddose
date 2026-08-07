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
	chamberLength: string;
	kermaHorizontal: string;
	kermaVertical: string;
	fieldSampledH: string;
	fieldSampledV: string;
	fieldLength: string;
	fieldWidth: string;
	pkaMachine: string;
};

// Pencil chambers used for CBCT dosimetry have a 100 mm active length.
const CHAMBER_LENGTH_MM = "100";

const cbctInitial: CbctFormState = {
	exam: "",
	chamberLength: CHAMBER_LENGTH_MM,
	kermaHorizontal: "",
	kermaVertical: "",
	fieldSampledH: "",
	fieldSampledV: "",
	fieldLength: "",
	fieldWidth: "",
	pkaMachine: "",
};

function computeCbct(form: CbctFormState) {
	const chamber = parse(form.chamberLength);
	const horizontal = parse(form.kermaHorizontal);
	const vertical = parse(form.kermaVertical);
	const sampledH = parse(form.fieldSampledH);
	const sampledV = parse(form.fieldSampledV);
	const length = parse(form.fieldLength);
	const width = parse(form.fieldWidth);

	if (
		chamber === null ||
		horizontal === null ||
		vertical === null ||
		sampledH === null ||
		sampledV === null ||
		length === null ||
		width === null
	) {
		return null;
	}
	// The reading is averaged over the whole active length, so the field must
	// cover part of it for the normalisation to mean anything.
	if (sampledH <= 0 || sampledV <= 0) return null;

	// Eq. (3a)/(3b): scale each reading back up to the fraction of the active
	// length the beam actually irradiated.
	const kermaNormalizedH = horizontal * (chamber / sampledH);
	const kermaNormalizedV = vertical * (chamber / sampledV);
	const kermaMean = (kermaNormalizedH + kermaNormalizedV) / 2; // Eq. (3c)
	const beamArea = length * width;
	const pkaEstimated = kermaMean * beamArea; // Eq. (4)
	return {
		kermaNormalizedH,
		kermaNormalizedV,
		kermaMean,
		beamArea,
		pkaEstimated,
	};
}

export function CbctTab() {
	const t = useTranslations("extraoral");
	const equipment = useSelectedEquipment("extraoral");
	const [form, setForm] = useState<CbctFormState>(cbctInitial);

	const result = useMemo(() => {
		const base = computeCbct(form);
		if (!base) return null;
		const pkaMach = parse(form.pkaMachine);
		const pkaRef = parse(equipment?.referencePka ?? "");
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
					<Field
						label={t("fields.chamberLength")}
						hint={t("fields.chamberLengthHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.chamberLength}
							onChange={update("chamberLength")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.normalization")}>
					<Field
						label={t("fields.fieldSampledH")}
						hint={t("fields.fieldSampledHHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.fieldSampledH}
							onChange={update("fieldSampledH")}
						/>
					</Field>
					<Field
						label={t("fields.fieldSampledV")}
						hint={t("fields.fieldSampledVHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.fieldSampledV}
							onChange={update("fieldSampledV")}
						/>
					</Field>
				</Section>

				<Section title={t("sections.beamGeometry")}>
					<Field
						label={t("fields.fieldWidth")}
						hint={t("fields.fieldWidthHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.fieldWidth}
							onChange={update("fieldWidth")}
						/>
					</Field>
					<Field
						label={t("fields.fieldLength")}
						hint={t("fields.fieldLengthHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.fieldLength}
							onChange={update("fieldLength")}
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
					<ClearButton onClick={() => setForm(cbctInitial)} />
				</Section>
			</form>

			<Reveal when={!!result}>
				{result ? (
					<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Stat
							label={t("stats.normalizedKermaH")}
							value={result.kermaNormalizedH}
							unit="mGy"
						/>
						<Stat
							label={t("stats.normalizedKermaV")}
							value={result.kermaNormalizedV}
							unit="mGy"
						/>
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
							expectedLabel={t("validation.equipment")}
							unit="mGy·cm²"
							tolerance={IN_94}
							emptyHint={t("validation.hintEquipment")}
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
								tone: "machine",
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
					{t.rich("empty.cbct", richTags)}
				</section>
			</Reveal>

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p>{t.rich("footer.cbctFormula1", richTags)}</p>
				<p>{t.rich("footer.cbctFormula2", richTags)}</p>
				<p>{t.rich("footer.cbctFormula3", richTags)}</p>
				<p className="mt-1">{t("footer.cbctTolerance")}</p>
			</footer>
		</>
	);
}
