import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: routing.locales.map((l) => `/${l}/audit/`),
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
