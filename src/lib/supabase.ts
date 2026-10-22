"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser Supabase client, or null when the project isn't configured.
 * Without NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY the site
 * keeps working in demo mode (sign-in and orders saved in this browser).
 *
 * The anon key is safe in the browser: Row Level Security (supabase/schema.sql)
 * limits every request to the signed-in user's own rows.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client =
    url && anonKey && typeof window !== "undefined"
      ? createClient(url, anonKey, {
          auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        })
      : null;
  return client;
}

export const supabaseConfigured = Boolean(url && anonKey);
