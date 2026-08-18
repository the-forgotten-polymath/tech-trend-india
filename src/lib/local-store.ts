import { readStorage, writeStorage } from "./storage";

type Listener = () => void;

export type LocalStore<T> = {
  /** Subscribe to changes (also picks up edits made in other tabs). */
  subscribe: (listener: Listener) => () => void;
  /** Current client value. Cached, so it is safe for useSyncExternalStore. */
  getSnapshot: () => T;
  /** Value used while server-rendering and during hydration. */
  getServerSnapshot: () => T;
  set: (updater: T | ((current: T) => T)) => void;
};

/**
 * A localStorage-backed store shaped for `useSyncExternalStore`.
 *
 * Server rendering and hydration always see `fallback`, so markup matches; once
 * hydrated React re-reads the real value. Using a store (instead of reading
 * storage inside an effect) keeps every consumer in sync and gives cross-tab
 * updates for free.
 */
export function createLocalStore<T>(
  key: string,
  fallback: T,
  sanitize: (value: unknown) => T = (value) => value as T,
): LocalStore<T> {
  const listeners = new Set<Listener>();
  let cache: T = fallback;
  let loaded = false;

  const load = (): T => sanitize(readStorage<T>(key, fallback));

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const onStorageEvent = (event: StorageEvent) => {
    if (event.key !== null && event.key !== key) return;
    cache = load();
    emit();
  };

  return {
    subscribe(listener) {
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorageEvent);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorageEvent);
        }
      };
    },
    getSnapshot() {
      if (!loaded && typeof window !== "undefined") {
        cache = load();
        loaded = true;
      }
      return cache;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(updater) {
      const current = this.getSnapshot();
      const next = typeof updater === "function" ? (updater as (value: T) => T)(current) : updater;
      cache = next;
      loaded = true;
      writeStorage(key, next);
      emit();
    },
  };
}

/**
 * Flips from false to true once the client takes over, without calling setState
 * inside an effect. Handy for showing skeletons until stored state is known.
 */
export const clientReadyStore: LocalStore<boolean> = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
  set: () => {},
};
