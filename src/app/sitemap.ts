import type { MetadataRoute } from "next";

import { calculators } from "@/lib/calculators";
import { SITE_URL } from "@/lib/site";

// Required by `output: "export"` — the route must be fully static.
export const dynamic = "force-static";

/**
 * Sitemap for crawlers. Lists the home, the equipments management page,
 * and any calculator whose status is "implemented" — planned calculators
 * are excluded so we don't advertise stubs.
 *
 * `/audit/` is intentionally omitted (it's also disallowed in robots.ts).
 *
 * `trailingSlash: true` in next.config.ts means generated route URLs end
 * with `/`; sitemap URLs match that to avoid 301 redirects from crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	const fixed: MetadataRoute.Sitemap = [
		{
			url: `${SITE_URL}/`,
			lastModified,
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/equipments/`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];

	const implemented: MetadataRoute.Sitemap = calculators
		.filter((c) => c.status === "implemented")
		.map((c) => ({
			url: `${SITE_URL}/${c.slug}/`,
			lastModified,
			changeFrequency: "monthly",
			priority: 0.8,
		}));

	return [...fixed, ...implemented];
}
