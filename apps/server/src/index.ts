import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "smart-calendar-server", time: new Date().toISOString() });
});

// Placeholder daily brief (we’ll wire to @core soon)
app.get("/api/brief", (_req, res) => {
  res.json({
    date: new Date().toISOString().slice(0,10),
    topThree: [
      { title: "Deep Work", reason: "120-min focus window" },
      { title: "Team Sync", reason: "Prep notes 10 min before" },
      { title: "Admin Tasks", reason: "Batch emails in one block" }
    ]
  });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`✅ Server listening http://localhost:${port}`);
});
