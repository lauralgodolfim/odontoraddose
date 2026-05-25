"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCountUp } from "@/lib/useCountUp";
import { useEquipment } from "./EquipmentProvider";

export function EquipmentBadge() {
	const t = useTranslations();
	const { equipments } = useEquipment();
	const count = equipments.length;
	return (
		<Link
			href="/equipments"
			prefetch={false}
			className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400 transition hover:border-radiation-400 hover:text-radiation-300"
		>
			<span className="font-medium uppercase tracking-wider text-radiation-400">
				{t("common.equipment")}
			</span>
			<span aria-hidden className="text-radiation-400/40">
				·
			</span>
			<span className="tabular-nums">
				{count === 0 ? (
					t("equipmentBadge.noneSaved")
				) : (
					<>
						<AnimatedCount value={count} /> {t("equipmentBadge.saved")}
					</>
				)}
			</span>
		</Link>
	);
}

function AnimatedCount({ value }: { value: number }) {
	const display = useCountUp(value);
	return <>{Math.round(display)}</>;
}
