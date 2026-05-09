"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { parse } from "@/lib/num";
import { type Verdict, verdictMeta } from "@/lib/verdict";

type Test = {
  key: string;
  label: string;
  unit?: string;
  hint?: string;
};

const numericTests: Test[] = [
  {
    key: "penetration",
    label: "Penetration depth",
    unit: "cm",
    hint: "Should reach or exceed the probe's rated depth.",
  },
  {
    key: "axial",
    label: "Axial resolution",
    unit: "mm",
    hint: "Lower is better (typically ≤ 1 mm for high-frequency probes).",
  },
  {
    key: "lateral",
    label: "Lateral resolution",
    unit: "mm",
    hint: "Probe-dependent; compare against baseline.",
  },
  {
    key: "deadZone",
    label: "Dead zone",
    unit: "mm",
    hint: "Distance from the probe face to the first usable signal.",
  },
];

const passFailTests: Test[] = [
  { key: "anechoic", label: "Anechoic targets visible" },
  { key: "hyperechoic", label: "Hyperechoic targets visible" },
  { key: "uniformity", label: "Image uniformity" },
  { key: "geometric", label: "Geometric accuracy" },
  { key: "artefacts", label: "Artefact-free image" },
];

type FormState = {
  probe: string;
  numeric: Record<string, string>;
  baseline: Record<string, string>;
  passFail: Record<string, boolean>;
};

const initial: FormState = {
  probe: "",
  numeric: Object.fromEntries(numericTests.map((t) => [t.key, ""])),
  baseline: Object.fromEntries(numericTests.map((t) => [t.key, ""])),
  passFail: Object.fromEntries(passFailTests.map((t) => [t.key, true])),
};

function classifyDeviation(measured: number, baseline: number): Verdict {
  if (baseline <= 0) return "pass";
  const dev = Math.abs(measured / baseline - 1);
  if (dev > 0.4) return "restricted";
  if (dev > 0.2) return "fail";
  return "pass";
}

export default function UltrasoundPage() {
  const [form, setForm] = useState<FormState>(initial);

  const overall = useMemo(() => {
    const numericVerdicts: Verdict[] = numericTests
      .map((t) => {
        const m = parse(form.numeric[t.key] ?? "");
        const b = parse(form.baseline[t.key] ?? "");
        if (m === null || b === null) return null;
        return classifyDeviation(m, b);
      })
      .filter((v): v is Verdict => v !== null);

    const passFailVerdicts: Verdict[] = passFailTests.map((t) =>
      form.passFail[t.key] ? "pass" : "fail",
    );

    const all = [...numericVerdicts, ...passFailVerdicts];
    if (all.length === 0) return null;
    if (all.includes("restricted")) return "restricted";
    if (all.includes("fail")) return "fail";
    return "pass";
  }, [form]);

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
            Ultrasound — QC
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Periodic QC checks for ultrasound probes against a tissue-mimicking
            phantom. Measured values are compared against a per-probe baseline;
            a deviation under 20% passes, 20–40% fails, &gt; 40% is restricted.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <Section title="Probe">
          <Field
            label="Probe identifier"
            hint="Frequency / model. Each probe has its own baseline."
          >
            <input
              type="text"
              value={form.probe}
              onChange={(e) =>
                setForm((f) => ({ ...f, probe: e.target.value }))
              }
              placeholder="e.g. C5-1 convex"
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="Numeric tests (vs baseline)">
          <div className="grid grid-cols-1 gap-3">
            {numericTests.map((t) => {
              const m = parse(form.numeric[t.key] ?? "");
              const b = parse(form.baseline[t.key] ?? "");
              const verdict =
                m !== null && b !== null ? classifyDeviation(m, b) : null;
              return (
                <div
                  key={t.key}
                  className="grid grid-cols-1 items-end gap-2 rounded-md border border-zinc-200 p-3 sm:grid-cols-3 dark:border-zinc-800"
                >
                  <Field label={t.label} hint={t.hint}>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.numeric[t.key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          numeric: { ...f.numeric, [t.key]: e.target.value },
                        }))
                      }
                      placeholder={t.unit}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Baseline">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.baseline[t.key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          baseline: {
                            ...f.baseline,
                            [t.key]: e.target.value,
                          },
                        }))
                      }
                      placeholder={t.unit}
                      className={inputCls}
                    />
                  </Field>
                  <div className="text-right text-xs">
                    {verdict ? (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 font-medium ${verdictMeta[verdict].tone}`}
                      >
                        {verdictMeta[verdict].label}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Pass/fail tests">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {passFailTests.map((t) => (
              <label
                key={t.key}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-sm">{t.label}</span>
                <input
                  type="checkbox"
                  checked={form.passFail[t.key]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      passFail: {
                        ...f.passFail,
                        [t.key]: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm(initial)}
            className="self-start rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        </Section>

        {overall ? (
          <section
            className={`flex flex-col gap-1 rounded-lg border p-4 ${verdictMeta[overall].tone}`}
          >
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Overall verdict
            </span>
            <span className="text-2xl font-semibold">
              {verdictMeta[overall].label}
            </span>
            <span className="text-[11px]">
              Aggregates the worst result across all completed numeric and
              pass/fail tests.
            </span>
          </section>
        ) : null}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>
            References: AAPM TG-1, ACR Ultrasound Accreditation Program.
            Baselines should come from the equipment&apos;s acceptance test
            and be re-baselined on probe replacement.
          </p>
        </footer>
      </main>
    </div>
  );
}
