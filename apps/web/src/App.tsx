import { useEffect, useState } from "react";
import { fetchBrief } from "./api";

type Brief = { date: string; topThree: { title: string; reason: string }[] };

export default function App() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchBrief().then(setBrief).catch(e => setErr(e.message));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Qlear</h1>
      <p style={{ opacity: 0.7 }}>Server-connected demo</p>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {!brief ? (
        <p>Loading daily brief…</p>
      ) : (
        <div>
          <h3>Daily Brief — {brief.date}</h3>
          <ul>
            {brief.topThree.map((t, i) => (
              <li key={i}><strong>{t.title}</strong> — {t.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
