import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "smart-calendar-server", time: new Date().toISOString() });
});

// Brief
app.get("/api/brief", (_req, res) => {
  res.json({ date: new Date().toISOString().slice(0,10), topThree: [/* ... */] });
});

/* ---- In-memory events START ---- */
type Category = 'work' | 'personal' | 'habit' | 'focus' | 'break';
type Event = { id: string; title: string; start: string; end: string; category?: Category; description?: string; location?: string };

const events: Event[] = [];

function startOfTodayISO() { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); }
function endOfTodayISO()   { const d = new Date(); d.setHours(23,59,59,999); return d.toISOString(); }

app.get('/api/events', (req, res) => {
  const { range, from, to } = req.query as { range?: string; from?: string; to?: string };
  let fromISO = from, toISO = to;
  if (range === 'today' || (!from && !to)) { fromISO = startOfTodayISO(); toISO = endOfTodayISO(); }
  if (!fromISO || !toISO) return res.status(400).json({ error: 'Provide range=today or from&to ISO timestamps' });

  const fromMs = Date.parse(fromISO), toMs = Date.parse(toISO);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return res.status(400).json({ error: 'Invalid from/to ISO' });

  const data = events
    .filter(e => Date.parse(e.start) < toMs && Date.parse(e.end) > fromMs)
    .sort((a,b) => Date.parse(a.start) - Date.parse(b.start));

  res.json(data);
});

app.post('/api/events', (req, res) => {
  const { title, start, end, category, description, location } = req.body ?? {};
  if (!title || !start || !end) return res.status(400).json({ error: 'title, start, end are required' });

  const item: Event = {
    id: String(Date.now()),
    title, start, end,
    category: category ?? 'work',
    description, location,
  };
  events.push(item);
  res.status(201).json(item);
});
/* ---- In-memory events END ---- */

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`✅ Server listening http://localhost:${port}`);
});

// Add this union type near your other types
type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly';

// Extend Event
type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  category?: Category;
  description?: string;
  location?: string;
  recurrence?: Recurrence; // <-- NEW
};

// In POST /api/events — read & store recurrence (default 'none')
app.post('/api/events', (req, res) => {
  const { title, start, end, category, description, location, recurrence } = req.body ?? {};
  if (!title || !start || !end) return res.status(400).json({ error: 'title, start, end are required' });

  const item: Event = {
    id: String(Date.now()),
    title,
    start,
    end,
    category: category ?? 'work',
    description,
    location,
    recurrence: recurrence ?? 'none', // <-- NEW
  };
  events.push(item);
  res.status(201).json(item);
});
