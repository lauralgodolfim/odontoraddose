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
					? "border-radiation-400/70 bg-radiation-400/10 text-radiation-100 dark:border-radiation-400 dark:bg-radiation-400/10 dark:text-radiation-100"
					: "border-zinc-200 bg-white dark:border-radiation-400/20 dark:bg-zinc-950"
			}`}
		>
			<span
				className={`text-[11px] font-medium uppercase tracking-wider ${
					emphasis
						? "text-radiation-300 dark:text-radiation-300"
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
						? "text-radiation-200 dark:text-radiation-200"
						: "text-zinc-500 dark:text-zinc-400"
				}`}
			>
				{unit}
			</span>
		</div>
	);
}
