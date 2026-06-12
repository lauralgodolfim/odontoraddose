"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ClearButton } from "@/components/ClearButton";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, Section } from "@/components/form";
import { Reveal } from "@/components/Reveal";
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
import {
	type CtRegion,
	ctdiVolMaxByRegion,
	ctEffectiveDoseFactor,
} from "@/lib/tables/dosimetry";
import type { Tolerance } from "@/lib/verdict";

type Mode = "helical" | "axial";

type FormState = {
	region: CtRegion;
	mode: Mode;
	kvp: string;
	mA: string;
	sliceMm: string;
	channels: string;
	pitch: string;
	ctdiCenter: string;
	ctdi3h: string;
	ctdi6h: string;
	ctdi9h: string;
	ctdi12h: string;
	calibrationFactor: string;
	detectorLengthMm: string;
	ctdiVolIndicated: string;
	dlpIndicated: string;
};

const initial: FormState = {
	region: "AbdomenAdult",
	mode: "helical",
	kvp: "",
	mA: "",
	sliceMm: "",
	channels: "",
	pitch: "1",
	ctdiCenter: "",
	ctdi3h: "",
	ctdi6h: "",
	ctdi9h: "",
	ctdi12h: "",
	calibrationFactor: "1",
	detectorLengthMm: "100",
	ctdiVolIndicated: "",
	dlpIndicated: "",
};

const ctdiAccuracyTolerance: Tolerance = {
	fail: 0.2,
	restricted: 0.4,
	reference: "IN 55",
};

const ctdiCapTolerance: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 55 cap",
	kind: "cap",
};

