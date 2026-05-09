# Odonto RadDose

Radiation-dose calculators for dental imaging equipment. Built as an
installable, offline-capable web app (Next.js SPA + PWA, fully client-side).

The project digitises the calculations from a long-standing dental QC
workbook (`public/Modelos_CQ.xltx`, sheet `doses`) so technicians can compute
and validate dose values from a phone or browser instead of editing the
spreadsheet by hand.

## Status

Work in progress. Calculators ship one at a time as they are translated from
the source workbook.

| Calculator | Route        | Status     |
| ---------- | ------------ | ---------- |
| Extraoral — P<sub>KA</sub> (DAP) | `/extraoral` | Implemented |
| Intraoral, panoramic, mammography, CT, fluoroscopy, etc. | — | Planned |

### Extraoral — P<sub>KA</sub> (DAP)

Computes the kerma–area product from a P<sub>KL</sub> chamber reading and
compares it against the value reported by the machine, per Brazilian
**IN 56/2019** tolerance.

```
Corrected P_KL  = Measured P_KL × (D_focus-detector / D_focus-receptor)²
Dose-area P_KA  = Corrected P_KL × field height
Calculated P_KA = Dose-area P_KA × correction factor
```

Validation against the machine-reported P<sub>KA</sub>:

| Deviation | Verdict |
| --------- | ------- |
| ≤ 20 %    | Pass    |
| 20 – 40 % | Fail    |
| &gt; 40 % | Restricted |

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
  layout.tsx          Root layout, fonts, PWA metadata, SW registration
  page.tsx            Home / calculator index
  globals.css         Tailwind entry + theme tokens
  sw-register.tsx     Service-worker registration (production only)
  extraoral/page.tsx  Extraoral P_KA calculator
public/
  Modelos_CQ.xltx     Source QC workbook (calculations are ported from here)
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
