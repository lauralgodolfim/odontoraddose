"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import {
  type IntraoralFfd,
  intraoralBackscatter,
} from "@/lib/tables/intraoral";
import { type Tolerance } from "@/lib/verdict";

type FormState = {
  exam: string;
  kvp: string;
  mA: string;
  timeS: string;
  dFocusChamber: string;
  dFocusConeTip: string;
  chamberDose: string;
  ffd: IntraoralFfd | "custom";
  customBackscatter: string;
  referenceDose: string;
};

const initial: FormState = {
  exam: "",
  kvp: "",
  mA: "",
  timeS: "",
  dFocusChamber: "",
  dFocusConeTip: "",
  chamberDose: "",
  ffd: "ffd20",
  customBackscatter: "1",
  referenceDose: "",
};

/** IN 56/2019 timer / reproducibility tolerance: ±20% pass, ±40% fail. */
const intraoralTolerance: Tolerance = {
  fail: 0.2,
  restricted: 0.4,
  reference: "Local protocol",
};

export default function IntraoralPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const dChamber = parse(form.dFocusChamber);
    const dCone = parse(form.dFocusConeTip);
    const chamber = parse(form.chamberDose);
    const time = parse(form.timeS);
    const referenceDose = parse(form.referenceDose);

    if (dChamber === null || dCone === null || chamber === null) return null;
    if (dCone === 0) return null;

    const distanceFactor = (dChamber / dCone) ** 2;
    const doseAtConeTip = chamber * distanceFactor;

    const factor =
      form.ffd === "custom"
        ? (parse(form.customBackscatter) ?? 1)
        : intraoralBackscatter[form.ffd].factor;

    const esd = doseAtConeTip * factor;
    const doseRate = time !== null && time > 0 ? esd / time : null;

    return {
      doseAtConeTip,
      esd,
      doseRate,
      backscatterFactor: factor,
      referenceDose,
    };
  }, [form]);

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
        <header className="flex flex-col gap-2">
          <Link
            href="../"
            className="text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Intraoral — ESD
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Entrance skin dose at the cone tip. The chamber dose is scaled to
            the cone-tip distance via inverse square, then multiplied by the
            tissue backscatter factor.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Identification">
            <Field label="Exam">
              <input
                type="text"
                value={form.exam}
                onChange={update("exam")}
                placeholder="e.g. Periapical adult"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
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
              <Field label="Time [s]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.timeS}
                  onChange={update("timeS")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="Geometry">
            <Field
              label="Focus–chamber distance [cm]"
              hint="Distance from the focus to the chamber during the measurement."
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
              label="Focus–cone-tip distance [cm]"
              hint="Distance from the focus to the localiser exit (where the patient's skin is)."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusConeTip}
                onChange={update("dFocusConeTip")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Measurement">
            <Field label="Chamber dose [mGy]">
              <input
                type="number"
                inputMode="decimal"
                value={form.chamberDose}
                onChange={update("chamberDose")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Backscatter factor (FR)"
              hint="From the IPEN reference: 1.167 for 20 cm FFD, 1.208 for 27.5 cm FFD."
            >
              <select
                value={form.ffd}
                onChange={update("ffd")}
                className={inputCls}
              >
                <option value="ffd20">20 cm FFD — FR 1.167</option>
                <option value="ffd27_5">27.5 cm FFD — FR 1.208</option>
                <option value="custom">Custom</option>
              </select>
            </Field>
            {form.ffd === "custom" ? (
              <Field label="Custom FR">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.customBackscatter}
                  onChange={update("customBackscatter")}
                  className={inputCls}
                />
              </Field>
            ) : null}
          </Section>

          <Section title="Reference (optional)">
            <Field
              label="Reference ESD [mGy]"
              hint="Local protocol limit or IN 56 reference dose to compare against."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.referenceDose}
                onChange={update("referenceDose")}
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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Dose at cone tip"
              value={fmt(result.doseAtConeTip)}
              unit="mGy (free in air)"
            />
            <Stat label="ESD" value={fmt(result.esd)} unit="mGy" emphasis />
            <Stat
              label="Dose rate"
              value={fmt(result.doseRate)}
              unit="mGy/s"
            />
            <ValidationCard
              observed={result.esd}
              observedLabel="Calc"
              expected={result.referenceDose}
              expectedLabel="Ref"
              unit="mGy"
              tolerance={intraoralTolerance}
              emptyHint="Enter a reference ESD to compare against."
            />
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter chamber dose, focus–chamber distance and focus–cone-tip
            distance to see the ESD calculation.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>
            Dose at cone tip = chamber dose × (D<sub>focus–chamber</sub> / D
            <sub>focus–cone-tip</sub>)²
          </p>
          <p>ESD = dose at cone tip × backscatter factor (FR)</p>
          <p className="mt-1">
            Backscatter factors after Andrade &amp; da Penha (IPEN): 1.167 at
            20 cm FFD; 1.208 at 27.5 cm FFD.
          </p>
        </footer>
      </main>
    </div>
  );
}
