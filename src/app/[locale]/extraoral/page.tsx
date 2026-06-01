"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useSelectedEquipment } from "@/components/EquipmentProvider";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { Link } from "@/i18n/navigation";
import { fmt, parse } from "@/lib/num";
import { DIN_6868_161_DFOV, IN_94_PKA, type Tolerance } from "@/lib/verdict";

type TabId = "pka" | "dap" | "dfov";

type PkaInputs = {
	pklMeasured: string;
	dFocusDetector: string;
	dFocusReceptor: string;
	fieldHeight: string;
	correctionFactor: string;
};

function computePka(form: PkaInputs) {
	const pkl = parse(form.pklMeasured);
	const dDet = parse(form.dFocusDetector);
	const dRec = parse(form.dFocusReceptor);
	const height = parse(form.fieldHeight);
	const factor = parse(form.correctionFactor) ?? 1;

	if (pkl === null || dDet === null || dRec === null || height === null) {
		return null;
	}
	if (dRec === 0) return null;

	const pklCorrected = pkl * (dDet / dRec) ** 2;
	const pkaArea = pklCorrected * height;
	const pkaCalc = pkaArea * factor;
	return { pklCorrected, pkaArea, pkaCalc };
}

type PkaFormState = PkaInputs & {
	exam: string;
	mode: string;
	kvp: string;
	mA: string;
	s: string;
	beamWidth: string;
	pkaMachine: string;
};

const pkaInitial: PkaFormState = {
	exam: "",
	mode: "",
	kvp: "",
	mA: "",
	s: "",
	dFocusReceptor: "",
	dFocusDetector: "",
	fieldHeight: "",
	beamWidth: "",
	correctionFactor: "1",
	pklMeasured: "",
	pkaMachine: "",
};

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

type DfovFormState = {
	ka: string;
	a: string;
	b: string;
	c: string;
	d: string;
	reference: string;
};

const dfovInitial: DfovFormState = {
	ka: "",
	a: "",
	b: "",
	c: "",
	d: "",
	reference: "",
};

const DFOV_ACTION_LEVEL_MGY = 50;

