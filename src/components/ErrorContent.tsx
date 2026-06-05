"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocaleFlagToggle, localeFromPath } from "@/components/localeFlags";
import type { Locale } from "@/i18n/routing";

/**
 * Shared error body. Used by both `app/error.tsx` (rendered inside the root
 * layout) and `app/global-error.tsx` (which replaces the root layout on a
 * root-level crash). Both render OUTSIDE the next-intl provider, so the copy is
 * read from this module by URL-prefix locale, defaulting to English.
 */
const copy = {
	"pt-BR": {
		chip: "Exceção não tratada",
		sublabel: "vetor de estado colapsado",
		heading: "Algo espalhou a renderização para fora do eixo.",
		caption: "Culpa do Heisenberg, na verdade:",
		body: "capturamos o erro, mas não dá para fixar a posição exata dele ao mesmo tempo. Tentar de novo costuma recolapsar tudo em um estado funcional.",
		retry: "Medir de novo",
		home: "Voltar a uma órbita estável",
		refLabel: "id do evento",
	},
	en: {
		chip: "Unhandled exception",
		sublabel: "state vector collapsed",
		heading: "Something scattered the render off-axis.",
		caption: "Heisenberg's fault, really:",
		body: "we caught the error, but we can't pin down its exact position at the same time. A retry usually re-collapses everything into a working state.",
		retry: "Measure again",
		home: "Back to a stable orbit",
		refLabel: "event id",
	},
} as const;

export function ErrorContent({
	reset,
	digest,
}: {
	reset?: () => void;
	digest?: string;
}) {
	const pathname = usePathname();
	const [locale, setLocale] = useState<Locale>(() => localeFromPath(pathname));
	const t = copy[locale];
	const home = `/${locale}/`;

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-2xl flex-1 animate-fade-up flex-col items-center justify-center gap-8 px-6 py-20 text-center sm:px-8">
				<div className="relative h-16 w-16 sm:h-20 sm:w-20">
					<Image
						src="/logo.png"
						alt=""
						width={192}
						height={192}
						priority
						sizes="(min-width: 640px) 80px, 64px"
						className="h-full w-full rounded-2xl"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute left-[61%] top-[68%] h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 animate-radiate rounded-full"
					/>
				</div>

				<span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-rose-300">
					{t.chip}
				</span>

				<div className="flex flex-col items-center gap-2">
					<h1 className="bg-gradient-to-b from-radiation-200 to-radiation-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent tabular-nums sm:text-8xl">
						500
					</h1>
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-radiation-400/70">
						{t.sublabel}
					</span>
				</div>

				<div className="flex flex-col items-center gap-3">
					<h2 className="text-balance text-xl font-semibold text-zinc-950 sm:text-2xl dark:text-zinc-100">
						{t.heading}
					</h2>

					<code className="rounded-lg border border-radiation-400/20 bg-zinc-950/60 px-4 py-2 font-mono text-sm text-radiation-200">
						ΔE · Δt ≥ ℏ/2
					</code>

					<p className="text-pretty text-sm leading-6 text-zinc-500 dark:text-zinc-400">
						<span className="text-zinc-400 dark:text-zinc-300">
							{t.caption}
						</span>{" "}
						{t.body}
					</p>

					{digest ? (
						<p className="font-mono text-[11px] text-zinc-600 dark:text-zinc-500">
							{t.refLabel}: {digest}
						</p>
					) : null}
				</div>

				<div className="flex flex-wrap items-center justify-center gap-2">
					{reset ? (
						<button
							type="button"
							onClick={() => reset()}
							className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-radiation-400/10 px-5 py-2 text-sm font-medium text-radiation-200 transition hover:border-radiation-400 hover:bg-radiation-400/20 hover:text-radiation-100"
						>
							<span aria-hidden>↻</span>
							{t.retry}
						</button>
					) : null}
					<a
						href={home}
						className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-5 py-2 text-sm text-zinc-200 transition hover:border-radiation-400 hover:text-radiation-300"
					>
						<span aria-hidden>←</span>
						{t.home}
					</a>
				</div>

				<LocaleFlagToggle locale={locale} onSelect={setLocale} />
			</main>
		</div>
	);
}
