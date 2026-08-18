"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { calculateTotals, findCoupon, lineKey, type CartLine, type CartTotals } from "@/lib/cart-math";
import { cartStore } from "@/lib/stores";
import { useClientReady, useStore } from "@/lib/use-store";

export const MAX_LINE_QUANTITY = 20;

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
  lines: CartLine[];
  totals: CartTotals;
  couponCode: string | null;
  /** False until the persisted bag has been read on the client. */
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  applyCoupon: (code: string | null) => void;
  clearCart: () => void;
  quantityOf: (productId: number) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { lines, couponCode } = useStore(cartStore);
  const hydrated = useClientReady();
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((input: AddInput) => {
    const quantity = Math.max(1, input.quantity ?? 1);
    const key = lineKey(input.productId, input.options);
    cartStore.set((current) => {
      const existing = current.lines.find((line) => line.key === key);
      const nextLines = existing
        ? current.lines.map((line) =>
            line.key === key
              ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, line.quantity + quantity) }
              : line,
          )
        : [...current.lines, { ...input, key, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }];
      return { ...current, lines: nextLines };
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    cartStore.set((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.key !== key),
    }));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    cartStore.set((current) => ({
      ...current,
      lines:
        quantity <= 0
          ? current.lines.filter((line) => line.key !== key)
          : current.lines.map((line) =>
              line.key === key
                ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }
                : line,
            ),
    }));
  }, []);

  const applyCoupon = useCallback((code: string | null) => {
    cartStore.set((current) => ({
      ...current,
      couponCode: code ? code.trim().toUpperCase() : null,
    }));
  }, []);

  const clearCart = useCallback(() => {
    cartStore.set({ lines: [], couponCode: null });
  }, []);

  const totals = useMemo(
    () => calculateTotals(lines, { coupon: findCoupon(couponCode) ?? null }),
    [lines, couponCode],
  );

  const quantityOf = useCallback(
    (productId: number) =>
      lines.reduce((sum, line) => (line.productId === productId ? sum + line.quantity : sum), 0),
    [lines],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totals,
      couponCode,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      applyCoupon,
      clearCart,
      quantityOf,
    }),
    [
      lines,
      totals,
      couponCode,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      applyCoupon,
      clearCart,
      quantityOf,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
