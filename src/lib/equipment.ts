import type { Rectifier } from "@/lib/tables/hvl";

/**
 * Equipment metadata captured by the Header sheet of Modelos_CQ.xltx.
 * Most fields are informational and feed the printed report (LAUDO);
 * `rectifier` is the only field that changes calc formulas.
 */
export type Equipment = {
	id: string;
	name: string;

	// QC parameters (calc-affecting)
	rectifier: Rectifier;

	// Identification (informational, used for reports)
	client?: string;
	location?: string;
	serviceDate?: string;
	responsible?: string;
	dosimeterBrand?: string;
	generatorBrand?: string;
	generatorModel?: string;
	generatorSerial?: string;
	generatorAnvisa?: string;
	kvNominal?: string;
	maNominal?: string;
	certificate?: string;

	// Extraoral reference values (used as defaults by the extraoral tabs).
	// Manufacturer P_KA / DFOV come from the device manual.
	referencePka?: string;
	referenceDfov?: string;
};

export const defaultEquipmentFields: Omit<Equipment, "id" | "name"> = {
	rectifier: "af",
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
