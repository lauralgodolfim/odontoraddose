import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { calculators } from "@/lib/calculators";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Sitemap for crawlers. Emits one entry per locale for the home, equipments
 * page, and any "implemented" calculator. Each entry carries `alternates`
 * with `hreflang` links so search engines can connect the per-locale URLs.
 *
 * `trailingSlash: true` in next.config.ts means generated route URLs end
 * with `/`; sitemap URLs match that to avoid 301 redirects from crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();
	const locales = routing.locales;

	const paths: { path: string; priority: number }[] = [
		{ path: "", priority: 1 },
		{ path: "equipments/", priority: 0.5 },
		...calculators
			.filter((c) => c.status === "implemented")
			.map((c) => ({ path: `${c.slug}/`, priority: 0.8 })),
	];

	return paths.flatMap(({ path, priority }) => {
		const languages = Object.fromEntries(
			locales.map((l) => [l, `${SITE_URL}/${l}/${path}`]),
		);
		return locales.map((locale) => ({
			url: `${SITE_URL}/${locale}/${path}`,
			lastModified,
			changeFrequency: "monthly" as const,
			priority,
			alternates: { languages },
		}));
	});
}
