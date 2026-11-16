import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { formatINR } from "@/lib/format";
import { getCategoryLabel, getStartingPrice, type Product } from "@/lib/catalog";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const basic = product.tiers.find((tier) => tier.key === "basic");
  const premium = product.tiers.find((tier) => tier.key === "premium");

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[3.5rem_3.5rem_1.4rem_1.4rem] border border-sage/50 bg-linen">
        <Link href={`/shop/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          <div className="relative aspect-4/5 overflow-hidden">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />
          </div>
        </Link>
        {product.badge ? (
          <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-cream/92 px-3 py-1 font-display text-[0.78rem] font-semibold tracking-[0.12em] whitespace-nowrap text-forest uppercase backdrop-blur">
            {product.badge}
          </span>
        ) : null}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <Link href={`/shop/${product.slug}`} className="btn btn-outline w-full bg-cream/95! py-2 text-[0.92rem]">
            Choose a level
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col text-center">
        <p className="font-display text-[0.8rem] font-semibold tracking-[0.2em] text-rose uppercase">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="mt-1 font-display text-[1.45rem] leading-tight">
          <Link href={`/shop/${product.slug}`} className="transition-colors hover:text-rose">
            {product.name}
          </Link>
        </h3>
        <p className="prose-note mt-1 line-clamp-2 text-[0.84rem]">{product.blurb}</p>
        <p className="mt-2 font-display text-xl font-semibold text-forest">
          from {formatINR(getStartingPrice(product))}
        </p>
        <ul className="mt-1.5 flex flex-wrap justify-center gap-1.5 text-[0.7rem] tracking-[0.06em] text-ink-soft uppercase">
          <li className="rounded-full border border-sage/60 px-2 py-0.5">Basic {basic ? formatINR(basic.price ?? 0) : ""}</li>
          <li className="rounded-full border border-blush/80 bg-petal/60 px-2 py-0.5">Premium {premium ? formatINR(premium.price ?? 0) : ""}</li>
          <li className="rounded-full border border-forest/50 bg-forest px-2 py-0.5 text-cream">Customise</li>
        </ul>
      </div>
    </article>
  );
}
