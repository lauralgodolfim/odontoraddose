# Odonto RadDose

Radiation-dose and QC calculators for medical imaging equipment. Built as an
installable, offline-capable web app (Next.js SPA + PWA, fully client-side).

The project digitises the calculations from a medical-physics QC workbook
(`public/Modelos_CQ.xltx`) so technicians can compute and validate dose and
QC values from a phone or browser instead of editing the spreadsheet by
hand.

## Calculators

All routes are statically prerendered and run entirely in the browser.

### Dose

| Route | Calculator | Standard |
| ----- | ---------- | -------- |
| `/extraoral` | P<sub>KA</sub> (DAP) | IN 56/2019 |
| `/intraoral` | ESD at the cone tip | local protocol |
| `/tomography` | CTDIw → CTDIvol → DLP → E | IN 55 |
| `/conventional` | Per-exam ESD | IN 90/2021 Annex II |
| `/mammography` | MGD via g·c · S · K<sub>it</sub> | IN 54 / AIEA HHS 17 |
| `/fluoroscopy` | Entrance dose-rate | IN 91 / RDC 330 |

### Foundational QC

| Route | Test | Standard |
| ----- | ---- | -------- |
| `/qc/kvp` | kVp accuracy & reproducibility | IN 56/2019 |
| `/qc/hvl` | HVL minimum vs measured | IN 56/2019 Annex 2 |
| `/qc/output` | Tube output (μGy/mAs·m²) | IN 56 / IN 90 |
| `/qc/timer` | Exposure-timer accuracy & reproducibility | IN 56/2019 |

### Safety & environment

| Route | Test | Standard |
| ----- | ---- | -------- |
| `/qc/leakage` | Leakage at 1 m, max-load | IN 56 / IEC 60601-1-3 |
| `/qc/accessories` | Lead-apron / collar / shield integrity | NR 32 / IEC 61331 |
| `/qc/displays` | Light-box & monitor luminance, ambient | AAPM TG-18 |

### Imaging QC

| Route | Test | Standard |
| ----- | ---- | -------- |
| `/qc/ct-number` | CT-number accuracy / uniformity / noise | ACR / IN 55 |
| `/qc/mammography-phantom` | ACR mammography phantom scoring | ACR |
| `/qc/ultrasound` | Probe QC against per-probe baseline | AAPM TG-1 / ACR |
| `/qc/mri` | ACR phantom (geometry, slice, SNR, PIU, PSG) | ACR |

### Cross-cutting

| Route | Purpose |
| ----- | ------- |
| `/equipment` | Per-equipment context (rectifier, dosimeter brand, identifying metadata) — saved locally on the device |
| `/audit` | Coverage summary across all calculators |

## What each calculator computes

### Dose

#### `/extraoral` — P<sub>KA</sub> (DAP)

Inputs: focus–detector distance, focus–receptor distance, field height,
correction factor, measured P<sub>KL</sub> (mGy·cm), machine-reported
P<sub>KA</sub>.

```
Corrected P_KL = P_KL × (D_focus-detector / D_focus-receptor)²
P_KA           = Corrected P_KL × field height × correction factor
```

Validation: |P<sub>KA,calc</sub> / P<sub>KA,machine</sub> − 1| against the
IN 56/2019 band — ≤ 20% pass, 20–40% fail, &gt; 40% restricted.

#### `/intraoral` — ESD at the cone tip

Inputs: focus–chamber distance, focus–cone-tip distance, chamber dose,
backscatter factor, optional reference ESD.

```
Dose at cone tip = chamber dose × (D_focus-chamber / D_focus-cone-tip)²
ESD              = Dose at cone tip × backscatter factor
```

Backscatter factors (Andrade & da Penha, IPEN): 1.167 at 20 cm FFD; 1.208 at
27.5 cm FFD. Optional comparison against a local-protocol reference dose.

#### `/tomography` — CTDI / DLP / E

Inputs: region (head, chest, abdomen, pelvis, lumbar, paediatric abdomen),
mode, kVp / mA, slice / channels / pitch, five CTDI<sub>100</sub> chamber
readings (centre + 3, 6, 9, 12 h positions), calibration factor, chamber
length, optional machine-indicated CTDI<sub>vol</sub> and DLP.

```
CTDI_w     = ⅓·CTDI_100,center + ⅔·avg(CTDI_100,peripheral)
CTDI_vol   = CTDI_w · calibration · length-correction / pitch
DLP        = scan-length · CTDI_vol / 10        [mGy·cm]
E          = DLP · k(region)                     [mSv]
```

