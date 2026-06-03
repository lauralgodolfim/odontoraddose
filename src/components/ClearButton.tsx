"use client";

import { useTranslations } from "next-intl";
import { useAudio } from "@/lib/AudioProvider";

const defaultCls =
	"mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10";

export function ClearButton({
	onClick,
	className,
}: {
	onClick: () => void;
	className?: string;
}) {
	const t = useTranslations("common");
	const { playClick } = useAudio();
	return (
		<button
			type="button"
			onClick={() => {
				playClick();
				onClick();
			}}
			className={className ?? defaultCls}
		>
			{t("clear")}
		</button>
	);
}
