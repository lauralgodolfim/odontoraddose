"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { fmt, parse } from "@/lib/num";
import { type Verdict, verdictMeta } from "@/lib/verdict";

type FormState = {
  kvpRef: string;
  kvpMeasured: string;
  mA: string;
  doseRateMgyS: string;
  dfdCm: string;
  applyKvpCorrection: boolean;
  minRange: string;
  maxRange: string;
};

const initial: FormState = {
  kvpRef: "80",
  kvpMeasured: "",
  mA: "",
  doseRateMgyS: "",
  dfdCm: "",
  applyKvpCorrection: true,
  minRange: "30",
  maxRange: "65",
};

/** IN 56 / IN 90 conventional radiography tubeOutput bands (μGy/mAs·m² @ 80 kVp). */
const conventionalRanges = {
  pass: { min: 30, max: 65 },
  fail: { min: 20, max: 80 },
};

function classifyOutput(value: number): Verdict {
  if (value < conventionalRanges.fail.min || value > conventionalRanges.fail.max)
    return "restricted";
  if (value < conventionalRanges.pass.min || value > conventionalRanges.pass.max)
    return "fail";
  return "pass";
}

export default function OutputPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const doseRate = parse(form.doseRateMgyS);
    const mA = parse(form.mA);
    const dfd = parse(form.dfdCm);
    const kvpRef = parse(form.kvpRef);
    const kvpMeasured = parse(form.kvpMeasured);

    if (doseRate === null || mA === null || dfd === null || mA === 0) return null;

    let tubeOutput = (doseRate * 1000) / mA;
    tubeOutput *= (dfd / 100) ** 2;
    if (
      form.applyKvpCorrection &&
      kvpRef !== null &&
      kvpMeasured !== null &&
      kvpMeasured > 0
    ) {
      tubeOutput *= (kvpRef / kvpMeasured) ** 2;
    }

    const verdict = classifyOutput(tubeOutput);
    return { tubeOutput, verdict };
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
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" /> Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Tube output
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tube output normalised to 1 metre and (optionally) to a reference
            kVp. Compares against the IN 56 / IN 90 acceptable range for
            conventional radiography.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Beam">
            <div className="grid grid-cols-2 gap-3">
              <Field label="kVp reference">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.kvpRef}
                  onChange={update("kvpRef")}
                  className={inputCls}
                />
              </Field>
              <Field label="kVp measured">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.kvpMeasured}
                  onChange={update("kvpMeasured")}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field
              label="Apply kVp² correction"
              hint="Normalises the output to the reference kVp via inverse-square."
            >
              <select
                value={form.applyKvpCorrection ? "yes" : "no"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    applyKvpCorrection: e.target.value === "yes",
                  }))
                }
                className={inputCls}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </Section>

          <Section title="Measurement">
            <Field label="Dose rate [mGy/s]">
              <input
                type="number"
                inputMode="decimal"
                value={form.doseRateMgyS}
                onChange={update("doseRateMgyS")}
                className={inputCls}
              />
            </Field>
            <Field label="Tube current [mA]">
              <input
                type="number"
                inputMode="decimal"
                value={form.mA}
                onChange={update("mA")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Focus–detector distance [cm]"
              hint="Distance the dose rate was measured at."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dfdCm}
                onChange={update("dfdCm")}
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
              label="Tube output"
              value={fmt(result.tubeOutput)}
              unit="μGy/mAs · m²"
              emphasis
            />
            <div
              className={`flex flex-col gap-1 rounded-lg border p-4 ${verdictMeta[result.verdict].tone}`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider">
                IN 56 / IN 90
              </span>
              <span className="text-2xl font-semibold">
                {verdictMeta[result.verdict].label}
              </span>
              <span className="text-[11px]">
                Acceptable range {conventionalRanges.pass.min}–
                {conventionalRanges.pass.max}; tolerance{" "}
                {conventionalRanges.fail.min}–{conventionalRanges.fail.max}{" "}
                μGy/mAs·m².
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <span className="font-medium uppercase tracking-wider">Note</span>
              <span>
                The IN 56 range is for conventional radiography at the
                reference kVp. Dental intraoral typically reads higher and
                has no published cap; treat the verdict as informational
                outside the conventional context.
              </span>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter dose rate, current and focus–detector distance.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>
            Tube output [μGy/mAs·m²] = (dose rate × 1000 / mA) × (FDD / 100)²
            × (kVp<sub>ref</sub> / kVp<sub>meas</sub>)²
          </p>
          <p className="mt-1">
            The (FDD/100)² term scales the measurement to 1 m. The (kVp
            ratio)² term normalises to a reference kVp using the standard
            tube-output kVp² scaling.
          </p>
        </footer>
      </main>
    </div>
  );
}
