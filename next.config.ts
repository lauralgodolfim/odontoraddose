import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: { unoptimized: true },
	// Serve a single global 404 for unmatched URLs. Required here because the
	// root layout lives under a top-level dynamic `[locale]` segment, which
	// otherwise captures unknown paths and breaks the static-export 404.
	experimental: { globalNotFound: true },
};

export default withNextIntl(nextConfig);
