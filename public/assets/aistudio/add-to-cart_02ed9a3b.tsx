"use client";

import { useCart } from "@/components/cart-provider";
import { BagIcon, CheckIcon } from "@/components/icons";
import type { TierKey } from "@/lib/catalog";

export function AddToCartButton({
  slug,
  tier = "basic",
  quantity = 1,
  compact = false,
  label = "Add to bag",
  className = "",
}: {
  slug: string;
  tier?: TierKey;
  quantity?: number;
  compact?: boolean;
  label?: string;
  className?: string;
}) {
  const { addItem, lastAdded, hydrated } = useCart();
  const added = hydrated && lastAdded === `${slug}:${tier}`;

  return (
    <button
      type="button"
      onClick={() => addItem(slug, tier, quantity)}
      className={`btn ${compact ? "btn-outline px-4 py-2 text-[0.92rem]" : "btn-primary"} ${className} ${
        added ? "bg-whatsapp! text-cream! border-whatsapp!" : ""
      }`}
      aria-live="polite"
    >
      {added ? <CheckIcon className="h-4 w-4" /> : <BagIcon className="h-4 w-4" />}
      {added ? "Added to bag" : label}
    </button>
  );
}
