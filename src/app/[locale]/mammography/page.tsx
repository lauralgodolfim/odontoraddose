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
import { fmt, parse } from "@/lib/num";
import {
	gcByHvl,
	in54Dgm,
	sFactorByTargetFilter,
	sFactorWAlByPmma,
	type TargetFilter,
} from "@/lib/tables/mammography";
import type { Tolerance } from "@/lib/verdict";

type FormState = {
	pmma: string;
	hvl: string;
	targetFilter: TargetFilter;
	kit: string;
};

const initial: FormState = {
	pmma: "45",
	hvl: "0.4",
	targetFilter: "Mo/Mo",
	kit: "",
};

const in54Cap: Tolerance = {
	fail: 0,
	restricted: 0.4,
	reference: "IN 54",
	kind: "cap",
};

const targetFilterOptions: TargetFilter[] = [
	"Mo/Mo",
	"Mo/Rh",
	"Rh/Rh",
	"W/Ag",
	"W/Rh",
	"W/Al",
];

function lookupGc(pmma: number, hvl: number): number | null {
	const row = gcByHvl.rows.find((r) => r.pmmaMm === pmma);
	if (!row) return null;
	const idx = gcByHvl.hvls.indexOf(hvl as (typeof gcByHvl.hvls)[number]);
	if (idx === -1) return null;
	return row.gc[idx];
}

function lookupS(target: TargetFilter, pmma: number): number | null {
	if (target === "W/Al") {
		const row = sFactorWAlByPmma.find((r) => r.pmmaMm === pmma);
		return row?.s ?? null;
	}
	return sFactorByTargetFilter[target]?.s ?? null;
}

function lookupIn54Cap(pmma: number) {
	return in54Dgm.find((r) => r.pmmaMm === pmma) ?? null;
}

export default function MammographyPage() {
	const t = useTranslations("mammography");
	const tCommon = useTranslations("common");
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const pmma = parse(form.pmma);
		const hvl = parse(form.hvl);
		const kit = parse(form.kit);
		if (pmma === null || hvl === null || kit === null) return null;

		const gc = lookupGc(pmma, hvl);
		const s = lookupS(form.targetFilter, pmma);
		const cap = lookupIn54Cap(pmma);

		if (gc === null || s === null) {
			return {
				gc,
				s,
				kit,
				mgd: null as number | null,
				cap,
			};
		}
		const mgd = gc * s * kit;
		return { gc, s, kit, mgd, cap };
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
						<EquipmentSelector calculatorSlug="mammography" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.phantomBeam")}>
						<Field label={t("fields.pmma")}>
							<select
								value={form.pmma}
								onChange={update("pmma")}
								className={inputCls}
							>
								{gcByHvl.rows.map((r) => {
									const cap = in54Dgm.find((c) => c.pmmaMm === r.pmmaMm);
									return (
										<option key={r.pmmaMm} value={r.pmmaMm}>
											{t("fields.pmmaOption", {
												pmma: r.pmmaMm,
												breast: r.breastEqMm,
												cap: cap ? String(cap.tolerance) : "none",
											})}
										</option>
									);
								})}
							</select>
						</Field>
						<Field label={t("fields.hvl")} hint={t("fields.hvlHint")}>
							<select
								value={form.hvl}
								onChange={update("hvl")}
								className={inputCls}
							>
								{gcByHvl.hvls.map((h) => (
									<option key={h} value={h}>
										{h.toFixed(2)} mm Al
									</option>
								))}
							</select>
						</Field>
						<Field
							label={t("fields.targetFilter")}
							hint={t("fields.targetFilterHint")}
						>
							<select
								value={form.targetFilter}
								onChange={update("targetFilter")}
								className={inputCls}
							>
								{targetFilterOptions.map((tt) => (
									<option key={tt} value={tt}>
										{tt}
									</option>
								))}
							</select>
						</Field>
					</Section>

					<Section title={t("sections.measurement")}>
						<Field label={t("fields.kit")} hint={t("fields.kitHint")}>
							<input
								type="number"
								inputMode="decimal"
								value={form.kit}
								onChange={update("kit")}
								className={inputCls}
							/>
						</Field>
						<ClearButton onClick={() => setForm(initial)} />
					</Section>
				</form>

				<Reveal when={!!result}>
					{result ? (
						<section className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Stat
								label={t("stats.gc")}
								value={result.gc !== null ? fmt(result.gc) : "—"}
								unit="—"
							/>
							<Stat
								label={t("stats.sFactor")}
								value={result.s !== null ? fmt(result.s) : "—"}
								unit="—"
							/>
							<Stat
								label={t("stats.mgd")}
								value={result.mgd !== null ? fmt(result.mgd) : "—"}
								unit="mGy"
								emphasis
							/>
							{result.mgd !== null && result.cap ? (
								<ValidationCard
									observed={result.mgd}
									observedLabel={t("validation.mgd")}
									expected={result.cap.tolerance}
									expectedLabel={t("validation.cap")}
									unit="mGy"
									tolerance={in54Cap}
									emptyHint=""
								/>
							) : (
								<div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
									<span className="font-medium uppercase tracking-wider">
										{t("validation.in54Label")}
									</span>
									<span>
										{result.cap
											? t("validation.in54Incomplete")
											: t("validation.in54None")}
									</span>
								</div>
							)}
						</section>
					) : null}
				</Reveal>
				<Reveal when={!result}>
					<section className="animate-fade-up rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
						{t("empty")}
					</section>
				</Reveal>

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t("footer.l1")}</p>
					<p className="mt-1">{t("footer.l2")}</p>
				</footer>
			</main>
		</div>
	);
}
