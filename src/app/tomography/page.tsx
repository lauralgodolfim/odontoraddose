"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import {
  type CtRegion,
  ctEffectiveDoseFactor,
  ctRegionLabels,
  ctdiVolMaxByRegion,
} from "@/lib/tables/dosimetry";
import { type Tolerance } from "@/lib/verdict";

type Mode = "helical" | "axial";

type FormState = {
  region: CtRegion;
  mode: Mode;
  kvp: string;
  mA: string;
  sliceMm: string;
  channels: string;
  pitch: string;
  ctdiCenter: string;
  ctdi3h: string;
  ctdi6h: string;
  ctdi9h: string;
  ctdi12h: string;
  calibrationFactor: string;
  detectorLengthMm: string;
  ctdiVolIndicated: string;
  dlpIndicated: string;
};

const initial: FormState = {
  region: "AbdomenAdult",
  mode: "helical",
  kvp: "",
  mA: "",
  sliceMm: "",
  channels: "",
  pitch: "1",
  ctdiCenter: "",
  ctdi3h: "",
  ctdi6h: "",
  ctdi9h: "",
  ctdi12h: "",
  calibrationFactor: "1",
  detectorLengthMm: "100",
  ctdiVolIndicated: "",
  dlpIndicated: "",
};

/** IN 55 indicator-accuracy tolerance: ±20% pass, ±40% fail. */
const ctdiAccuracyTolerance: Tolerance = {
  fail: 0.2,
  restricted: 0.4,
  reference: "IN 55",
};

const ctdiCapTolerance: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 55 cap",
  kind: "cap",
};

