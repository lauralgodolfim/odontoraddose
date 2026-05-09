"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { useEquipment } from "@/components/EquipmentProvider";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { hvlMinFor, type Rectifier } from "@/lib/tables/hvl";
import { type Tolerance } from "@/lib/verdict";

type FormState = {
  kvp: string;
  measuredHvl: string;
  rectifierOverride: Rectifier | "";
};

const initial: FormState = {
  kvp: "",
  measuredHvl: "",
  rectifierOverride: "",
};

const hvlFloor: Tolerance = {
  fail: 0.0,
  restricted: 0.8,
  reference: "IN 56/2019",
  kind: "floor",
};

const rectifierLabels: Record<Rectifier, string> = {
  mono: "Mono (single-phase)",
  tri: "Tri (three-phase)",
  af: "AF (high frequency)",
};

export default function HvlPage() {
  const { equipment } = useEquipment();
  const [form, setForm] = useState<FormState>(initial);

  const rectifier: Rectifier =
    form.rectifierOverride !== "" ? form.rectifierOverride : equipment.rectifier;

  const result = useMemo(() => {
    const kvp = parse(form.kvp);
    const measured = parse(form.measuredHvl);
    if (kvp === null) return null;
    const minimum = hvlMinFor(kvp, rectifier);
    if (minimum === null) return { minimum, measured };
    return { minimum, measured };
  }, [form.kvp, form.measuredHvl, rectifier]);

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
            HVL — half-value layer
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Compares the measured half-value layer against the IN 56/2019
            minimum for the kVp setting and rectifier type. Linear
            interpolation between tabulated kVp rows.
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
            <Field label="kVp">
              <input
                type="number"
                inputMode="decimal"
                value={form.kvp}
                onChange={update("kvp")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Rectifier"
              hint={`Default from equipment settings: ${rectifierLabels[equipment.rectifier]}.`}
            >
              <select
                value={form.rectifierOverride}
                onChange={update("rectifierOverride")}
                className={inputCls}
              >
                <option value="">Use equipment setting</option>
                <option value="mono">Mono (single-phase)</option>
                <option value="tri">Tri (three-phase)</option>
                <option value="af">AF (high frequency)</option>
              </select>
            </Field>
          </Section>

          <Section title="Measurement">
            <Field label="Measured HVL [mm Al]">
              <input
                type="number"
                inputMode="decimal"
                value={form.measuredHvl}
                onChange={update("measuredHvl")}
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
              label="HVL minimum"
              value={result.minimum !== null ? fmt(result.minimum) : "—"}
              unit="mm Al"
            />
            <Stat
              label="Measured HVL"
              value={result.measured !== null ? fmt(result.measured) : "—"}
              unit="mm Al"
              emphasis
            />
            {result.measured !== null && result.minimum !== null ? (
              <ValidationCard
                observed={result.measured}
                observedLabel="Measured"
                expected={result.minimum}
                expectedLabel="Min"
                unit="mm Al"
                tolerance={hvlFloor}
                emptyHint=""
              />
            ) : (
              <div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <span className="font-medium uppercase tracking-wider">
                  IN 56/2019
                </span>
                <span>
                  {result.minimum === null
                    ? "kVp outside tabulated range (50–130 kVp)."
                    : "Enter the measured HVL to compare."}
                </span>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter the kVp setting to look up the IN 56 minimum HVL.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>
            HVL minimum is interpolated between the IN 56/2019 Annex 2 table
            rows for the selected rectifier type. Coverage: 50–130 kVp.
          </p>
          <p className="mt-1">
            Verdict: pass if measured ≥ minimum; fail if 80–100% of minimum;
            restricted if &lt; 80%.
          </p>
        </footer>
      </main>
    </div>
  );
}
