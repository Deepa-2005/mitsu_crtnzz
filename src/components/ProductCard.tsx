import React from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../lib/site';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const firstTier = product.tiers[0];

  return (
    <article className="group flex flex-col rounded-2xl border border-[#A8B18F]/55 bg-[#FDF9F4] p-3.5 shadow-xs">
      <div className="relative overflow-hidden rounded-xl bg-[#F9E4E7]/75 border border-[#E9A9AA]/45 p-2">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="block w-full text-left overflow-hidden rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183923]"
        >
          {product.secondaryImage ? (
            <div className="grid grid-cols-2 gap-1.5 aspect-[4/3]">
              <ResilientImage
                src={product.image}
                alt={product.name}
                aspectClassName="h-full w-full rounded-md"
                objectFit="cover"
                className="group-hover:[&_img]:scale-[1.03]"
                titleFallback={product.name}
              />
              <ResilientImage
                src={product.secondaryImage}
                alt={`${product.name} alternate bouquet`}
                aspectClassName="h-full w-full rounded-md"
                objectFit="cover"
                className="group-hover:[&_img]:scale-[1.03]"
                titleFallback={product.name}
              />
            </div>
          ) : (
            <ResilientImage
              src={product.image}
              alt={product.name}
              aspectClassName="aspect-[4/3] rounded-lg"
              objectFit="contain"
              className="!bg-transparent group-hover:[&_img]:scale-[1.03]"
              titleFallback={product.name}
            />
          )}
        </button>

        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-[#FDF9F4]/95 px-2.5 py-0.5 font-display text-[11.5px] font-semibold tracking-[0.08em] text-[#183923] uppercase whitespace-nowrap shadow-xs border border-[#A8B18F]/40">
            {product.badge}
          </span>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from Wishlist`
                : `Save ${product.name} to Wishlist`
            }
            aria-pressed={isWishlisted}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
              isWishlisted
                ? 'bg-[#F9E4E7] border-[#CF6C87] text-[#CF6C87]'
                : 'bg-[#FDF9F4]/95 border-[#A8B18F]/65 text-[#183923] hover:text-[#CF6C87] hover:border-[#CF6C87]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="pt-3.5 flex-1 flex flex-col justify-between text-center space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-[11.5px] text-[#7C6536]">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.craftTime}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="block w-full cursor-pointer"
          >
            <h3 className="font-display text-[22px] font-semibold text-[#183923] leading-snug group-hover:text-[#CF6C87] transition-colors">
              {product.name}
            </h3>
          </button>

          <p className="text-[12.5px] leading-relaxed text-[#183923]/75 line-clamp-2 px-1">
            {product.blurb}
          </p>

          {/* Three-Tier Cost Boxes (matching Mitsu Price List PDF) */}
          <div className="pt-1.5 grid grid-cols-3 gap-1.5">
            {product.tiers.map((tier) => (
              <button
                key={tier.key}
                type="button"
                onClick={() => onSelect(product)}
                className="rounded-lg bg-[#F9E4E7]/65 border border-[#E9A9AA]/50 py-1.5 px-1 text-center hover:border-[#CF6C87] transition-colors cursor-pointer"
              >
                <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-[#7C6536] truncate">
                  {tier.label}
                </span>
                <span className="block font-display text-[17px] font-semibold text-[#183923] tabular-nums leading-tight mt-0.5">
                  {tier.price !== null ? formatINR(tier.price) : 'Quote'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="flex-1 py-2 px-3 rounded-full border border-[#183923]/35 text-[12px] font-medium text-[#183923] hover:bg-[#183923] hover:text-[#F8F0E4] transition-colors cursor-pointer whitespace-nowrap"
          >
            Choose Level
          </button>
          <button
            type="button"
            onClick={() => onQuickAdd(product)}
            className="flex-1 py-2 px-3 rounded-full bg-[#183923] text-[#F8F0E4] text-[12px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer whitespace-nowrap"
          >
            Add {firstTier?.label ?? 'Basic'}
          </button>
        </div>
      </div>
    </article>
  );
};
