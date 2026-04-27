const isBrowser = typeof window !== "undefined";

export function save(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("storage.save failed", err);
  }
}

export function load<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("storage.load failed", err);
    return defaultValue;
  }
}
