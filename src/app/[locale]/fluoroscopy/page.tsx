"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { parse } from "@/lib/num";
import type { Tolerance } from "@/lib/verdict";

const fluoroModes = {
	manual: { labelKey: "manual", capMgyPerMin: 50 },
	automatic: { labelKey: "automatic", capMgyPerMin: 100 },
	highRate: { labelKey: "highRate", capMgyPerMin: 200 },
} as const;

type Mode = keyof typeof fluoroModes;

type FormState = {
	mode: Mode;
	kvp: string;
	mA: string;
	dFocusChamber: string;
	dFocusSkin: string;
	chamberMgy: string;
	exposureSeconds: string;
	alarmMinutes: string;
};

const initial: FormState = {
	mode: "manual",
	kvp: "",
	mA: "",
	dFocusChamber: "",
	dFocusSkin: "",
	chamberMgy: "",
	exposureSeconds: "",
	alarmMinutes: "",
};

const dosRateCap: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 91 / RDC 330",
	kind: "cap",
};

const ALARM_THRESHOLD_MIN = 5;
const alarmTolerance: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 91 alarm",
	kind: "cap",
};

export default function FluoroscopyPage() {
	const t = useTranslations("fluoroscopy");
	const tCommon = useTranslations("common");
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const chamber = parse(form.chamberMgy);
		const seconds = parse(form.exposureSeconds);
		const dChamber = parse(form.dFocusChamber);
		const dSkin = parse(form.dFocusSkin);

		if (chamber === null || seconds === null || seconds <= 0) {
			return null;
		}

		const ratePerMinAtChamber = (chamber * 60) / seconds;
		let rateAtSkin: number | null = null;
		if (dChamber !== null && dSkin !== null && dSkin > 0) {
			rateAtSkin = ratePerMinAtChamber * (dChamber / dSkin) ** 2;
		}

		return {
			ratePerMinAtChamber,
			rateAtSkin,
			cap: fluoroModes[form.mode].capMgyPerMin,
		};
	}, [form]);

	const alarmMin = parse(form.alarmMinutes);

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
						<EquipmentSelector calculatorSlug="fluoroscopy" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.operatingMode")}>
						<Field label={t("fields.mode")} hint={t("fields.modeHint")}>
							<select
								value={form.mode}
								onChange={update("mode")}
								className={inputCls}
							>
								{(Object.keys(fluoroModes) as Mode[]).map((m) => (
									<option key={m} value={m}>
										{t("fields.modeOption", {
											label: t(
												// biome-ignore lint/suspicious/noExplicitAny: dynamic key
												`fields.${fluoroModes[m].labelKey}` as any,
											),
											cap: fluoroModes[m].capMgyPerMin,
										})}
									</option>
								))}
							</select>
						</Field>
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

					<Section title={t("sections.geometry")}>
						<Field
							label={t("fields.dFocusChamber")}
							hint={t("fields.dFocusChamberHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.dFocusChamber}
								onChange={update("dFocusChamber")}
								className={inputCls}
							/>
						</Field>
						<Field
							label={t("fields.dFocusSkin")}
							hint={t("fields.dFocusSkinHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.dFocusSkin}
								onChange={update("dFocusSkin")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.chamberMgy")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.chamberMgy}
								onChange={update("chamberMgy")}
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
					</Section>

					<Section title={t("sections.timeAlarm")}>
						<Field
							label={t("fields.alarmMinutes")}
							hint={t("fields.alarmMinutesHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.alarmMinutes}
								onChange={update("alarmMinutes")}
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

				{result ? (
					<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Stat
							label={t("stats.rateChamber")}
							value={result.ratePerMinAtChamber}
							unit="mGy/min"
						/>
						<Stat
							label={t("stats.rateEntrance")}
							value={result.rateAtSkin}
							unit="mGy/min"
							emphasis
						/>
						<ValidationCard
							observed={result.rateAtSkin ?? result.ratePerMinAtChamber}
							observedLabel={t("validation.rate")}
							expected={result.cap}
							expectedLabel={t("validation.cap")}
							unit="mGy/min"
							tolerance={dosRateCap}
							emptyHint=""
						/>
					</section>
				) : (
					<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						{t("empty")}
					</section>
				)}

				{alarmMin !== null ? (
					<section>
						<ValidationCard
							observed={alarmMin}
							observedLabel={t("validation.alarm")}
							expected={ALARM_THRESHOLD_MIN}
							expectedLabel={t("validation.cap")}
							unit="min"
							tolerance={alarmTolerance}
							emptyHint=""
						/>
					</section>
				) : null}

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t("footer.l1")}</p>
					<p
						// biome-ignore lint/security/noDangerouslySetInnerHtml: formula uses <sub> markup
						dangerouslySetInnerHTML={{ __html: t.raw("footer.l2") as string }}
					/>
					<p className="mt-1">{t("footer.l3")}</p>
				</footer>
			</main>
		</div>
	);
}
