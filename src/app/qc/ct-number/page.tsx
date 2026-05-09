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
  centerHu: string;
  centerSd: string;
  topHu: string;
  rightHu: string;
  bottomHu: string;
  leftHu: string;
};

const initial: FormState = {
  centerHu: "",
  centerSd: "",
  topHu: "",
  rightHu: "",
  bottomHu: "",
  leftHu: "",
};

const waterAccuracy: Tolerance = {
  fail: 5,
  restricted: 10,
  reference: "ACR / IN 55",
};

const uniformity: Tolerance = {
  fail: 5,
  restricted: 10,
  reference: "ACR uniformity",
};

const noiseCap: Tolerance = {
  fail: 0,
  restricted: 1,
  reference: "ACR noise",
  kind: "cap",
};

const NOISE_CAP_HU = 7;

export default function CtNumberPage() {
  const [form, setForm] = useState<FormState>(initial);

  const result = useMemo(() => {
    const center = parse(form.centerHu);
    const noise = parse(form.centerSd);
    const peripheral = [
      parse(form.topHu),
      parse(form.rightHu),
      parse(form.bottomHu),
      parse(form.leftHu),
    ].filter((v): v is number => v !== null);
    if (center === null) return null;
    if (peripheral.length === 0) {
      return { center, noise, worstUniformity: null };
    }
    const worstUniformity = peripheral.reduce(
      (worst, p) => (Math.abs(p - center) > Math.abs(worst) ? p - center : worst),
      0,
    );
    return { center, noise, worstUniformity };
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
            CT number, uniformity &amp; noise
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Five ROIs on a water phantom: centre + four peripheral
            (top/right/bottom/left). Reports CT number accuracy of water
            (target 0 HU), worst uniformity deviation, and image noise (ROI
            standard deviation).
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Centre ROI">
            <Field label="Mean CT number [HU]">
              <input
                type="number"
                inputMode="decimal"
                value={form.centerHu}
                onChange={update("centerHu")}
                className={inputCls}
              />
            </Field>
            <Field label="Standard deviation [HU]" hint="Image noise.">
              <input
                type="number"
                inputMode="decimal"
                value={form.centerSd}
                onChange={update("centerSd")}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Peripheral ROIs [HU]">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Top">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.topHu}
                  onChange={update("topHu")}
                  className={inputCls}
                />
              </Field>
              <Field label="Right">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.rightHu}
                  onChange={update("rightHu")}
                  className={inputCls}
                />
              </Field>
              <Field label="Bottom">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.bottomHu}
                  onChange={update("bottomHu")}
                  className={inputCls}
                />
              </Field>
              <Field label="Left">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.leftHu}
                  onChange={update("leftHu")}
                  className={inputCls}
                />
              </Field>
            </div>
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
              label="Centre CT number"
              value={fmt(result.center)}
              unit="HU"
              emphasis
            />
            <ValidationCard
              observed={result.center}
              observedLabel="Centre"
              expected={0}
              expectedLabel="Target"
              unit="HU"
              tolerance={waterAccuracy}
              emptyHint=""
            />
            {result.worstUniformity !== null ? (
              <ValidationCard
                observed={result.worstUniformity}
                observedLabel="Δ"
                expected={0}
                expectedLabel="Target"
                unit="HU"
                tolerance={uniformity}
                emptyHint=""
              />
            ) : null}
            {result.noise !== null ? (
              <ValidationCard
                observed={result.noise}
                observedLabel="Noise"
                expected={NOISE_CAP_HU}
                expectedLabel="Cap"
                unit="HU"
                tolerance={noiseCap}
                emptyHint=""
              />
            ) : null}
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter the centre-ROI mean to start.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>Water target: 0 HU. ACR / IN 55 tolerance ±5 HU.</p>
          <p>
            Uniformity: largest |peripheral − centre| across the four
            peripheral ROIs.
          </p>
          <p>
            Noise: ROI standard deviation. Cap is protocol-specific;
            displayed cap is a typical 7 HU at standard adult-abdomen
            technique.
          </p>
        </footer>
      </main>
    </div>
  );
}
