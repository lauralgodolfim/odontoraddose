/**
 * Generic dosimetry-correction factors used across modalities.
 * Source: doses sheet header (rows 3-7) and per-modality blocks.
 */

/**
 * "D radiação" — radiation-quality correction factor for dosimeters.
 * Source: doses I174:J177.
 */
export const radiationQualityFactor = {
  Mamografia: 1.4,
  Odontológico: 1.3,
  Convencional: 1.2,
  Fontes: 1.0,
} as const;

export type RadiationQuality = keyof typeof radiationQualityFactor;

/**
 * LiF dosimeter batch factor ("Fator do Lote"). Source: doses F174:G179.
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
 * Source: doses B105:D105 (TOMOGRAFIA block).
 * E [mSv] = DLP [mGy·cm] × k.
 */
export const ctEffectiveDoseFactor = {
  Cranio: 0.0021,
  ColunaLombar: 0.015,
  Abdomen: 0.02,
} as const;

export type CtRegion = keyof typeof ctEffectiveDoseFactor;
