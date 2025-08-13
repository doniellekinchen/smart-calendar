// brief.ts
const BASE = import.meta.env.VITE_API_URL ?? "";
import { authFetch } from "./authFetch";

export type Brief = { date: string; topThree: { title: string; reason: string }[] };

export async function fetchBrief(): Promise<Brief> {
  const res = await authFetch(`${BASE}/api/brief`);
  if (!res.ok) throw new Error(`fetchBrief failed: ${res.status}`);
  return res.json();
}
