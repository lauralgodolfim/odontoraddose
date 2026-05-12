"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { DIN_6868_161_DFOV, IN_56_PKA } from "@/lib/verdict";

const TABS = [
	{ id: "pka", label: "P_KA (DAP)" },
	{ id: "dfov", label: "DFOV (CBCT)" },
] as const;
type TabId = (typeof TABS)[number]["id"];

type PkaFormState = {
	exam: string;
	mode: string;
	kvp: string;
	mA: string;
	s: string;
	dFocusReceptor: string;
	dFocusDetector: string;
	fieldHeight: string;
	beamWidth: string;
	correctionFactor: string;
	pklMeasured: string;
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
	const [tab, setTab] = useState<TabId>("pka");
	const [pkaForm, setPkaForm] = useState<PkaFormState>(pkaInitial);
	const [dfovForm, setDfovForm] = useState<DfovFormState>(dfovInitial);

	const pkaResult = useMemo(() => {
		const pkl = parse(pkaForm.pklMeasured);
		const dDet = parse(pkaForm.dFocusDetector);
		const dRec = parse(pkaForm.dFocusReceptor);
		const height = parse(pkaForm.fieldHeight);
		const factor = parse(pkaForm.correctionFactor) ?? 1;
		const pkaMach = parse(pkaForm.pkaMachine);

		if (pkl === null || dDet === null || dRec === null || height === null) {
			return null;
		}
		if (dRec === 0) return null;

		const pklCorrected = pkl * (dDet / dRec) ** 2;
		const pkaArea = pklCorrected * height;
		const pkaCalc = pkaArea * factor;
		return { pklCorrected, pkaArea, pkaCalc, pkaMach };
	}, [pkaForm]);

	const dfovResult = useMemo(() => {
		const ka = parse(dfovForm.ka);
		const a = parse(dfovForm.a);
		const b = parse(dfovForm.b);
		const c = parse(dfovForm.c);
		const d = parse(dfovForm.d);
		const reference = parse(dfovForm.reference);

		if (ka === null || a === null || b === null || c === null || d === null) {
			return null;
		}
		if (a === 0 || c === 0) return null;

		const dfov = ka * (b / a) * (d / c);
		return { dfov, reference };
	}, [dfovForm]);

	const updatePka =
		(key: keyof PkaFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setPkaForm((f) => ({ ...f, [key]: e.target.value }));

	const updateDfov =
		(key: keyof DfovFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			setDfovForm((f) => ({ ...f, [key]: e.target.value }));

	return (
		<div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
				<header className="flex flex-col gap-2">
					<Link
						href="../"
						className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
					>
						<ArrowLeft aria-hidden className="h-3 w-3" /> Home
					</Link>
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
						Extraoral
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Dose calculators for extraoral dental imaging: panoramic /
						cephalometric P<sub>KA</sub> (IN 56/2019) and CBCT DFOV (DIN
						6868-161).
					</p>
				</header>

				<div
					role="tablist"
					aria-label="Extraoral calculators"
					className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-radiation-400/20"
				>
					{TABS.map((t) => {
						const active = t.id === tab;
						return (
							<button
								key={t.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setTab(t.id)}
								className={
									active
										? "border-radiation-400 text-radiation-500 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:text-radiation-300"
										: "border-transparent text-zinc-500 hover:text-zinc-900 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:hover:text-zinc-200"
								}
							>
								{t.label}
							</button>
						);
					})}
				</div>

				{tab === "pka" ? (
					<>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
						>
							<Section title="Identification">
								<Field label="Exam">
									<input
										type="text"
										value={pkaForm.exam}
										onChange={updatePka("exam")}
										placeholder="e.g. Panoramic"
										className={inputCls}
									/>
								</Field>
								<Field label="Operation mode">
									<input
										type="text"
										value={pkaForm.mode}
										onChange={updatePka("mode")}
										placeholder="e.g. Standard adult"
										className={inputCls}
									/>
								</Field>
								<div className="grid grid-cols-3 gap-3">
									<Field label="kVp">
										<input
											type="number"
											inputMode="decimal"
											value={pkaForm.kvp}
											onChange={updatePka("kvp")}
											className={inputCls}
										/>
									</Field>
									<Field label="mA">
										<input
											type="number"
											inputMode="decimal"
											value={pkaForm.mA}
											onChange={updatePka("mA")}
											className={inputCls}
										/>
									</Field>
									<Field label="s">
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

							<Section title="Beam geometry">
								<Field
									label="Focus–receptor distance [cm]"
									hint="Distance from focus to the patient's image receptor."
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
									label="Focus–detector distance [cm]"
									hint="Distance from focus to the chamber during measurement."
								>
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.dFocusDetector}
										onChange={updatePka("dFocusDetector")}
										className={inputCls}
									/>
								</Field>
								<Field label="Field height [cm]">
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.fieldHeight}
										onChange={updatePka("fieldHeight")}
										className={inputCls}
									/>
								</Field>
								<Field
									label="Beam-swept width [cm]"
									hint="Informational — P_KL is already integrated over this width."
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

							<Section title="Measurement">
								<Field label="Measured P_KL [mGy·cm]">
									<input
										type="number"
										inputMode="decimal"
										value={pkaForm.pklMeasured}
										onChange={updatePka("pklMeasured")}
										className={inputCls}
									/>
								</Field>
								<Field
									label="Correction factor"
									hint="Keep at 1 when no factor is declared."
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

							<Section title="Manufacturer reference">
								<Field label="Machine-reported P_KA [mGy·cm²]">
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
									Clear
								</button>
							</Section>
						</form>

						{pkaResult ? (
							<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<Stat
									label="Corrected P_KL"
									value={fmt(pkaResult.pklCorrected)}
									unit="mGy·cm"
								/>
								<Stat
									label="Dose–area P_KA"
									value={fmt(pkaResult.pkaArea)}
									unit="mGy·cm²"
								/>
								<Stat
									label="Calculated P_KA"
									value={fmt(pkaResult.pkaCalc)}
									unit="mGy·cm²"
									emphasis
								/>
								<ValidationCard
									observed={pkaResult.pkaCalc}
									observedLabel="Calc"
									expected={pkaResult.pkaMach}
									expectedLabel="Machine"
									unit="mGy·cm²"
									tolerance={IN_56_PKA}
									emptyHint="Enter the machine-reported P_KA to compare."
								/>
							</section>
						) : (
							<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
								Enter measured P<sub>KL</sub>, focus–receptor and focus–detector
								distances, and field height to see the calculation.
							</section>
						)}

						<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
							<p>
								Corrected P<sub>KL</sub> = Measured P<sub>KL</sub> × (D
								<sub>focus–detector</sub> / D<sub>focus–receptor</sub>)²
							</p>
							<p>
								Calculated P<sub>KA</sub> = Corrected P<sub>KL</sub> × field
								height × correction factor
							</p>
							<p className="mt-1">
								IN 56/2019 tolerance: ≤ 20% pass; 20%–40% fail; &gt; 40%
								restriction.
							</p>
						</footer>
					</>
				) : (
					<>
						<form
							onSubmit={(e) => e.preventDefault()}
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
						>
							<Section title="Beam &amp; geometry">
								<Field
									label="Incident kerma K_a,i(FDD) [mGy]"
									hint="Kerma measured at the detector entrance."
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.ka}
										onChange={updateDfov("ka")}
										className={inputCls}
									/>
								</Field>
								<Field
									label="a — Focus–isocenter [cm]"
									hint="Distance from focus to the isocenter."
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.a}
										onChange={updateDfov("a")}
										className={inputCls}
									/>
								</Field>
								<Field
									label="b — Focus–measurement point [cm]"
									hint="Distance from focus to the measurement point."
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.b}
										onChange={updateDfov("b")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title="Field of view">
								<Field
									label="c — Scanned volume horizontal diameter [cm]"
									hint="Horizontal diameter of the scanned volume."
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.c}
										onChange={updateDfov("c")}
										className={inputCls}
									/>
								</Field>
								<Field
									label="d — Radiation field diameter at measurement [cm]"
									hint="Horizontal diameter of the radiation field at the measurement point."
								>
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.d}
										onChange={updateDfov("d")}
										className={inputCls}
									/>
								</Field>
							</Section>

							<Section title="Manufacturer reference">
								<Field label="Reference DFOV [mGy]">
									<input
										type="number"
										inputMode="decimal"
										value={dfovForm.reference}
										onChange={updateDfov("reference")}
										className={inputCls}
									/>
								</Field>
								<button
									type="button"
									onClick={() => setDfovForm(dfovInitial)}
									className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
								>
									Clear
								</button>
							</Section>
						</form>

						{dfovResult ? (
							<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<Stat
									label="DFOV"
									value={fmt(dfovResult.dfov)}
									unit="mGy"
									emphasis
								/>
								<ValidationCard
									observed={dfovResult.dfov}
									observedLabel="Calc"
									expected={dfovResult.reference}
									expectedLabel="Reference"
									unit="mGy"
									tolerance={DIN_6868_161_DFOV}
									emptyHint="Enter the manufacturer reference DFOV to compare."
								/>
								<ActionLevelCard dfov={dfovResult.dfov} />
							</section>
						) : (
							<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
								Enter K<sub>a,i</sub>, focus–isocenter (a), focus–measurement (b),
								scanned-volume diameter (c) and radiation-field diameter (d) to
								see the calculation.
							</section>
						)}

						<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
							<p>DFOV = K_a,i(FDD) × (b / a) × (d / c)</p>
							<p className="mt-1">
								DIN 6868-161 deviation vs reference: ≤ 20% pass; 20%–40% fail;
								&gt; 40% restriction.
							</p>
							<p>
								Action level (DIN 6868-161): DFOV ≥ {DFOV_ACTION_LEVEL_MGY} mGy
								— compliant; below that, image-quality action required.
							</p>
						</footer>
					</>
				)}
			</main>
		</div>
	);
}

function ActionLevelCard({ dfov }: { dfov: number }) {
	const compliant = dfov >= DFOV_ACTION_LEVEL_MGY;
	const tone = compliant
		? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
		: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
	return (
		<div className={`flex flex-col gap-1 rounded-lg border p-4 ${tone}`}>
			<span className="text-[11px] font-medium uppercase tracking-wider">
				DIN 6868-161 action level
			</span>
			<span className="text-2xl font-semibold">
				{compliant ? "Compliant" : "Below action level"}
			</span>
			<span className="font-mono text-sm tabular-nums">
				DFOV {fmt(dfov)} mGy {compliant ? "≥" : "<"} {DFOV_ACTION_LEVEL_MGY} mGy
			</span>
			<span className="text-[11px]">
				Threshold: DFOV ≥ {DFOV_ACTION_LEVEL_MGY} mGy per DIN 6868-161.
			</span>
		</div>
	);
}
