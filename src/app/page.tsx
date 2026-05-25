import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const target = `/${routing.defaultLocale}/`;

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function RootRedirect() {
	return (
		<>
			<meta httpEquiv="refresh" content={`0; url=${target}`} />
			<noscript>
				<a href={target}>Continue →</a>
			</noscript>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static client-side redirect fallback for the / entry point
				dangerouslySetInnerHTML={{
					__html: `window.location.replace(${JSON.stringify(target)});`,
				}}
			/>
		</>
	);
}
