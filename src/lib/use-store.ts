"use client";

import { useSyncExternalStore } from "react";

import { clientReadyStore, type LocalStore } from "./local-store";

/** Read a localStorage-backed store with SSR-safe hydration. */
export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/** False during SSR and hydration, true afterwards. */
export function useClientReady(): boolean {
  return useStore(clientReadyStore);
}
