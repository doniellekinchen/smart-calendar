export type Category = 'work' | 'personal' | 'habit' | 'focus' | 'break';
export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly';

export type Event = {
  id: string;
  title: string;
  start: string;   // ISO string
  end: string;     // ISO string
  category?: Category;
  description?: string;
  location?: string;
  recurrence?: Recurrence;
};

export type NewEvent = Omit<Event, 'id'>;

const BASE = import.meta.env.VITE_API_URL ?? '';

function toISO(date: Date) {
  return date.toISOString();
}

export function todayRange(): { from: string; to: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { from: toISO(start), to: toISO(end) };
}

/** GET today’s events */
export async function fetchEventsToday(category?: string) {
  const base = `${BASE}/api/events?range=today`;
  const url = category ? `${base}&category=${encodeURIComponent(category)}` : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchEventsToday failed: ${res.status}`);
  return res.json();
}
/** GET events between two ISO timestamps */
export async function fetchEvents(from: string, to: string): Promise<Event[]> {
  const url = `${BASE}/api/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchEvents failed: ${res.status}`);
  return res.json();
}

/** POST create event */
export async function createEvent(input: NewEvent): Promise<Event> {
  const res = await fetch(`${BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`createEvent failed: ${res.status}`);
  return res.json();
}
