import { useEffect, useState } from "react";
import { fetchBrief, type Brief } from "../../api/brief";

export default function BriefCard() {
  const [data, setData] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const brief = await fetchBrief();
        if (alive) setData(brief);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load brief");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <ul className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <li key={i} className="h-4 rounded bg-slate-100 animate-pulse" />
        ))}
      </ul>
    );
  }

  if (err) {
    return <p className="text-sm text-red-600">Error: {err}</p>;
  }

  if (!data) {
    return <p className="text-slate-500">No brief available.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500">Daily Brief — {data.date}</div>
      <ul className="space-y-1">
        {data.topThree.map((t, i) => (
          <li key={i} className="text-slate-700">
            <span className="font-medium">{t.title}</span>
            <span className="text-slate-500"> — {t.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
