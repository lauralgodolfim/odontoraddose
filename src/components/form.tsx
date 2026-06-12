"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<Card className="gap-3 rounded-lg ring-zinc-200 dark:bg-zinc-950 dark:ring-radiation-400/25">
			<CardHeader>
				<CardTitle className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-radiation-300">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">{children}</CardContent>
		</Card>
	);
}

export function Field({
	label,
	hint,
	children,
}: {
	label: ReactNode;
	hint?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Label className="flex flex-col items-stretch gap-1 font-normal">
			<span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
				{label}
			</span>
			{children}
			{hint ? (
				<span className="text-[11px] text-zinc-400 dark:text-zinc-400">
					{hint}
				</span>
			) : null}
		</Label>
	);
}

export function ClearButton({ onClick }: { onClick: () => void }) {
	const t = useTranslations("common");
	return (
		<Button
			type="button"
			variant="outline"
			onClick={onClick}
			className="mt-2 self-start border-radiation-400/40 text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10 hover:text-radiation-300 dark:border-radiation-400/40 dark:bg-zinc-950 dark:hover:bg-radiation-400/10"
		>
			{t("clear")}
		</Button>
	);
}
