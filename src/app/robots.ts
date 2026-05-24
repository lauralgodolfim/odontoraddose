import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Required by `output: "export"` — the route must be fully static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: "/audit/",
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
