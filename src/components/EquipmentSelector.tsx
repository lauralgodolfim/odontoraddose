"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { useEquipment } from "./EquipmentProvider";

export function EquipmentSelector({
	calculatorSlug,
}: {
	calculatorSlug: string;
}) {
	const t = useTranslations("common");
	const { equipments, selection, select } = useEquipment();
	const selectedId = selection[calculatorSlug] ?? "";

	const prevIdRef = useRef(selectedId);
	const [flashKey, setFlashKey] = useState(0);
	useEffect(() => {
		if (prevIdRef.current === selectedId) return;
		prevIdRef.current = selectedId;
		setFlashKey((k) => k + 1);
	}, [selectedId]);

	if (equipments.length === 0) {
		return (
			<div className="inline-flex items-center gap-2 rounded-md border border-dashed border-zinc-300 bg-white/40 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
				<span className="uppercase tracking-wider">{t("equipment")}</span>
				<Link
					href="/equipments"
					className="text-radiation-300 hover:text-radiation-400"
				>
					{t("addOne")}
				</Link>
			</div>
		);
	}

	return (
		<div
			key={flashKey}
			className="inline-flex animate-selector-flash items-center gap-2 rounded-md border border-radiation-400/30 bg-zinc-950/40 px-3 py-1.5 text-xs"
		>
			<span className="uppercase tracking-wider text-radiation-400">
				{t("equipment")}
			</span>
			<select
				value={selectedId}
				onChange={(e) => select(calculatorSlug, e.target.value || null)}
				className="bg-transparent text-zinc-200 outline-none [&>option]:bg-zinc-950"
				aria-label={t("selectEquipmentAria")}
			>
				<option value="">{t("none")}</option>
				{equipments.map((eq) => (
					<option key={eq.id} value={eq.id}>
						{eq.name || t("untitled")}
					</option>
				))}
			</select>
		</div>
	);
}
