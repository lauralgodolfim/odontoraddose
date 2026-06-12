"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { useEquipment } from "./EquipmentProvider";

const NONE = "none";

export function EquipmentSelector({
	calculatorSlug,
}: {
	calculatorSlug: string;
}) {
	const t = useTranslations("common");
	const { equipments, selection, select } = useEquipment();
	const selectedId = selection[calculatorSlug] ?? NONE;

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
			<Select
				value={selectedId}
				onValueChange={(value) =>
					select(calculatorSlug, value === NONE ? null : value)
				}
			>
				<SelectTrigger
					size="sm"
					aria-label={t("selectEquipmentAria")}
					className="h-auto gap-1 border-0 bg-transparent p-0 text-xs text-zinc-200 focus-visible:ring-0 data-[size=sm]:h-auto dark:bg-transparent dark:hover:bg-transparent"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={NONE}>{t("none")}</SelectItem>
					{equipments.map((eq) => (
						<SelectItem key={eq.id} value={eq.id}>
							{eq.name || t("untitled")}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
