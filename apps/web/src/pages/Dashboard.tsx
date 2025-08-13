import { useEffect, useState } from "react";
import BriefCard from "../components/dashboard/BriefCard";
import FocusBlock from "../components/dashboard/FocusBlock";
import HabitsToday from "../components/dashboard/HabitsToday";
import UpcomingList from "../components/dashboard/UpcomingList";
import MiniMonth from "../components/dashboard/MiniMonth";
import QuickAdd from "../components/dashboard/QuickAdd";
import { fetchEventsToday, type Event } from "../api/events";

export default function Dashboard() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [habitEvents, setHabitEvents] = useState<Event[] | null>(null);
  const [loadingHabits, setLoadingHabits] = useState(true);

  async function loadToday() {
    setLoadingEvents(true);
    try {
      const data = await fetchEventsToday();
      setEvents(data);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function loadHabitsToday() {
    setLoadingHabits(true);
    try {
      const data = await fetchEventsToday("habit"); // only habits
      setHabitEvents(data);
    } finally {
      setLoadingHabits(false);
    }
  }

  useEffect(() => {
    // single effect: load both lists
    loadToday();
    loadHabitsToday();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column (spans 2 on large) */}
            <div className="lg:col-span-2 space-y-6">
              <section role="region" aria-labelledby="brief-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="brief-title" className="text-sm font-semibold text-slate-800">Today’s Brief</h2>
                <div className="h-px bg-slate-100 my-3" />
                <BriefCard />
              </section>

              <section role="region" aria-labelledby="upcoming-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="upcoming-title" className="text-sm font-semibold text-slate-800">Upcoming</h2>
                <div className="h-px bg-slate-100 my-3" />
                <UpcomingList events={events} loading={loadingEvents} />
              </section>

              <section role="region" aria-labelledby="quickadd-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="quickadd-title" className="text-sm font-semibold text-slate-800">Quick Add</h2>
                <div className="h-px bg-slate-100 my-3" />
                <QuickAdd onAdded={() => { loadToday(); loadHabitsToday(); }} />
              </section>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-6">
              <section role="region" aria-labelledby="focus-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="focus-title" className="text-sm font-semibold text-slate-800">AI Focus Block</h2>
                <div className="h-px bg-slate-100 my-3" />
               <FocusBlock description="Let AI suggest your best deep work time today." />
              </section>

              <section role="region" aria-labelledby="mini-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="mini-title" className="text-sm font-semibold text-slate-800">Mini Month</h2>
                <div className="h-px bg-slate-100 my-3" />
                <MiniMonth />
              </section>

              <section role="region" aria-labelledby="habits-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 id="habits-title" className="text-sm font-semibold text-slate-800">Habits Today</h2>
                <div className="h-px bg-slate-100 my-3" />
                {/* pass habit-only events; add loading if your component supports it */}
                <HabitsToday events={habitEvents} loading={loadingHabits} />

              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