Validation: indicator accuracy (calc vs machine) under IN 55 ±20/40%, and
IN 55 absolute caps — head 70 mGy, abdomen 25 mGy, paediatric abdomen 20 mGy.

#### `/conventional` — ESD per exam

Inputs: exam (14 presets carrying standard thickness and IN 90 cap),
station (table or wall stand / Bucky), focus–detector distance,
focus–image-receptor distance (FID), patient thickness, table- or
wall-stand-to-receptor offset, chamber dose, radiation-quality factor.

```
Focus-skin distance = FID − thickness − (table or wall-stand offset)
ESD                 = chamber dose × radiation factor × (D_focus-detector / Focus-skin)²
```

Validation: cap from IN 90/2021 Annex II per exam (e.g. chest PA 0.4 mGy,
lumbar LSJ 40 mGy).

#### `/mammography` — MGD

Inputs: PMMA thickness, HVL nominal, target/filter combination, entrance
air kerma K<sub>it</sub>.

```
MGD = g·c(PMMA, HVL) · S(target/filter) · K_it
```

Lookups: `g·c` from AIEA HHS 17 (8 PMMA × 7 HVL grid); `S` from the
target/filter table or the W/Al-by-PMMA table. Validation: IN 54 cap by
PMMA thickness (e.g. 1.0 mGy at 20 mm, 4.5 mGy at 60 mm).

#### `/fluoroscopy` — Entrance dose-rate

Inputs: operating mode (manual / automatic / high-rate), kVp / mA,
focus–chamber and focus–entrance distances, integrated chamber dose,
exposure time, indicated alarm time.

```
Rate at chamber  = chamber dose × 60 / exposure time      [mGy/min]
Rate at entrance = Rate at chamber × (D_focus-chamber / D_focus-entrance)²
```

Validation: IN 91 / RDC 330 caps — 50 mGy/min (manual), 100 mGy/min
(automatic), 200 mGy/min (high-rate); accumulated-time alarm must trigger
at ≤ 5 min.

### Foundational QC

#### `/qc/kvp` — kVp accuracy

Inputs: nominal kVp, five measured shots.

```
Per-shot deviation = measured / nominal − 1
Reproducibility    = (max − min) / mean
```

Validation: per-shot ±10% accuracy (IN 56), ±5% reproducibility.

#### `/qc/hvl` — Half-value layer

Inputs: kVp, optional rectifier override (defaults from `/equipment`),
measured HVL.

Lookup: linear interpolation of IN 56/2019 Annex 2 minimum-HVL table by kVp
× rectifier (50–130 kVp; mono / tri / AF). Validation: pass if measured ≥
minimum; fail in 80–100% band; restricted if &lt; 80%.

#### `/qc/output` — Tube output

Inputs: dose rate, mA, focus–detector distance, kVp reference, kVp
measured, optional kVp² correction.

```
Output = (dose rate × 1000 / mA) × (FDD / 100)² × (kVp_ref / kVp_meas)²
```

Validation: conventional 80 kVp range — 30–65 (pass), 20–80 (fail), outside
(restricted) μGy/mAs·m².

#### `/qc/timer` — Exposure timer

Inputs: five (selected, measured) time pairs. Same per-pair deviation and
reproducibility metrics as kVp accuracy, with the same IN 56 bands.

### Safety & environment

#### `/qc/leakage` — Leakage radiation

Inputs: kVp / mA at maximum load, distance from tube housing, integrated
chamber dose, exposure time.

```
Rate at distance = chamber dose × 3600 / exposure time   [mGy/h]
Rate at 1 m      = Rate at distance × (distance / 100)²
```

Validation: cap of 1 mGy/h at 1 m per IN 56 / IEC 60601-1-3.

#### `/qc/accessories` — Lead aprons & accessories

Per item: type, identifier, Pb-equivalent thickness, visual inspection,
radiographic inspection, notes. Aggregate verdict: pass if no failures,
fail if up to 20% fail, restricted otherwise. Reference: NR 32 / IN 56 /
IEC 61331.

#### `/qc/displays` — Light box & monitor luminance

Inputs: five light-box luminance measurements (centre + four corners),
diagnostic monitor L<sub>max</sub>, L<sub>min</sub>, ambient illuminance.

```
Light-box mean       = average of 5 points
Light-box uniformity = (max − min) / mean
Monitor ratio        = L_max / L_min
```

