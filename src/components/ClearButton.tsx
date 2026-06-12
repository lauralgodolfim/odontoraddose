"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/AudioProvider";
import { cn } from "@/lib/utils";

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
		<Button
			type="button"
			variant="outline"
			onClick={() => {
				playClick();
				onClick();
			}}
			className={cn(
				"mt-2 self-start border-radiation-400/40 text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10 hover:text-radiation-300 dark:border-radiation-400/40 dark:bg-zinc-950 dark:hover:bg-radiation-400/10",
				className,
			)}
		>
			{t("clear")}
		</Button>
	);
}
