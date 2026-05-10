import { ArrowRight, Circle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import {
	type Calculator,
	type CalculatorPhase,
	calculators,
	phaseLabels,
} from "@/lib/calculators";

export default function Home() {
	const byPhase = new Map<CalculatorPhase, Calculator[]>();
	for (const c of calculators) {
		const list = byPhase.get(c.phase) ?? [];
		list.push(c);
		byPhase.set(c.phase, list);
	}
	const phases = Array.from(byPhase.keys()).sort((a, b) => a - b);

	return (
		<div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:px-8">
				<header className="flex flex-col items-center gap-4 text-center">
					<span className="rounded-full border border-radiation-400/40 bg-radiation-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-radiation-300">
						Work in progress
					</span>
					<div className="flex items-center gap-4">
						<Image
							src="./logo.png"
							alt=""
							width={192}
							height={192}
							priority
							sizes="(min-width: 640px) 80px, 56px"
							className="h-14 w-14 rounded-2xl shadow-sm ring-1 ring-radiation-400/40 sm:h-20 sm:w-20"
						/>
						<h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
							RadQC Suite
						</h1>
					</div>
					<p className="max-w-xl text-lg leading-7 text-zinc-600 dark:text-zinc-400">
						Radiation-dose and quality-control calculators for radiography, CT,
						mammography, fluoroscopy, ultrasound and MRI. Validated against
						Brazilian IN 54–91, ACR, AAPM and IEC references.
					</p>
					<p className="max-w-xl text-sm leading-6 text-zinc-400 dark:text-zinc-400">
						Runs entirely in your browser — measurements stay on the device, and
						the app works offline once installed.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<EquipmentBadge />
						<Link
							href="./audit"
							prefetch={false}
							className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400 transition hover:border-radiation-400 hover:text-radiation-300"
						>
							<span className="font-medium uppercase tracking-wider text-radiation-400">
								Audit
							</span>
							<span aria-hidden className="text-radiation-400/40">
								·
							</span>
							<span>Coverage summary</span>
						</Link>
					</div>
				</header>

				{phases.map((phase) => (
					<section key={phase} className="flex flex-col gap-3">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-radiation-300">
							{phaseLabels[phase]}
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{(byPhase.get(phase) ?? []).map((c) => (
								<CalculatorCard key={c.slug} calc={c} />
							))}
						</div>
					</section>
				))}
			</main>
		</div>
	);
}

function CalculatorCard({ calc }: { calc: Calculator }) {
	const isImplemented = calc.status === "implemented";
	const inner = (
		<>
			<span className="flex flex-col">
				<span className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
					{calc.title}
				</span>
				<span className="text-sm text-zinc-600 dark:text-zinc-400">
					{calc.description}
				</span>
			</span>
			{isImplemented ? (
				<ArrowRight
					aria-hidden
					className="h-5 w-5 text-radiation-400/60 transition group-hover:translate-x-0.5 group-hover:text-radiation-400"
				/>
			) : (
				<Circle
					aria-hidden
					className="h-2 w-2 fill-current text-zinc-300 dark:text-zinc-700"
				/>
			)}
		</>
	);
	if (!isImplemented) {
		return (
			<div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-zinc-200 bg-white/40 px-5 py-4 text-left opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40">
				{inner}
			</div>
		);
	}
	return (
		<Link
			href={`./${calc.slug}`}
			prefetch={false}
			className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-5 py-4 text-left transition hover:border-radiation-400 dark:border-radiation-400/20 dark:bg-zinc-950 dark:hover:border-radiation-400 dark:hover:bg-radiation-400/5"
		>
			{inner}
		</Link>
	);
}
