import { useEffect, useState } from "react";

// ---- API helpers (inline to keep this file standalone) ----
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Category = "work" | "personal" | "habit" | "focus" | "break";
type Recurrence = "none" | "daily" | "weekdays" | "weekly";

type Event = {
  id: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  category?: Category;
  description?: string;
  location?: string;
  recurrence?: Recurrence;
};

async function fetchEventsToday(category?: Category): Promise<Event[]> {
  const url = new URL(`${API_URL}/api/events`);
  url.searchParams.set("range", "today");
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
}

async function createEvent(payload: {
  title: string;
  start: string;
  end: string;
  category?: Category;
  description?: string;
  location?: string;
  recurrence?: Recurrence;
}): Promise<Event> {
  const res = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

// ---- tiny time helpers for Quick Add ----
function todayAt(timeHHMM: string): Date {
  const [hh, mm] = timeHHMM.split(":").map(Number);
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}
function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60_000);
}


// ---- Brief (visual only) ----
const BriefCard = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-slate-700">Your day starts with a 9:30 AM standup</span>
    </div>
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium text-slate-700">Best focus time: 10:30 AM - 12:00 PM</span>
    </div>
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
      <span className="text-sm font-medium text-slate-700">3 tasks need attention today</span>
    </div>
  </div>
);

