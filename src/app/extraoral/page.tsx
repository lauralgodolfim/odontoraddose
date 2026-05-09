"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FormState = {
  exam: string;
  mode: string;
  kvp: string;
  mA: string;
  s: string;
  dFocusReceptor: string;
  dFocusDetector: string;
  fieldHeight: string;
  beamWidth: string;
  correctionFactor: string;
  pklMeasured: string;
  pkaMachine: string;
};

const initial: FormState = {
  exam: "",
  mode: "",
  kvp: "",
  mA: "",
  s: "",
  dFocusReceptor: "",
  dFocusDetector: "",
  fieldHeight: "",
  beamWidth: "",
  correctionFactor: "1",
  pklMeasured: "",
  pkaMachine: "",
};

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const parsed = Number(v.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

type Verdict = "pass" | "fail" | "restricted";

function verdictFor(deviation: number): Verdict {
  const a = Math.abs(deviation);
  if (a > 0.4) return "restricted";
  if (a > 0.2) return "fail";
  return "pass";
}

const verdictMeta: Record<
  Verdict,
  { label: string; sub: string; tone: string }
> = {
  pass: {
    label: "Pass",
    sub: "Deviation ≤ 20% — within IN 56/2019 tolerance.",
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  fail: {
    label: "Fail",
    sub: "Deviation between 20% and 40% — outside IN 56/2019 tolerance.",
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  restricted: {
    label: "Restricted",
    sub: "Deviation above 40% — usage restriction recommended.",
    tone: "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

export default function ExtraoralPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const pkl = num(form.pklMeasured);
    const dDet = num(form.dFocusDetector);
    const dRec = num(form.dFocusReceptor);
    const height = num(form.fieldHeight);
    const factor = num(form.correctionFactor) ?? 1;
    const pkaMach = num(form.pkaMachine);

    if (pkl === null || dDet === null || dRec === null || height === null) {
      return null;
    }
    if (dRec === 0) return null;

    const distanceFactor = (dDet / dRec) ** 2;
    const pklCorrected = pkl * distanceFactor;
    const pkaArea = pklCorrected * height;
    const pkaCalc = pkaArea * factor;

    let deviation: number | null = null;
    let verdict: Verdict | null = null;
    if (pkaMach !== null && pkaMach !== 0) {
      deviation = pkaCalc / pkaMach - 1;
      verdict = verdictFor(deviation);
    }

    return { pklCorrected, pkaArea, pkaCalc, deviation, verdict, pkaMach };
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
            className="text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Extraoral — PKA (DAP)
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Computes the kerma–area product (P<sub>KA</sub>) from the P
            <sub>KL</sub> measured at the chamber and compares it against the
            value reported by the machine, per IN 56/2019.
          </p>
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
                placeholder="e.g. Panoramic"
                className={inputCls}
              />
            </Field>
            <Field label="Operation mode">
              <input
                type="text"
                value={form.mode}
                onChange={update("mode")}
                placeholder="e.g. Standard adult"
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
              <Field label="s">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.s}
                  onChange={update("s")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="Beam geometry">
            <Field
              label="Focus–receptor distance [cm]"
              hint="Distance from focus to the patient's image receptor."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusReceptor}
                onChange={update("dFocusReceptor")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Focus–detector distance [cm]"
              hint="Distance from focus to the chamber during measurement."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusDetector}
                onChange={update("dFocusDetector")}
                className={inputCls}
              />
            </Field>
            <Field label="Field height [cm]">
              <input
                type="number"
                inputMode="decimal"
                value={form.fieldHeight}
                onChange={update("fieldHeight")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Beam-swept width [cm]"
              hint="Informational — P_KL is already integrated over this width."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.beamWidth}
                onChange={update("beamWidth")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Measurement">
            <Field label="Measured P_KL [mGy·cm]">
              <input
                type="number"
                inputMode="decimal"
                value={form.pklMeasured}
                onChange={update("pklMeasured")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Correction factor"
              hint="Keep at 1 when no factor is declared."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.correctionFactor}
                onChange={update("correctionFactor")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Manufacturer reference">
            <Field label="Machine-reported P_KA [mGy·cm²]">
              <input
                type="number"
                inputMode="decimal"
                value={form.pkaMachine}
                onChange={update("pkaMachine")}
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

        <Results result={result} />

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>
            Corrected P<sub>KL</sub> = Measured P<sub>KL</sub> × (D
            <sub>focus–detector</sub> / D<sub>focus–receptor</sub>)²
          </p>
          <p>
            Calculated P<sub>KA</sub> = Corrected P<sub>KL</sub> × field height
            × correction factor
          </p>
          <p className="mt-1">
            IN 56/2019 tolerance: ≤ 20% pass; 20%–40% fail; &gt; 40%
            restriction.
          </p>
        </footer>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

type ResultData = {
  pklCorrected: number;
  pkaArea: number;
  pkaCalc: number;
  deviation: number | null;
  verdict: Verdict | null;
  pkaMach: number | null;
};

function Results({ result }: { result: ResultData | null }) {
  if (!result) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
        Enter measured P<sub>KL</sub>, focus–receptor and focus–detector
        distances, and field height to see the calculation.
      </section>
    );
  }
  const { pklCorrected, pkaArea, pkaCalc, deviation, verdict, pkaMach } =
    result;
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Corrected P_KL" value={fmt(pklCorrected)} unit="mGy·cm" />
      <Stat label="Dose–area P_KA" value={fmt(pkaArea)} unit="mGy·cm²" />
      <Stat
        label="Calculated P_KA"
        value={fmt(pkaCalc)}
        unit="mGy·cm²"
        emphasis
      />
      <ValidationCard
        verdict={verdict}
        deviation={deviation}
        pkaMach={pkaMach}
        pkaCalc={pkaCalc}
      />
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  emphasis = false,
}: {
  label: string;
  value: string;
  unit: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border p-4 ${
        emphasis
          ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <span
        className={`text-[11px] font-medium uppercase tracking-wider ${
          emphasis
            ? "text-zinc-300 dark:text-zinc-700"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tabular-nums">
        {value}
      </span>
      <span
        className={`text-xs ${
          emphasis
            ? "text-zinc-300 dark:text-zinc-700"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {unit}
      </span>
    </div>
  );
}

function ValidationCard({
  verdict,
  deviation,
  pkaMach,
  pkaCalc,
}: {
  verdict: Verdict | null;
  deviation: number | null;
  pkaMach: number | null;
  pkaCalc: number;
}) {
  if (verdict === null || deviation === null || pkaMach === null) {
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <span className="font-medium uppercase tracking-wider">Validation</span>
        <span>
          Enter the machine-reported P<sub>KA</sub> to compare.
        </span>
      </div>
    );
  }
  const meta = verdictMeta[verdict];
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-4 ${meta.tone}`}>
      <span className="text-[11px] font-medium uppercase tracking-wider">
        IN 56/2019
      </span>
      <span className="text-2xl font-semibold">{meta.label}</span>
      <span className="font-mono text-sm tabular-nums">
        Deviation {(deviation * 100).toFixed(1)}%
      </span>
      <span className="text-xs">
        Calc {fmt(pkaCalc)} vs Machine {fmt(pkaMach)} mGy·cm²
      </span>
      <span className="text-[11px]">{meta.sub}</span>
    </div>
  );
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 1 : abs >= 1 ? 2 : 3;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
