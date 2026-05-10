"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { IN_56_PKA } from "@/lib/verdict";

type FormState = {
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

const initial: FormState = {
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

export default function ExtraoralPage() {
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const pkl = parse(form.pklMeasured);
		const dDet = parse(form.dFocusDetector);
		const dRec = parse(form.dFocusReceptor);
		const height = parse(form.fieldHeight);
		const factor = parse(form.correctionFactor) ?? 1;
		const pkaMach = parse(form.pkaMachine);

		if (pkl === null || dDet === null || dRec === null || height === null) {
			return null;
		}
		if (dRec === 0) return null;

		const pklCorrected = pkl * (dDet / dRec) ** 2;
		const pkaArea = pklCorrected * height;
		const pkaCalc = pkaArea * factor;
		return { pklCorrected, pkaArea, pkaCalc, pkaMach };
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
						href="../"
						className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
					>
						<ArrowLeft aria-hidden className="h-3 w-3" /> Home
					</Link>
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
						Extraoral — PKA (DAP)
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Computes the kerma–area product (P<sub>KA</sub>) from the P
						<sub>KL</sub> measured at the chamber and compares it against the
						value reported by the machine, per IN 56/2019.
					</p>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title="Identification">
						<Field label="Exam">
							<input
								type="text"
								value={form.exam}
								onChange={update("exam")}
								placeholder="e.g. Panoramic"
								className={inputCls}
							/>
						</Field>
						<Field label="Operation mode">
							<input
								type="text"
								value={form.mode}
								onChange={update("mode")}
								placeholder="e.g. Standard adult"
								className={inputCls}
							/>
						</Field>
						<div className="grid grid-cols-3 gap-3">
							<Field label="kVp">
								<input
									type="number"
									inputMode="decimal"
									value={form.kvp}
									onChange={update("kvp")}
									className={inputCls}
								/>
							</Field>
							<Field label="mA">
								<input
									type="number"
									inputMode="decimal"
									value={form.mA}
									onChange={update("mA")}
									className={inputCls}
								/>
							</Field>
							<Field label="s">
								<input
									type="number"
									inputMode="decimal"
									value={form.s}
									onChange={update("s")}
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
								value={form.dFocusReceptor}
								onChange={update("dFocusReceptor")}
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
								value={form.dFocusDetector}
								onChange={update("dFocusDetector")}
								className={inputCls}
							/>
						</Field>
						<Field label="Field height [cm]">
							<input
								type="number"
								inputMode="decimal"
								value={form.fieldHeight}
								onChange={update("fieldHeight")}
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
								value={form.beamWidth}
								onChange={update("beamWidth")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title="Measurement">
						<Field label="Measured P_KL [mGy·cm]">
							<input
								type="number"
								inputMode="decimal"
								value={form.pklMeasured}
								onChange={update("pklMeasured")}
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
								value={form.correctionFactor}
								onChange={update("correctionFactor")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title="Manufacturer reference">
						<Field label="Machine-reported P_KA [mGy·cm²]">
							<input
								type="number"
								inputMode="decimal"
								value={form.pkaMachine}
								onChange={update("pkaMachine")}
								className={inputCls}
							/>
						</Field>
						<button
							type="button"
							onClick={() => setForm(initial)}
							className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
						>
							Clear
						</button>
					</Section>
				</form>

				{result ? (
					<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Stat
							label="Corrected P_KL"
							value={fmt(result.pklCorrected)}
							unit="mGy·cm"
						/>
						<Stat
							label="Dose–area P_KA"
							value={fmt(result.pkaArea)}
							unit="mGy·cm²"
						/>
						<Stat
							label="Calculated P_KA"
							value={fmt(result.pkaCalc)}
							unit="mGy·cm²"
							emphasis
						/>
						<ValidationCard
							observed={result.pkaCalc}
							observedLabel="Calc"
							expected={result.pkaMach}
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
						Calculated P<sub>KA</sub> = Corrected P<sub>KL</sub> × field height
						× correction factor
					</p>
					<p className="mt-1">
						IN 56/2019 tolerance: ≤ 20% pass; 20%–40% fail; &gt; 40%
						restriction.
					</p>
				</footer>
			</main>
		</div>
	);
}