// ---- Upcoming (real events) ----
function UpcomingList({ events, loading }: { events: Event[] | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded-md mb-2"></div>
            <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  const list = events ?? [];

  const icon = (c?: Category) => {
    switch (c) {
      case "focus": return <span className="text-purple-500 text-sm">🧠</span>;
      case "habit": return <span className="text-green-500 text-sm">🎯</span>;
      case "personal": return <span className="text-pink-500 text-sm">🏡</span>;
      case "break": return <span className="text-amber-500 text-sm">☕</span>;
      default: return <span className="text-blue-500 text-sm">📅</span>;
    }
  };
  const style = (c?: Category) => {
    switch (c) {
      case "focus": return "border-l-[3px] border-l-purple-400 bg-gradient-to-r from-purple-50/50 to-transparent";
      case "habit": return "border-l-[3px] border-l-green-400 bg-gradient-to-r from-green-50/50 to-transparent";
      case "personal": return "border-l-[3px] border-l-pink-400 bg-gradient-to-r from-pink-50/50 to-transparent";
      case "break": return "border-l-[3px] border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-transparent";
      default: return "border-l-[3px] border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-transparent";
    }
  };

  return (
    <div className="space-y-3">
      {list.map((e) => (
        <div key={e.id} className={`p-3 rounded-lg ${style(e.category)} hover:shadow-sm transition-all duration-200`}>
          <div className="flex items-center gap-3">
            {icon(e.category)}
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 text-sm">{e.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(e.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {" – "}
                {new Date(e.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="text-sm text-slate-500">Nothing scheduled yet.</p>}
    </div>
  );
}

// ---- Quick Add (inline form; posts to /api/events; refresh on success) ----
function QuickAdd({ onAdded }: { onAdded: () => void }) {
  const [show, setShow] = useState<null | Category>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function open(c: Category) {
    setShow(c);
    setTitle("");
    setTime("09:00");
    setDuration(30);
    setErr(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!show) return;
    if (!title.trim()) { setErr("Title is required"); return; }

    const start = todayAt(time);
    const end = addMinutes(start, duration);

    try {
      setSaving(true);
      await createEvent({
        title: title.trim(),
        start: start.toISOString(),
        end: end.toISOString(),
        category: show,
        recurrence: show === "habit" ? "daily" : "none",
      });
      setShow(null);
      onAdded();
    } catch (e: any) {
      setErr(e.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => open("work")}
          className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
        >
          <span className="text-slate-400 group-hover:text-blue-500 text-lg">➕</span>
          <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">Add Task</span>
        </button>
        <button
          onClick={() => open("habit")}
          className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 group"
        >
          <span className="text-slate-400 group-hover:text-green-500 text-lg">🎯</span>
          <span className="text-sm font-medium text-slate-600 group-hover:text-green-600">Add Habit</span>
        </button>
      </div>
      <button
        onClick={() => open("work")}
        className="w-full flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 group"
      >
        <span className="text-slate-400 group-hover:text-indigo-500 text-lg">📅</span>
        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Add Event</span>
      </button>

      {show && (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-xl border border-slate-200 p-3 bg-white">
          <input
            type="text"
            placeholder={show === "habit" ? "Habit name" : "Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setShow(null)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          {err && <div className="md:col-span-5 text-sm text-red-600">{err}</div>}
        </form>
      )}
    </div>
  );
}

// ---- Focus block (wired to backend) ----
function FocusBlock({ description, onBook }: { description: string; onBook: () => void }) {
  const [suggesting, setSuggesting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ start: string; end: string; reason?: string } | null>(null);

  async function suggest() {
    try {
      setErr(null);
      setSuggesting(true);
      setSlot(null);
      const res = await fetch(`${API_URL}/api/focus/suggest?duration=60`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to suggest focus block");
      if (!data.ok) { setErr(data.reason || "No open block found."); return; }
      setSlot(data.suggestion);
    } catch (e: any) {
      setErr(e.message || "Failed to get suggestion");
    } finally {
      setSuggesting(false);
    }
  }

  async function book() {
    if (!slot) return;
    try {
      setErr(null);
      setBooking(true);
      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Focus Block",
          start: slot.start,
          end: slot.end,
          category: "focus",
          recurrence: "none",
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Failed to create event");
      }
      onBook(); // refresh dashboard
    } catch (e: any) {
      setErr(e.message || "Failed to add event");
    } finally {
      setBooking(false);
    }
  }

  const timeLabel =
    slot &&
    `${new Date(slot.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${new Date(slot.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-2xl">🧠</span>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-800">
          {slot ? timeLabel : "No slot selected"}
        </h3>
        <p className="text-sm text-slate-600">
          {slot?.reason || description}
        </p>
        {slot && (
          <div className="flex items-center justify-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            <span className="text-sm">⚡</span>
            <span>Peak Energy Window</span>
          </div>
        )}

        {!slot && !suggesting && (
          <button
            onClick={suggest}
            className="w-full bg-white text-purple-600 border border-purple-200 py-2 px-4 rounded-lg hover:bg-purple-50 transition-all duration-200 text-sm font-medium"
          >
            Suggest 60-min Block
          </button>
        )}
      </div>

      {slot && (
        <button
          onClick={book}
          disabled={booking}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium disabled:opacity-60"
        >
          {booking ? "Blocking…" : "Block This Time"}
        </button>
      )}

      {suggesting && <div className="text-xs text-slate-500">Finding your best window…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
    </div>
  );
}

// ---- MiniMonth (visual only) ----
const MiniMonth = () => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-800">
          {today.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h4>
        <span className="text-slate-500 text-lg">📅</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`text-center text-xs py-1.5 rounded-md transition-colors duration-200 ${
              day === today.getDate()
                ? "bg-indigo-600 text-white font-medium"
                : day
                ? "text-slate-600 hover:bg-slate-100 cursor-pointer"
                : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Habits Today (filters real events) ----
function HabitsToday({ events, loading }: { events: Event[] | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }
  const habits = (events ?? []).filter((e) => e.category === "habit");

  return (
    <div className="space-y-3">
      {habits.map((h) => (
        <div
          key={h.id}
          className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200"
        >
          <button className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-green-400 flex items-center justify-center"></button>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-700">{h.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">
                {new Date(h.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {h.recurrence && h.recurrence !== "none" ? h.recurrence : "one-time"}
              </span>
            </div>
          </div>
        </div>
      ))}
      {habits.length === 0 && <p className="text-sm text-slate-500">No habits scheduled today.</p>}
    </div>
  );
}

// ---- Main Dashboard ----
export default function Dashboard() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [habitEvents, setHabitEvents] = useState<Event[] | null>(null);
  const [loadingHabits, setLoadingHabits] = useState(true);

  async function loadUpcoming() {
    setLoadingEvents(true);
    try {
      setEvents(await fetchEventsToday());
    } finally {
      setLoadingEvents(false);
    }
  }
  async function loadHabits() {
    setLoadingHabits(true);
    try {
      setHabitEvents(await fetchEventsToday("habit"));
    } finally {
      setLoadingHabits(false);
    }
  }
  async function refreshAll() {
    await Promise.all([loadUpcoming(), loadHabits()]);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Qlear</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{dateLabel}</span>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Good morning! ☀️</h2>
            <p className="text-slate-600">Here's your intelligent daily plan, ready to adapt as your day unfolds.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-8">
              <section className="group rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">☕</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Today's Brief</h2>
                    <p className="text-sm text-slate-500">Your AI-curated daily overview</p>
                  </div>
                </div>
                <BriefCard />
              </section>

              <section className="group rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">⏰</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Upcoming</h2>
                    <p className="text-sm text-slate-500">Your schedule for today</p>
                  </div>
                </div>
                <UpcomingList events={events} loading={loadingEvents} />
              </section>

              <section className="group rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">➕</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Quick Add</h2>
                    <p className="text-sm text-slate-500">Add tasks, habits, or events instantly</p>
                  </div>
                </div>
                <QuickAdd onAdded={refreshAll} />
              </section>
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 space-y-8">
              <section className="group rounded-3xl border border-purple-200/60 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🧠</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">AI Focus Block</h2>
                    <p className="text-sm text-slate-500">Optimized for peak performance</p>
                  </div>
                </div>
                <FocusBlock
                  description="AI analyzed your energy patterns and suggests this optimal deep work window."
                  onBook={refreshAll}
                />
              </section>

              <section className="group rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Calendar</h2>
                    <p className="text-sm text-slate-500">Quick month overview</p>
                  </div>
                </div>
                <MiniMonth />
              </section>

              <section className="group rounded-3xl border border-green-200/60 bg-gradient-to-br from-white/80 to-green-50/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Habits Today</h2>
                    <p className="text-sm text-slate-500">Build your best self</p>
                  </div>
                </div>
                <HabitsToday events={habitEvents} loading={loadingHabits} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
