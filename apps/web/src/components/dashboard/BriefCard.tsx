import { useEffect, useState } from "react"
import { fetchBrief, type Brief } from "../../api";

type Brief = {
    date: string;
    topThree: { title: string; reason: string} [];
};

export default function BriefCard() {
    const [brief, setBrief] = useState<Brief | null>(null);
    const [err, setErr] = useState<string | null>(null);

   useEffect(() => {
    fetchBrief()
      .then(setBrief)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Today's Brief</h2>

      {err && <p className="text-red-600">Error: {err}</p>}

      {!brief ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">{brief.date}</p>
          <ul className="space-y-2">
            {brief.topThree.map((item, idx) => (
              <li key={idx}>
                <strong>{item.title}</strong> — {item.reason}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}