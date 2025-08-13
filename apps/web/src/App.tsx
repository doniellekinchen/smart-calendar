import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";

// 🔧 TEMP: bypass login so you can work on the Dashboard UI.
// set to false once auth is configured.
const DEV_SKIP_AUTH = true;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // ---- DEV BYPASS (early return) ----
  if (DEV_SKIP_AUTH) {
    return (
      <>
        <Header />
        <Dashboard />
      </>
    );
  }
  // -----------------------------------

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-md mx-auto p-6">
          <Auth />
        </main>
      </div>
    );
  }

  return (
    <>
      <Header session={session} />
      <Dashboard />
    </>
  );
}

// Inline to keep it simple. Move to separate file if you want.
function Auth() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setErr(null); setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMsg("Check your email for the magic link.");
    } catch (e: any) {
      setErr(e.message || "Failed to send link");
    } finally {
      setSending(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <form onSubmit={signInWithEmail} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send magic link"}
        </button>
      </form>
      <div className="text-center text-xs text-slate-500">or</div>
      <button
        onClick={signInWithGoogle}
        className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-slate-300 hover:bg-slate-50"
      >
        Continue with Google
      </button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
