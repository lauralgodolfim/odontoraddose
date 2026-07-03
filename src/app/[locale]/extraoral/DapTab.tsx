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
import type { Tolerance } from "@/lib/verdict";

type DapFormState = {
	exam: string;
	pkaMeasured: string;
	pkaReference: string;
};

const dapInitial: DapFormState = {
	exam: "",
	pkaMeasured: "",
	pkaReference: "",
};

const DAP_TOLERANCE: Tolerance = {
	fail: 0.2,
	restricted: 0.4,
	reference: "IN 94",
};

export function DapTab() {
	const t = useTranslations("extraoral");
	const equipment = useSelectedEquipment("extraoral");
	const [form, setForm] = useState<DapFormState>(dapInitial);

	const result = useMemo(() => {
		const measured = parse(form.pkaMeasured);
		if (measured === null) return null;
		const reference = parse(form.pkaReference);
		const equipmentReference = parse(equipment?.referencePka ?? "");
		return { measured, reference, equipmentReference };
	}, [form.pkaMeasured, form.pkaReference, equipment?.referencePka]);

	const update =
		(key: keyof DapFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<>
			<form
				onSubmit={(e) => e.preventDefault()}
				className="grid grid-cols-1 gap-6 md:grid-cols-2"
			>
				<Section title={t("sections.comparison")}>
					<Field label={t("fields.exam")}>
						<Input
							type="text"
							value={form.exam}
							onChange={update("exam")}
							placeholder={t("fields.examPlaceholder")}
						/>
					</Field>
					<Field
						label={t("fields.pkaMeasured")}
						hint={t("fields.pkaMeasuredHint")}
					>
						<Input
							type="number"
							inputMode="decimal"
							value={form.pkaMeasured}
							onChange={update("pkaMeasured")}
						/>
					</Field>
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
					<ClearButton onClick={() => setForm(dapInitial)} />
				</Section>
			</form>

			<Reveal when={!!result}>
				{result ? (
					<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Stat
							label={t("stats.measuredPka")}
							value={result.measured}
							unit="mGy·cm²"
							emphasis
						/>
						<ValidationCard
							observed={result.measured}
							observedLabel={t("validation.measured")}
							expected={result.reference}
							expectedLabel={t("validation.reference")}
							unit="mGy·cm²"
							tolerance={DAP_TOLERANCE}
							emptyHint={t("validation.hintReference")}
						/>
						<ValidationCard
							observed={result.measured}
							observedLabel={t("validation.measured")}
							expected={result.equipmentReference}
							expectedLabel={t("validation.equipment")}
							unit="mGy·cm²"
							tolerance={DAP_TOLERANCE}
							emptyHint={t("validation.hintEquipment")}
						/>
					</section>
				) : null}
			</Reveal>

			<Reveal when={!!result}>
				{result ? (
					<ComparisonChart
						unit="mGy·cm²"
						tolerance={DAP_TOLERANCE}
						series={[
							{
								label: t("validation.measured"),
								value: result.measured,
								tone: "primary",
							},
							{
								label: t("validation.reference"),
								value: result.reference,
								tone: "neutral",
							},
							{
								label: t("validation.equipment"),
								value: result.equipmentReference,
								tone: "equipment",
							},
						]}
					/>
				) : null}
			</Reveal>
			<Reveal when={!result}>
				<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
					{t.rich("empty.dap", richTags)}
				</section>
			</Reveal>

			<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
				<p>{t.rich("footer.dapFormula", richTags)}</p>
				<p className="mt-1">{t("footer.dapTolerance")}</p>
			</footer>
		</>
	);
}
