"use client";

import Link from "next/link";

import { useEquipment } from "./EquipmentProvider";

export function EquipmentBadge() {
	const { equipment } = useEquipment();
	return (
		<Link
			href="./equipment"
			className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400 transition hover:border-radiation-400 hover:text-radiation-300"
		>
			<span className="font-medium uppercase tracking-wider text-radiation-400">
				Equipment
			</span>
			<span aria-hidden className="text-radiation-400/40">
				·
			</span>
			<span>
				{equipment.dosimeterBrand} · {equipment.rectifier.toUpperCase()}
			</span>
		</Link>
	);
}
