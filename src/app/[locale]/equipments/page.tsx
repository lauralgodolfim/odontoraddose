"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useEquipment } from "@/components/EquipmentProvider";
import { Field, inputCls, Section } from "@/components/form";
import { Link } from "@/i18n/navigation";
import type { Equipment } from "@/lib/equipment";
import type { Rectifier } from "@/lib/tables/hvl";

export default function EquipmentPage() {
	const t = useTranslations("equipments");
	const tCommon = useTranslations("common");
	const tRect = useTranslations("equipments.rectifiers");
	const { equipments, add, update, remove } = useEquipment();
	const [activeId, setActiveId] = useState<string | null>(null);

	const rectifiers: {
		value: Rectifier;
		label: string;
		description: string;
	}[] = [
		{ value: "mono", label: tRect("mono"), description: tRect("monoDesc") },
		{ value: "tri", label: tRect("tri"), description: tRect("triDesc") },
		{ value: "af", label: tRect("af"), description: tRect("afDesc") },
	];

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
				</header>

				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-radiation-300">
							{t("savedCount", { count: equipments.length })}
						</h2>
						<button
							type="button"
							onClick={handleAdd}
							className="inline-flex items-center gap-1.5 rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
						>
							<Plus aria-hidden className="h-4 w-4" />
							{t("addNew")}
						</button>
					</div>
					{equipments.length === 0 ? (
						<div
							className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy includes <strong>
							dangerouslySetInnerHTML={{ __html: t.raw("empty") as string }}
						/>
					) : (
						<ul className="flex flex-col gap-2">
							{equipments.map((eq) => {
								const isActive = eq.id === activeId;
								return (
									<li
										key={eq.id}
										className={`flex animate-list-enter items-center justify-between gap-3 rounded-lg border px-4 py-3 transition ${
											isActive
												? "animate-row-glow border-radiation-400 bg-radiation-400/10"
												: "border-zinc-200 bg-white hover:border-radiation-400/40 dark:border-radiation-400/20 dark:bg-zinc-950"
										}`}
									>
										<button
											type="button"
											onClick={() => setActiveId(eq.id)}
											className="flex flex-1 flex-col items-start gap-0.5 text-left"
										>
											<span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
												{eq.name || tCommon("untitled")}
											</span>
											<span className="text-xs text-zinc-500 dark:text-zinc-400">
												{eq.rectifier.toUpperCase()}
												{eq.dosimeterBrand ? ` · ${eq.dosimeterBrand}` : ""}
												{eq.generatorBrand ? ` · ${eq.generatorBrand}` : ""}
												{eq.generatorModel ? ` ${eq.generatorModel}` : ""}
											</span>
										</button>
										<button
											type="button"
											onClick={() => handleRemove(eq.id)}
											aria-label={t("deleteAria", {
												name: eq.name || t("defaultName"),
											})}
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
					<div
						key={active.id}
						className="grid animate-fade-up grid-cols-1 gap-6 md:grid-cols-2"
					>
						<Section title={t("sections.identification")}>
							<Field label={t("fields.name")} hint={t("fields.nameHint")}>
								<input
									type="text"
									value={active.name}
									onChange={setField("name")}
									placeholder={t("fields.namePlaceholder")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.client")}>
								<input
									type="text"
									value={active.client ?? ""}
									onChange={setField("client")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.location")}>
								<input
									type="text"
									value={active.location ?? ""}
									onChange={setField("location")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.serviceDate")}>
								<input
									type="date"
									value={active.serviceDate ?? ""}
									onChange={setField("serviceDate")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.responsible")}>
								<input
									type="text"
									value={active.responsible ?? ""}
									onChange={setField("responsible")}
									className={inputCls}
								/>
							</Field>
						</Section>

						<Section title={t("sections.qcParameters")}>
							<Field
								label={t("fields.rectifier")}
								hint={t("fields.rectifierHint")}
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
							<Field label={t("fields.dosimeterBrand")}>
								<input
									type="text"
									value={active.dosimeterBrand ?? ""}
									onChange={setField("dosimeterBrand")}
									placeholder={t("fields.dosimeterBrandPlaceholder")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.certificate")}>
								<input
									type="text"
									value={active.certificate ?? ""}
									onChange={setField("certificate")}
									placeholder={t("fields.certificatePlaceholder")}
									className={inputCls}
								/>
							</Field>
						</Section>

						<Section title={t("sections.generator")}>
							<Field label={t("fields.brand")}>
								<input
									type="text"
									value={active.generatorBrand ?? ""}
									onChange={setField("generatorBrand")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.model")}>
								<input
									type="text"
									value={active.generatorModel ?? ""}
									onChange={setField("generatorModel")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.serial")}>
								<input
									type="text"
									value={active.generatorSerial ?? ""}
									onChange={setField("generatorSerial")}
									className={inputCls}
								/>
							</Field>
							<Field label={t("fields.anvisa")}>
								<input
									type="text"
									value={active.generatorAnvisa ?? ""}
									onChange={setField("generatorAnvisa")}
									className={inputCls}
								/>
							</Field>
							<div className="grid grid-cols-2 gap-3">
								<Field label={t("fields.kvNominal")}>
									<input
										type="number"
										inputMode="decimal"
										value={active.kvNominal ?? ""}
										onChange={setField("kvNominal")}
										className={inputCls}
									/>
								</Field>
								<Field label={t("fields.maNominal")}>
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

						<Section title={t("sections.extraoralReferences")}>
							<Field
								label={t("fields.referencePka")}
								hint={t("fields.referencePkaHint")}
							>
								<input
									type="number"
									inputMode="decimal"
									value={active.referencePka ?? ""}
									onChange={setField("referencePka")}
									className={inputCls}
								/>
							</Field>
							<Field
								label={t("fields.referenceDfov")}
								hint={t("fields.referenceDfovHint")}
							>
								<input
									type="number"
									inputMode="decimal"
									value={active.referenceDfov ?? ""}
									onChange={setField("referenceDfov")}
									className={inputCls}
								/>
							</Field>
							<div className="grid grid-cols-2 gap-3">
								<Field
									label={t("fields.fieldHeight")}
									hint={t("fields.fieldHeightHint")}
								>
									<input
										type="number"
										inputMode="decimal"
										value={active.fieldHeight ?? ""}
										onChange={setField("fieldHeight")}
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
										value={active.beamWidth ?? ""}
										onChange={setField("beamWidth")}
										className={inputCls}
									/>
								</Field>
							</div>
						</Section>
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						{t("selectPrompt")}
					</div>
				)}
			</main>
		</div>
	);
}
