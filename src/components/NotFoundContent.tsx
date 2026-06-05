"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { type JSX, useState } from "react";
import { type Locale, routing } from "@/i18n/routing";

/**
 * Shared 404 body. Used by both `app/not-found.tsx` (rendered inside the root
 * layout when `notFound()` fires within a locale) and `app/global-not-found.tsx`
 * (rendered for top-level paths that never match the `[locale]` segment).
 *
 * Both render OUTSIDE the next-intl provider, so the copy can't come from
 * `useTranslations`, and `LocaleSwitcher` (provider-bound) can't be reused. We
 * read the locale from the URL prefix, default to English for unprefixed paths,
 * and let the user flip languages with the inline flag buttons.
 */
const copy = {
	"pt-BR": {
		chip: "Erro de detecção",
		sublabel: "fóton não detectado",
		heading: "Esta página decaiu abaixo do limiar de detecção.",
		caption: "Sua meia-vida expirou antes de você chegar.",
		body: "Ou talvez ela tenha caído com 1/r². De qualquer forma, a dose lida aqui é 0 µGy — nada para medir.",
		home: "Voltar para uma página mensurável",
	},
	en: {
		chip: "Detection error",
		sublabel: "photon not detected",
		heading: "This page decayed below the detection threshold.",
		caption: "Its half-life expired before you arrived.",
		body: "Or maybe it just fell off as 1/r². Either way, the dose here reads 0 µGy — nothing to measure.",
		home: "Back to a measurable page",
	},
} as const;

function BrazilFlag() {
	return (
		<svg
			viewBox="0 0 28 20"
			className="h-3.5 w-5 overflow-hidden rounded-[2px]"
			aria-hidden="true"
		>
			<rect width="28" height="20" fill="#009c3b" />
			<polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#ffdf00" />
			<circle cx="14" cy="10" r="3.6" fill="#002776" />
		</svg>
	);
}

const usStripeRows = [1, 3, 5, 7, 9, 11];

function USFlag() {
	const stripeH = 20 / 13;
	return (
		<svg
			viewBox="0 0 28 20"
			className="h-3.5 w-5 overflow-hidden rounded-[2px]"
			aria-hidden="true"
		>
			<rect width="28" height="20" fill="#b22234" />
			{usStripeRows.map((row) => (
				<rect
					key={`stripe-${row}`}
					y={row * stripeH}
					width="28"
					height={stripeH}
					fill="#fff"
				/>
			))}
			<rect width="11.2" height={stripeH * 7} fill="#3c3b6e" />
		</svg>
	);
}

const flagFor: Record<Locale, () => JSX.Element> = {
	"pt-BR": BrazilFlag,
	en: USFlag,
};

const shortLabel: Record<Locale, string> = {
	"pt-BR": "PT",
	en: "EN",
};

/** Locale from the URL prefix, defaulting to English for unprefixed paths. */
function localeFromPath(pathname: string): Locale {
	const first = pathname.split("/").filter(Boolean)[0];
	return routing.locales.find((l) => l === first) ?? "en";
}

export function NotFoundContent() {
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

				<span className="rounded-full border border-radiation-400/40 bg-radiation-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-radiation-300">
					{t.chip}
				</span>

				<div className="flex flex-col items-center gap-2">
					<h1 className="bg-gradient-to-b from-radiation-200 to-radiation-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent tabular-nums sm:text-8xl">
						404
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
						N(t) = N₀·e^(−λt) → 0
					</code>

					<p className="text-pretty text-sm leading-6 text-zinc-500 dark:text-zinc-400">
						<span className="text-zinc-400 dark:text-zinc-300">
							{t.caption}
						</span>{" "}
						{t.body}
					</p>
				</div>

				<a
					href={home}
					className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-5 py-2 text-sm text-zinc-200 transition hover:border-radiation-400 hover:text-radiation-300"
				>
					<span aria-hidden>←</span>
					{t.home}
				</a>

				<div className="inline-flex items-center gap-1">
					{routing.locales.map((l) => {
						const Flag = flagFor[l];
						const active = l === locale;
						return (
							<button
								key={l}
								type="button"
								onClick={() => setLocale(l)}
								aria-pressed={active}
								className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium uppercase tracking-wider transition ${
									active
										? "border-radiation-400/60 bg-radiation-400/10 text-radiation-300"
										: "border-radiation-400/20 text-zinc-400 hover:border-radiation-400/50 hover:text-zinc-200"
								}`}
							>
								<Flag />
								<span>{shortLabel[l]}</span>
							</button>
						);
					})}
				</div>
			</main>
		</div>
	);
}