Validation (AAPM TG-18): light-box mean ≥ 1500 cd/m², uniformity ≤ 30%;
monitor L<sub>max</sub> ≥ 350 cd/m², L<sub>max</sub>/L<sub>min</sub> ≥ 250;
ambient ≤ 50 lux.

### Imaging QC

#### `/qc/ct-number` — CT number, uniformity, noise

Inputs: centre-ROI mean and standard deviation, four peripheral-ROI means.

```
Worst uniformity = max |peripheral − centre| over four ROIs
```

Validation (ACR / IN 55): water target 0 HU ±5; uniformity ±5 HU; noise
cap 7 HU (typical adult-abdomen technique).

#### `/qc/mammography-phantom` — ACR phantom scoring

Inputs: visible counts of fibres (max 6), masses (max 5), speck groups
(max 5). Validation: ACR thresholds — ≥ 4 fibres, ≥ 3 masses, ≥ 3 speck
groups visible.

#### `/qc/ultrasound` — Probe QC

Inputs: per-probe identifier; numeric tests against per-probe baseline
(penetration depth, axial / lateral resolution, dead zone) plus pass/fail
visual checks (anechoic & hyperechoic targets, image uniformity, geometric
accuracy, artefact-free).

```
Numeric deviation = |measured / baseline − 1|
```

Validation: ±20% pass, ±40% fail per AAPM TG-1 / ACR. Aggregate verdict
across all completed tests.

#### `/qc/mri` — ACR phantom

Inputs: geometric accuracy length, slice thickness (nominal + measured),
slice-position displacement, signal-ROI mean, background-noise SD, PIU,
PSG, low-contrast spokes visible.

```
SNR = signal-ROI mean / background-noise SD
```

Validation (ACR MRI Quality Control Manual): geometry ±2 mm of 190 mm,
slice ±0.7 mm, slice position ±5 mm, PIU ≥ 87.5%, PSG ≤ 2.5%, low-contrast
≥ 9 spokes (1.5T) or ≥ 37 (3T).

## Tech stack

- **Next.js 16** with the App Router and Turbopack
- **React 19**
- **TypeScript** in strict mode
- **Tailwind CSS v4**
- **Static export** (`output: "export"`, `trailingSlash: true`) — the build
  produces a fully static bundle that can be served from any CDN, a sub-path,
  or even `file://`
- **PWA**: a small `public/sw.js` is registered in production for offline use,
  alongside `manifest.webmanifest`

Because everything runs client-side, no patient data ever leaves the device.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # eslint
npm run build    # static export → ./out
```

The static bundle in `./out` is what gets deployed.

## Project structure

```
src/app/
  layout.tsx              Root layout, fonts, PWA metadata, SW registration
  page.tsx                Home / calculator index (renders from registry)
  globals.css             Tailwind entry + theme tokens + print styles
  sw-register.tsx         Service-worker registration (production only)
  audit/page.tsx          Coverage / status summary
  equipment/page.tsx      Per-equipment QC context settings
  <slug>/page.tsx         One file per calculator route
src/components/
  EquipmentProvider.tsx   localStorage-backed context (useSyncExternalStore)
  EquipmentBadge.tsx      Shows current rectifier / dosimeter on each page
  form.tsx                Field, Section, inputCls
  Stat.tsx                Result card
  ValidationCard.tsx      Verdict card; takes a Tolerance
  PrintButton.tsx         Triggers window.print()
src/lib/
  num.ts                  parse(), fmt() with locale
  verdict.ts              Verdict, Tolerance (two-sided/cap/floor), classifyDeviation
  calculators.ts          Single registry that drives the home page + audit
  equipment.ts            Equipment type + storage key
  tables/                 Reference tables ported from the workbook
public/
  Modelos_CQ.xltx         Source QC workbook
  manifest.webmanifest
  icon.svg
  sw.js
```

## Notes for contributors

- This Next.js version has breaking changes versus older majors. Before
  writing new code, consult `node_modules/next/dist/docs/` for the relevant
  guide and heed deprecation notices.
- New calculators should be added as a sibling route under `src/app/` (e.g.
  `src/app/intraoral/page.tsx`) and linked from the home page.
- Use **relative URLs** (`../`, `./foo`) for in-app navigation and assets so
  the bundle stays portable across sub-path and `file://` deployments.
- Keep calculators client-only (`"use client"`); the app is a static export
  and has no server runtime.
