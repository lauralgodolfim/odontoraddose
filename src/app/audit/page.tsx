import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
	type Calculator,
	type CalculatorPhase,
	calculators,
	categoryLabels,
	phaseLabels,
} from "@/lib/calculators";

export default function AuditPage() {
	const byPhase = new Map<CalculatorPhase, Calculator[]>();
	for (const c of calculators) {
		const list = byPhase.get(c.phase) ?? [];
		list.push(c);
		byPhase.set(c.phase, list);
	}
	const phases = Array.from(byPhase.keys()).sort((a, b) => a - b);

	const totals = {
		total: calculators.length,
		implemented: calculators.filter((c) => c.status === "implemented").length,
		planned: calculators.filter((c) => c.status === "planned").length,
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
						Audit
					</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Coverage summary across all calculators ported from the Modelos_CQ
						workbook. {totals.implemented} of {totals.total} implemented;{" "}
						{totals.planned} planned.
					</p>
				</header>

				{phases.map((phase) => {
					const list = byPhase.get(phase) ?? [];
					return (
						<section key={phase} className="flex flex-col gap-3">
							<div className="flex items-baseline justify-between">
								<h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									{phaseLabels[phase]}
								</h2>
								<span className="text-xs text-zinc-500 dark:text-zinc-500">
									{list.filter((c) => c.status === "implemented").length} /{" "}
									{list.length} implemented
								</span>
							</div>
							<div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
								<table className="w-full text-sm">
									<thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
										<tr>
											<th className="px-4 py-2 text-left font-medium">
												Calculator
											</th>
											<th className="px-4 py-2 text-left font-medium">
												Category
											</th>
											<th className="px-4 py-2 text-right font-medium">
												Status
											</th>
										</tr>
									</thead>
									<tbody>
										{list.map((c) => (
											<tr
												key={c.slug}
												className="border-t border-zinc-100 dark:border-zinc-900"
											>
												<td className="px-4 py-2 align-top">
													{c.status === "implemented" ? (
														<Link
															href={`../${c.slug}`}
															className="font-medium text-zinc-950 hover:underline dark:text-zinc-50"
														>
															{c.title}
														</Link>
													) : (
														<span className="font-medium text-zinc-500 dark:text-zinc-500">
															{c.title}
														</span>
													)}
													<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
														{c.description}
													</p>
												</td>
												<td className="px-4 py-2 align-top text-xs text-zinc-500 dark:text-zinc-400">
													{categoryLabels[c.category]}
												</td>
												<td className="px-4 py-2 align-top text-right">
													<span
														className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
															c.status === "implemented"
																? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
																: "border border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-500"
														}`}
													>
														{c.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					);
				})}

				<footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
					<p>
						Each calculator runs entirely in the browser; nothing is sent to a
						server. Use the print action on individual calculator pages to
						generate a LAUDO-style PDF for archival.
					</p>
				</footer>
			</main>
		</div>
	);
}
