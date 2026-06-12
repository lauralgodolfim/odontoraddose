"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { EquipmentSelector } from "@/components/EquipmentSelector";
import { ClearButton, Field, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { VerdictCard } from "@/components/VerdictCard";
import { Link } from "@/i18n/navigation";
import { fmt, parse } from "@/lib/num";
import { useVerdictMeta } from "@/lib/useVerdictMeta";
import {
	classifyDeviation,
	IN_56_KVP,
	type Tolerance,
	type Verdict,
} from "@/lib/verdict";

const SHOT_COUNT = 5;

type FormState = {
	nominal: string;
	shots: string[];
};

const initial: FormState = {
	nominal: "",
	shots: Array.from({ length: SHOT_COUNT }, () => ""),
};

const reproTolerance: Tolerance = {
	fail: 0.05,
	restricted: 0.1,
	reference: "IN 56 reproducibility",
};

function classifyMaxDeviation(deviations: number[]): Verdict {
	let worst: Verdict = "pass";
	for (const d of deviations) {
		const v = classifyDeviation(d, IN_56_KVP);
		if (v === "restricted") return "restricted";
		if (v === "fail") worst = "fail";
	}
	return worst;
}

export default function KvpPage() {
	const t = useTranslations("kvp");
	const tCommon = useTranslations("common");
	const verdictMeta = useVerdictMeta();
	const [form, setForm] = useState<FormState>(initial);

	const result = useMemo(() => {
		const nominal = parse(form.nominal);
		const measured = form.shots.map((v) => parse(v));
		const valid = measured.filter((v): v is number => v !== null);
		if (nominal === null || nominal === 0 || valid.length === 0) return null;

		const deviations = valid.map((m) => m / nominal - 1);
		const accuracyVerdict = classifyMaxDeviation(deviations);

		const max = Math.max(...valid);
		const min = Math.min(...valid);
		const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
		const reproducibility = avg === 0 ? 0 : (max - min) / avg;
		const reproVerdict = classifyDeviation(reproducibility, reproTolerance);

		return {
			nominal,
			measured,
			deviations,
			accuracyVerdict,
			avg,
			reproducibility,
			reproVerdict,
		};
	}, [form]);

	const updateShot = (idx: number) => (value: string) =>
		setForm((f) => {
			const shots = [...f.shots];
			shots[idx] = value;
			return { ...f, shots };
		});

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
						<EquipmentSelector calculatorSlug="qc/kvp" />
					</div>
				</header>

				<form
					onSubmit={(e) => e.preventDefault()}
					className="grid grid-cols-1 gap-6 md:grid-cols-2"
				>
					<Section title={t("sections.nominal")}>
						<Field label={t("fields.nominal")}>
							<Input
								type="number"
								inputMode="decimal"
								value={form.nominal}
								onChange={(e) =>
									setForm((f) => ({ ...f, nominal: e.target.value }))
								}
							/>
						</Field>
						<ClearButton onClick={() => setForm(initial)} />
					</Section>

					<Section title={t("sections.measured")}>
						{form.shots.map((shot, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: shots are fixed-length positional inputs (Shot 1..N); index is the stable identity
							<Field key={idx} label={t("fields.shot", { n: idx + 1 })}>
								<Input
									type="number"
									inputMode="decimal"
									value={shot}
									onChange={(e) => updateShot(idx)(e.target.value)}
								/>
							</Field>
						))}
					</Section>
				</form>

				{result ? (
					<>
						<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<Stat label={t("stats.meanKvp")} value={result.avg} unit="kVp" />
							<Stat
								label={t("stats.reproducibility")}
								value={`${(result.reproducibility * 100).toFixed(1)}%`}
								unit={t("stats.reproducibilityUnit")}
								emphasis
							/>
							<VerdictCard
								title={t("verdicts.reproTitle")}
								verdict={result.reproVerdict}
								tolerance={reproTolerance}
							/>
						</section>
						<section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
							<Table className="w-full text-sm">
								<TableHeader className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
									<TableRow>
										<TableHead className="px-4 py-2 text-left font-medium">
											{t("table.shot")}
										</TableHead>
										<TableHead className="px-4 py-2 text-right font-medium">
											{t("table.measured")}
										</TableHead>
										<TableHead className="px-4 py-2 text-right font-medium">
											{t("table.deviation")}
										</TableHead>
										<TableHead className="px-4 py-2 text-right font-medium">
											{t("table.in56")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{result.measured.map((m, idx) => {
										if (m === null) return null;
										const dev = result.deviations[idx];
										const verdict = classifyDeviation(dev, IN_56_KVP);
										const meta = verdictMeta(verdict, IN_56_KVP);
										return (
											<TableRow
												// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional shot entries; index matches the input slot above
												key={idx}
												className="border-t border-zinc-100 dark:border-zinc-900"
											>
												<TableCell className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
													{idx + 1}
												</TableCell>
												<TableCell className="px-4 py-2 text-right font-mono tabular-nums">
													{fmt(m)}
												</TableCell>
												<TableCell className="px-4 py-2 text-right font-mono tabular-nums">
													{(dev * 100).toFixed(1)}%
												</TableCell>
												<TableCell className="px-4 py-2 text-right">
													<span
														className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.tone}`}
													>
														{meta.label}
													</span>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</section>
						<section>
							<VerdictCard
								title={t("verdicts.accuracyTitle")}
								verdict={result.accuracyVerdict}
								tolerance={IN_56_KVP}
							/>
						</section>
					</>
				) : (
					<section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
						{t("empty")}
					</section>
				)}

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>{t("footer.l1")}</p>
					<p>{t("footer.l2")}</p>
					<p className="mt-1">{t("footer.l3")}</p>
				</footer>
			</main>
		</div>
	);
}
