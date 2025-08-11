export async function fetchBrief() {
  const url = `${import.meta.env.VITE_API_URL}/api/brief`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Brief fetch failed: ${res.status}`);
  return res.json() as Promise<{ date: string; topThree: { title: string; reason: string }[] }>;
}
