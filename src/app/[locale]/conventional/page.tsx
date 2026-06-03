"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ClearButton } from "@/components/ClearButton";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { parse } from "@/lib/num";
import { conventionalExams } from "@/lib/tables/conventional";
import { radiationQualityFactor } from "@/lib/tables/dosimetry";
import type { Tolerance } from "@/lib/verdict";

type Station = "table" | "wallStand";

type FormState = {
	examSlug: string;
	station: Station;
	dTableReceptor: string;
	dWallStandReceptor: string;
	dFocusDetector: string;
	fid: string;
	thickness: string;
	chamberDose: string;
	radiationFactor: string;
};

const initial: FormState = {
	examSlug: conventionalExams[0].slug,
	station: "wallStand",
	dTableReceptor: "",
	dWallStandReceptor: "",
	dFocusDetector: "",
	fid: "",
	thickness: "",
	chamberDose: "",
	radiationFactor: String(radiationQualityFactor.Conventional),
};

const in90Cap: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 90/2021",
	kind: "cap",
};

export default function ConventionalPage() {
	const t = useTranslations("conventional");
	const tCommon = useTranslations("common");
	const tExams = useTranslations("conventional.exams");
	const [form, setForm] = useState<FormState>(initial);

	const exam = useMemo(
		() => conventionalExams.find((e) => e.slug === form.examSlug),
		[form.examSlug],
	);
	const examLabel = exam
		? // biome-ignore lint/suspicious/noExplicitAny: dynamic key into conventional.exams namespace
			tExams(exam.slug as any)
		: "";

	const result = useMemo(() => {
		const chamber = parse(form.chamberDose);
		const factor = parse(form.radiationFactor) ?? 1;
		const dDet = parse(form.dFocusDetector);
		const fid = parse(form.fid);
		const thicknessOverride = parse(form.thickness);
		const thickness = thicknessOverride ?? exam?.thicknessCm ?? null;
		const offset =
			form.station === "table"
				? parse(form.dTableReceptor)
				: parse(form.dWallStandReceptor);

		if (
			chamber === null ||
			dDet === null ||
			fid === null ||
			thickness === null ||
			offset === null
		)
			return null;

		const skinFocusDistance = fid - thickness - offset;
		if (skinFocusDistance <= 0) return null;

		const esd = chamber * factor * (dDet / skinFocusDistance) ** 2;
		return { esd, skinFocusDistance, maxEsd: exam?.maxEsdMgy ?? null };
	}, [form, exam]);

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
						<EquipmentSelector calculatorSlug="conventional" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.exam")}>
						<Field label={t("fields.exam")}>
							<select
								value={form.examSlug}
								onChange={update("examSlug")}
								className={inputCls}
							>
								{conventionalExams.map((e) => (
									<option key={e.slug} value={e.slug}>
										{tExams(
											// biome-ignore lint/suspicious/noExplicitAny: dynamic key
											e.slug as any,
										)}
									</option>
								))}
							</select>
						</Field>
						<Field label={t("fields.station")}>
							<select
								value={form.station}
								onChange={update("station")}
								className={inputCls}
							>
								<option value="wallStand">
									{t("fields.stationWallStand")}
								</option>
								<option value="table">{t("fields.stationTable")}</option>
							</select>
						</Field>
						<Field
							label={t("fields.thickness")}
							hint={
								exam
									? t("fields.thicknessHint", {
											exam: examLabel,
											thickness: exam.thicknessCm,
										})
									: ""
							}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.thickness}
								onChange={update("thickness")}
								placeholder={exam ? String(exam.thicknessCm) : ""}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title={t("sections.geometry")}>
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
						<Field label={t("fields.fid")} hint={t("fields.fidHint")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.fid}
								onChange={update("fid")}
								className={inputCls}
							/>
						</Field>
						<Field
							label={t("fields.dTableReceptor")}
							hint={t("fields.dTableReceptorHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.dTableReceptor}
								onChange={update("dTableReceptor")}
								className={inputCls}
							/>
						</Field>
						<Field
							label={t("fields.dWallStandReceptor")}
							hint={t("fields.dWallStandReceptorHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.dWallStandReceptor}
								onChange={update("dWallStandReceptor")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.chamberDose")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.chamberDose}
								onChange={update("chamberDose")}
								className={inputCls}
							/>
						</Field>
						<Field
							label={t("fields.radiationFactor")}
							hint={t("fields.radiationFactorHint")}
						>
							<input
								type="number"
								inputMode="decimal"
								value={form.radiationFactor}
								onChange={update("radiationFactor")}
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
								label={t("stats.focusSkin")}
								value={result.skinFocusDistance}
								unit="cm"
							/>
							<Stat
								label={t("stats.esd")}
								value={result.esd}
								unit="mGy"
								emphasis
							/>
							<ValidationCard
								observed={result.esd}
								observedLabel={t("validation.calc")}
								expected={result.maxEsd}
								expectedLabel={t("validation.cap")}
								unit="mGy"
								tolerance={in90Cap}
								emptyHint={t("validation.emptyHint")}
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
