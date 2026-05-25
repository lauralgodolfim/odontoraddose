"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { type Locale, routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
	const t = useTranslations("common");
	const tLang = useTranslations("languages");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const [isPending, startTransition] = useTransition();

	const onChange = (next: Locale) => {
		startTransition(() => {
			router.replace(
				// @ts-expect-error -- next-intl typed routes can't infer params at runtime here
				{ pathname, params },
				{ locale: next },
			);
		});
	};

	return (
		<label className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
			<span className="font-medium uppercase tracking-wider text-radiation-400">
				{t("language")}
			</span>
			<select
				value={locale}
				disabled={isPending}
				onChange={(e) => onChange(e.target.value as Locale)}
				className="bg-transparent text-zinc-200 outline-none [&>option]:bg-zinc-950"
				aria-label={t("language")}
			>
				{routing.locales.map((l) => (
					<option key={l} value={l}>
						{tLang(l)}
					</option>
				))}
			</select>
		</label>
	);
}
