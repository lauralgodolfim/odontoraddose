"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { type Tolerance } from "@/lib/verdict";

type FormState = {
  // Geometric accuracy: nominal 190 mm
  geomMeasuredMm: string;
  // Slice thickness: nominal value & measured
  sliceNominalMm: string;
  sliceMeasuredMm: string;
  // Slice position: signed displacement (mm)
  slicePositionMm: string;
  // SNR
  signalRoi: string;
  noiseSd: string;
  // Low-contrast: visible spokes (10 spokes per disk × 4 disks = 40 max)
  lowContrastSpokes: string;
  // Image intensity uniformity (PIU, %)
  piuPct: string;
  // Percent-signal ghosting (%)
  ghostingPct: string;
};

const initial: FormState = {
  geomMeasuredMm: "",
  sliceNominalMm: "5",
  sliceMeasuredMm: "",
  slicePositionMm: "",
  signalRoi: "",
  noiseSd: "",
  lowContrastSpokes: "",
  piuPct: "",
  ghostingPct: "",
};

const GEOMETRY_NOMINAL = 190;

const geometryTolerance: Tolerance = {
  fail: 2,
  restricted: 4,
  reference: "ACR MRI",
};
const sliceThicknessTolerance: Tolerance = {
  fail: 0.7,
  restricted: 1.4,
  reference: "ACR MRI",
};
const slicePositionTolerance: Tolerance = {
  fail: 5,
  restricted: 10,
  reference: "ACR MRI",
};
const piuFloor: Tolerance = {
  fail: 0,
  restricted: 0.1,
  reference: "ACR PIU",
  kind: "floor",
};
const PIU_MIN = 87.5;
const ghostingCap: Tolerance = {
  fail: 0,
  restricted: 1,
  reference: "ACR PSG",
  kind: "cap",
};
const PSG_CAP = 2.5;
const lowContrastFloor: Tolerance = {
  fail: 0,
  restricted: 0.2,
  reference: "ACR low contrast",
  kind: "floor",
};
const LOW_CONTRAST_MIN = 9;

export default function MriPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const signal = parse(form.signalRoi);
    const noise = parse(form.noiseSd);
    const snr = signal !== null && noise !== null && noise > 0 ? signal / noise : null;
    return { snr };
  }, [form.signalRoi, form.noiseSd]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  const geom = parse(form.geomMeasuredMm);
  const sliceMeas = parse(form.sliceMeasuredMm);
  const sliceNom = parse(form.sliceNominalMm);
  const slicePos = parse(form.slicePositionMm);
  const piu = parse(form.piuPct);
  const ghosting = parse(form.ghostingPct);
  const lowContrast = parse(form.lowContrastSpokes);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
        <header className="flex flex-col gap-2">
          <Link
            href="../../"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" /> Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            MRI — ACR phantom
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ACR phantom QC: geometric accuracy, slice thickness and position,
            SNR, image uniformity (PIU), ghosting (PSG), and low-contrast
            visibility.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Geometric accuracy">
            <Field
              label="Measured length [mm]"
              hint="Phantom diameter target: 190 mm. ACR ±2 mm."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.geomMeasuredMm}
                onChange={update("geomMeasuredMm")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Slice thickness & position">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nominal [mm]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.sliceNominalMm}
                  onChange={update("sliceNominalMm")}
                  className={inputCls}
                />
              </Field>
              <Field label="Measured [mm]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.sliceMeasuredMm}
                  onChange={update("sliceMeasuredMm")}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field
              label="Slice-position displacement [mm]"
              hint="Signed; ACR ±5 mm of intended position."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.slicePositionMm}
                onChange={update("slicePositionMm")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="SNR">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Signal ROI mean">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.signalRoi}
                  onChange={update("signalRoi")}
                  className={inputCls}
                />
              </Field>
              <Field label="Background noise SD">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.noiseSd}
                  onChange={update("noiseSd")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="Uniformity & artefacts">
            <Field
              label="PIU — image intensity uniformity [%]"
              hint="ACR ≥ 87.5% at 1.5T (≥ 82% at 3T)."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.piuPct}
                onChange={update("piuPct")}
                className={inputCls}
              />
            </Field>
            <Field
              label="PSG — percent-signal ghosting [%]"
              hint="ACR ≤ 2.5%."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.ghostingPct}
                onChange={update("ghostingPct")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Low-contrast spokes visible (max 40)"
              hint="ACR ≥ 9 spokes (1.5T) or ≥ 37 (3T)."
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={40}
                value={form.lowContrastSpokes}
                onChange={update("lowContrastSpokes")}
                className={inputCls}
              />
            </Field>
            <button
              type="button"
              onClick={() => setForm(initial)}
              className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
            >
              Clear
            </button>
          </Section>
        </form>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.snr !== null ? (
            <Stat label="SNR" value={fmt(result.snr)} unit="" emphasis />
          ) : null}
          {geom !== null ? (
            <ValidationCard
              observed={geom}
              observedLabel="Length"
              expected={GEOMETRY_NOMINAL}
              expectedLabel="Target"
              unit="mm"
              tolerance={geometryTolerance}
              emptyHint=""
            />
          ) : null}
          {sliceMeas !== null && sliceNom !== null ? (
            <ValidationCard
              observed={sliceMeas}
              observedLabel="Slice"
              expected={sliceNom}
              expectedLabel="Nominal"
              unit="mm"
              tolerance={sliceThicknessTolerance}
              emptyHint=""
            />
          ) : null}
          {slicePos !== null ? (
            <ValidationCard
              observed={slicePos}
              observedLabel="Δ"
              expected={0}
              expectedLabel="Target"
              unit="mm"
              tolerance={slicePositionTolerance}
              emptyHint=""
            />
          ) : null}
          {piu !== null ? (
            <ValidationCard
              observed={piu}
              observedLabel="PIU"
              expected={PIU_MIN}
              expectedLabel="Min"
              unit="%"
              tolerance={piuFloor}
              emptyHint=""
            />
          ) : null}
          {ghosting !== null ? (
            <ValidationCard
              observed={ghosting}
              observedLabel="PSG"
              expected={PSG_CAP}
              expectedLabel="Cap"
              unit="%"
              tolerance={ghostingCap}
              emptyHint=""
            />
          ) : null}
          {lowContrast !== null ? (
            <ValidationCard
              observed={lowContrast}
              observedLabel="Spokes"
              expected={LOW_CONTRAST_MIN}
              expectedLabel="Min"
              unit=""
              tolerance={lowContrastFloor}
              emptyHint=""
            />
          ) : null}
        </section>

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>SNR = signal-ROI mean / background-noise standard deviation.</p>
          <p>
            References: ACR MRI Quality Control Manual, AAPM TG-100. Field-
            strength specific thresholds (1.5T vs 3T) shown in hints.
          </p>
        </footer>
      </main>
    </div>
  );
}
