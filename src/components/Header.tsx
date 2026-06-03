"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { useAudio } from "@/lib/AudioProvider";

export function Header() {
	const { isMuted, toggleMute } = useAudio();
	const t = useTranslations("common");
	const label = isMuted ? t("unmute") : t("mute");

	return (
		<header className="sticky top-0 z-40 border-b border-radiation-400/10 bg-zinc-950/80 backdrop-blur-sm">
			<div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-6 py-2 sm:px-8">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:text-radiation-300"
				>
					<Image
						src="/logo.png"
						alt=""
						width={24}
						height={24}
						className="h-6 w-6 rounded-md"
					/>
					<span>RadQC</span>
				</Link>
				<div className="flex items-center gap-2">
					<LocaleSwitcher />
					<button
						type="button"
						onClick={toggleMute}
						aria-label={label}
						aria-pressed={!isMuted}
						title={label}
						className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-radiation-400/20 text-zinc-400 transition hover:border-radiation-400/50 hover:text-radiation-300"
					>
						{isMuted ? (
							<VolumeX aria-hidden className="h-3.5 w-3.5" />
						) : (
							<Volume2 aria-hidden className="h-3.5 w-3.5" />
						)}
					</button>
				</div>
			</div>
		</header>
	);
}
