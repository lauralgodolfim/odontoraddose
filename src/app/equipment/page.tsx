"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEquipment } from "@/components/EquipmentProvider";
import { Field, inputCls, Section } from "@/components/form";
import type { DosimeterBrand, Equipment } from "@/lib/equipment";
import type { Rectifier } from "@/lib/tables/hvl";

const dosimeterBrands: DosimeterBrand[] = ["Unfors", "Fluke", "Raysafe"];

const rectifiers: { value: Rectifier; label: string; description: string }[] = [
	{ value: "mono", label: "Mono", description: "Single-phase (60 Hz)" },
	{ value: "tri", label: "Tri", description: "Three-phase (120 Hz / 6-pulse)" },
	{ value: "af", label: "AF", description: "High frequency / continuous" },
];

export default function EquipmentPage() {
	const { equipment, update, reset } = useEquipment();

	const setField =
		<K extends keyof Equipment>(key: K) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
			update({ [key]: e.target.value || undefined } as Partial<Equipment>);

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
						Equipment
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Per-equipment context shared across calculators and reports. Saved
						locally on this device — nothing is sent to a server. Rectifier type
						and dosimeter brand affect calculator formulas; the rest is
						informational and shows up on printed reports.
					</p>
				</header>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Section title="QC parameters">
						<Field
							label="Rectifier"
							hint="Used by HVL minimum and beam-quality formulas."
						>
							<select
								value={equipment.rectifier}
								onChange={(e) =>
									update({ rectifier: e.target.value as Rectifier })
								}
								className={inputCls}
							>
								{rectifiers.map((r) => (
									<option key={r.value} value={r.value}>
										{r.label} — {r.description}
									</option>
								))}
							</select>
						</Field>
						<Field
							label="Dosimeter brand"
							hint="Affects which measurement column is read by chamber-driven calculators."
						>
							<select
								value={equipment.dosimeterBrand}
								onChange={(e) =>
									update({ dosimeterBrand: e.target.value as DosimeterBrand })
								}
								className={inputCls}
							>
								{dosimeterBrands.map((b) => (
									<option key={b} value={b}>
										{b}
									</option>
								))}
							</select>
						</Field>
						<Field label="Certificate (multimeter)">
							<input
								type="text"
								value={equipment.certificate ?? ""}
								onChange={setField("certificate")}
								placeholder="e.g. X2"
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title="Generator">
						<Field label="Brand">
							<input
								type="text"
								value={equipment.generatorBrand ?? ""}
								onChange={setField("generatorBrand")}
								className={inputCls}
							/>
						</Field>
						<Field label="Model">
							<input
								type="text"
								value={equipment.generatorModel ?? ""}
								onChange={setField("generatorModel")}
								className={inputCls}
							/>
						</Field>
						<Field label="Serial">
							<input
								type="text"
								value={equipment.generatorSerial ?? ""}
								onChange={setField("generatorSerial")}
								className={inputCls}
							/>
						</Field>
						<Field label="Anvisa registration">
							<input
								type="text"
								value={equipment.generatorAnvisa ?? ""}
								onChange={setField("generatorAnvisa")}
								className={inputCls}
							/>
						</Field>
						<div className="grid grid-cols-2 gap-3">
							<Field label="kV nominal">
								<input
									type="number"
									inputMode="decimal"
									value={equipment.kvNominal ?? ""}
									onChange={setField("kvNominal")}
									className={inputCls}
								/>
							</Field>
							<Field label="mA nominal">
								<input
									type="number"
									inputMode="decimal"
									value={equipment.maNominal ?? ""}
									onChange={setField("maNominal")}
									className={inputCls}
								/>
							</Field>
						</div>
					</Section>

					<Section title="Service">
						<Field label="Client">
							<input
								type="text"
								value={equipment.client ?? ""}
								onChange={setField("client")}
								className={inputCls}
							/>
						</Field>
						<Field label="Location / room">
							<input
								type="text"
								value={equipment.location ?? ""}
								onChange={setField("location")}
								className={inputCls}
							/>
						</Field>
						<Field label="Service date">
							<input
								type="date"
								value={equipment.serviceDate ?? ""}
								onChange={setField("serviceDate")}
								className={inputCls}
							/>
						</Field>
						<Field label="Responsible">
							<input
								type="text"
								value={equipment.responsible ?? ""}
								onChange={setField("responsible")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title="Reset">
						<p className="text-xs text-zinc-500 dark:text-zinc-500">
							Clear all stored equipment fields and reset the QC parameters to
							defaults (AF rectifier, Unfors dosimeter).
						</p>
						<button
							type="button"
							onClick={reset}
							className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
						>
							Reset to defaults
						</button>
					</Section>
				</div>
			</main>
		</div>
	);
}
