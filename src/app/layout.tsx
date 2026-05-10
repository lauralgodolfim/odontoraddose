import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EquipmentProvider } from "@/components/EquipmentProvider";
import { ServiceWorkerRegister } from "./sw-register";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "RadQC Suite",
	description:
		"Radiation-dose and quality-control calculators for medical imaging equipment.",
	manifest: "./manifest.webmanifest",
	icons: { icon: "./favicon.png", apple: "./favicon.png" },
	applicationName: "RadQC Suite",
	appleWebApp: {
		capable: true,
		title: "RadQC Suite",
		statusBarStyle: "black-translucent",
	},
};

export const viewport: Viewport = {
	themeColor: "#ebb244",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<EquipmentProvider>{children}</EquipmentProvider>
				<ServiceWorkerRegister />
			</body>
		</html>
	);
}
