"use client";

import Link from "next/link";

import { useEquipment } from "./EquipmentProvider";

export function EquipmentSelector({
	calculatorSlug,
}: {
	calculatorSlug: string;
}) {
	const { equipments, selection, select } = useEquipment();
	const selectedId = selection[calculatorSlug] ?? "";

	if (equipments.length === 0) {
		return (
			<div className="inline-flex items-center gap-2 rounded-md border border-dashed border-zinc-300 bg-white/40 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
				<span className="uppercase tracking-wider">Equipment</span>
				<Link
					href="../equipments"
					className="text-radiation-300 hover:text-radiation-400"
				>
					Add one →
				</Link>
			</div>
		);
	}

	return (
		<div className="inline-flex items-center gap-2 rounded-md border border-radiation-400/30 bg-zinc-950/40 px-3 py-1.5 text-xs">
			<span className="uppercase tracking-wider text-radiation-400">
				Equipment
			</span>
			<select
				value={selectedId}
				onChange={(e) => select(calculatorSlug, e.target.value || null)}
				className="bg-transparent text-zinc-200 outline-none [&>option]:bg-zinc-950"
				aria-label="Select equipment for this calculator"
			>
				<option value="">— none —</option>
				{equipments.map((eq) => (
					<option key={eq.id} value={eq.id}>
						{eq.name || "(untitled)"}
					</option>
				))}
			</select>
		</div>
	);
}
