"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { type Tolerance } from "@/lib/verdict";

type FormState = {
  kvp: string;
  mA: string;
  distanceCm: string;
  chamberDoseMgy: string;
  exposureSeconds: string;
};

const initial: FormState = {
  kvp: "",
  mA: "",
  distanceCm: "",
  chamberDoseMgy: "",
  exposureSeconds: "",
};

/** IEC 60601-1-3 / IN 56: leakage ≤ 1 mGy/h at 1 m from tube housing. */
const LEAKAGE_CAP_MGY_PER_H = 1;

const leakageCap: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 56 / IEC 60601-1-3",
  kind: "cap",
};

export default function LeakagePage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const distance = parse(form.distanceCm);
    const chamber = parse(form.chamberDoseMgy);
    const seconds = parse(form.exposureSeconds);
    if (
      distance === null ||
      chamber === null ||
      seconds === null ||
      seconds <= 0 ||
      distance <= 0
    )
      return null;

    const ratePerHourAtDistance = (chamber * 3600) / seconds;
    const ratePerHourAt1m = ratePerHourAtDistance * (distance / 100) ** 2;

    return {
      ratePerHourAtDistance,
      ratePerHourAt1m,
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
            href="../../"
            className="text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Leakage radiation
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Leakage dose rate from the tube housing at 1 m, computed from a
            chamber reading at any distance and the exposure duration. Tested
            under maximum-load conditions (max kVp + max continuous mA).
            Limit: 1 mGy/h per IN 56 / IEC 60601-1-3.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Test conditions">
            <div className="grid grid-cols-2 gap-3">
              <Field label="kVp (max load)">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.kvp}
                  onChange={update("kvp")}
                  className={inputCls}
                />
              </Field>
              <Field label="mA (max load)">
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

          <Section title="Measurement">
            <Field
              label="Distance from tube housing [cm]"
              hint="Where the chamber sat during the measurement."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.distanceCm}
                onChange={update("distanceCm")}
                className={inputCls}
              />
            </Field>
            <Field label="Integrated chamber dose [mGy]">
              <input
                type="number"
                inputMode="decimal"
                value={form.chamberDoseMgy}
                onChange={update("chamberDoseMgy")}
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
            <button
              type="button"
              onClick={() => setForm(initial)}
              className="mt-2 self-start rounded-md border border-radiation-400/40 bg-zinc-950 px-3 py-1.5 text-sm text-radiation-300 hover:border-radiation-400 hover:bg-radiation-400/10"
            >
              Clear
            </button>
          </Section>
        </form>

        {result ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Rate at distance"
              value={fmt(result.ratePerHourAtDistance)}
              unit="mGy/h"
            />
            <Stat
              label="Rate at 1 m"
              value={fmt(result.ratePerHourAt1m)}
              unit="mGy/h"
              emphasis
            />
            <ValidationCard
              observed={result.ratePerHourAt1m}
              observedLabel="Rate"
              expected={LEAKAGE_CAP_MGY_PER_H}
              expectedLabel="Cap"
              unit="mGy/h"
              tolerance={leakageCap}
              emptyHint=""
            />
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter measurement distance, chamber dose and exposure time.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>Rate at distance = chamber dose × 3600 / exposure time</p>
          <p>Rate at 1 m = rate at distance × (distance / 100)²</p>
          <p className="mt-1">
            The (distance/100)² term scales the measurement to 1 m via
            inverse square. Test must be performed at the maximum continuous
            tube load specified by the manufacturer.
          </p>
        </footer>
      </main>
    </div>
  );
}
