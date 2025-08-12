// A tiny month view that shows the current month, Mon–Sun,
// and highlights "today". No external libs.

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toMondayIndex(jsDay: number) {
  // JS: 0=Sun..6=Sat  ->  0=Mon..6=Sun
  return (jsDay + 6) % 7;
}

function getMonthMatrix(base = new Date()) {
  const year = base.getFullYear();
  const month = base.getMonth(); // 0..11

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Where does the 1st fall, Monday-based?
  const startOffset = toMondayIndex(firstOfMonth.getDay()); // 0..6

  // Build a 6x7 grid (42 cells): leading blanks + 1..days + trailing blanks
  const cells: { day: number | null; inMonth: boolean; date?: Date }[] = [];
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const cellIndex = i - startOffset + 1; // day number candidate
    if (cellIndex >= 1 && cellIndex <= daysInMonth) {
      const d = new Date(year, month, cellIndex);
      cells.push({ day: cellIndex, inMonth: true, date: d });
    } else {
      cells.push({ day: null, inMonth: false });
    }
  }

  return { year, month, cells };
}

export default function MiniMonth() {
  const now = new Date();
  const { year, month, cells } = getMonthMatrix(now);

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">{monthLabel}</h3>
        {/* (optional) prev/next buttons later */}
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-[11px] uppercase tracking-wide text-slate-500 text-center"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const isToday =
            c.inMonth &&
            c.day === todayD &&
            month === todayM &&
            year === todayY;

          const base =
            "aspect-square flex items-center justify-center rounded-md text-sm";

          const state = !c.inMonth
            ? "text-slate-300"
            : isToday
            ? "bg-indigo-600 text-white font-medium"
            : "text-slate-800 hover:bg-slate-100";

          return (
            <div key={i} className={`${base} ${state}`}>
              {c.day ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
