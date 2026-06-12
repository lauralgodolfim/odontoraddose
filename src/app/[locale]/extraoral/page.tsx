"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, useState } from "react";

import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Link } from "@/i18n/navigation";
import { CbctTab } from "./CbctTab";
import { DapTab } from "./DapTab";
import { DfovTab } from "./DfovTab";
import { PkaTab } from "./PkaTab";

type TabId = "pka" | "cbct" | "dap" | "dfov";

const TABS: { id: TabId; Panel: ComponentType }[] = [
	{ id: "pka", Panel: PkaTab },
	{ id: "cbct", Panel: CbctTab },
	{ id: "dap", Panel: DapTab },
	{ id: "dfov", Panel: DfovTab },
];

export default function ExtraoralPage() {
	const t = useTranslations("extraoral");
	const tCommon = useTranslations("common");
	const [tab, setTab] = useState<TabId>("pka");

	return (
		<div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
				<header className="flex flex-col gap-2">
					<Link
						href="/"
						className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
					>
						<ArrowLeft aria-hidden className="h-3 w-3" /> {tCommon("home")}
					</Link>
					<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
						{t("title")}
					</h1>
					<p
						className="text-sm text-zinc-600 dark:text-zinc-400"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: translated copy contains inline <strong>/<sub> markup
						dangerouslySetInnerHTML={{ __html: t.raw("description") as string }}
					/>
					<div className="pt-1">
						<EquipmentSelector calculatorSlug="extraoral" />
					</div>
				</header>

				<div
					role="tablist"
					aria-label={t("tabs.aria")}
					className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-radiation-400/20"
				>
					{TABS.map((tabItem) => {
						const active = tabItem.id === tab;
						return (
							<button
								key={tabItem.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setTab(tabItem.id)}
								className={
									active
										? "border-radiation-400 text-radiation-500 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:text-radiation-300"
										: "border-transparent text-zinc-500 hover:text-zinc-900 border-b-2 -mb-px px-4 py-2 text-sm font-medium dark:hover:text-zinc-200"
								}
							>
								{t(`tabs.${tabItem.id}`)}
							</button>
						);
					})}
				</div>

				{TABS.map(({ id, Panel }) => (
					// Panels stay mounted so entered values survive tab switches.
					<div
						key={id}
						role="tabpanel"
						className={id === tab ? "flex flex-col gap-8" : "hidden"}
					>
						<Panel />
					</div>
				))}
			</main>
		</div>
	);
}
