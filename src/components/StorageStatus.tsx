"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

const PROBE_KEY = "pocket:storage-probe";

export default function StorageStatus() {
  const [ready, setReady] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    try {
      save(PROBE_KEY, { ts: Date.now() });
      const probe = load<{ ts: number } | null>(PROBE_KEY, null);
      setReady(probe ? "ok" : "fail");
    } catch {
      setReady("fail");
    }
  }, []);

  if (ready === "checking") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        … checking storage
      </span>
    );
  }

  if (ready === "fail") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        ✗ Storage unavailable
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      ✓ Storage ready
    </span>
  );
}
