"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useSelectedEquipment } from "@/components/EquipmentProvider";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { fmt, parse } from "@/lib/num";
import { hvlMinFor, type Rectifier } from "@/lib/tables/hvl";
import type { Tolerance } from "@/lib/verdict";

type FormState = {
	kvp: string;
	measuredHvl: string;
	rectifierOverride: Rectifier | "";
};

const initial: FormState = {
	kvp: "",
	measuredHvl: "",
	rectifierOverride: "",
};

const hvlFloor: Tolerance = {
	fail: 0.0,
	restricted: 0.8,
	reference: "IN 56/2019",
	kind: "floor",
};

export default function HvlPage() {
	const t = useTranslations("hvl");
	const tCommon = useTranslations("common");
	const equipment = useSelectedEquipment("qc/hvl");
	const [form, setForm] = useState<FormState>(initial);

	const rectifier: Rectifier =
		form.rectifierOverride !== ""
			? form.rectifierOverride
			: (equipment?.rectifier ?? "af");

	const rectifierLabels: Record<Rectifier, string> = {
		mono: t("fields.mono"),
		tri: t("fields.tri"),
		af: t("fields.af"),
	};

	const result = useMemo(() => {
		const kvp = parse(form.kvp);
		const measured = parse(form.measuredHvl);
		if (kvp === null) return null;
		const minimum = hvlMinFor(kvp, rectifier);
		if (minimum === null) return { minimum, measured };
		return { minimum, measured };
	}, [form.kvp, form.measuredHvl, rectifier]);

	const update =
		<K extends keyof FormState>(key: K) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

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
						<EquipmentSelector calculatorSlug="qc/hvl" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.beam")}>
						<Field label={t("fields.kvp")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.kvp}
								onChange={update("kvp")}
								className={inputCls}
							/>
						</Field>
						<Field
							label={t("fields.rectifier")}
							hint={t("fields.rectifierHint", {
								label: rectifierLabels[equipment?.rectifier ?? "af"],
							})}
						>
							<select
								value={form.rectifierOverride}
								onChange={update("rectifierOverride")}
								className={inputCls}
							>
								<option value="">{t("fields.useEquipment")}</option>
								<option value="mono">{t("fields.mono")}</option>
								<option value="tri">{t("fields.tri")}</option>
								<option value="af">{t("fields.af")}</option>
							</select>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.measuredHvl")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.measuredHvl}
								onChange={update("measuredHvl")}
								className={inputCls}
							/>
						</Field>
						<button
							type="button"
							onClick={() => setForm(initial)}
							className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
						>
							{tCommon("clear")}
						</button>
					</Section>
				</form>

				<Reveal when={!!result}>
					{result ? (
						<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Stat
								label={t("stats.hvlMinimum")}
								value={result.minimum !== null ? fmt(result.minimum) : "—"}
								unit="mm Al"
							/>
							<Stat
								label={t("stats.measuredHvl")}
								value={result.measured !== null ? fmt(result.measured) : "—"}
								unit="mm Al"
								emphasis
							/>
							{result.measured !== null && result.minimum !== null ? (
								<ValidationCard
									observed={result.measured}
									observedLabel={t("validation.measured")}
									expected={result.minimum}
									expectedLabel={t("validation.min")}
									unit="mm Al"
									tolerance={hvlFloor}
									emptyHint=""
								/>
							) : (
								<div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
									<span className="font-medium uppercase tracking-wider">
										{t("validation.in56Label")}
									</span>
									<span>
										{result.minimum === null
											? t("validation.outOfRange")
											: t("validation.enterMeasured")}
									</span>
								</div>
							)}
						</section>
					) : null}
				</Reveal>
				<Reveal when={!result}>
					<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						{t("empty")}
					</section>
				</Reveal>

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t("footer.l1")}</p>
					<p className="mt-1">{t("footer.l2")}</p>
				</footer>
			</main>
		</div>
	);
}
