"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";

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
		<div className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
			<span className="font-medium uppercase tracking-wider text-radiation-400">
				{t("language")}
			</span>
			<Select
				value={locale}
				disabled={isPending}
				onValueChange={(value) => onChange(value as Locale)}
			>
				<SelectTrigger
					size="sm"
					aria-label={t("language")}
					className="h-auto gap-1 border-0 bg-transparent p-0 text-xs text-zinc-200 focus-visible:ring-0 data-[size=sm]:h-auto dark:bg-transparent dark:hover:bg-transparent"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{routing.locales.map((l) => (
						<SelectItem key={l} value={l}>
							{tLang(l)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
