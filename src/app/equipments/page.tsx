"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
	const { equipments, add, update, remove } = useEquipment();
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (equipments.length === 0) {
			setActiveId(null);
			return;
		}
		if (activeId === null || !equipments.some((e) => e.id === activeId)) {
			setActiveId(equipments[0].id);
		}
	}, [equipments, activeId]);

	const active = equipments.find((e) => e.id === activeId) ?? null;

	const handleAdd = () => {
		const eq = add();
		setActiveId(eq.id);
	};

	const handleRemove = (id: string) => {
		remove(id);
		if (activeId === id) setActiveId(null);
	};

	const setField =
		<K extends keyof Equipment>(key: K) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			if (!active) return;
			const raw = e.target.value;
			update(active.id, {
				[key]: (raw === "" ? undefined : raw) as Equipment[K],
			});
		};

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
						Manage saved equipments. Each calculator can independently select
						which one to use. Stored locally on this device — nothing is sent to
						a server. Rectifier type and dosimeter brand affect calculator
						formulas; the rest is informational and shows up on printed reports.
					</p>
				</header>

				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-radiation-300">
							Saved equipments ({equipments.length})
						</h2>
						<button
							type="button"
							onClick={handleAdd}
							className="inline-flex items-center gap-1.5 rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
						>
							<Plus aria-hidden className="h-4 w-4" />
							Add new
						</button>
					</div>
					{equipments.length === 0 ? (
						<div className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
							No equipments saved yet. Click <strong>Add new</strong> to create
							one.
						</div>
					) : (
						<ul className="flex flex-col gap-2">
							{equipments.map((eq) => {
								const isActive = eq.id === activeId;
								return (
									<li
										key={eq.id}
										className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition ${
											isActive
												? "border-radiation-400 bg-radiation-400/10"
												: "border-zinc-200 bg-white hover:border-radiation-400/40 dark:border-radiation-400/20 dark:bg-zinc-950"
										}`}
									>
										<button
											type="button"
											onClick={() => setActiveId(eq.id)}
											className="flex flex-1 flex-col items-start gap-0.5 text-left"
										>
											<span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
												{eq.name || "(untitled)"}
											</span>
											<span className="text-xs text-zinc-500 dark:text-zinc-400">
												{eq.dosimeterBrand} · {eq.rectifier.toUpperCase()}
												{eq.generatorBrand ? ` · ${eq.generatorBrand}` : ""}
												{eq.generatorModel ? ` ${eq.generatorModel}` : ""}
											</span>
										</button>
										<button
											type="button"
											onClick={() => handleRemove(eq.id)}
											aria-label={`Delete ${eq.name || "equipment"}`}
											className="rounded-md border border-transparent p-1.5 text-zinc-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
										>
											<Trash2 aria-hidden className="h-4 w-4" />
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</section>

				{active ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Section title="Identification">
							<Field label="Name" hint="Displayed in selectors and lists.">
								<input
									type="text"
									value={active.name}
									onChange={setField("name")}
									placeholder="e.g. Panoramic — room 3"
									className={inputCls}
								/>
							</Field>
							<Field label="Client">
								<input
									type="text"
									value={active.client ?? ""}
									onChange={setField("client")}
									className={inputCls}
								/>
							</Field>
							<Field label="Location / room">
								<input
									type="text"
									value={active.location ?? ""}
									onChange={setField("location")}
									className={inputCls}
								/>
							</Field>
							<Field label="Service date">
								<input
									type="date"
									value={active.serviceDate ?? ""}
									onChange={setField("serviceDate")}
									className={inputCls}
								/>
							</Field>
							<Field label="Responsible">
								<input
									type="text"
									value={active.responsible ?? ""}
									onChange={setField("responsible")}
									className={inputCls}
								/>
							</Field>
						</Section>

						<Section title="QC parameters">
							<Field
								label="Rectifier"
								hint="Used by HVL minimum and beam-quality formulas."
							>
								<select
									value={active.rectifier}
									onChange={(e) =>
										update(active.id, {
											rectifier: e.target.value as Rectifier,
										})
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
									value={active.dosimeterBrand}
									onChange={(e) =>
										update(active.id, {
											dosimeterBrand: e.target.value as DosimeterBrand,
										})
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
									value={active.certificate ?? ""}
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
									value={active.generatorBrand ?? ""}
									onChange={setField("generatorBrand")}
									className={inputCls}
								/>
							</Field>
							<Field label="Model">
								<input
									type="text"
									value={active.generatorModel ?? ""}
									onChange={setField("generatorModel")}
									className={inputCls}
								/>
							</Field>
							<Field label="Serial">
								<input
									type="text"
									value={active.generatorSerial ?? ""}
									onChange={setField("generatorSerial")}
									className={inputCls}
								/>
							</Field>
							<Field label="Anvisa registration">
								<input
									type="text"
									value={active.generatorAnvisa ?? ""}
									onChange={setField("generatorAnvisa")}
									className={inputCls}
								/>
							</Field>
							<div className="grid grid-cols-2 gap-3">
								<Field label="kV nominal">
									<input
										type="number"
										inputMode="decimal"
										value={active.kvNominal ?? ""}
										onChange={setField("kvNominal")}
										className={inputCls}
									/>
								</Field>
								<Field label="mA nominal">
									<input
										type="number"
										inputMode="decimal"
										value={active.maNominal ?? ""}
										onChange={setField("maNominal")}
										className={inputCls}
									/>
								</Field>
							</div>
						</Section>
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						Select an equipment from the list to edit its fields.
					</div>
				)}
			</main>
		</div>
	);
}
