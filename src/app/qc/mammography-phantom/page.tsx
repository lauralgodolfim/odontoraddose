"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { parse } from "@/lib/num";
import { type Verdict, verdictMeta } from "@/lib/verdict";

type FormState = {
	fibers: string;
	masses: string;
	specks: string;
};

const initial: FormState = {
	fibers: "",
	masses: "",
	specks: "",
};

/** ACR mammography phantom acceptance: ≥4 fibres, ≥3 masses, ≥3 speck groups. */
const ACR_THRESHOLDS = {
	fibers: { min: 4, total: 6, label: "Fibres" },
	masses: { min: 3, total: 5, label: "Masses" },
	specks: { min: 3, total: 5, label: "Speck groups" },
} as const;

function classifyCount(value: number, min: number): Verdict {
	if (value >= min) return "pass";
	if (value >= min - 1) return "fail";
	return "restricted";
}

export default function MammographyPhantomPage() {
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const fibers = parse(form.fibers);
		const masses = parse(form.masses);
		const specks = parse(form.specks);
		if (fibers === null || masses === null || specks === null) return null;

		const v = {
			fibers: classifyCount(fibers, ACR_THRESHOLDS.fibers.min),
			masses: classifyCount(masses, ACR_THRESHOLDS.masses.min),
			specks: classifyCount(specks, ACR_THRESHOLDS.specks.min),
		};
		const verdicts = Object.values(v);
		const overall: Verdict = verdicts.includes("restricted")
			? "restricted"
			: verdicts.includes("fail")
				? "fail"
				: "pass";
		return { fibers, masses, specks, v, overall };
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
						href="../../"
						className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
					>
						<ArrowLeft aria-hidden className="h-3 w-3" /> Home
					</Link>
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
						Mammography phantom
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Daily / periodic phantom-image scoring for mammography. Counts
						visible fibres, masses, and speck groups against the ACR acceptance
						thresholds.
					</p>
					<div className="pt-1">
						<EquipmentBadge />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-3"
				>
					<Section title={ACR_THRESHOLDS.fibers.label}>
						<Field
							label={`Visible fibres (max ${ACR_THRESHOLDS.fibers.total})`}
							hint={`ACR ≥ ${ACR_THRESHOLDS.fibers.min}.`}
						>
							<input
								type="number"
								inputMode="numeric"
								min={0}
								max={ACR_THRESHOLDS.fibers.total}
								value={form.fibers}
								onChange={update("fibers")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title={ACR_THRESHOLDS.masses.label}>
						<Field
							label={`Visible masses (max ${ACR_THRESHOLDS.masses.total})`}
							hint={`ACR ≥ ${ACR_THRESHOLDS.masses.min}.`}
						>
							<input
								type="number"
								inputMode="numeric"
								min={0}
								max={ACR_THRESHOLDS.masses.total}
								value={form.masses}
								onChange={update("masses")}
								className={inputCls}
							/>
						</Field>
					</Section>

					<Section title={ACR_THRESHOLDS.specks.label}>
						<Field
							label={`Visible speck groups (max ${ACR_THRESHOLDS.specks.total})`}
							hint={`ACR ≥ ${ACR_THRESHOLDS.specks.min}.`}
						>
							<input
								type="number"
								inputMode="numeric"
								min={0}
								max={ACR_THRESHOLDS.specks.total}
								value={form.specks}
								onChange={update("specks")}
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
						{(
							Object.keys(ACR_THRESHOLDS) as (keyof typeof ACR_THRESHOLDS)[]
						).map((k) => {
							const t = ACR_THRESHOLDS[k];
							const value = result[k] as number;
							const verdict = result.v[k];
							const meta = verdictMeta[verdict];
							return (
								<div
									key={k}
									className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}`}
								>
									<span className="text-[11px] font-medium uppercase tracking-wider">
										{t.label}
									</span>
									<span className="font-mono text-2xl font-semibold tabular-nums">
										{value} / {t.total}
									</span>
									<span className="text-xs">{meta.label}</span>
									<span className="text-[11px]">ACR ≥ {t.min}</span>
								</div>
							);
						})}
						<div
							className={`flex flex-col gap-1 rounded-lg border p-4 ${verdictMeta[result.overall].tone}`}
						>
							<span className="text-[11px] font-medium uppercase tracking-wider">
								Overall
							</span>
							<span className="text-2xl font-semibold">
								{verdictMeta[result.overall].label}
							</span>
							<span className="text-[11px]">
								Worst category determines the overall verdict.
							</span>
						</div>
					</section>
				) : (
					<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						Enter visible counts for fibres, masses, and speck groups.
					</section>
				)}

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>
						ACR Mammography Quality Control Manual: ≥ 4 fibres, ≥ 3 masses, ≥ 3
						speck groups visible. Always score the largest visible object first;
						if a smaller object in the same group is more visible than a larger
						one, count both.
					</p>
				</footer>
			</main>
		</div>
	);
}
