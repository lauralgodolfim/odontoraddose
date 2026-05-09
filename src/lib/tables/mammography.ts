/**
 * Mammography reference tables.
 * Source: doses sheet (Modelos_CQ.xltx) and AIEA HHS 17 (pg. 114).
 */

export type TargetFilter = "Mo/Mo" | "Mo/Rh" | "Rh/Rh" | "W/Ag" | "W/Rh" | "W/Al";

/**
 * S factor for selected target/filter combinations (independent of PMMA
 * thickness). Source: doses A175:C179.
 */
export const sFactorByTargetFilter: Record<
  Exclude<TargetFilter, "W/Al">,
  { filterUm: string; s: number }
> = {
  "Mo/Mo": { filterUm: "30", s: 1.0 },
  "Mo/Rh": { filterUm: "25", s: 1.017 },
  "Rh/Rh": { filterUm: "25", s: 1.061 },
  "W/Ag": { filterUm: "50–75", s: 1.042 },
  "W/Rh": { filterUm: "50–60", s: 1.042 },
};

/**
 * S factor for tungsten target filtered by 0.5 mm Al, indexed by PMMA
 * thickness (mm). Source: doses A184:C191.
 */
export const sFactorWAlByPmma: ReadonlyArray<{
  pmmaMm: number;
  breastEqMm: number;
  s: number;
}> = [
  { pmmaMm: 20, breastEqMm: 21, s: 1.075 },
  { pmmaMm: 30, breastEqMm: 32, s: 1.104 },
  { pmmaMm: 40, breastEqMm: 45, s: 1.134 },
  { pmmaMm: 45, breastEqMm: 53, s: 1.149 },
  { pmmaMm: 50, breastEqMm: 60, s: 1.16 },
  { pmmaMm: 60, breastEqMm: 75, s: 1.181 },
  { pmmaMm: 70, breastEqMm: 90, s: 1.198 },
  { pmmaMm: 80, breastEqMm: 103, s: 1.208 },
];

/**
 * Product of conversion factors g·c for calculating DG for standard breasts
 * from measurements with different PMMA phantom thicknesses.
 * Source: doses A161:J169 (AIEA HHS 17, pg. 114).
 *
 * Each row: PMMA thickness (mm), equivalent breast thickness (mm),
 * fibroglandular proportion (%), and g·c indexed by HVL (mm Al).
 */
export const gcByHvl = {
  hvls: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6] as const,
  rows: [
    { pmmaMm: 20, breastEqMm: 21, fibroglandularPct: 97, gc: [0.336, 0.377, 0.415, 0.45, 0.482, 0.513, 0.539] },
    { pmmaMm: 30, breastEqMm: 32, fibroglandularPct: 67, gc: [0.245, 0.277, 0.308, 0.338, 0.368, 0.399, 0.427] },
    { pmmaMm: 40, breastEqMm: 45, fibroglandularPct: 41, gc: [0.191, 0.217, 0.241, 0.268, 0.296, 0.322, 0.351] },
    { pmmaMm: 45, breastEqMm: 53, fibroglandularPct: 29, gc: [0.172, 0.196, 0.218, 0.242, 0.269, 0.297, 0.321] },
    { pmmaMm: 50, breastEqMm: 60, fibroglandularPct: 20, gc: [0.157, 0.179, 0.198, 0.221, 0.245, 0.269, 0.296] },
    { pmmaMm: 60, breastEqMm: 75, fibroglandularPct: 9, gc: [0.133, 0.151, 0.168, 0.187, 0.203, 0.23, 0.253] },
    { pmmaMm: 70, breastEqMm: 90, fibroglandularPct: 4, gc: [0.112, 0.127, 0.142, 0.157, 0.173, 0.194, 0.215] },
    { pmmaMm: 80, breastEqMm: 103, fibroglandularPct: 3, gc: [0.097, 0.11, 0.124, 0.136, 0.15, 0.169, 0.188] },
  ],
} as const;

/**
 * IN 54 mean glandular dose (DGM) thresholds by PMMA thickness.
 * Source: doses I182:L188 (named range IN54_DGM).
 * `tolerance` is the strict-less-than upper bound.
 */
export const in54Dgm: ReadonlyArray<{
  pmmaMm: number;
  breastEqCm: number;
  reference: number;
  tolerance: number;
}> = [
  { pmmaMm: 20, breastEqCm: 2.1, reference: 0.6, tolerance: 1.0 },
  { pmmaMm: 30, breastEqCm: 3.2, reference: 1.0, tolerance: 1.5 },
  { pmmaMm: 40, breastEqCm: 4.5, reference: 1.6, tolerance: 2.0 },
  { pmmaMm: 45, breastEqCm: 5.3, reference: 2.0, tolerance: 2.5 },
  { pmmaMm: 50, breastEqCm: 6.0, reference: 2.4, tolerance: 3.0 },
  { pmmaMm: 60, breastEqCm: 7.5, reference: 3.6, tolerance: 4.5 },
];
