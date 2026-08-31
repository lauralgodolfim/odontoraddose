import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { version } from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: { unoptimized: true },
	// Serve a single global 404 for unmatched URLs. Required here because the
	// root layout lives under a top-level dynamic `[locale]` segment, which
	// otherwise captures unknown paths and breaks the static-export 404.
	experimental: { globalNotFound: true },
	// Surfaced in the header so a printed report can be traced back to the
	// build that produced it. Inlined at build time from package.json.
	env: { NEXT_PUBLIC_APP_VERSION: version },
};

export default withNextIntl(nextConfig);
