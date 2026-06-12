"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function PrintButton({ label }: { label?: string }) {
	const t = useTranslations("common");
	return (
		<Button
			type="button"
			variant="outline"
			onClick={() => window.print()}
			className="no-print"
		>
			{label ?? t("printReport")}
		</Button>
	);
}
