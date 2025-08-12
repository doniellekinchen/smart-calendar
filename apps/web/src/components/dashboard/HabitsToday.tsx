import { useMemo, useState } from "react";
import { type Event } from "../../api/events";

type Props = {
  events: Event[] | null;                 // today's events from Dashboard
  onToggle?: (id: string, done: boolean) => void; // optional: persist later
};

export default function HabitsToday({ events, onToggle }: Props) {
  // derive today's habits from events
  const habitEvents = useMemo(
    () => (events ?? []).filter(e => e.category === "habit"),
    [events]
  );

  // local completion state (id -> done)
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setDoneMap(prev => {
      const next = !prev[id];
      onToggle?.(id, next);
      return { ...prev, [id]: next };
    });
  }

  return (
    <section
      aria-labelledby="habits-title"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 id="habits-title" className="text-sm font-semibold text-slate-800">
        Habits Today
      </h2>
      <div className="h-px bg-slate-100 my-3" />

      {habitEvents.length === 0 ? (
        <p className="text-slate-500">No habits scheduled today.</p>
      ) : (
        <ul className="space-y-2">
          {habitEvents.map(h => {
            const done = !!doneMap[h.id];
            return (
              <li key={h.id} className="flex items-center gap-3">
                <input
                  id={`habit-${h.id}`}
                  type="checkbox"
                  checked={done}
                  onChange={() => toggle(h.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`habit-${h.id}`}
                  className={`text-sm ${done ? "line-through text-slate-400" : "text-slate-700"}`}
                >
                  {h.title}
                </label>

                {/* show recurrence if present */}
                {h.recurrence && h.recurrence !== "none" && (
                  <span className="ml-auto text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                    {h.recurrence}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
