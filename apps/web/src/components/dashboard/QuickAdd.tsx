import { useState } from "react";
import { createEvent, type NewEvent, type Recurrence } from "../../api/events";

type Props = {
  onAdded: () => void; // call after successful create
};

function todayAt(timeHHMM: string): Date {
  const [hh, mm] = timeHHMM.split(":").map(Number);
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

export default function QuickAdd({ onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<NewEvent["category"]>("work");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onChangeCategory(value: NewEvent["category"]) {
    setCategory(value);
    // if user switches away from "habit", recurrence becomes irrelevant
    if (value !== "habit") setRecurrence("none");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleaned = title.trim();
    if (!cleaned) {
      setErr("Title is required");
      return;
    }

    const startDate = todayAt(time);
    const endDate = addMinutes(startDate, duration);

    const payload: NewEvent = {
      title: cleaned,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      category,
      recurrence, // server now stores this; expansion comes later
    };

    try {
      setSaving(true);
      await createEvent(payload);
      // reset form
      setTitle("");
      setTime("09:00");
      setDuration(30);
      setCategory("work");
      setRecurrence("none");
      onAdded();
    } catch (e: any) {
      setErr(e?.message || "Failed to add event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        id="qa-title"
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Event title"
      />

      <input
        id="qa-time"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Start time"
      />

      <select
        id="qa-duration"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Duration"
      >
        {[15, 30, 45, 60, 90].map((m) => (
          <option key={m} value={m}>
            {m} min
          </option>
        ))}
      </select>

      <select
        id="qa-category"
        value={category}
        onChange={(e) => onChangeCategory(e.target.value as NewEvent["category"])}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Category"
      >
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="habit">Habit</option>
        <option value="focus">Focus</option>
        <option value="break">Break</option>
      </select>

      {category === "habit" && (
        <select
          id="qa-recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Recurrence"
        >
          <option value="none">One time</option>
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
        </select>
      )}

      <div className="md:col-span-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add"}
        </button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
