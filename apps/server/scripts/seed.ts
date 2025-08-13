import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // 1) Create a test user
  const email = `tester+${Date.now()}@qlear.dev`;
  const password = 'Passw0rd!'; // dev only
  const { data: userRes, error: userErr } = await sb.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (userErr) throw userErr;
  const userId = userRes.user!.id;
  console.log('Created user:', email, userId);

  // 2) Insert a couple events for today
  const now = new Date();
  const start1 = new Date(now); start1.setHours(10, 0, 0, 0);
  const end1   = new Date(now); end1.setHours(11, 0, 0, 0);

  const { error: evErr } = await sb.from('events').insert([
    {
      user_id: userId,
      title: 'Deep Work',
      category: 'focus',
      recurrence: 'none',
      start: start1.toISOString(),
      end: end1.toISOString(),
    },
    {
      user_id: userId,
      title: 'Stretch (habit)',
      category: 'habit',
      recurrence: 'daily',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 45, 0).toISOString(),
    }
  ]);
  if (evErr) throw evErr;

  console.log('Seed complete. Set TEST_USER_ID in .env to:', userId);
  console.log('Dev login (later):', email, password);
}
main().catch(err => { console.error(err); process.exit(1); });
