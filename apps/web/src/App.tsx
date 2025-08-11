import { useEffect, useState } from "react";
import { fetchBrief } from "./api";
import Header from "./components/Header"

type Brief = { date: string; topThree: { title: string; reason: string }[] };

export default function App() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchBrief().then(setBrief).catch(e => setErr(e.message));
  }, []);

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-slate-600">Server-connected demo</p>

          {err && <p className="text-red-600">Error: {err}</p>}

          {!brief ? (
            <p>Loading daily brief…</p>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Daily Brief — {brief.date}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {brief.topThree.map((t, i) => (
                  <li key={i}>
                    <strong>{t.title}</strong> — {t.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </>
  );
}