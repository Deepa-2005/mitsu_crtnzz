"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { categories, type CategorySlug, type Product } from "@/lib/catalog";

type Filter = CategorySlug | "all";

const filters: Array<{ label: string; value: Filter }> = [
  { label: "All pieces", value: "all" },
  ...categories.map((category) => ({ label: category.label, value: category.slug })),
];

export function ProductExplorer({ products, initial = "all" }: { products: Product[]; initial?: Filter }) {
  const [active, setActive] = useState<Filter>(initial);
  const visible = useMemo(
    () => (active === "all" ? products : products.filter((product) => product.category === active)),
    [active, products],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter pieces by category">
        {filters.map((filter) => {
          const selected = active === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActive(filter.value)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-1.5 font-display text-[0.98rem] font-semibold transition-colors ${
                selected
                  ? "border-forest bg-forest text-cream"
                  : "border-forest/30 bg-ivory/60 text-forest hover:border-forest/70"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[0.74rem] tracking-[0.14em] text-ink-soft uppercase" aria-live="polite">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"} · made to order
      </p>

      <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product, index) => (
          <ProductCard key={product.slug} product={product} priority={index < 3} />
        ))}
      </div>
    </div>
  );
}
