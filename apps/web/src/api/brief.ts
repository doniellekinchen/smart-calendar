export type Brief = {
  date: string;
  topThree: { title: string; reason: string }[];
};

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchBrief(): Promise<Brief> {
  const res = await fetch(`${BASE}/api/brief`);
  if (!res.ok) throw new Error(`fetchBrief failed: ${res.status}`);
  return res.json();
}
