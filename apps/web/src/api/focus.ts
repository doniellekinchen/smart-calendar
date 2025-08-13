// focus.ts
const BASE = import.meta.env.VITE_API_URL ?? "";
import { authFetch } from "./authFetch";

export type FocusSuggestion =
  | { ok: true; suggestion: { start: string; end: string; reason: string } }
  | { ok: false; reason: string };

export async function fetchFocusSuggestion(durationMin = 60): Promise<FocusSuggestion> {
  const res = await authFetch(`${BASE}/api/focus/suggest?duration=${durationMin}`);
  if (!res.ok) throw new Error(`focus suggest failed: ${res.status}`);
  return res.json();
}
