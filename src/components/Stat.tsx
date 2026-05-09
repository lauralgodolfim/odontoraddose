export function Stat({
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
