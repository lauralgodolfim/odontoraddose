import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { EquipmentProvider } from "@/components/EquipmentProvider";
import { Header } from "@/components/Header";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { routing } from "@/i18n/routing";
import { AudioProvider } from "@/lib/AudioProvider";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	return (
		<NextIntlClientProvider>
			<HtmlLangSync locale={locale} />
			<AudioProvider>
				<EquipmentProvider>
					<Header />
					{children}
				</EquipmentProvider>
			</AudioProvider>
		</NextIntlClientProvider>
	);
}
