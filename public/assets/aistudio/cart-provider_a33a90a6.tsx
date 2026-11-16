"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, getTier, isTierKey, type Product, type Tier, type TierKey } from "@/lib/catalog";

export type CartItem = { slug: string; tier: TierKey; quantity: number };

export type CartLine = {
  key: string;
  product: Product;
  tier: Tier;
  quantity: number;
  /** 0 for Customise lines, which are quoted on WhatsApp. */
  lineTotal: number;
  quoted: boolean;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  /** Sum of all priced (Basic / Premium) lines. */
  subtotal: number;
  /** Number of Customise pieces that will be quoted on WhatsApp. */
  quotedCount: number;
  lastAdded: string | null;
  addItem: (slug: string, tier?: TierKey, quantity?: number) => void;
  setQuantity: (slug: string, tier: TierKey, quantity: number) => void;
  removeItem: (slug: string, tier: TierKey) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "mitsu-crntzz-cart-v2";
const MAX_QUANTITY = 20;

const CartContext = createContext<CartContextValue | null>(null);

export const lineKey = (slug: string, tier: TierKey) => `${slug}:${tier}`;

function normaliseItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, CartItem>();
  for (const entry of input) {
    if (typeof entry !== "object" || entry === null) continue;
    const { slug, tier, quantity } = entry as { slug?: unknown; tier?: unknown; quantity?: unknown };
    if (typeof slug !== "string" || !getProduct(slug)) continue;
    const tierKey: TierKey = isTierKey(tier) ? tier : "basic";
    const qty = typeof quantity === "number" ? Math.floor(quantity) : Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) continue;
    const key = lineKey(slug, tierKey);
    const existing = merged.get(key);
    merged.set(key, { slug, tier: tierKey, quantity: Math.min(MAX_QUANTITY, (existing?.quantity ?? 0) + qty) });
  }
  return Array.from(merged.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // Hydrating the saved bag after mount is the intended external-store sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setItems(normaliseItems(JSON.parse(stored)));
    } catch {
      // Ignore unreadable storage and start with an empty bag.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable (private mode) — the bag still works in memory.
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!lastAdded) return;
    const timeout = window.setTimeout(() => setLastAdded(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [lastAdded]);

  const addItem = useCallback((slug: string, tier: TierKey = "basic", quantity = 1) => {
    if (!getProduct(slug)) return;
    const add = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
    setItems((current) => {
      const existing = current.find((item) => item.slug === slug && item.tier === tier);
      if (!existing) return [...current, { slug, tier, quantity: add }];
      return current.map((item) =>
        item.slug === slug && item.tier === tier
          ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + add) }
          : item,
      );
    });
    setLastAdded(lineKey(slug, tier));
  }, []);

  const setQuantity = useCallback((slug: string, tier: TierKey, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    const next = Math.floor(quantity);
    if (next < 1) {
      setItems((current) => current.filter((item) => !(item.slug === slug && item.tier === tier)));
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.slug === slug && item.tier === tier ? { ...item, quantity: Math.min(MAX_QUANTITY, next) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((slug: string, tier: TierKey) => {
    setItems((current) => current.filter((item) => !(item.slug === slug && item.tier === tier)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((item) => {
        const product = getProduct(item.slug);
        if (!product) return [];
        const tier = getTier(product, item.tier);
        const quoted = tier.price === null;
        return [
          {
            key: lineKey(item.slug, item.tier),
            product,
            tier,
            quantity: item.quantity,
            lineTotal: quoted ? 0 : (tier.price ?? 0) * item.quantity,
            quoted,
          },
        ];
      }),
    [items],
  );

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.lineTotal, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const quotedCount = useMemo(
    () => lines.filter((line) => line.quoted).reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      lines,
      hydrated,
      itemCount,
      subtotal,
      quotedCount,
      lastAdded,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, lines, hydrated, itemCount, subtotal, quotedCount, lastAdded, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

export { MAX_QUANTITY };
