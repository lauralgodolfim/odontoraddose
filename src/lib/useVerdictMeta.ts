"use client";

import { useTranslations } from "next-intl";
import { pct, type Tolerance, type Verdict, verdictTones } from "./verdict";

export function useVerdictLabel() {
	const t = useTranslations("verdict");
	return (verdict: Verdict): { label: string; tone: string } => ({
		label: t(verdict),
		tone: verdictTones[verdict],
	});
}

export type VerdictMeta = {
	label: string;
	sub: string;
	tone: string;
};

export function useVerdictMeta() {
	const t = useTranslations("verdict");
	return (verdict: Verdict, tolerance: Tolerance): VerdictMeta => {
		const tone = verdictTones[verdict];
		if (verdict === "pass") {
			return {
				label: t("pass"),
				sub: t("passSub", {
					threshold: pct(tolerance.fail),
					reference: tolerance.reference,
				}),
				tone,
			};
		}
		if (verdict === "fail") {
			return {
				label: t("fail"),
				sub: t("failSub", {
					failThreshold: pct(tolerance.fail),
					restrictedThreshold: pct(tolerance.restricted),
					reference: tolerance.reference,
				}),
				tone,
			};
		}
		return {
			label: t("restricted"),
			sub: t("restrictedSub", { threshold: pct(tolerance.restricted) }),
			tone,
		};
	};
}
