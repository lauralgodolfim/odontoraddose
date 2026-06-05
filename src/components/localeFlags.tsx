"use client";

import type { JSX } from "react";
import { type Locale, routing } from "@/i18n/routing";

/**
 * Shared locale flag switcher for the error/not-found pages, which render
 * OUTSIDE the next-intl provider and so can't use the provider-bound
 * `LocaleSwitcher`. These flip a local copy language rather than navigating.
 */

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
export function localeFromPath(pathname: string): Locale {
	const first = pathname.split("/").filter(Boolean)[0];
	return routing.locales.find((l) => l === first) ?? "en";
}

export function LocaleFlagToggle({
	locale,
	onSelect,
}: {
	locale: Locale;
	onSelect: (locale: Locale) => void;
}) {
	return (
		<div className="inline-flex items-center gap-1">
			{routing.locales.map((l) => {
				const Flag = flagFor[l];
				const active = l === locale;
				return (
					<button
						key={l}
						type="button"
						onClick={() => onSelect(l)}
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
	);
}
