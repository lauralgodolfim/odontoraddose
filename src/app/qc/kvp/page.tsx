"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { fmt, parse } from "@/lib/num";
import {
  classifyDeviation,
  IN_56_KVP,
  type Tolerance,
  type Verdict,
  verdictMeta,
} from "@/lib/verdict";

const SHOT_COUNT = 5;

type FormState = {
  nominal: string;
  shots: string[];
};

const initial: FormState = {
  nominal: "",
  shots: Array.from({ length: SHOT_COUNT }, () => ""),
};

const reproTolerance: Tolerance = {
  fail: 0.05,
  restricted: 0.1,
  reference: "IN 56 reproducibility",
};

function classifyMaxDeviation(deviations: number[]): Verdict {
  let worst: Verdict = "pass";
  for (const d of deviations) {
    const v = classifyDeviation(d, IN_56_KVP);
    if (v === "restricted") return "restricted";
    if (v === "fail") worst = "fail";
  }
  return worst;
}

export default function KvpPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const nominal = parse(form.nominal);
    const measured = form.shots.map((v) => parse(v));
    const valid = measured.filter((v): v is number => v !== null);
    if (nominal === null || nominal === 0 || valid.length === 0) return null;

    const deviations = valid.map((m) => m / nominal - 1);
    const accuracyVerdict = classifyMaxDeviation(deviations);

    const max = Math.max(...valid);
    const min = Math.min(...valid);
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    const reproducibility = avg === 0 ? 0 : (max - min) / avg;
    const reproVerdict = classifyDeviation(reproducibility, reproTolerance);

    return {
      nominal,
      measured,
      deviations,
      accuracyVerdict,
      avg,
      reproducibility,
      reproVerdict,
    };
  }, [form]);

  const updateShot = (idx: number) => (value: string) =>
    setForm((f) => {
      const shots = [...f.shots];
      shots[idx] = value;
      return { ...f, shots };
    });

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
            kVp accuracy
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Per-shot kVp deviation against the selected nominal value, plus
            reproducibility across the shot series. IN 56 tolerances: ±10%
            per shot for accuracy; ±5% reproducibility.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Nominal">
            <Field label="Nominal kVp">
              <input
                type="number"
                inputMode="decimal"
                value={form.nominal}
                onChange={(e) => setForm((f) => ({ ...f, nominal: e.target.value }))}
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

          <Section title="Measured kVp per shot">
            {form.shots.map((shot, idx) => (
              <Field key={idx} label={`Shot ${idx + 1}`}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={shot}
                  onChange={(e) => updateShot(idx)(e.target.value)}
                  className={inputCls}
                />
              </Field>
            ))}
          </Section>
        </form>

        {result ? (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="Mean kVp" value={fmt(result.avg)} unit="kVp" />
              <Stat
                label="Reproducibility"
                value={`${(result.reproducibility * 100).toFixed(1)}%`}
                unit="(max−min)/avg"
                emphasis
              />
              <VerdictCard
                title="IN 56 reproducibility"
                verdict={result.reproVerdict}
                tolerance={reproTolerance}
              />
            </section>
            <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Shot</th>
                    <th className="px-4 py-2 text-right font-medium">Measured kVp</th>
                    <th className="px-4 py-2 text-right font-medium">Deviation</th>
                    <th className="px-4 py-2 text-right font-medium">IN 56</th>
                  </tr>
                </thead>
                <tbody>
                  {result.measured.map((m, idx) => {
                    if (m === null) return null;
                    const dev = result.deviations[idx];
                    const verdict = classifyDeviation(dev, IN_56_KVP);
                    const meta = verdictMeta[verdict];
                    return (
                      <tr
                        key={idx}
                        className="border-t border-zinc-100 dark:border-zinc-900"
                      >
                        <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {fmt(m)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {(dev * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.tone}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
            <section>
              <VerdictCard
                title="Worst-shot accuracy verdict"
                verdict={result.accuracyVerdict}
                tolerance={IN_56_KVP}
              />
            </section>
          </>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter the nominal kVp and at least one measured shot to see the
            analysis.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>Per-shot deviation = measured / nominal − 1</p>
          <p>Reproducibility = (max − min) / mean across the shot series</p>
          <p className="mt-1">
            IN 56/2019 tolerance: per-shot accuracy ±10% (pass), ±10–20%
            (fail), &gt; 20% (restricted). Reproducibility ≤ 5% (pass), 5–10%
            (fail), &gt; 10% (restricted).
          </p>
        </footer>
      </main>
    </div>
  );
}

function VerdictCard({
  title,
  verdict,
  tolerance,
}: {
  title: string;
  verdict: Verdict;
  tolerance: Tolerance;
}) {
  const meta = verdictMeta[verdict];
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}`}>
      <span className="text-[11px] font-medium uppercase tracking-wider">
        {title}
      </span>
      <span className="text-2xl font-semibold">{meta.label}</span>
      <span className="text-[11px]">{meta.sub(tolerance)}</span>
    </div>
  );
}
