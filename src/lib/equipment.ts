import type { Rectifier } from "@/lib/tables/hvl";

/**
 * Multimeter / dosimeter brand. Several spreadsheet formulas branch on this
 * to pick which measurement column to read (cell offsets differ per brand).
 */
export type DosimeterBrand = "Unfors" | "Fluke" | "Raysafe";

/**
 * Equipment metadata captured by the Header sheet of Modelos_CQ.xltx.
 * Most fields are informational and feed the printed report (LAUDO);
 * `rectifier` and `dosimeterBrand` are the only fields that change calc
 * formulas.
 */
export type Equipment = {
	// QC parameters (calc-affecting)
	rectifier: Rectifier;
	dosimeterBrand: DosimeterBrand;

	// Identification (informational, used for reports)
	client?: string;
	location?: string;
	serviceDate?: string;
	responsible?: string;
	generatorBrand?: string;
	generatorModel?: string;
	generatorSerial?: string;
	generatorAnvisa?: string;
	kvNominal?: string;
	maNominal?: string;
	certificate?: string;
};

export const defaultEquipment: Equipment = {
	rectifier: "af",
	dosimeterBrand: "Unfors",
};

export const EQUIPMENT_STORAGE_KEY = "radqc-suite:equipment";
