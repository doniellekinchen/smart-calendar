import { supabase } from "./supabase";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header("authorization") || req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing bearer token" });
    const token = auth.slice("Bearer ".length).trim();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Invalid token" });
    req.userId = data.user.id;
    next();
  } catch (e: any) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
