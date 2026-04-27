import StorageStatus from "@/components/StorageStatus";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Pocket</h1>
            <p className="text-xs text-zinc-500">Weekly AI financial coach for students</p>
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
