import StorageStatus from "@/components/StorageStatus";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-base shadow-sm"
              aria-hidden
            >
              💸
            </span>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Pocket
              </h1>
              <p className="text-xs text-zinc-500">
                Weekly AI financial coach for students
              </p>
            </div>
          </div>
          <StorageStatus />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Dashboard />
      </main>
    </div>
  );
}
