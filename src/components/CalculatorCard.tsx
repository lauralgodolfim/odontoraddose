"use client";

import { ArrowRight, Circle } from "lucide-react";
import Link from "next/link";

import type { Calculator } from "@/lib/calculators";

export function CalculatorCard({ calc }: { calc: Calculator }) {
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

	const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
		e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
	};

	return (
		<Link
			href={`./${calc.slug}`}
			prefetch={false}
			onMouseMove={handleMove}
			className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-lg border border-zinc-200 bg-white px-5 py-4 text-left transition hover:border-radiation-400 dark:border-radiation-400/20 dark:bg-zinc-950 dark:hover:border-radiation-400 dark:hover:bg-radiation-400/5"
		>
			<span
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{
					background:
						"radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(235, 178, 68, 0.22), transparent 65%)",
				}}
			/>
			{inner}
		</Link>
	);
}
