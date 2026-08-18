"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { wishlistStore } from "@/lib/stores";
import { useClientReady, useStore } from "@/lib/use-store";

type WishlistContextValue = {
  ids: number[];
  hydrated: boolean;
  has: (id: number) => boolean;
  /** Returns true when the product is now saved. */
  toggle: (id: number) => boolean;
  add: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const ids = useStore(wishlistStore);
  const hydrated = useClientReady();

  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const add = useCallback((id: number) => {
    wishlistStore.set((current) => (current.includes(id) ? current : [id, ...current]));
  }, []);

  const remove = useCallback((id: number) => {
    wishlistStore.set((current) => current.filter((value) => value !== id));
  }, []);

  const toggle = useCallback(
    (id: number) => {
      const saved = ids.includes(id);
      wishlistStore.set((current) =>
        saved ? current.filter((value) => value !== id) : [id, ...current],
      );
      return !saved;
    },
    [ids],
  );

  const clear = useCallback(() => wishlistStore.set([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, hydrated, has, toggle, add, remove, clear }),
    [ids, hydrated, has, toggle, add, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return context;
}