export default function ExtraoralPage() {
	const t = useTranslations("extraoral");
	const tCommon = useTranslations("common");
	const equipment = useSelectedEquipment("extraoral");
	const [tab, setTab] = useState<TabId>("pka");
	const [pkaForm, setPkaForm] = useState<PkaFormState>(pkaInitial);
	const [dapForm, setDapForm] = useState<DapFormState>(dapInitial);
	const [dfovForm, setDfovForm] = useState<DfovFormState>(dfovInitial);

	const TABS: { id: TabId; label: string }[] = [
		{ id: "pka", label: t("tabs.pka") },
		{ id: "dap", label: t("tabs.dap") },
		{ id: "dfov", label: t("tabs.dfov") },
	];

	const pkaResult = useMemo(() => {
		const base = computePka(pkaForm);
		if (!base) return null;
		const pkaMach = parse(pkaForm.pkaMachine);
		const pkaRef = parse(equipment?.referencePka ?? "");
		return { ...base, pkaMach, pkaRef };
	}, [pkaForm, equipment?.referencePka]);

	const dapResult = useMemo(() => {
		const measured = parse(dapForm.pkaMeasured);
		if (measured === null) return null;
		const reference = parse(dapForm.pkaReference);
		const equipmentReference = parse(equipment?.referencePka ?? "");
		return { measured, reference, equipmentReference };
	}, [dapForm.pkaMeasured, dapForm.pkaReference, equipment?.referencePka]);

	const dfovResult = useMemo(() => {
		const ka = parse(dfovForm.ka);
		const a = parse(dfovForm.a);
		const b = parse(dfovForm.b);
		const c = parse(dfovForm.c);
		const d = parse(dfovForm.d);
		const reference =
			parse(dfovForm.reference) ?? parse(equipment?.referenceDfov ?? "");

		if (ka === null || a === null || b === null || c === null || d === null) {
			return null;
		}
		if (a === 0 || c === 0) return null;

		const dfov = ka * (b / a) * (d / c);
		return { dfov, reference };
	}, [dfovForm, equipment?.referenceDfov]);

	const updatePka =
		(key: keyof PkaFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setPkaForm((f) => ({ ...f, [key]: e.target.value }));

	const updateDap =
		(key: keyof DapFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setDapForm((f) => ({ ...f, [key]: e.target.value }));

	const updateDfov =
		(key: keyof DfovFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setDfovForm((f) => ({ ...f, [key]: e.target.value }));

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
					<p
						className="text-sm text-zinc-600 dark:text-zinc-400"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <strong>/<sub> markup
						dangerouslySetInnerHTML={{ __html: t.raw("description") as string }}
					/>
					<div className="pt-1">
						<EquipmentSelector calculatorSlug="extraoral" />
					</div>
				</header>

				<div
					role="tablist"
					aria-label={t("tabs.aria")}
					className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-radiation-400/20"
				>
					{TABS.map((tabItem) => {
						const active = tabItem.id === tab;
						return (
							<button
								key={tabItem.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setTab(tabItem.id)}
								className={
									active
										? "border-radiation-400 text-radiation-500 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:text-radiation-300"
										: "border-transparent text-zinc-500 hover:text-zinc-900 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:hover:text-zinc-200"
								}
							>
								{tabItem.label}
							</button>
						);
					})}
				</div>

				{tab === "pka" && (
					<>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
						>
							<Section title={t("sections.identification")}>
								<Field label={t("fields.exam")}>
									<input
										type="text"
										value={pkaForm.exam}
										onChange={updatePka("exam")}
										placeholder={t("fields.examPlaceholder")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.mode")}>
									<input
										type="text"
										value={pkaForm.mode}
										onChange={updatePka("mode")}
										placeholder={t("fields.modePlaceholder")}
										className={inputCls}
									/>
								</Field>
								<div className="grid grid-cols-3 gap-3">
									<Field label={t("fields.kvp")}>
										<input
											type="number"
											inputMode="decimal"
											value={pkaForm.kvp}
											onChange={updatePka("kvp")}
											className={inputCls}
										/>
									</Field>
									<Field label={t("fields.mA")}>
										<input
											type="number"
											inputMode="decimal"
											value={pkaForm.mA}
											onChange={updatePka("mA")}
											className={inputCls}
										/>
									</Field>
									<Field label={t("fields.s")}>
										<input
											type="number"
											inputMode="decimal"
											value={pkaForm.s}
											onChange={updatePka("s")}
											className={inputCls}
										/>
									</Field>
								</div>
							</Section>

							<Section title={t("sections.beamGeometry")}>
								<Field
									label={t("fields.dFocusReceptor")}
									hint={t("fields.dFocusReceptorHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.dFocusReceptor}
										onChange={updatePka("dFocusReceptor")}
										className={inputCls}
									/>
								</Field>
								<Field
									label={t("fields.dFocusDetector")}
									hint={t("fields.dFocusDetectorHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.dFocusDetector}
										onChange={updatePka("dFocusDetector")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.fieldHeight")}>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.fieldHeight}
										onChange={updatePka("fieldHeight")}
										className={inputCls}
									/>
								</Field>
								<Field
									label={t("fields.beamWidth")}
									hint={t("fields.beamWidthHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.beamWidth}
										onChange={updatePka("beamWidth")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title={t("sections.measurement")}>
								<Field label={t("fields.pklMeasured")}>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.pklMeasured}
										onChange={updatePka("pklMeasured")}
										className={inputCls}
									/>
								</Field>
								<Field
									label={t("fields.correctionFactor")}
									hint={t("fields.correctionFactorHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.correctionFactor}
										onChange={updatePka("correctionFactor")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title={t("sections.equipmentIndicator")}>
								<Field label={t("fields.pkaMachine")}>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.pkaMachine}
										onChange={updatePka("pkaMachine")}
										className={inputCls}
									/>
								</Field>
								<button
									type="button"
									onClick={() => setPkaForm(pkaInitial)}
									className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
								>
									{tCommon("clear")}
								</button>
							</Section>
						</form>

						{pkaResult ? (
							<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
								<Stat
									label={t("stats.correctedPkl")}
									value={pkaResult.pklCorrected}
									unit="mGy·cm"
								/>
								<Stat
									label={t("stats.doseAreaPka")}
									value={pkaResult.pkaArea}
									unit="mGy·cm²"
								/>
								<Stat
									label={t("stats.calculatedPka")}
									value={pkaResult.pkaCalc}
									unit="mGy·cm²"
									emphasis
								/>
								<ValidationCard
									observed={pkaResult.pkaCalc}
									observedLabel={t("validation.calc")}
									expected={pkaResult.pkaMach}
									expectedLabel={t("validation.machine")}
									unit="mGy·cm²"
									tolerance={IN_94_PKA}
									emptyHint={t("validation.hintMachine")}
								/>
								<ValidationCard
									observed={pkaResult.pkaCalc}
									observedLabel={t("validation.calc")}
									expected={pkaResult.pkaRef}
									expectedLabel={t("validation.equipment")}
									unit="mGy·cm²"
									tolerance={IN_94_PKA}
									emptyHint={t("validation.hintEquipment")}
								/>
							</section>
						) : (
							<section
								className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <sub> markup
								dangerouslySetInnerHTML={{ __html: t.raw("empty.pka") as string }}
							/>
						)}

						<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
							<p
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
								dangerouslySetInnerHTML={{
									__html: t.raw("footer.pkaFormula1") as string,
								}}
							/>
							<p
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
								dangerouslySetInnerHTML={{
									__html: t.raw("footer.pkaFormula2") as string,
								}}
							/>
							<p className="mt-1">{t("footer.pkaTolerance")}</p>
						</footer>
					</>
				)}

				{tab === "dap" && (
					<>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
						>
							<Section title={t("sections.comparison")}>
								<Field label={t("fields.exam")}>
									<input
										type="text"
										value={dapForm.exam}
										onChange={updateDap("exam")}
										placeholder={t("fields.examPlaceholder")}
										className={inputCls}
									/>
								</Field>
								<Field
									label={t("fields.pkaMeasured")}
									hint={t("fields.pkaMeasuredHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={dapForm.pkaMeasured}
										onChange={updateDap("pkaMeasured")}
										className={inputCls}
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
									<input
										type="number"
										inputMode="decimal"
										value={dapForm.pkaReference}
										onChange={updateDap("pkaReference")}
										placeholder={equipment?.referencePka ?? ""}
										className={inputCls}
									/>
								</Field>
								<button
									type="button"
									onClick={() => setDapForm(dapInitial)}
									className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
								>
									{tCommon("clear")}
								</button>
							</Section>
						</form>

						{dapResult ? (
							<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<Stat
									label={t("stats.measuredPka")}
									value={dapResult.measured}
									unit="mGy·cm²"
									emphasis
								/>
								<ValidationCard
									observed={dapResult.measured}
									observedLabel={t("validation.measured")}
									expected={dapResult.reference}
									expectedLabel={t("validation.reference")}
									unit="mGy·cm²"
									tolerance={DAP_TOLERANCE}
									emptyHint={t("validation.hintReference")}
								/>
								<ValidationCard
									observed={dapResult.measured}
									observedLabel={t("validation.measured")}
									expected={dapResult.equipmentReference}
									expectedLabel={t("validation.equipment")}
									unit="mGy·cm²"
									tolerance={DAP_TOLERANCE}
									emptyHint={t("validation.hintEquipment")}
								/>
							</section>
						) : (
							<section
								className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <sub> markup
								dangerouslySetInnerHTML={{ __html: t.raw("empty.dap") as string }}
							/>
						)}

						<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
							<p
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated formula uses <sub> markup
								dangerouslySetInnerHTML={{
									__html: t.raw("footer.dapFormula") as string,
								}}
							/>
							<p className="mt-1">{t("footer.dapTolerance")}</p>
						</footer>
					</>
				)}

				{tab === "dfov" && (
					<>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
						>
							<Section title={t("sections.beamAndGeometry")}>
								<Field label={t("fields.ka")} hint={t("fields.kaHint")}>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.ka}
										onChange={updateDfov("ka")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.a")} hint={t("fields.aHint")}>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.a}
										onChange={updateDfov("a")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.b")} hint={t("fields.bHint")}>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.b}
										onChange={updateDfov("b")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title={t("sections.fieldOfView")}>
								<Field label={t("fields.c")} hint={t("fields.cHint")}>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.c}
										onChange={updateDfov("c")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.d")} hint={t("fields.dHint")}>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.d}
										onChange={updateDfov("d")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title={t("sections.manufacturerReference")}>
								<Field
									label={t("fields.reference")}
									hint={
										equipment?.referenceDfov
											? t("fields.referenceDefault", {
													value: equipment.referenceDfov,
												})
											: undefined
									}
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.reference}
										onChange={updateDfov("reference")}
										placeholder={equipment?.referenceDfov ?? ""}
										className={inputCls}
									/>
								</Field>
								<button
									type="button"
									onClick={() => setDfovForm(dfovInitial)}
									className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
								>
									{tCommon("clear")}
								</button>
							</Section>
						</form>

						{dfovResult ? (
							<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<Stat
									label={t("stats.dfov")}
									value={dfovResult.dfov}
									unit="mGy"
									emphasis
								/>
								<ValidationCard
									observed={dfovResult.dfov}
									observedLabel={t("validation.calc")}
									expected={dfovResult.reference}
									expectedLabel={t("validation.reference")}
									unit="mGy"
									tolerance={DIN_6868_161_DFOV}
									emptyHint={t("validation.hintDfovRef")}
								/>
								<ActionLevelCard dfov={dfovResult.dfov} />
							</section>
						) : (
							<section
								className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <sub> markup
								dangerouslySetInnerHTML={{
									__html: t.raw("empty.dfov") as string,
								}}
							/>
						)}

						<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
							<p>{t("footer.dfovFormula")}</p>
							<p className="mt-1">{t("footer.dfovTolerance")}</p>
							<p>
								{t("footer.dfovAction", { threshold: DFOV_ACTION_LEVEL_MGY })}
							</p>
						</footer>
					</>
				)}
			</main>
		</div>
	);
}

function ActionLevelCard({ dfov }: { dfov: number }) {
	const t = useTranslations("extraoral.actionLevel");
	const compliant = dfov < DFOV_ACTION_LEVEL_MGY;
	const tone = compliant
		? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
		: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
	return (
		<div className={`flex flex-col gap-1 rounded-lg border p-4 ${tone}`}>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				{t("label")}
			</span>
			<span className="text-2xl font-semibold">
				{compliant ? t("compliant") : t("aboveActionLevel")}
			</span>
			<span className="font-mono text-sm tabular-nums">
				DFOV {fmt(dfov)} mGy {compliant ? "<" : "≥"} {DFOV_ACTION_LEVEL_MGY} mGy
			</span>
			<span className="text-[11px]">
				{t("threshold", { threshold: DFOV_ACTION_LEVEL_MGY })}
			</span>
		</div>
	);
}