export default function TomographyPage() {
	const t = useTranslations("tomography");
	const tCommon = useTranslations("common");
	const tRegion = useTranslations("tomography.regions");
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const center = parse(form.ctdiCenter);
		const r3 = parse(form.ctdi3h);
		const r6 = parse(form.ctdi6h);
		const r9 = parse(form.ctdi9h);
		const r12 = parse(form.ctdi12h);
		const calibration = parse(form.calibrationFactor) ?? 1;
		const pitch = parse(form.pitch) ?? 1;
		const detectorLength = parse(form.detectorLengthMm) ?? 100;
		const slice = parse(form.sliceMm);
		const channels = parse(form.channels);
		const ctdiVolIndicated = parse(form.ctdiVolIndicated);
		const dlpIndicated = parse(form.dlpIndicated);

		if (
			center === null ||
			r3 === null ||
			r6 === null ||
			r9 === null ||
			r12 === null
		)
			return null;
		if (pitch === 0) return null;

		const peripheralAvg = (r3 + r6 + r9 + r12) / 4;
		const ctdiW = (1 / 3) * center + (2 / 3) * peripheralAvg;

		let scanLengthMm: number | null = null;
		if (
			ctdiVolIndicated !== null &&
			ctdiVolIndicated > 0 &&
			dlpIndicated !== null
		) {
			scanLengthMm = (10 * dlpIndicated) / ctdiVolIndicated;
		} else if (slice !== null && channels !== null) {
			scanLengthMm = channels * slice;
		}

		const lengthCorrection =
			scanLengthMm !== null && scanLengthMm < detectorLength
				? detectorLength / scanLengthMm
				: 1;

		const ctdiWCorrected = ctdiW * calibration * lengthCorrection;
		const ctdiVol = ctdiWCorrected / pitch;
		const dlp = scanLengthMm !== null ? (scanLengthMm * ctdiVol) / 10 : null;
		const k = ctEffectiveDoseFactor[form.region];
		const effectiveDose = dlp !== null ? dlp * k : null;
		const cap = ctdiVolMaxByRegion[form.region] ?? null;

		return {
			ctdiW,
			ctdiVol,
			dlp,
			effectiveDose,
			ctdiVolIndicated,
			cap,
			scanLengthMm,
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
						<EquipmentSelector calculatorSlug="tomography" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.scanParameters")}>
						<Field label={t("fields.region")}>
							<Select
								value={form.region}
								onValueChange={(v) =>
									setForm((f) => ({ ...f, region: v as CtRegion }))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(ctEffectiveDoseFactor) as CtRegion[]).map(
										(r) => (
											<SelectItem key={r} value={r}>
												{t("fields.regionOption", {
													label: tRegion(r),
													k: ctEffectiveDoseFactor[r],
												})}
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</Field>
						<Field label={t("fields.mode")}>
							<Select
								value={form.mode}
								onValueChange={(v) =>
									setForm((f) => ({ ...f, mode: v as Mode }))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="helical">
										{t("fields.modeHelical")}
									</SelectItem>
									<SelectItem value="axial">{t("fields.modeAxial")}</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						<div className="grid grid-cols-2 gap-3">
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
						</div>
						<div className="grid grid-cols-3 gap-3">
							<Field label={t("fields.sliceMm")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.sliceMm}
									onChange={update("sliceMm")}
								/>
							</Field>
							<Field label={t("fields.channels")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.channels}
									onChange={update("channels")}
								/>
							</Field>
							<Field label={t("fields.pitch")} hint={t("fields.pitchHint")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.pitch}
									onChange={update("pitch")}
								/>
							</Field>
						</div>
					</Section>

					<Section title={t("sections.ctdiReadings")}>
						<Field label={t("fields.central")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.ctdiCenter}
								onChange={update("ctdiCenter")}
							/>
						</Field>
						<div className="grid grid-cols-2 gap-3">
							<Field label={t("fields.h3")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.ctdi3h}
									onChange={update("ctdi3h")}
								/>
							</Field>
							<Field label={t("fields.h6")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.ctdi6h}
									onChange={update("ctdi6h")}
								/>
							</Field>
							<Field label={t("fields.h9")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.ctdi9h}
									onChange={update("ctdi9h")}
								/>
							</Field>
							<Field label={t("fields.h12")}>
								<Input
									type="number"
									inputMode="decimal"
									value={form.ctdi12h}
									onChange={update("ctdi12h")}
								/>
							</Field>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Field
								label={t("fields.calibrationFactor")}
								hint={t("fields.calibrationFactorHint")}
							>
								<Input
									type="number"
									inputMode="decimal"
									value={form.calibrationFactor}
									onChange={update("calibrationFactor")}
								/>
							</Field>
							<Field
								label={t("fields.detectorLength")}
								hint={t("fields.detectorLengthHint")}
							>
								<Input
									type="number"
									inputMode="decimal"
									value={form.detectorLengthMm}
									onChange={update("detectorLengthMm")}
								/>
							</Field>
						</div>
					</Section>

					<Section title={t("sections.machineValues")}>
						<Field
							label={t("fields.ctdiVolIndicated")}
							hint={t("fields.ctdiVolIndicatedHint")}
						>
							<Input
								type="number"
								inputMode="decimal"
								value={form.ctdiVolIndicated}
								onChange={update("ctdiVolIndicated")}
							/>
						</Field>
						<Field
							label={t("fields.dlpIndicated")}
							hint={t("fields.dlpIndicatedHint")}
						>
							<Input
								type="number"
								inputMode="decimal"
								value={form.dlpIndicated}
								onChange={update("dlpIndicated")}
							/>
						</Field>
						<ClearButton onClick={() => setForm(initial)} />
					</Section>
				</form>

				<Reveal when={!!result}>
					{result ? (
						<>
							<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<Stat
									label={t("stats.ctdiW")}
									value={result.ctdiW}
									unit="mGy"
								/>
								<Stat
									label={t("stats.ctdiVol")}
									value={result.ctdiVol}
									unit="mGy"
									emphasis
								/>
								<Stat label={t("stats.dlp")} value={result.dlp} unit="mGy·cm" />
								<Stat
									label={t("stats.effectiveDose")}
									value={result.effectiveDose}
									unit="mSv"
								/>
							</section>
							<section className="grid animate-fade-up grid-cols-1 gap-4 lg:grid-cols-2">
								<ValidationCard
									observed={result.ctdiVol}
									observedLabel={t("validation.calc")}
									expected={result.ctdiVolIndicated}
									expectedLabel={t("validation.indicated")}
									unit="mGy"
									tolerance={ctdiAccuracyTolerance}
									emptyHint={t("validation.emptyHint")}
								/>
								{result.cap !== null ? (
									<ValidationCard
										observed={result.ctdiVol}
										observedLabel={t("validation.calc")}
										expected={result.cap}
										expectedLabel={t("validation.cap")}
										unit="mGy"
										tolerance={ctdiCapTolerance}
										emptyHint=""
									/>
								) : (
									<div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
										<span className="font-medium uppercase tracking-wider">
											{t("validation.capLabel")}
										</span>
										<span>
											{t("validation.capNone", {
												region: tRegion(form.region),
											})}
										</span>
									</div>
								)}
							</section>
						</>
					) : null}
				</Reveal>
				<Reveal when={!result}>
					<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
						{t("empty")}
					</section>
				</Reveal>

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t("footer.l1")}</p>
					<p>{t("footer.l2")}</p>
					<p>{t("footer.l3")}</p>
					<p>{t("footer.l4")}</p>
					<p className="mt-1">{t("footer.l5")}</p>
				</footer>
			</main>
		</div>
	);
}
