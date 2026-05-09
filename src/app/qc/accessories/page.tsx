"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EquipmentBadge } from "@/components/EquipmentBadge";
import { Section } from "@/components/form";
import { type Verdict, verdictMeta } from "@/lib/verdict";

type AccessoryKind =
  | "lead-apron"
  | "thyroid-collar"
  | "gonadal-shield"
  | "lead-glasses"
  | "ovary-shield";

type Accessory = {
  id: number;
  kind: AccessoryKind;
  identifier: string;
  pbEquivalent: string;
  visualOk: boolean;
  radiographicOk: boolean;
  notes: string;
};

const accessoryLabels: Record<AccessoryKind, string> = {
  "lead-apron": "Lead apron",
  "thyroid-collar": "Thyroid collar",
  "gonadal-shield": "Gonadal shield",
  "lead-glasses": "Lead glasses",
  "ovary-shield": "Ovary shield",
};

let nextId = 1;

function makeAccessory(): Accessory {
  return {
    id: nextId++,
    kind: "lead-apron",
    identifier: "",
    pbEquivalent: "0.5",
    visualOk: true,
    radiographicOk: true,
    notes: "",
  };
}

export default function AcessoriosPage() {
  const [items, setItems] = useState<Accessory[]>(() => [makeAccessory()]);

  const summary = useMemo(() => {
    if (items.length === 0) return null;
    let failed = 0;
    let passed = 0;
    for (const a of items) {
      if (a.visualOk && a.radiographicOk) passed++;
      else failed++;
    }
    let verdict: Verdict;
    if (failed === 0) verdict = "pass";
    else if (failed / items.length <= 0.2) verdict = "fail";
    else verdict = "restricted";
    return { passed, failed, verdict };
  }, [items]);

  const update =
    (id: number) =>
    <K extends keyof Accessory>(key: K, value: Accessory[K]) =>
      setItems((arr) =>
        arr.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
      );

  const remove = (id: number) =>
    setItems((arr) => arr.filter((a) => a.id !== id));

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
            Lead aprons &amp; accessories
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pass/fail scoring for personal protective equipment. Each item
            should be visually inspected for tears or deformation and
            radiographically inspected for hidden defects (cracks, voids,
            thinning of the lead lining).
          </p>
          <div className="pt-1">
            <EquipmentBadge />
          </div>
        </header>

        <Section title="Inventory">
          <div className="flex flex-col gap-3">
            {items.map((a) => (
              <AccessoryRow
                key={a.id}
                item={a}
                onUpdate={update(a.id)}
                onRemove={() => remove(a.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => setItems((arr) => [...arr, makeAccessory()])}
              className="self-start rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              + Add accessory
            </button>
          </div>
        </Section>

        {summary ? (
          <section
            className={`flex flex-col gap-1 rounded-lg border p-4 ${verdictMeta[summary.verdict].tone}`}
          >
            <span className="text-[11px] font-medium uppercase tracking-wider">
              IN 56 / NR 32
            </span>
            <span className="text-2xl font-semibold">
              {verdictMeta[summary.verdict].label}
            </span>
            <span className="font-mono text-sm tabular-nums">
              {summary.passed} pass · {summary.failed} fail · {items.length}{" "}
              total
            </span>
            <span className="text-[11px]">
              Pass when no item fails. Fail when up to 20% of items fail.
              Restricted when more than 20% fail or any critical item is
              missing.
            </span>
          </section>
        ) : null}

        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>
            Visual inspection: look for tears, peeling, or deformation that
            interferes with proper coverage.
          </p>
          <p>
            Radiographic inspection: image the apron at the standard kVp /
            mAs and look for areas of low optical density that indicate
            cracks or thinning. Reference: NR 32 / IN 56 / IEC 61331.
          </p>
        </footer>
      </main>
    </div>
  );
}

function AccessoryRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: Accessory;
  onUpdate: <K extends keyof Accessory>(key: K, value: Accessory[K]) => void;
  onRemove: () => void;
}) {
  const ok = item.visualOk && item.radiographicOk;
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 ${
        ok
          ? "border-zinc-200 dark:border-zinc-800"
          : "border-rose-300 bg-rose-50/50 dark:border-rose-700 dark:bg-rose-950/30"
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Type
          </span>
          <select
            value={item.kind}
            onChange={(e) =>
              onUpdate("kind", e.target.value as AccessoryKind)
            }
            className={selectCls}
          >
            {(Object.keys(accessoryLabels) as AccessoryKind[]).map((k) => (
              <option key={k} value={k}>
                {accessoryLabels[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Identifier
          </span>
          <input
            type="text"
            value={item.identifier}
            onChange={(e) => onUpdate("identifier", e.target.value)}
            placeholder="e.g. AP-002"
            className={selectCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Pb equivalent [mm]
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={item.pbEquivalent}
            onChange={(e) => onUpdate("pbEquivalent", e.target.value)}
            className={selectCls}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.visualOk}
            onChange={(e) => onUpdate("visualOk", e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Visual OK</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.radiographicOk}
            onChange={(e) => onUpdate("radiographicOk", e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          <span>Radiographic OK</span>
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
        >
          Remove
        </button>
      </div>
      <input
        type="text"
        value={item.notes}
        onChange={(e) => onUpdate("notes", e.target.value)}
        placeholder="Notes"
        className={selectCls}
      />
    </div>
  );
}

const selectCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";
