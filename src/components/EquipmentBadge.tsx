"use client";

import Link from "next/link";

import { useEquipment } from "./EquipmentProvider";

export function EquipmentBadge() {
  const { equipment } = useEquipment();
  return (
    <Link
      href="./equipment"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
    >
      <span className="font-medium uppercase tracking-wider">Equipment</span>
      <span aria-hidden className="text-zinc-300 dark:text-zinc-700">
        ·
      </span>
      <span>
        {equipment.dosimeterBrand} · {equipment.rectifier.toUpperCase()}
      </span>
    </Link>
  );
}
