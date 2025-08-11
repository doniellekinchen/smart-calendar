export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column (spans 2 on large) */}
            <div className="lg:col-span-2 space-y-6">
              <section
                aria-labelledby="brief-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="brief-title" className="text-sm font-semibold text-slate-800">
                  Today’s Brief
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Brief content goes here…</p>
              </section>

              <section
                aria-labelledby="upcoming-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="upcoming-title" className="text-sm font-semibold text-slate-800">
                  Upcoming
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Upcoming events list…</p>
              </section>

              <section
                aria-labelledby="quickadd-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="quickadd-title" className="text-sm font-semibold text-slate-800">
                  Quick Add
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Inline add form placeholder…</p>
              </section>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-6">
              <section
                aria-labelledby="focus-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="focus-title" className="text-sm font-semibold text-slate-800">
                  AI Focus Block
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Suggest a 60-min block…</p>
              </section>

              <section
                aria-labelledby="mini-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="mini-title" className="text-sm font-semibold text-slate-800">
                  Mini Month
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Mini month calendar…</p>
              </section>

              <section
                aria-labelledby="habits-title"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h2 id="habits-title" className="text-sm font-semibold text-slate-800">
                  Habits Today
                </h2>
                <div className="h-px bg-slate-100 my-3" />
                <p className="text-slate-500">Habit checkboxes…</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
