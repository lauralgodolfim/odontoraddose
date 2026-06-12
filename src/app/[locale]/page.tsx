import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { CalculatorCard } from "@/components/CalculatorCard";
import { EquipmentBadge } from "@/components/EquipmentBadge";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import {
	type Calculator,
	type CalculatorPhase,
	calculators,
} from "@/lib/calculators";

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	return <HomeView />;
}

function HomeView() {
	const t = useTranslations("home");
	const tCommon = useTranslations("common");
	const tPhase = useTranslations("phaseLabels");

	const byPhase = new Map<CalculatorPhase, Calculator[]>();
	for (const c of calculators) {
		const list = byPhase.get(c.phase) ?? [];
		list.push(c);
		byPhase.set(c.phase, list);
	}
	const phases = Array.from(byPhase.keys()).sort((a, b) => a - b);

	return (
		<div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
			<main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:px-8">
				<header className="flex flex-col items-center gap-4 text-center">
					<span className="rounded-full border border-radiation-400/40 bg-radiation-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-radiation-300">
						{tCommon("workInProgress")}
					</span>
					<div className="flex items-center gap-4">
						<div className="relative h-14 w-14 sm:h-20 sm:w-20">
							<Image
								src="/logo.png"
								alt=""
								width={192}
								height={192}
								priority
								sizes="(min-width: 640px) 80px, 56px"
								className="h-full w-full rounded-2xl"
							/>
							<span
								aria-hidden
								className="pointer-events-none absolute left-[61%] top-[68%] h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 animate-radiate rounded-full"
							/>
						</div>
						<h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
							{t("title")}
						</h1>
					</div>
					<p className="max-w-xl text-lg leading-7 text-zinc-600 dark:text-zinc-400">
						{t("description")}
					</p>
					<p className="max-w-xl text-sm leading-6 text-zinc-400 dark:text-zinc-400">
						{t("privacy")}
					</p>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<EquipmentBadge />
						<Link
							href="/audit"
							prefetch={false}
							className="inline-flex items-center gap-2 rounded-full border border-radiation-400/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400 transition hover:border-radiation-400 hover:text-radiation-300"
						>
							<span className="font-medium uppercase tracking-wider text-radiation-400">
								{t("auditBadge")}
							</span>
							<span aria-hidden className="text-radiation-400/40">
								·
							</span>
							<span>{t("auditBadgeSub")}</span>
						</Link>
						<LocaleSwitcher />
					</div>
				</header>

				{phases.map((phase) => (
					<section key={phase} className="flex flex-col gap-3">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-radiation-300">
							{tPhase(String(phase) as "0" | "1" | "2" | "3" | "4")}
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{(byPhase.get(phase) ?? []).map((c) => (
								<CalculatorCard key={c.slug} calc={c} />
							))}
						</div>
					</section>
				))}
			</main>
		</div>
	);
}
