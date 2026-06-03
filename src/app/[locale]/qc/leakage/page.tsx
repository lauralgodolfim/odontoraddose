"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { parse } from "@/lib/num";
import type { Tolerance } from "@/lib/verdict";

type FormState = {
	kvp: string;
	mA: string;
	distanceCm: string;
	chamberDoseMgy: string;
	exposureSeconds: string;
};

const initial: FormState = {
	kvp: "",
	mA: "",
	distanceCm: "",
	chamberDoseMgy: "",
	exposureSeconds: "",
};

const LEAKAGE_CAP_MGY_PER_H = 1;

const leakageCap: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 56 / IEC 60601-1-3",
	kind: "cap",
};

export default function LeakagePage() {
	const t = useTranslations("leakage");
	const tCommon = useTranslations("common");
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const distance = parse(form.distanceCm);
		const chamber = parse(form.chamberDoseMgy);
		const seconds = parse(form.exposureSeconds);
		if (
			distance === null ||
			chamber === null ||
			seconds === null ||
			seconds <= 0 ||
			distance <= 0
		)
			return null;

		const ratePerHourAtDistance = (chamber * 3600) / seconds;
		const ratePerHourAt1m = ratePerHourAtDistance * (distance / 100) ** 2;

		return {
			ratePerHourAtDistance,
			ratePerHourAt1m,
		};
	}, [form]);

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
						<EquipmentSelector calculatorSlug="qc/leakage" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.testConditions")}>
						<div className="grid grid-cols-2 gap-3">
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
						</div>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field
							label={t("fields.distance")}
							hint={t("fields.distanceHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.distanceCm}
								onChange={update("distanceCm")}
								className={inputCls}
							/>
						</Field>
						<Field label={t("fields.chamberDose")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.chamberDoseMgy}
								onChange={update("chamberDoseMgy")}
								className={inputCls}
							/>
						</Field>
						<Field label={t("fields.exposureSeconds")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.exposureSeconds}
								onChange={update("exposureSeconds")}
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
								label={t("stats.rateDistance")}
								value={result.ratePerHourAtDistance}
								unit="mGy/h"
							/>
							<Stat
								label={t("stats.rate1m")}
								value={result.ratePerHourAt1m}
								unit="mGy/h"
								emphasis
							/>
							<ValidationCard
								observed={result.ratePerHourAt1m}
								observedLabel={t("validation.rate")}
								expected={LEAKAGE_CAP_MGY_PER_H}
								expectedLabel={t("validation.cap")}
								unit="mGy/h"
								tolerance={leakageCap}
								emptyHint=""
							/>
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
					<p>{t("footer.l2")}</p>
					<p className="mt-1">{t("footer.l3")}</p>
				</footer>
			</main>
		</div>
	);
}
