"use client";

import { useSyncExternalStore } from "react";

/**
 * DEMO SIGN-IN. The profile lives in this browser's localStorage: nothing is
 * sent to a server and nothing is verified. A real launch would replace this
 * with verified login (Google OAuth or a one-time code) and a database.
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

const KEY = "giftwala.profile.v1";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Profile | null } = { raw: null, value: null };

function read(): Profile | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cache.raw) return cache.value;
  let value: Profile | null = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") value = parsed;
  } catch {
    value = null;
  }
  cache = { raw, value };
  return value;
}

function write(profile: Profile | null) {
  try {
    if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the in-page state still updates below.
  }
  cache = { raw: profile ? JSON.stringify(profile) : null, value: profile };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The signed-in profile: `null` when signed out, `undefined` during server
 * rendering (before the browser can be checked).
 */
export function useProfile(): Profile | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function saveProfile(profile: Profile) {
  write(profile);
}

export function signOut() {
  write(null);
}

/** Only same-site paths are allowed as a return address after sign-in. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
