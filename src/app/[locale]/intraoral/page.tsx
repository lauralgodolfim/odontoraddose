"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EquipmentSelector } from "@/components/EquipmentSelector";
import { ClearButton, Field, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { parse } from "@/lib/num";
import { richTags } from "@/lib/rich";
import {
	type IntraoralFfd,
	intraoralBackscatter,
} from "@/lib/tables/intraoral";
import type { Tolerance } from "@/lib/verdict";

type FormState = {
	exam: string;
	kvp: string;
	mA: string;
	timeS: string;
	dFocusChamber: string;
	dFocusConeTip: string;
	chamberDose: string;
	ffd: IntraoralFfd | "custom";
	customBackscatter: string;
	referenceDose: string;
};

const initial: FormState = {
	exam: "",
	kvp: "",
	mA: "",
	timeS: "",
	dFocusChamber: "",
	dFocusConeTip: "",
	chamberDose: "",
	ffd: "ffd20",
	customBackscatter: "1",
	referenceDose: "",
};

export default function IntraoralPage() {
	const t = useTranslations("intraoral");
	const tCommon = useTranslations("common");
	const [form, setForm] = useState<FormState>(initial);

	const intraoralTolerance: Tolerance = {
		fail: 0.2,
		restricted: 0.4,
		reference: t("toleranceReference"),
	};

	const result = useMemo(() => {
		const dChamber = parse(form.dFocusChamber);
		const dCone = parse(form.dFocusConeTip);
		const chamber = parse(form.chamberDose);
		const time = parse(form.timeS);
		const referenceDose = parse(form.referenceDose);

		if (dChamber === null || dCone === null || chamber === null) return null;
		if (dCone === 0) return null;

		const distanceFactor = (dChamber / dCone) ** 2;
		const doseAtConeTip = chamber * distanceFactor;

		const factor =
			form.ffd === "custom"
				? (parse(form.customBackscatter) ?? 1)
				: intraoralBackscatter[form.ffd].factor;

		const esd = doseAtConeTip * factor;
		const doseRate = time !== null && time > 0 ? esd / time : null;

		return {
			doseAtConeTip,
			esd,
			doseRate,
			backscatterFactor: factor,
			referenceDose,
		};
	}, [form]);

	const update =
		(key: keyof FormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
				<header className="flex flex-col gap-2">
					<Link
						href="/"
						className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
					>
						<ArrowLeft aria-hidden className="h-3 w-3" /> {tCommon("home")}
					</Link>
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
						{t("title")}
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						{t("description")}
					</p>
					<div className="pt-1">
						<EquipmentSelector calculatorSlug="intraoral" />
					</div>
				</header>

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
							<Field label={t("fields.timeS")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.timeS}
									onChange={update("timeS")}
								/>
							</Field>
						</div>
					</Section>

					<Section title={t("sections.geometry")}>
						<Field
							label={t("fields.dFocusChamber")}
							hint={t("fields.dFocusChamberHint")}
						>
							<Input
								type="number"
								inputMode="decimal"
								value={form.dFocusChamber}
								onChange={update("dFocusChamber")}
							/>
						</Field>
						<Field
							label={t("fields.dFocusConeTip")}
							hint={t("fields.dFocusConeTipHint")}
						>
							<Input
								type="number"
								inputMode="decimal"
								value={form.dFocusConeTip}
								onChange={update("dFocusConeTip")}
							/>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.chamberDose")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.chamberDose}
								onChange={update("chamberDose")}
							/>
						</Field>
						<Field
							label={t("fields.backscatter")}
							hint={t("fields.backscatterHint")}
						>
							<Select
								value={form.ffd}
								onValueChange={(v) =>
									setForm((f) => ({ ...f, ffd: v as FormState["ffd"] }))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ffd20">{t("fields.ffd20")}</SelectItem>
									<SelectItem value="ffd27_5">{t("fields.ffd275")}</SelectItem>
									<SelectItem value="custom">{t("fields.custom")}</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						{form.ffd === "custom" ? (
							<Field label={t("fields.customFr")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.customBackscatter}
									onChange={update("customBackscatter")}
								/>
							</Field>
						) : null}
					</Section>

					<Section title={t("sections.reference")}>
						<Field
							label={t("fields.referenceEsd")}
							hint={t("fields.referenceEsdHint")}
						>
							<Input
								type="number"
								inputMode="decimal"
								value={form.referenceDose}
								onChange={update("referenceDose")}
							/>
						</Field>
						<ClearButton onClick={() => setForm(initial)} />
					</Section>
				</form>

				{result ? (
					<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Stat
							label={t("stats.doseAtConeTip")}
							value={result.doseAtConeTip}
							unit={t("stats.doseAtConeTipUnit")}
						/>
						<Stat
							label={t("stats.esd")}
							value={result.esd}
							unit="mGy"
							emphasis
						/>
						<Stat
							label={t("stats.doseRate")}
							value={result.doseRate}
							unit="mGy/s"
						/>
						<ValidationCard
							observed={result.esd}
							observedLabel={t("validation.calc")}
							expected={result.referenceDose}
							expectedLabel={t("validation.ref")}
							unit="mGy"
							tolerance={intraoralTolerance}
							emptyHint={t("validation.emptyHint")}
						/>
					</section>
				) : (
					<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						{t("empty")}
					</section>
				)}

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t.rich("footer.l1", richTags)}</p>
					<p>{t("footer.l2")}</p>
					<p className="mt-1">{t("footer.l3")}</p>
				</footer>
			</main>
		</div>
	);
}
