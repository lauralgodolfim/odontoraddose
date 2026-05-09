export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-24 px-8 sm:items-start sm:text-left">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start">
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
      </main>
    </div>
  );
}
