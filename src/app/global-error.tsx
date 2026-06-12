"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import { ErrorContent } from "@/components/ErrorContent";
import { routing } from "@/i18n/routing";
import "./globals.css";

/**
 * Last-resort error boundary that catches crashes in the root layout itself.
 * It replaces the root layout when active, so — like `global-not-found.tsx` —
 * it must render its own `<html>`/`<body>` and pull in fonts and global styles.
 * Error boundaries are Client Components, so the title is set via React's
 * `<title>` rather than a `metadata` export.
 */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html
			lang={routing.defaultLocale}
			className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<title>500 — RadQC Suite</title>
				<ErrorContent reset={reset} digest={error.digest} />
			</body>
		</html>
	);
}
