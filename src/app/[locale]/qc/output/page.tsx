"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ClearButton } from "@/components/ClearButton";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { Link } from "@/i18n/navigation";
import { parse } from "@/lib/num";
import { useVerdictMeta } from "@/lib/useVerdictMeta";
import type { Verdict } from "@/lib/verdict";

type FormState = {
	kvpRef: string;
	kvpMeasured: string;
	mA: string;
	doseRateMgyS: string;
	dfdCm: string;
	applyKvpCorrection: boolean;
	minRange: string;
	maxRange: string;
};

const initial: FormState = {
	kvpRef: "80",
	kvpMeasured: "",
	mA: "",
	doseRateMgyS: "",
	dfdCm: "",
	applyKvpCorrection: true,
	minRange: "30",
	maxRange: "65",
};

const conventionalRanges = {
	pass: { min: 30, max: 65 },
	fail: { min: 20, max: 80 },
};

function classifyOutput(value: number): Verdict {
	if (
		value < conventionalRanges.fail.min ||
		value > conventionalRanges.fail.max
	)
		return "restricted";
	if (
		value < conventionalRanges.pass.min ||
		value > conventionalRanges.pass.max
	)
		return "fail";
	return "pass";
}

const outputTolerance = {
	fail: 0,
	restricted: 0,
	reference: "IN 56 / IN 90",
};

export default function OutputPage() {
	const t = useTranslations("output");
	const tCommon = useTranslations("common");
	const verdictMeta = useVerdictMeta();
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const doseRate = parse(form.doseRateMgyS);
		const mA = parse(form.mA);
		const dfd = parse(form.dfdCm);
		const kvpRef = parse(form.kvpRef);
		const kvpMeasured = parse(form.kvpMeasured);

		if (doseRate === null || mA === null || dfd === null || mA === 0)
			return null;

		let tubeOutput = (doseRate * 1000) / mA;
		tubeOutput *= (dfd / 100) ** 2;
		if (
			form.applyKvpCorrection &&
			kvpRef !== null &&
			kvpMeasured !== null &&
			kvpMeasured > 0
		) {
			tubeOutput *= (kvpRef / kvpMeasured) ** 2;
		}

		const verdict = classifyOutput(tubeOutput);
		return { tubeOutput, verdict };
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
						<EquipmentSelector calculatorSlug="qc/output" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.beam")}>
						<div className="grid grid-cols-2 gap-3">
							<Field label={t("fields.kvpRef")}>
								<input
									type="number"
									inputMode="decimal"
									value={form.kvpRef}
									onChange={update("kvpRef")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.kvpMeasured")}>
								<input
									type="number"
									inputMode="decimal"
									value={form.kvpMeasured}
									onChange={update("kvpMeasured")}
									className={inputCls}
								/>
							</Field>
						</div>
						<Field label={t("fields.applyKvp")} hint={t("fields.applyKvpHint")}>
							<select
								value={form.applyKvpCorrection ? "yes" : "no"}
								onChange={(e) =>
									setForm((f) => ({
										...f,
										applyKvpCorrection: e.target.value === "yes",
									}))
								}
								className={inputCls}
							>
								<option value="yes">{t("fields.yes")}</option>
								<option value="no">{t("fields.no")}</option>
							</select>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.doseRate")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.doseRateMgyS}
								onChange={update("doseRateMgyS")}
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
						<Field label={t("fields.dfd")} hint={t("fields.dfdHint")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.dfdCm}
								onChange={update("dfdCm")}
								className={inputCls}
							/>
						</Field>
						<ClearButton onClick={() => setForm(initial)} />
					</Section>
				</form>

				<Reveal when={!!result}>
					{result ? (
						<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Stat
								label={t("stats.tubeOutput")}
								value={result.tubeOutput}
								unit="μGy/mAs · m²"
								emphasis
							/>
							<div
								className={`flex flex-col gap-1 rounded-lg border p-4 ${
									verdictMeta(result.verdict, outputTolerance).tone
								}`}
							>
								<span className="text-[11px] font-medium uppercase tracking-wider">
									{t("verdict.label")}
								</span>
								<span className="text-2xl font-semibold">
									{verdictMeta(result.verdict, outputTolerance).label}
								</span>
								<span className="text-[11px]">
									{t("verdict.range", {
										passMin: conventionalRanges.pass.min,
										passMax: conventionalRanges.pass.max,
										failMin: conventionalRanges.fail.min,
										failMax: conventionalRanges.fail.max,
									})}
								</span>
							</div>
							<div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
								<span className="font-medium uppercase tracking-wider">
									{t("note.title")}
								</span>
								<span>{t("note.body")}</span>
							</div>
						</section>
					) : null}
				</Reveal>
				<Reveal when={!result}>
					<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
						{t("empty")}
					</section>
				</Reveal>

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p
						// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains formula sub/sup tags
						dangerouslySetInnerHTML={{ __html: t.raw("footer.l1") as string }}
					/>
					<p className="mt-1">{t("footer.l2")}</p>
				</footer>
			</main>
		</div>
	);
}
