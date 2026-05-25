import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { EquipmentProvider } from "@/components/EquipmentProvider";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { routing } from "@/i18n/routing";

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
			<EquipmentProvider>{children}</EquipmentProvider>
		</NextIntlClientProvider>
	);
}
