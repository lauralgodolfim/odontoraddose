"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Field, inputCls, Section } from "@/components/form";
import { Stat } from "@/components/Stat";
import { ValidationCard } from "@/components/ValidationCard";
import { fmt, parse } from "@/lib/num";
import { conventionalExams } from "@/lib/tables/conventional";
import { radiationQualityFactor } from "@/lib/tables/dosimetry";
import { type Tolerance } from "@/lib/verdict";

type Station = "table" | "wallStand";

type FormState = {
  examSlug: string;
  station: Station;
  dTableReceptor: string;
  dWallStandReceptor: string;
  dFocusDetector: string;
  fid: string;
  thickness: string;
  chamberDose: string;
  radiationFactor: string;
};

const initial: FormState = {
  examSlug: conventionalExams[0].slug,
  station: "wallStand",
  dTableReceptor: "",
  dWallStandReceptor: "",
  dFocusDetector: "",
  fid: "",
  thickness: "",
  chamberDose: "",
  radiationFactor: String(radiationQualityFactor.Conventional),
};

/** IN 90/2021 cap is a strict upper bound — anything over fails. */
const in90Cap: Tolerance = {
  fail: 0,
  restricted: 0.4,
  reference: "IN 90/2021",
  kind: "cap",
};

export default function ConventionalPage() {
  const [form, setForm] = useState<FormState>(initial);

  const exam = useMemo(
    () => conventionalExams.find((e) => e.slug === form.examSlug),
    [form.examSlug],
  );

  const result = useMemo(() => {
    const chamber = parse(form.chamberDose);
    const factor = parse(form.radiationFactor) ?? 1;
    const dDet = parse(form.dFocusDetector);
    const fid = parse(form.fid);
    const thicknessOverride = parse(form.thickness);
    const thickness = thicknessOverride ?? exam?.thicknessCm ?? null;
    const offset =
      form.station === "table"
        ? parse(form.dTableReceptor)
        : parse(form.dWallStandReceptor);

    if (
      chamber === null ||
      dDet === null ||
      fid === null ||
      thickness === null ||
      offset === null
    )
      return null;

    const skinFocusDistance = fid - thickness - offset;
    if (skinFocusDistance <= 0) return null;

    const esd = chamber * factor * (dDet / skinFocusDistance) ** 2;
    return { esd, skinFocusDistance, maxEsd: exam?.maxEsdMgy ?? null };
  }, [form, exam]);

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
            className="text-xs uppercase tracking-wider text-radiation-400/70 hover:text-radiation-300"
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            Conventional — ESD
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Entrance skin dose for conventional radiography. The chamber
            reading is corrected by the radiation-quality factor and scaled
            to the patient&apos;s skin via inverse square, then compared to the
            IN 90/2021 Annex II reference dose for that exam.
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Section title="Exam">
            <Field label="Exam">
              <select
                value={form.examSlug}
                onChange={update("examSlug")}
                className={inputCls}
              >
                {conventionalExams.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Station (where the exam is performed)">
              <select
                value={form.station}
                onChange={update("station")}
                className={inputCls}
              >
                <option value="wallStand">Wall stand (Bucky)</option>
                <option value="table">Table</option>
              </select>
            </Field>
            <Field
              label="Patient thickness [cm]"
              hint={
                exam
                  ? `IN 90 standard for ${exam.label}: ${exam.thicknessCm} cm. Leave blank to use the standard.`
                  : ""
              }
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.thickness}
                onChange={update("thickness")}
                placeholder={exam ? String(exam.thicknessCm) : ""}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Geometry">
            <Field
              label="Focus–detector distance [cm]"
              hint="Distance from focus to chamber during measurement."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dFocusDetector}
                onChange={update("dFocusDetector")}
                className={inputCls}
              />
            </Field>
            <Field
              label="FID — Focus–image-receptor distance [cm]"
              hint="Distance the exam was performed at."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.fid}
                onChange={update("fid")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Table-to-receptor distance [cm]"
              hint="Distance from the table top to the image receptor."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dTableReceptor}
                onChange={update("dTableReceptor")}
                className={inputCls}
              />
            </Field>
            <Field
              label="Wall-stand-to-receptor distance [cm]"
              hint="Distance from the wall-stand Bucky to the image receptor."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.dWallStandReceptor}
                onChange={update("dWallStandReceptor")}
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
              label="Radiation-quality factor"
              hint="1.2 for conventional, 1.4 for mammography, 1.3 for dental."
            >
              <input
                type="number"
                inputMode="decimal"
                value={form.radiationFactor}
                onChange={update("radiationFactor")}
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
              label="Focus–skin distance"
              value={fmt(result.skinFocusDistance)}
              unit="cm"
            />
            <Stat label="ESD" value={fmt(result.esd)} unit="mGy" emphasis />
            <ValidationCard
              observed={result.esd}
              observedLabel="Calc"
              expected={result.maxEsd}
              expectedLabel="Cap"
              unit="mGy"
              tolerance={in90Cap}
              emptyHint="No reference cap available for this exam."
            />
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-zinc-300 bg-white/40 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40">
            Enter chamber dose, focus–detector and FID distances, and the
            table- or wall-stand-to-receptor offset for the chosen station.
          </section>
        )}

        <footer className="border-t border-radiation-400/20 pt-4 text-xs text-zinc-400">
          <p>
            Focus–skin distance = FID − patient thickness −
            table/wall-stand-to-receptor offset
          </p>
          <p>
            ESD = chamber dose × radiation factor × (D
            <sub>focus–detector</sub> / focus–skin distance)²
          </p>
          <p className="mt-1">
            Reference doses: IN 90/2021 Annex II (maximum permitted ESD).
          </p>
        </footer>
      </main>
    </div>
  );
}
