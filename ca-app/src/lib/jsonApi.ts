import type { JsonStore } from "../data/initialStore";

const BASE = "/api";

export async function fetchStore(): Promise<JsonStore | null> {
  const res = await fetch(`${BASE}/store`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load store (${res.status})`);
  return (await res.json()) as JsonStore;
}

export async function saveStore(store: JsonStore): Promise<JsonStore> {
  const res = await fetch(`${BASE}/store`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(store),
  });
  if (!res.ok) throw new Error(`Failed to save store (${res.status})`);
  return (await res.json()) as JsonStore;
}

export async function resetStoreFile(): Promise<void> {
  const res = await fetch(`${BASE}/store`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to reset store (${res.status})`);
}
