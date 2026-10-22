"use client";

import { useSyncExternalStore } from "react";
import { clearLocalOrders } from "./orders";
import { getSupabase, supabaseConfigured } from "./supabase";

/**
 * Who's signed in.
 *
 * - With Supabase configured: real sign-in (Google, or an emailed magic link)
 *   through Supabase Auth, and the profile (name, phone, birthday,
 *   anniversary) stored in the `profiles` table. A new user signs in first,
 *   then fills in their details once.
 * - Without it (DEMO): the profile lives in this browser's localStorage and
 *   nothing is verified.
 *
 * `useProfile()` works the same in both modes, so pages don't need to care.
 */

export interface Profile {
  name: string;
  email: string;
  phone: string;
  /** ISO date, yyyy-mm-dd */
  dob: string;
  /** ISO date, optional */
  anniversary?: string;
  createdAt: string;
}

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  /** Signed in with Supabase, but hasn't filled in their details yet. */
  | { status: "needs-details"; email: string; suggestedName: string }
  | { status: "signed-in"; profile: Profile; checkout?: unknown };

export const authMode: "supabase" | "demo" = supabaseConfigured ? "supabase" : "demo";

// ── Shared state ──────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
let state: AuthState = { status: "loading" };
let started = false;

function set(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) start();
  return () => listeners.delete(listener);
}

const SERVER: AuthState = { status: "loading" };

/** The full sign-in state, for the login page. */
export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/**
 * The signed-in profile: `null` when signed out (or details aren't filled in
 * yet), `undefined` while it's still being checked.
 */
export function useProfile(): Profile | null | undefined {
  const s = useAuthState();
  if (s.status === "loading") return undefined;
  return s.status === "signed-in" ? s.profile : null;
}

// ── Demo mode: localStorage ───────────────────────────────────────────────

const KEY = "giftwala.profile.v1";

function readLocal(): Profile | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return parsed && typeof parsed.name === "string" && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(profile: Profile | null) {
  try {
    if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the in-page state still updates.
  }
}

// ── Supabase mode ─────────────────────────────────────────────────────────

interface ProfileRow {
  name: string;
  phone: string;
  dob: string;
  anniversary: string | null;
  checkout: unknown;
  created_at: string;
}

async function loadSupabaseProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("profiles")
    .select("name, phone, dob, anniversary, checkout, created_at")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  const email = user.email ?? "";
  if (error || !data) {
    const meta = user.user_metadata ?? {};
    const suggestedName = String(meta.full_name ?? meta.name ?? "");
    set({ status: "needs-details", email, suggestedName });
    return;
  }
  set({
    status: "signed-in",
    profile: {
      name: data.name,
      email,
      phone: data.phone,
      dob: data.dob,
      anniversary: data.anniversary ?? undefined,
      createdAt: data.created_at,
    },
    checkout: data.checkout ?? undefined,
  });
}

function start() {
  started = true;
  if (typeof window === "undefined") return;
  const supabase = getSupabase();
  if (!supabase) {
    const local = readLocal();
    set(local ? { status: "signed-in", profile: local } : { status: "signed-out" });
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      const p = readLocal();
      set(p ? { status: "signed-in", profile: p } : { status: "signed-out" });
    });
    return;
  }
  supabase.auth.onAuthStateChange((event, session) => {
    // Supabase recommends not awaiting other Supabase calls inside this callback
    if (!session?.user) {
      set({ status: "signed-out" });
      return;
    }
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
      const user = session.user;
      setTimeout(() => void loadSupabaseProfile(user), 0);
    }
  });
}

// ── Actions ───────────────────────────────────────────────────────────────

/** Saves the shopper's details. Resolves with an error message if it failed. */
export async function saveProfile(profile: Profile): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) {
    writeLocal(profile);
    set({ status: "signed-in", profile });
    return undefined;
  }
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return "Your sign-in has expired. Please sign in again.";
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: profile.name,
    phone: profile.phone,
    dob: profile.dob,
    anniversary: profile.anniversary ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) return "We couldn't save your details. Please try again.";
  await loadSupabaseProfile(user);
  return undefined;
}

/** Remembers checkout details on the account, so they follow the shopper to other devices. */
export async function saveCheckoutToAccount(checkout: unknown) {
  const supabase = getSupabase();
  if (!supabase || state.status !== "signed-in") return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("profiles").update({ checkout, updated_at: new Date().toISOString() }).eq("id", data.user.id);
  state = { ...state, checkout };
}

export async function signInWithGoogle(next: string): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return "Google sign-in isn't set up yet.";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(next)}` },
  });
  return error ? "We couldn't start Google sign-in. Please try again." : undefined;
}

export async function sendMagicLink(email: string, next: string): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return "Email sign-in isn't set up yet.";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/login?next=${encodeURIComponent(next)}` },
  });
  if (!error) return undefined;
  return error.status === 429
    ? "Too many emails sent. Please wait a minute and try again."
    : "We couldn't send the sign-in email. Please check the address and try again.";
}

export async function signOut() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
    clearLocalOrders();
  } else writeLocal(null);
  set({ status: "signed-out" });
}

/** Only same-site paths are allowed as a return address after sign-in. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
