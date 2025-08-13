import { useState } from "react";
import { fetchFocusSuggestion, type FocusSuggestion } from "../../api/focus";

type Props = { description?: string };

export default function FocusBlock({ description }: Props) {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(60);
  const [data, setData] = useState<FocusSuggestion | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function suggest() {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const res = await fetchFocusSuggestion(duration);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Failed to get suggestion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {description && <p className="text-slate-500 text-sm">{description}</p>}

      <div className="flex items-center gap-2">
        <label htmlFor="focus-duration" className="text-sm text-slate-600">Duration</label>
        <select
          id="focus-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {[30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
        </select>

        <button
          type="button"
          onClick={suggest}
          disabled={loading}
          className="ml-auto inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Finding…" : `Suggest ${duration}-min Block`}
        </button>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {data && data.ok && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-slate-800">
          <div className="font-medium">Suggested:</div>
          <div className="mt-1">
            {new Date(data.suggestion.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {" – "}
            {new Date(data.suggestion.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="text-slate-600 mt-1">{data.suggestion.reason}</div>
        </div>
      )}

      {data && !data.ok && (
        <p className="text-sm text-slate-500">{data.reason}</p>
      )}
    </div>
  );
}