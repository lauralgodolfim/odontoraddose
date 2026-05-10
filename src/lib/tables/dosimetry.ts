/**
 * Generic dosimetry-correction factors used across modalities.
 * Source: doses sheet header (rows 3-7) and per-modality blocks.
 */

/**
 * Radiation-quality correction factor for dosimeters
 * (workbook field "D radiação"). Source: doses I174:J177.
 */
export const radiationQualityFactor = {
	Mammography: 1.4,
	Dental: 1.3,
	Conventional: 1.2,
	Source: 1.0,
} as const;

export type RadiationQuality = keyof typeof radiationQualityFactor;

/**
 * LiF dosimeter batch factor (workbook field "Fator do Lote").
 * Source: doses F174:G179.
 */
export const lifBatchFactor: Record<number, number> = {
	1: 1.0,
	2: 0.91,
	3: 0.83,
	4: 0.76,
	5: 0.69,
	6: 0.63,
};

/**
 * DLP → effective dose conversion factor (k) by anatomical region.
 * E [mSv] = DLP [mGy·cm] × k.
 *
 * Adult values from EUR 16262 / ICRP 102 (CT 32 cm body phantom, 16 cm head
 * phantom). Pediatric values are first-approximation factors used by the
 * source workbook (doses B105:D105, with the spreadsheet's labelling bug
 * corrected here so the factors match the regions).
 */
export const ctEffectiveDoseFactor = {
	HeadAdult: 0.0021,
	ChestAdult: 0.014,
	AbdomenAdult: 0.015,
	PelvisAdult: 0.015,
	LumbarSpineAdult: 0.015,
	AbdomenPediatric: 0.02,
} as const;

export type CtRegion = keyof typeof ctEffectiveDoseFactor;

export const ctRegionLabels: Record<CtRegion, string> = {
	HeadAdult: "Head (adult)",
	ChestAdult: "Chest (adult)",
	AbdomenAdult: "Abdomen (adult)",
	PelvisAdult: "Pelvis (adult)",
	LumbarSpineAdult: "Lumbar spine (adult)",
	AbdomenPediatric: "Abdomen (pediatric)",
};

/**
 * Maximum permitted CTDIvol per IN 55 / ANVISA. Source: doses C65:C67.
 * Used as a reference cap; values not present here have no published cap
 * and the field is left undefined (the validation card hides itself).
 */
export const ctdiVolMaxByRegion: Partial<Record<CtRegion, number>> = {
	HeadAdult: 70,
	AbdomenAdult: 25,
	AbdomenPediatric: 20,
};
