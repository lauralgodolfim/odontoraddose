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
  // Light box
  lbCenter: string;
  lbTopLeft: string;
  lbTopRight: string;
  lbBottomLeft: string;
  lbBottomRight: string;
  // Monitor
  monMaxLuminance: string;
  monMinLuminance: string;
  // Ambient
  ambientLux: string;
};

const initial: FormState = {
  lbCenter: "",
  lbTopLeft: "",
  lbTopRight: "",
  lbBottomLeft: "",
  lbBottomRight: "",
  monMaxLuminance: "",
  monMinLuminance: "",
  ambientLux: "",
};

/** Light box mean luminance: 1500 cd/m² minimum (general radiography). */
const LB_LUMINANCE_MIN = 1500;
const lbLuminanceFloor: Tolerance = {
  fail: 0,
  restricted: 0.5,
  reference: "AAPM TG-18",
  kind: "floor",
};

/** Light box uniformity: max-min ≤ 30% of mean. */
const LB_UNIFORMITY_MAX = 0.3;

/** Diagnostic monitor: max luminance ≥ 350 cd/m² (TG-18). */
const MON_LUMINANCE_MIN = 350;
const monLuminanceFloor: Tolerance = {
  fail: 0,
  restricted: 0.3,
  reference: "AAPM TG-18",
  kind: "floor",
};

/** Diagnostic monitor: luminance ratio L_max / L_min ≥ 250 (TG-18). */
const MON_RATIO_MIN = 250;
const monRatioFloor: Tolerance = {
  fail: 0,
  restricted: 0.5,
  reference: "AAPM TG-18",
  kind: "floor",
};

/** Reading-room ambient illuminance: ≤ 50 lux (TG-18 / AAPM). */
const AMBIENT_LUX_MAX = 50;
const ambientCap: Tolerance = {
  fail: 0,
  restricted: 1,
  reference: "AAPM TG-18",
  kind: "cap",
};

export default function DisplaysPage() {
  const [form, setForm] = useState<FormState>(initial);

  const lbResult = useMemo(() => {
    const points = [
      parse(form.lbCenter),
      parse(form.lbTopLeft),
      parse(form.lbTopRight),
      parse(form.lbBottomLeft),
      parse(form.lbBottomRight),
    ].filter((v): v is number => v !== null);
    if (points.length === 0) return null;
    const mean = points.reduce((a, b) => a + b, 0) / points.length;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const uniformity = mean === 0 ? 0 : (max - min) / mean;
    return { mean, uniformity };
  }, [form]);

  const monResult = useMemo(() => {
    const max = parse(form.monMaxLuminance);
    const min = parse(form.monMinLuminance);
    if (max === null || min === null || min <= 0) {
      return { max, min, ratio: null as number | null };
    }
    return { max, min, ratio: max / min };
  }, [form.monMaxLuminance, form.monMinLuminance]);

  const ambient = parse(form.ambientLux);

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
            className="text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Displays — luminance &amp; ambient
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Light box luminance and uniformity, diagnostic monitor
            luminance and contrast ratio, and reading-room ambient
            illuminance, against AAPM TG-18 references.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Light box (cd/m²)">
            <Field label="Centre">
              <input
                type="number"
                inputMode="decimal"
                value={form.lbCenter}
                onChange={update("lbCenter")}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Top-left">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.lbTopLeft}
                  onChange={update("lbTopLeft")}
                  className={inputCls}
                />
              </Field>
              <Field label="Top-right">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.lbTopRight}
                  onChange={update("lbTopRight")}
                  className={inputCls}
                />
              </Field>
              <Field label="Bottom-left">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.lbBottomLeft}
                  onChange={update("lbBottomLeft")}
                  className={inputCls}
                />
              </Field>
              <Field label="Bottom-right">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.lbBottomRight}
                  onChange={update("lbBottomRight")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          <Section title="Diagnostic monitor (cd/m²)">
            <Field
              label="L max"
              hint="White-patch luminance at full brightness."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.monMaxLuminance}
                onChange={update("monMaxLuminance")}
                className={inputCls}
              />
            </Field>
            <Field
              label="L min"
              hint="Black-patch luminance with the display on."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.monMinLuminance}
                onChange={update("monMinLuminance")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Ambient illuminance (lux)">
            <Field
              label="Reading-room ambient"
              hint="Measured at the monitor face with the monitor off."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.ambientLux}
                onChange={update("ambientLux")}
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

        {lbResult ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Light box mean"
              value={fmt(lbResult.mean)}
              unit="cd/m²"
              emphasis
            />
            <ValidationCard
              observed={lbResult.mean}
              observedLabel="Mean"
              expected={LB_LUMINANCE_MIN}
              expectedLabel="Min"
              unit="cd/m²"
              tolerance={lbLuminanceFloor}
              emptyHint=""
            />
            <ValidationCard
              observed={lbResult.uniformity}
              observedLabel="(max−min)/mean"
              expected={LB_UNIFORMITY_MAX}
              expectedLabel="Cap"
              unit=""
              tolerance={{
                fail: 0,
                restricted: 0.5,
                reference: "TG-18 uniformity",
                kind: "cap",
              }}
              emptyHint=""
            />
          </section>
        ) : null}

        {monResult.max !== null && monResult.min !== null ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="L max" value={fmt(monResult.max)} unit="cd/m²" />
            <Stat label="L min" value={fmt(monResult.min)} unit="cd/m²" />
            <Stat
              label="L max / L min"
              value={fmt(monResult.ratio)}
              unit=""
              emphasis
            />
            <ValidationCard
              observed={monResult.max}
              observedLabel="L max"
              expected={MON_LUMINANCE_MIN}
              expectedLabel="Min"
              unit="cd/m²"
              tolerance={monLuminanceFloor}
              emptyHint=""
            />
            {monResult.ratio !== null ? (
              <ValidationCard
                observed={monResult.ratio}
                observedLabel="Ratio"
                expected={MON_RATIO_MIN}
                expectedLabel="Min"
                unit=""
                tolerance={monRatioFloor}
                emptyHint=""
              />
            ) : null}
          </section>
        ) : null}

        {ambient !== null ? (
          <section>
            <ValidationCard
              observed={ambient}
              observedLabel="Ambient"
              expected={AMBIENT_LUX_MAX}
              expectedLabel="Cap"
              unit="lux"
              tolerance={ambientCap}
              emptyHint=""
            />
          </section>
        ) : null}

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>Light box mean = average of 5 measurement points.</p>
          <p>Uniformity = (max − min) / mean across the 5 points.</p>
          <p>Monitor contrast ratio = L max / L min.</p>
          <p className="mt-1">
            References: AAPM TG-18, DICOM PS 3.14 GSDF. Light box minimum
            mean luminance 1500 cd/m²; uniformity ≤ 30%. Diagnostic monitor
            L max ≥ 350 cd/m²; L max/L min ≥ 250. Ambient ≤ 50 lux.
          </p>
        </footer>
      </main>
    </div>
  );
}
