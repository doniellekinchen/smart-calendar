import { supabase } from "../lib/supabase";

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}
