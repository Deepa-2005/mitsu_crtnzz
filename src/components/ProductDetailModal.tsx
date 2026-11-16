import React, { useEffect, useState } from 'react';
import { Check, Heart, Minus, Plus, Sparkles, X } from 'lucide-react';
import { Product, TierKey } from '../types';
import { getTier } from '../data/catalog';
import { buildWhatsAppLink, formatINR } from '../lib/site';
import { ResilientImage } from './ResilientImage';
import { WhatsAppIcon } from './BrandMark';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, tier: TierKey, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [selectedTierKey, setSelectedTierKey] = useState<TierKey>('basic');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedTierKey('basic');
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const activeTier = getTier(product, selectedTierKey);
  const isQuoted = activeTier.price === null;

  const whatsappMessage = isQuoted
    ? `Hello MITSU Crntzz ♡ I'd like to customise *${product.name}*. Here is what I have in mind:`
    : `Hello MITSU Crntzz ♡ I have a question about *${product.name}* (${activeTier.label} · ${formatINR(activeTier.price ?? 0)}).`;

  const handleAdd = () => {
    onAddToCart(product, activeTier.key, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#183923]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-4xl bg-[#F8F0E4] text-[#183923] border border-[#B69A64]/50 shadow-2xl max-h-[92vh] overflow-y-auto rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[#F8F0E4]/95 border border-[#B69A64]/45 text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Image */}
          <div className="md:col-span-5 bg-[#F9E4E7]/65 p-4 flex flex-col justify-center gap-3">
            {product.secondaryImage ? (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                <ResilientImage
                  src={product.image}
                  alt={product.name}
                  aspectClassName="aspect-[4/3] rounded-xl"
                  objectFit="contain"
                  className="!bg-transparent"
                  titleFallback={product.name}
                />
                <ResilientImage
                  src={product.secondaryImage}
                  alt={`${product.name} alternate view`}
                  aspectClassName="aspect-[4/3] rounded-xl"
                  objectFit="contain"
                  className="!bg-transparent"
                  titleFallback={product.name}
                />
              </div>
            ) : (
              <ResilientImage
                src={product.image}
                alt={product.name}
                aspectClassName="aspect-[4/5] rounded-xl"
                objectFit="contain"
                className="!bg-transparent"
                titleFallback={product.name}
              />
            )}
          </div>

          {/* Purchase Module */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[12px] text-[#7C6536]">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.availability}</span>
                <span aria-hidden="true">·</span>
                <span>Crafted in {product.craftTime}</span>
              </div>

              <div className="flex items-start justify-between gap-3 pr-8">
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#183923] leading-tight">
                  {product.name}
                </h2>
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from Wishlist`
                        : `Save ${product.name} to Wishlist`
                    }
                    aria-pressed={isWishlisted}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'bg-[#F9E4E7] border-[#CF6C87] text-[#CF6C87]'
                        : 'bg-[#FDF9F4] border-[#A8B18F]/60 text-[#183923] hover:border-[#CF6C87] hover:text-[#CF6C87]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                  </button>
                )}
              </div>

              <p className="text-[14px] leading-relaxed text-[#183923]/80">{product.description}</p>

              {/* 3-Level Selector */}
              <div className="space-y-2.5 pt-1">
                <span className="block font-display text-[17px] font-semibold text-[#183923]">
                  {product.slug === 'gift-hampers' ? 'Choose hamper edition' : 'Choose your level'}
                </span>
                <div
                  role="radiogroup"
                  aria-label="Choose product tier"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                >
                  {product.tiers.map((option) => {
                    const selected = option.key === selectedTierKey;
                    const isThirdTier = option.key === 'customise';
                    return (
                      <button
                        key={option.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSelectedTierKey(option.key)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selected
                            ? isThirdTier
                              ? 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                              : 'bg-[#F9E4E7] text-[#183923] border-[#CF6C87]'
                            : 'bg-[#FDF9F4] text-[#183923] border-[#A8B18F]/60 hover:border-[#183923]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[17px] font-semibold">
                            {option.label}
                          </span>
                          {(option.key === 'premium' || option.key === 'customise') && (
                            <Sparkles className="w-3.5 h-3.5 text-[#B69A64]" />
                          )}
                        </div>
                        <p
                          className={`font-display text-xl font-semibold tabular-nums mt-0.5 ${
                            selected && isThirdTier ? 'text-[#E9A9AA]' : 'text-[#183923]'
                          }`}
                        >
                          {option.price === null ? 'Quoted to you' : formatINR(option.price)}
                        </p>
                        <p
                          className={`text-[11px] leading-snug mt-1 ${
                            selected && isThirdTier ? 'text-[#F8F0E4]/80' : 'text-[#183923]/70'
                          }`}
                        >
                          {option.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Tier Includes */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/45 text-[12px] text-[#183923]/80">
                  {activeTier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#2F7A56] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specs */}
              <dl className="pt-3 border-t border-[#B69A64]/30 space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#183923]/60">Sizing</dt>
                  <dd className="text-right text-[#183923]">{product.dimensions}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#183923]/60">Materials</dt>
                  <dd className="text-right text-[#183923]">{product.materials}</dd>
                </div>
              </dl>
            </div>

            {/* Quantity, Add CTA & WhatsApp Link */}
            <div className="space-y-3 pt-3 border-t border-[#B69A64]/30">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-[#183923]/30 h-11 px-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-[14px] tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 h-11 px-6 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isQuoted ? (
                    <span>Add {activeTier.label} to Bag (Quoted)</span>
                  ) : (
                    <span>
                      Add {activeTier.label} ·{' '}
                      <span className="tabular-nums">
                        {formatINR((activeTier.price ?? 0) * quantity)}
                      </span>
                    </span>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={buildWhatsAppLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-display text-[15px] font-semibold text-[#2F7A56] hover:text-[#183923]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>
                    {isQuoted
                      ? 'Describe your customisation on WhatsApp'
                      : `Personalise or ask about ${activeTier.label} on WhatsApp`}
                  </span>
                </a>

                {product.slug === 'gift-hampers' && (
                  <a
                    href={buildWhatsAppLink(
                      'Hello MITSU Crntzz ♡ I would love to Build My Own Hamper with my favourite pieces!'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] font-medium text-[#CF6C87] hover:text-[#183923] underline underline-offset-4"
                  >
                    Build Your Own Hamper →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
