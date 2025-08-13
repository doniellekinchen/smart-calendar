// apps/server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Types ----------
type Category = 'work' | 'personal' | 'habit' | 'focus' | 'break';
type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly';

type Event = {
  id: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  category?: Category;
  description?: string;
  location?: string;
  recurrence?: Recurrence;
};

// ---------- Helpers ----------
function isoStartOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function isoEndOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/** subtract a busy interval from a list of free intervals */
function subtractBlock(
  frees: { start: Date; end: Date }[],
  busyStart: Date,
  busyEnd: Date
) {
  const out: { start: Date; end: Date }[] = [];
  for (const f of frees) {
    if (busyEnd <= f.start || busyStart >= f.end) {
      out.push(f); // no overlap
    } else {
      if (busyStart > f.start) out.push({ start: f.start, end: busyStart });
      if (busyEnd < f.end) out.push({ start: busyEnd, end: f.end });
    }
  }
  return out;
}

// ---------- Routes ----------

// Health
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'smart-calendar-server',
    time: new Date().toISOString(),
  });
});

// Brief (placeholder)
app.get('/api/brief', (_req, res) => {
  res.json({
    date: new Date().toISOString().slice(0, 10),
    topThree: [
      { title: 'Deep Work', reason: '120-min focus window' },
      { title: 'Team Sync', reason: 'Prep notes 10 min before' },
      { title: 'Admin Tasks', reason: 'Batch emails in one block' },
    ],
  });
});

// GET /api/events?range=today OR ?from&to [&category=...]
app.get('/api/events', async (req, res) => {
  try {
    const { range, from, to, category } = req.query as {
      range?: string;
      from?: string;
      to?: string;
      category?: string;
    };

    let fromISO = from;
    let toISO = to;
    if (range === 'today' || (!from && !to)) {
      fromISO = isoStartOfToday();
      toISO = isoEndOfToday();
    }
    if (!fromISO || !toISO) {
      return res
        .status(400)
        .json({ error: 'Provide range=today or from&to ISO timestamps' });
    }

    const user_id = process.env.TEST_USER_ID;
    if (!user_id) return res.status(500).json({ error: 'TEST_USER_ID not set' });

    let q = supabase
      .from('events')
      .select('*')
      .eq('user_id', user_id)
      .gte('start', fromISO)
      .lt('end', toISO)
      .order('start', { ascending: true });

    if (category) q = q.eq('category', category);

    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/events
app.post('/api/events', async (req, res) => {
  try {
    const { title, start, end, category, description, location, recurrence } =
      req.body ?? {};
    if (!title || !start || !end) {
      return res
        .status(400)
        .json({ error: 'title, start, end are required' });
    }

    const user_id = process.env.TEST_USER_ID;
    if (!user_id) return res.status(500).json({ error: 'TEST_USER_ID not set' });

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id,
        title,
        description,
        location,
        category: (category as Category) ?? 'work',
        recurrence: (recurrence as Recurrence) ?? 'none',
        start,
        end,
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/focus/suggest?duration=60
app.get('/api/focus/suggest', async (req, res) => {
  try {
    const durationMin = Math.max(15, Math.min(240, Number(req.query.duration) || 60));
    const needMs = durationMin * 60_000;
    const user_id = process.env.TEST_USER_ID;
    if (!user_id) return res.status(500).json({ error: 'TEST_USER_ID not set' });

    function windowFor(date: Date, startHour = 9, endHour = 17) {
      const s = new Date(date); s.setHours(startHour, 0, 0, 0);
      const e = new Date(date); e.setHours(endHour,   0, 0, 0);
      return { s, e };
    }

    async function suggestInWindow(day: Date, avoidPastWithinToday: boolean) {
      const { s, e } = windowFor(day);
      const fromISO = s.toISOString();
      const toISO = e.toISOString();

      const { data: busy, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user_id)
        .gte('start', fromISO)
        .lt('end', toISO)
        .order('start', { ascending: true });

      if (error) throw error;

      // Build free blocks by subtracting busy events from the work window
      let free: { start: Date; end: Date }[] = [{ start: s, end: e }];
      for (const ev of busy ?? []) {
        free = free.flatMap(block => {
          const bs = new Date(ev.start), be = new Date(ev.end);
          // no overlap
          if (be <= block.start || bs >= block.end) return [block];
          const out: { start: Date; end: Date }[] = [];
          if (bs > block.start) out.push({ start: block.start, end: bs });
          if (be < block.end)   out.push({ start: be,          end: block.end });
          return out;
        });
      }

      const nowMs = Date.now();
      for (const g of free) {
        const start = new Date(avoidPastWithinToday ? Math.max(g.start.getTime(), nowMs) : g.start.getTime());
        const end = new Date(start.getTime() + needMs);
        if (end <= g.end) {
          return {
            ok: true as const,
            suggestion: {
              start: start.toISOString(),
              end: end.toISOString(),
              reason: `Best ${durationMin}-min focus window based on your calendar.`,
            }
          };
        }
      }
      return { ok: false as const };
    }

    const today = new Date();
    const todayResult = await suggestInWindow(today, /*avoidPastWithinToday*/ true);
    if (todayResult.ok) return res.json(todayResult);

    // Fallback: try tomorrow 9–5 (no “past” filtering)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const tomorrowResult = await suggestInWindow(tomorrow, /*avoidPastWithinToday*/ false);
    if (tomorrowResult.ok) return res.json({
      ...tomorrowResult,
      suggestion: {
        ...tomorrowResult.suggestion,
        reason: `No slot today — suggesting tomorrow. ${tomorrowResult.suggestion.reason}`
      }
    });

    return res.json({
      ok: false,
      reason: 'No open block in today/tomorrow work hours. Try a shorter duration or widen hours.',
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// ---------- Start server ----------
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`✅ Server listening http://localhost:${port}`);
});
