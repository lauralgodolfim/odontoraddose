"use client";

export function PrintButton({ label = "Print report" }: { label?: string }) {
	return (
		<button
			type="button"
			onClick={() => window.print()}
			className="no-print rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
		>
			{label}
		</button>
	);
}
