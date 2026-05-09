"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import {
  gcByHvl,
  in54Dgm,
  sFactorByTargetFilter,
  sFactorWAlByPmma,
  type TargetFilter,
} from "@/lib/tables/mammography";
import { type Tolerance } from "@/lib/verdict";

type FormState = {
  pmma: string;
  hvl: string;
  targetFilter: TargetFilter;
  kit: string;
};

const initial: FormState = {
  pmma: "45",
  hvl: "0.4",
  targetFilter: "Mo/Mo",
  kit: "",
};

const in54Cap: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 54",
  kind: "cap",
};

const targetFilterOptions: TargetFilter[] = [
  "Mo/Mo",
  "Mo/Rh",
  "Rh/Rh",
  "W/Ag",
  "W/Rh",
  "W/Al",
];

function lookupGc(pmma: number, hvl: number): number | null {
  const row = gcByHvl.rows.find((r) => r.pmmaMm === pmma);
  if (!row) return null;
  const idx = gcByHvl.hvls.indexOf(hvl as (typeof gcByHvl.hvls)[number]);
  if (idx === -1) return null;
  return row.gc[idx];
}

function lookupS(target: TargetFilter, pmma: number): number | null {
  if (target === "W/Al") {
    const row = sFactorWAlByPmma.find((r) => r.pmmaMm === pmma);
    return row?.s ?? null;
  }
  return sFactorByTargetFilter[target]?.s ?? null;
}

function lookupIn54Cap(pmma: number) {
  return in54Dgm.find((r) => r.pmmaMm === pmma) ?? null;
}

export default function MammographyPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const pmma = parse(form.pmma);
    const hvl = parse(form.hvl);
    const kit = parse(form.kit);
    if (pmma === null || hvl === null || kit === null) return null;

    const gc = lookupGc(pmma, hvl);
    const s = lookupS(form.targetFilter, pmma);
    const cap = lookupIn54Cap(pmma);

    if (gc === null || s === null) {
      return {
        gc,
        s,
        kit,
        mgd: null as number | null,
        cap,
      };
    }
    const mgd = gc * s * kit;
    return { gc, s, kit, mgd, cap };
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
            Mammography — MGD
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mean glandular dose for a standard-equivalent breast. Looks up
            g·c (AIEA HHS 17) by PMMA thickness and HVL, then the S factor
            for the target/filter combination, and multiplies by the
            entrance air kerma. Validated against the IN 54 tolerance for
            that PMMA thickness.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Phantom & beam">
            <Field label="PMMA thickness [mm]">
              <select
                value={form.pmma}
                onChange={update("pmma")}
                className={inputCls}
              >
                {gcByHvl.rows.map((r) => {
                  const cap = in54Dgm.find((c) => c.pmmaMm === r.pmmaMm);
                  return (
                    <option key={r.pmmaMm} value={r.pmmaMm}>
                      {r.pmmaMm} mm — {r.breastEqMm} mm equivalent breast
                      {cap ? ` (IN 54 < ${cap.tolerance})` : ""}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field
              label="HVL nominal [mm Al]"
              hint="Pick the nominal HVL closest to the measured value."
            >
              <select
                value={form.hvl}
                onChange={update("hvl")}
                className={inputCls}
              >
                {gcByHvl.hvls.map((h) => (
                  <option key={h} value={h}>
                    {h.toFixed(2)} mm Al
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Target / filter"
              hint="W/Al uses a PMMA-dependent S factor; others are flat."
            >
              <select
                value={form.targetFilter}
                onChange={update("targetFilter")}
                className={inputCls}
              >
                {targetFilterOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Measurement">
            <Field
              label="Kit — entrance air kerma [mGy]"
              hint="From the chamber reading at the phantom surface. Use the LiF-derived value if applicable."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.kit}
                onChange={update("kit")}
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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="g·c (AIEA HHS 17)"
              value={result.gc !== null ? fmt(result.gc) : "—"}
              unit="—"
            />
            <Stat
              label="S factor"
              value={result.s !== null ? fmt(result.s) : "—"}
              unit="—"
            />
            <Stat
              label="MGD"
              value={result.mgd !== null ? fmt(result.mgd) : "—"}
              unit="mGy"
              emphasis
            />
            {result.mgd !== null && result.cap ? (
              <ValidationCard
                observed={result.mgd}
                observedLabel="MGD"
                expected={result.cap.tolerance}
                expectedLabel="Cap"
                unit="mGy"
                tolerance={in54Cap}
                emptyHint=""
              />
            ) : (
              <div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                <span className="font-medium uppercase tracking-wider">
                  IN 54
                </span>
                <span>
                  {result.cap
                    ? "Provide Kit and a valid PMMA/HVL/target combination."
                    : "No IN 54 cap for this PMMA thickness."}
                </span>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter the entrance air kerma (Kit) to see the MGD calculation.
          </section>
        )}

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>MGD = g·c (PMMA, HVL) × S (target/filter) × Kit</p>
          <p className="mt-1">
            g·c lookup: AIEA HHS 17 (pg. 114). S factors: AIEA HHS 17 Table
            on target–filter combinations and W/Al variant by PMMA. IN 54
            tolerance is a strict upper bound on MGD per PMMA thickness.
          </p>
        </footer>
      </main>
    </div>
  );
}
