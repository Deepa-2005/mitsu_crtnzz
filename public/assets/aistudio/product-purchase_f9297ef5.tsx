"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY, useCart } from "@/components/cart-provider";
import { ArrowIcon, BagIcon, CheckIcon, MinusIcon, PlusIcon, SparkleIcon, WhatsAppIcon } from "@/components/icons";
import { getTier, type Product, type TierKey } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { buildCustomiseMessage, buildProductEnquiryMessage } from "@/lib/messages";
import { buildWhatsAppLink } from "@/lib/site";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, lastAdded, hydrated } = useCart();
  const [tierKey, setTierKey] = useState<TierKey>("basic");
  const [quantity, setQuantity] = useState(1);
  const tier = getTier(product, tierKey);
  const quoted = tier.price === null;
  const added = hydrated && lastAdded === `${product.slug}:${tierKey}`;

  return (
    <div>
      <p className="font-display text-[1.05rem] font-semibold text-forest">Choose your level</p>
      <div role="radiogroup" aria-label="Choose a level" className="mt-2 grid gap-3 sm:grid-cols-3">
        {product.tiers.map((option) => {
          const selected = option.key === tierKey;
          const isCustom = option.price === null;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTierKey(option.key)}
              className={`flex flex-col rounded-[1.2rem] border p-3.5 text-left transition-all ${
                selected
                  ? isCustom
                    ? "border-forest bg-forest text-cream shadow-soft"
                    : "border-rose bg-petal/70 shadow-soft"
                  : "border-sage/60 bg-ivory/70 hover:border-forest/60"
              }`}
            >
              <span className={`flex items-center justify-between font-display text-[1.1rem] font-semibold ${selected && isCustom ? "text-cream" : "text-forest"}`}>
                {option.label}
                {option.key === "premium" ? <SparkleIcon className="h-3.5 w-3.5 text-gold" /> : null}
                {selected ? <CheckIcon className={`h-4 w-4 ${isCustom ? "text-blush" : "text-rose"}`} /> : null}
              </span>
              <span className={`mt-0.5 font-display text-xl font-semibold ${selected && isCustom ? "text-blush" : "text-forest"}`}>
                {option.price === null ? "Quoted to you" : formatINR(option.price)}
              </span>
              <span className={`mt-1 text-[0.78rem] leading-snug ${selected && isCustom ? "text-cream/80" : "text-ink-soft"}`}>{option.tagline}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-3 grid gap-1.5 rounded-[1.2rem] border border-sage/50 bg-ivory/60 p-4 text-[0.84rem] text-ink-soft sm:grid-cols-3">
        {tier.includes.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-forest/25 px-1 py-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-linen"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-linen"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[0.82rem] text-ink-soft">
          {quoted
            ? "Customise pieces are added to your bag and quoted on WhatsApp — describe your idea in the order notes."
            : `${formatINR(tier.price ?? 0)} each · ${formatINR((tier.price ?? 0) * quantity)} for ${quantity}`}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        <button
          type="button"
          onClick={() => addItem(product.slug, tierKey, quantity)}
          className={`btn ${added ? "btn-whatsapp" : "btn-primary"}`}
        >
          {added ? <CheckIcon className="h-4 w-4" /> : <BagIcon className="h-4 w-4" />}
          {added ? "Added to your bag" : `Add ${tier.label} to bag`}
        </button>
        <Link href="/cart" className="btn btn-outline">
          Checkout
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-[0.8rem]">
        <a
          href={buildWhatsAppLink(quoted ? buildCustomiseMessage(product.name) : buildProductEnquiryMessage(product.name, tier.label, tier.price))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-display text-[1rem] font-semibold text-whatsapp hover:text-forest"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {quoted ? "Describe your customisation on WhatsApp" : `Ask about the ${tier.label} level on WhatsApp`}
        </a>
      </div>
    </div>
  );
}
