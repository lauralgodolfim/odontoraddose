"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, useEffect } from "react";

import { useEquipment } from "@/components/EquipmentProvider";
import { EquipmentSelector } from "@/components/EquipmentSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { richTags } from "@/lib/rich";
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
	const { equipments, getSelected, select } = useEquipment();

	// When no equipment is selected for this calculator, default to the first one
	// that has extraoral reference values (manufacturer P_KA or DFOV) filled in.
	useEffect(() => {
		if (getSelected("extraoral")) return;
		const firstWithExtraoral = equipments.find((e) =>
			Boolean(e.referencePka?.trim() || e.referenceDfov?.trim()),
		);
		if (firstWithExtraoral) select("extraoral", firstWithExtraoral.id);
	}, [equipments, getSelected, select]);

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
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						{t.rich("description", richTags)}
					</p>
					<div className="pt-1">
						<EquipmentSelector calculatorSlug="extraoral" />
					</div>
				</header>

				<Tabs defaultValue="pka" className="gap-8">
					<TabsList
						variant="line"
						aria-label={t("tabs.aria")}
						className="h-auto w-full flex-wrap justify-start gap-2 rounded-none border-b border-zinc-200 p-0 dark:border-radiation-400/20"
					>
						{TABS.map(({ id }) => (
							<TabsTrigger
								key={id}
								value={id}
								className="h-auto flex-none rounded-none px-4 py-2 text-sm font-medium text-zinc-500 after:-bottom-px after:h-0.5 after:bg-radiation-400 hover:text-zinc-900 data-active:text-radiation-500 dark:text-zinc-400 dark:hover:text-zinc-200 dark:data-active:text-radiation-300"
							>
								{t(`tabs.${id}`)}
							</TabsTrigger>
						))}
					</TabsList>
					{TABS.map(({ id, Panel }) => (
						// forceMount keeps panels mounted so entered values survive tab switches.
						<TabsContent
							key={id}
							value={id}
							forceMount
							className="flex flex-col gap-8 data-[state=inactive]:hidden"
						>
							<Panel />
						</TabsContent>
					))}
				</Tabs>
			</main>
		</div>
	);
}
