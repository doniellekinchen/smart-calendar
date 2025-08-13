const BASE = import.meta.env.VITE_API_URL ?? "";

export type FocusSuggestion =
  | { ok: true; suggestion: { start: string; end: string; reason: string } }
  | { ok: false; reason: string };

export async function fetchFocusSuggestion(durationMin = 60): Promise<FocusSuggestion> {
  const res = await fetch(`${BASE}/api/focus/suggest?duration=${durationMin}`);
  if (!res.ok) throw new Error(`focus suggest failed: ${res.status}`);
  return res.json();
}
