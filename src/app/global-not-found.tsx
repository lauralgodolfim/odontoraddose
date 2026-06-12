import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotFoundContent } from "@/components/NotFoundContent";
import { routing } from "@/i18n/routing";
import "./globals.css";

/**
 * Global 404 for URLs that don't match any route — including top-level paths
 * (e.g. `/nonexistent`) that would otherwise be captured by the `[locale]`
 * dynamic segment and, under `output: export`, throw a dev-server param error.
 *
 * Unlike `not-found.tsx`, this bypasses the root layout, so it must render its
 * own `<html>`/`<body>` and pull in the fonts and global styles itself.
 */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "404 — RadQC Suite",
	description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
	return (
		<html
			lang={routing.defaultLocale}
			className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<NotFoundContent />
			</body>
		</html>
	);
}
