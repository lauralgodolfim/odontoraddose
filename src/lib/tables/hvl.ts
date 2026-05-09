/**
 * Minimum half-value layer (HVL) by tube voltage and rectification type.
 * Source: extraoral sheet (J17:M25) — Anexo 2 da IN 56/2019 (CSR mínima).
 *
 * `mono` = single-phase (60 Hz), `tri` = three-phase (120 Hz / 6-pulse),
 * `af` = high-frequency / continuous (the most common modern type).
 */
export type Rectifier = "mono" | "tri" | "af";

export type HvlMinRow = {
  kvp: number;
  mono: number;
  tri: number;
  af: number;
};

export const hvlMinTable: HvlMinRow[] = [
  { kvp: 50, mono: 1.5, tri: 1.6, af: 1.8 },
  { kvp: 60, mono: 1.8, tri: 2.0, af: 2.2 },
  { kvp: 70, mono: 2.1, tri: 2.3, af: 2.5 },
  { kvp: 80, mono: 2.3, tri: 2.6, af: 2.9 },
  { kvp: 90, mono: 2.5, tri: 3.0, af: 3.2 },
  { kvp: 100, mono: 2.7, tri: 3.2, af: 3.6 },
  { kvp: 110, mono: 3.0, tri: 3.5, af: 3.9 },
  { kvp: 120, mono: 3.2, tri: 3.9, af: 4.3 },
  { kvp: 130, mono: 3.5, tri: 4.1, af: 4.7 },
];

/**
 * Minimum HVL for a given kVp by linear interpolation between the table rows.
 * Returns `null` if the kVp is outside the tabulated range.
 */
export function hvlMinFor(kvp: number, rectifier: Rectifier): number | null {
  if (kvp < hvlMinTable[0].kvp || kvp > hvlMinTable[hvlMinTable.length - 1].kvp)
    return null;
  for (let i = 1; i < hvlMinTable.length; i++) {
    const a = hvlMinTable[i - 1];
    const b = hvlMinTable[i];
    if (kvp >= a.kvp && kvp <= b.kvp) {
      const t = (kvp - a.kvp) / (b.kvp - a.kvp);
      return a[rectifier] + t * (b[rectifier] - a[rectifier]);
    }
  }
  return null;
}
