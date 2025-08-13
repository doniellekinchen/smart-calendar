const BASE = import.meta.env.VITE_API_URL ?? "";
export type Event = { id: string; title: string; start: string; end: string; category?: string; recurrence?: string; description?: string; location?: string; };

import { authFetch } from "./authFetch";

export async function fetchEventsToday(category?: string): Promise<Event[]> {
  const base = `${BASE}/api/events?range=today`;
  const url = category ? `${base}&category=${encodeURIComponent(category)}` : base;
  const res = await authFetch(url);
  if (!res.ok) throw new Error(`fetchEventsToday failed: ${res.status}`);
  return res.json();
}

export type Recurrence = "none" | "daily" | "weekdays" | "weekly";
export type NewEvent = { title: string; start: string; end: string; category?: string; recurrence?: Recurrence; description?: string; location?: string; };

export async function createEvent(payload: NewEvent): Promise<Event> {
  const res = await authFetch(`${BASE}/api/events`, { method: "POST", body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`createEvent failed: ${res.status}`);
  return res.json();
}