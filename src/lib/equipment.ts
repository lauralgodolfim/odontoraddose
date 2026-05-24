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
	id: string;
	name: string;

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

export const defaultEquipmentFields: Omit<Equipment, "id" | "name"> = {
	rectifier: "af",
	dosimeterBrand: "Unfors",
};

export function createEquipment(name = "New equipment"): Equipment {
	return {
		id: makeId(),
		name,
		...defaultEquipmentFields,
	};
}

function makeId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `eq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** localStorage key for the equipments list. */
export const EQUIPMENTS_STORAGE_KEY = "radqc-suite:equipments";
/** localStorage key for the per-calculator selection map ({ slug: equipmentId }). */
export const EQUIPMENT_SELECTION_STORAGE_KEY =
	"radqc-suite:equipment-selection";
/** Legacy key for the single-equipment model. Migrated on first read. */
export const LEGACY_EQUIPMENT_STORAGE_KEY = "radqc-suite:equipment";
