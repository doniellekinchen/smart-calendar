import { Event } from "../../api/events";

type Props = {
  events: Event[] | null;
  loading: boolean;
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function badgeClasses(cat?: Event["category"]) {
  switch (cat) {
    case "focus": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "break": return "bg-amber-50 text-amber-700 border border-amber-100";
    case "personal": return "bg-pink-50 text-pink-700 border border-pink-100";
    case "habit": return "bg-sky-50 text-sky-700 border border-sky-100";
    default: return "bg-indigo-50 text-indigo-700 border border-indigo-100"; // work
  }
}

export default function UpcomingList({ events, loading }: Props) {
  if (loading) {
    return (
      <ul className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <li key={i} className="h-5 rounded bg-slate-100 animate-pulse" />
        ))}
      </ul>
    );
  }

  if (!events || events.length === 0) {
    return <p className="text-slate-500">Nothing scheduled for the rest of today.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.slice(0, 5).map((ev) => (
        <li key={ev.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {ev.title}
            </div>
            <div className="text-xs text-slate-500">
              {fmtTime(ev.start)} – {fmtTime(ev.end)}
            </div>
          </div>
          <span className={`text-xs rounded-full px-2 py-0.5 ${badgeClasses(ev.category)}`}>
            {ev.category ?? "work"}
          </span>
        </li>
      ))}
    </ul>
  );
}