export default function TomographyPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const center = parse(form.ctdiCenter);
    const r3 = parse(form.ctdi3h);
    const r6 = parse(form.ctdi6h);
    const r9 = parse(form.ctdi9h);
    const r12 = parse(form.ctdi12h);
    const calibration = parse(form.calibrationFactor) ?? 1;
    const pitch = parse(form.pitch) ?? 1;
    const detectorLength = parse(form.detectorLengthMm) ?? 100;
    const slice = parse(form.sliceMm);
    const channels = parse(form.channels);
    const ctdiVolIndicated = parse(form.ctdiVolIndicated);
    const dlpIndicated = parse(form.dlpIndicated);

    if (
      center === null ||
      r3 === null ||
      r6 === null ||
      r9 === null ||
      r12 === null
    )
      return null;
    if (pitch === 0) return null;

    const peripheralAvg = (r3 + r6 + r9 + r12) / 4;
    const ctdiW = (1 / 3) * center + (2 / 3) * peripheralAvg;

    let scanLengthMm: number | null = null;
    if (
      ctdiVolIndicated !== null &&
      ctdiVolIndicated > 0 &&
      dlpIndicated !== null
    ) {
      scanLengthMm = (10 * dlpIndicated) / ctdiVolIndicated;
    } else if (slice !== null && channels !== null) {
      scanLengthMm = channels * slice;
    }

    const lengthCorrection =
      scanLengthMm !== null && scanLengthMm < detectorLength
        ? detectorLength / scanLengthMm
        : 1;

    const ctdiWCorrected = ctdiW * calibration * lengthCorrection;
    const ctdiVol = ctdiWCorrected / pitch;
    const dlp = scanLengthMm !== null ? (scanLengthMm * ctdiVol) / 10 : null;
    const k = ctEffectiveDoseFactor[form.region];
    const effectiveDose = dlp !== null ? dlp * k : null;
    const cap = ctdiVolMaxByRegion[form.region] ?? null;

    return {
      ctdiW,
      ctdiVol,
      dlp,
      effectiveDose,
      ctdiVolIndicated,
      cap,
      scanLengthMm,
    };
  }, [form]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
        <header className="flex flex-col gap-2">
          <Link
            href="../"
            className="text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Tomography — CTDI / DLP / E
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Weighted CTDI from central + peripheral chamber readings, scaled
            to CTDIvol by pitch and length-corrected for short scans, then
            DLP and effective dose. Compares against the machine-displayed
            CTDIvol per IN 55.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Scan parameters">
            <Field label="Region">
              <select
                value={form.region}
                onChange={update("region")}
                className={inputCls}
              >
                {(Object.keys(ctEffectiveDoseFactor) as CtRegion[]).map(
                  (r) => (
                    <option key={r} value={r}>
                      {ctRegionLabels[r]} — k = {ctEffectiveDoseFactor[r]}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Mode">
              <select
                value={form.mode}
                onChange={update("mode")}
                className={inputCls}
              >
                <option value="helical">Helical / multislice</option>
                <option value="axial">Axial / sequential</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="kVp">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.kvp}
                  onChange={update("kvp")}
                  className={inputCls}
                />
              </Field>
              <Field label="mA">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.mA}
                  onChange={update("mA")}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Slice T [mm]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.sliceMm}
                  onChange={update("sliceMm")}
                  className={inputCls}
                />
              </Field>
              <Field label="Channels N">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.channels}
                  onChange={update("channels")}
                  className={inputCls}
                />
              </Field>
              <Field
                label="Pitch"
                hint="Helical pitch; default 1 for sequential."
              >
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.pitch}
                  onChange={update("pitch")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="CTDI100 chamber readings">
            <Field label="Central [mGy]">
              <input
                type="number"
                inputMode="decimal"
                value={form.ctdiCenter}
                onChange={update("ctdiCenter")}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="3 h [mGy]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.ctdi3h}
                  onChange={update("ctdi3h")}
                  className={inputCls}
                />
              </Field>
              <Field label="6 h [mGy]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.ctdi6h}
                  onChange={update("ctdi6h")}
                  className={inputCls}
                />
              </Field>
              <Field label="9 h [mGy]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.ctdi9h}
                  onChange={update("ctdi9h")}
                  className={inputCls}
                />
              </Field>
              <Field label="12 h [mGy]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.ctdi12h}
                  onChange={update("ctdi12h")}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Calibration factor"
                hint="Default 1 unless certificate provides one."
              >
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.calibrationFactor}
                  onChange={update("calibrationFactor")}
                  className={inputCls}
                />
              </Field>
              <Field
                label="Chamber length [mm]"
                hint="Active length of the CT pencil chamber (typically 100 mm)."
              >
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.detectorLengthMm}
                  onChange={update("detectorLengthMm")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="Machine-indicated values">
            <Field
              label="CTDIvol indicated [mGy]"
              hint="From the scanner's dose report."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.ctdiVolIndicated}
                onChange={update("ctdiVolIndicated")}
                className={inputCls}
              />
            </Field>
            <Field
              label="DLP indicated [mGy·cm]"
              hint="If provided, scan length is derived as 10·DLP / CTDIvol."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dlpIndicated}
                onChange={update("dlpIndicated")}
                className={inputCls}
              />
            </Field>
            <button
              type="button"
              onClick={() => setForm(initial)}
              className="mt-2 self-start rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Clear
            </button>
          </Section>
        </form>

        {result ? (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="CTDIw"
                value={fmt(result.ctdiW)}
                unit="mGy"
              />
              <Stat
                label="CTDIvol"
                value={fmt(result.ctdiVol)}
                unit="mGy"
                emphasis
              />
              <Stat label="DLP" value={fmt(result.dlp)} unit="mGy·cm" />
              <Stat
                label="Effective dose"
                value={fmt(result.effectiveDose)}
                unit="mSv"
              />
            </section>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ValidationCard
                observed={result.ctdiVol}
                observedLabel="Calc"
                expected={result.ctdiVolIndicated}
                expectedLabel="Indicated"
                unit="mGy"
                tolerance={ctdiAccuracyTolerance}
                emptyHint="Enter the indicated CTDIvol to check IN 55 indicator accuracy."
              />
              {result.cap !== null ? (
                <ValidationCard
                  observed={result.ctdiVol}
                  observedLabel="Calc"
                  expected={result.cap}
                  expectedLabel="Cap"
                  unit="mGy"
                  tolerance={ctdiCapTolerance}
                  emptyHint=""
                />
              ) : (
                <div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <span className="font-medium uppercase tracking-wider">
                    IN 55 cap
                  </span>
                  <span>
                    No published cap for {ctRegionLabels[form.region]}.
                  </span>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter the five chamber readings (central + 3 h, 6 h, 9 h, 12 h)
            to see the dose calculation.
          </section>
        )}

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>CTDIw = (1/3)·CTDI₁₀₀ central + (2/3)·avg(CTDI₁₀₀ peripheral)</p>
          <p>CTDIvol = CTDIw · calibration · length-correction / pitch</p>
          <p>DLP [mGy·cm] = scan-length [mm] · CTDIvol / 10</p>
          <p>E [mSv] = DLP · k(region)</p>
          <p className="mt-1">
            Length correction applies when scan length is shorter than the
            chamber&apos;s active length: factor = chamber-length / scan-length.
            Otherwise factor = 1.
          </p>
        </footer>
      </main>
    </div>
  );
}
