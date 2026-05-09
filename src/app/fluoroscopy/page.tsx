"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { type Tolerance } from "@/lib/verdict";

/** IN 91 / RDC 330 dose-rate caps at the entrance reference point. */
const fluoroModes = {
  manual: { label: "Manual / standard", capMgyPerMin: 50 },
  automatic: { label: "Automatic", capMgyPerMin: 100 },
  highRate: { label: "High rate (HLC)", capMgyPerMin: 200 },
} as const;

type Mode = keyof typeof fluoroModes;

type FormState = {
  mode: Mode;
  kvp: string;
  mA: string;
  dFocusChamber: string;
  dFocusSkin: string;
  chamberMgy: string;
  exposureSeconds: string;
  alarmMinutes: string;
};

const initial: FormState = {
  mode: "manual",
  kvp: "",
  mA: "",
  dFocusChamber: "",
  dFocusSkin: "",
  chamberMgy: "",
  exposureSeconds: "",
  alarmMinutes: "",
};

const dosRateCap: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 91 / RDC 330",
  kind: "cap",
};

/** Standard alarm threshold for accumulated fluoroscopy time. */
const ALARM_THRESHOLD_MIN = 5;
const alarmTolerance: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 91 alarm",
  kind: "cap",
};

export default function FluoroscopyPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const chamber = parse(form.chamberMgy);
    const seconds = parse(form.exposureSeconds);
    const dChamber = parse(form.dFocusChamber);
    const dSkin = parse(form.dFocusSkin);

    if (chamber === null || seconds === null || seconds <= 0) {
      return null;
    }

    const ratePerMinAtChamber = (chamber * 60) / seconds;
    let rateAtSkin: number | null = null;
    if (dChamber !== null && dSkin !== null && dSkin > 0) {
      rateAtSkin = ratePerMinAtChamber * (dChamber / dSkin) ** 2;
    }

    return {
      ratePerMinAtChamber,
      rateAtSkin,
      cap: fluoroModes[form.mode].capMgyPerMin,
    };
  }, [form]);

  const alarmMin = parse(form.alarmMinutes);

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
            Fluoroscopy
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Entrance dose rate at the reference point during fluoroscopy.
            Compares against IN 91 / RDC 330 dose-rate caps for the selected
            operating mode and checks the accumulated-time alarm threshold.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Operating mode">
            <Field
              label="Mode"
              hint="Selects the IN 91 / RDC 330 dose-rate cap."
            >
              <select
                value={form.mode}
                onChange={update("mode")}
                className={inputCls}
              >
                {(Object.keys(fluoroModes) as Mode[]).map((m) => (
                  <option key={m} value={m}>
                    {fluoroModes[m].label} — cap{" "}
                    {fluoroModes[m].capMgyPerMin} mGy/min
                  </option>
                ))}
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
          </Section>

          <Section title="Geometry">
            <Field
              label="Focus–chamber distance [cm]"
              hint="Distance from focus to the chamber during the test."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusChamber}
                onChange={update("dFocusChamber")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Focus–entrance reference distance [cm]"
              hint="Patient entrance reference point (typically 15 cm above the table for under-table tubes, 30 cm from the receptor for over-table)."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusSkin}
                onChange={update("dFocusSkin")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Measurement">
            <Field label="Integrated chamber dose [mGy]">
              <input
                type="number"
                inputMode="decimal"
                value={form.chamberMgy}
                onChange={update("chamberMgy")}
                className={inputCls}
              />
            </Field>
            <Field label="Exposure time [s]">
              <input
                type="number"
                inputMode="decimal"
                value={form.exposureSeconds}
                onChange={update("exposureSeconds")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Time alarm">
            <Field
              label="Indicated alarm time [min]"
              hint="When the accumulated-fluoroscopy alarm sounds. Should be ≤ 5 min per IN 91."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.alarmMinutes}
                onChange={update("alarmMinutes")}
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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Rate at chamber"
              value={fmt(result.ratePerMinAtChamber)}
              unit="mGy/min"
            />
            <Stat
              label="Rate at entrance"
              value={fmt(result.rateAtSkin)}
              unit="mGy/min"
              emphasis
            />
            <ValidationCard
              observed={result.rateAtSkin ?? result.ratePerMinAtChamber}
              observedLabel="Rate"
              expected={result.cap}
              expectedLabel="Cap"
              unit="mGy/min"
              tolerance={dosRateCap}
              emptyHint=""
            />
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter integrated chamber dose and exposure time to see the
            dose-rate calculation.
          </section>
        )}

        {alarmMin !== null ? (
          <section>
            <ValidationCard
              observed={alarmMin}
              observedLabel="Alarm"
              expected={ALARM_THRESHOLD_MIN}
              expectedLabel="Cap"
              unit="min"
              tolerance={alarmTolerance}
              emptyHint=""
            />
          </section>
        ) : null}

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>Rate at chamber [mGy/min] = chamber dose × 60 / exposure time</p>
          <p>
            Rate at entrance = rate at chamber × (D
            <sub>focus–chamber</sub> / D<sub>focus–entrance</sub>)²
          </p>
          <p className="mt-1">
            IN 91 / RDC 330 caps at the entrance reference point: 50 mGy/min
            (manual), 100 mGy/min (automatic), 200 mGy/min (high-rate).
            Accumulated-time alarm must trigger at ≤ 5 min.
          </p>
        </footer>
      </main>
    </div>
  );
}
