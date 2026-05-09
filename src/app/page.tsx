import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-24 px-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            Work in progress
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            Odonto RadDose
          </h1>
          <p className="max-w-md text-lg leading-7 text-zinc-600 dark:text-zinc-400">
            Radiation dose calculator for odontologic equipment. Calculators
            and reference data will appear here as the project grows.
          </p>
        </div>
        <nav className="flex w-full flex-col items-stretch gap-3 text-left">
          <Link
            href="./extraoral"
            className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-5 py-4 text-left transition hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-100"
          >
            <span className="flex flex-col">
              <span className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Extraoral — PKA (DAP)
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Compute P<sub>KA</sub> from the measured P<sub>KL</sub> and
                validate it against the machine-reported value.
              </span>
            </span>
            <span
              aria-hidden
              className="text-xl text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
            >
              →
            </span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
