"use client";

import { useSyncExternalStore } from "react";

/**
 * A small value kept in this browser's localStorage and shared by every
 * component that reads it (and other tabs). `undefined` is returned during
 * server rendering, before the browser can be read.
 */
export function createLocalStore<T>(key: string, fallback: T, isValid: (v: unknown) => v is T) {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } = { raw: null, value: fallback };

  function read(): T {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw === cache.raw) return cache.value;
    let value = fallback;
    try {
      const parsed = raw ? JSON.parse(raw) : fallback;
      if (isValid(parsed)) value = parsed;
    } catch {
      value = fallback;
    }
    cache = { raw, value };
    return value;
  }

  function write(value: T) {
    const raw = JSON.stringify(value);
    try {
      localStorage.setItem(key, raw);
    } catch {
      // Storage full or blocked: the in-page state still updates below.
    }
    cache = { raw, value };
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === key && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    read,
    write,
    update: (fn: (current: T) => T) => write(fn(read())),
    useValue: (): T | undefined => useSyncExternalStore(subscribe, read, () => undefined),
  };
}
