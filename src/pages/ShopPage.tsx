import React, { useEffect, useMemo, useState } from 'react';
import { Check, FileText, Gift, Heart, Search, Settings2, Sparkles, X } from 'lucide-react';
import { Product, ProductCategory, StudioManagerTab, TierKey } from '../types';
import { TIER_META } from '../data/catalog';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useStudioCatalog } from '../context/StudioCatalogContext';
import { buildWhatsAppLink, formatINR } from '../lib/site';
import { ProductCard } from '../components/ProductCard';
import { PriceRangeSlider } from '../components/PriceRangeSlider';
import { ResilientImage } from '../components/ResilientImage';
import { WhatsAppIcon } from '../components/BrandMark';

type ShopTab = 'All' | ProductCategory | 'Wishlist';

interface ShopPageProps {
  initialCategory?: 'All' | ProductCategory;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, tier?: TierKey) => void;
  wishlistSlugs: string[];
  onToggleWishlist: (product: Product) => void;
  onClearWishlist?: () => void;
  onOpenStudioManager?: (tab?: StudioManagerTab) => void;
}

const TIER_ORDER: TierKey[] = ['basic', 'premium', 'customise'];

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'All',
  onSelectProduct,
  onQuickAdd,
  wishlistSlugs,
  onToggleWishlist,
  onClearWishlist,
  onOpenStudioManager,
}) => {
  const { isOwnerVerified } = useOwnerAuth();
  const { products, shopCollections, getProductBySlug, getStartingPrice } = useStudioCatalog();

  const [selectedCategory, setSelectedCategory] = useState<ShopTab>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const [catalogMinPrice, catalogMaxPrice] = useMemo(() => {
    const allPrices = products.flatMap((p) =>
      p.tiers.map((t) => t.price).filter((n): n is number => typeof n === 'number')
    );
    if (allPrices.length === 0) return [0, 500];
    return [Math.min(...allPrices), Math.max(...allPrices)];
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    catalogMinPrice,
    catalogMaxPrice,
  ]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Keep priceRange aligned when catalog products are added/edited in-app
  useEffect(() => {
    setPriceRange((prev) => {
      const wasDefault = prev[0] <= catalogMinPrice && prev[1] >= catalogMaxPrice;
      if (wasDefault) return [catalogMinPrice, catalogMaxPrice];
      const nextMin = Math.max(catalogMinPrice, Math.min(prev[0], catalogMaxPrice));
      const nextMax = Math.min(catalogMaxPrice, Math.max(prev[1], nextMin));
      return [nextMin, nextMax];
    });
  }, [catalogMinPrice, catalogMaxPrice]);

  const categories: ShopTab[] = useMemo(
    () => ['All', ...shopCollections, 'Wishlist'],
    [shopCollections]
  );

  // Ensure selectedCategory stays valid if a collection was renamed or removed
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const isPriceFiltered = priceRange[0] > catalogMinPrice || priceRange[1] < catalogMaxPrice;

  const matchesSearchQuery = (item: Product, query: string): boolean => {
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length === 0) return true;

    const searchableText = [
      item.name,
      item.category,
      item.sku,
      item.blurb,
      item.description,
      item.materials,
      item.availability,
      ...item.tiers.flatMap((t) => [t.label, t.tagline, ...t.includes]),
    ]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => searchableText.includes(token));
  };

  const matchesPriceRange = (item: Product, [minP, maxP]: [number, number]): boolean => {
    if (minP <= catalogMinPrice && maxP >= catalogMaxPrice) return true;
    const tierPrices = item.tiers
      .map((t) => t.price)
      .filter((p): p is number => typeof p === 'number');
    if (tierPrices.length === 0) return false;
    return tierPrices.some((price) => price >= minP && price <= maxP);
  };

  const categoryCounts = useMemo(() => {
    const matched = products.filter(
      (item) => matchesSearchQuery(item, searchQuery) && matchesPriceRange(item, priceRange)
    );
    const counts: Record<string, number> = {
      All: matched.length,
      Wishlist: matched.filter((i) => wishlistSlugs.includes(i.slug)).length,
    };
    for (const col of shopCollections) {
      counts[col] = matched.filter((i) => i.category === col).length;
    }
    return counts;
  }, [products, shopCollections, searchQuery, priceRange, wishlistSlugs, catalogMinPrice, catalogMaxPrice]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((item) => {
      const matchesCat =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Wishlist'
            ? wishlistSlugs.includes(item.slug)
            : item.category === selectedCategory;
      return (
        matchesCat &&
        matchesSearchQuery(item, searchQuery) &&
        matchesPriceRange(item, priceRange)
      );
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    }
    return list;
  }, [
    products,
    selectedCategory,
    searchQuery,
    priceRange,
    sortBy,
    wishlistSlugs,
    getStartingPrice,
    catalogMinPrice,
    catalogMaxPrice,
  ]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'featured' ||
    isPriceFiltered;

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange([catalogMinPrice, catalogMaxPrice]);
  };

  const giftHamperProduct = getProductBySlug('gift-hampers');

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#A8B18F]/45">
        <div className="space-y-2 max-w-2xl">
          <p className="script-accent text-2xl text-[#CF6C87]">
            MITSU creations · The Creative Nest · From {formatINR(catalogMinPrice)}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#183923]">
            Our Handmade Store
          </h1>
          <p className="text-[15px] text-[#183923]/75 leading-relaxed">
            Greeting cards, bookmarks, mini scrapbooks, pipe cleaner, paper, ribbon &amp; real flower
            bouquets, photo frames, mini polaroid paintings, kolka art, keychains, memory jars &amp;
            curated gift hampers — each crafted in three transparent levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
          {isOwnerVerified && onOpenStudioManager && (
            <button
              type="button"
              onClick={() => onOpenStudioManager('products')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDF9F4] border border-[#CF6C87]/70 text-[#183923] text-[12px] font-medium hover:bg-[#F9E4E7] transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#CF6C87]" />
              <span>Manage Store</span>
            </button>
          )}
          <a
            href="/assets/aistudio/Mitsu-Price-List_d61917b6.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183923] text-[#F8F0E4] text-[12px] font-medium hover:bg-[#2d4a3b] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#E9A9AA]" />
            <span>Price List (PDF)</span>
          </a>
          <div className="px-4 py-2 rounded-full bg-[#EFE4D3] border border-[#A8B18F]/50 text-[12px] text-[#183923]/80">
            All prices in INR (₹) · Confirmed via WhatsApp &amp; Email
          </div>
        </div>
      </div>

      {/* Three Levels Explainer */}
      <section className="rounded-[1.6rem] border border-[#A8B18F]/55 bg-[#FDF9F4] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold text-[#183923]">
            Three levels in{' '}
            <span className="script-accent text-[#CF6C87] font-normal">every category</span>
          </h2>
          <p className="text-[13px] text-[#183923]/70">
            Handmade at minimal prices — pick the level that suits the moment.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIER_ORDER.map((key, index) => {
            const tier = TIER_META[key];
            const cardClass =
              key === 'basic'
                ? 'border-[#A8B18F]/60 bg-[#F8F0E4] text-[#183923]'
                : key === 'premium'
                  ? 'border-[#E9A9AA] bg-[#F9E4E7]/70 text-[#183923]'
                  : 'border-[#183923] bg-[#183923] text-[#F8F0E4]';

            return (
              <li key={key} className={`rounded-[1.2rem] border p-4 ${cardClass}`}>
                <p className="flex items-center gap-2 font-display text-lg font-semibold">
                  <span
                    className={`script-accent text-2xl leading-none ${
                      key === 'customise' ? 'text-[#E9A9AA]' : 'text-[#CF6C87]'
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <span>{tier.label}</span>
                  {key === 'premium' && <Sparkles className="w-3.5 h-3.5 text-[#B69A64]" />}
                </p>
                <p
                  className={`mt-1 text-[13px] leading-snug ${
                    key === 'customise' ? 'text-[#F8F0E4]/85' : 'text-[#183923]/75'
                  }`}
                >
                  {tier.blurb}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Filter, Search & Price Range Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[#183923]/55 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="shop-search" className="sr-only">
              Search products by name or category
            </label>
            <input
              id="shop-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchQuery) {
                  setSearchQuery('');
                }
              }}
              placeholder="Search by product name or category (e.g. Bouquet, Scrapbook, Kolka, Hamper)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px] text-[#183923] placeholder:text-[#183923]/50 focus:outline-none focus:border-[#CF6C87] shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#183923]/60 hover:text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <label htmlFor="sort-select" className="text-[12.5px] text-[#183923]/65 shrink-0">
              Sort by
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              className="px-4 py-2.5 rounded-full bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13px] text-[#183923] focus:outline-none focus:border-[#CF6C87] cursor-pointer"
            >
              <option value="featured">Studio Order</option>
              <option value="price-asc">Starting Price: Low to High</option>
              <option value="price-desc">Starting Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* UI Price Range Slider */}
        <PriceRangeSlider
          min={catalogMinPrice}
          max={catalogMaxPrice}
          value={priceRange}
          onChange={setPriceRange}
          isFiltered={isPriceFiltered}
          onReset={() => setPriceRange([catalogMinPrice, catalogMaxPrice])}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Product categories"
          >
            {categories.map((category) => {
              const active = selectedCategory === category;
              const isWishlist = category === 'Wishlist';
              const count = categoryCounts[category] ?? 0;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full border font-display text-[15px] font-semibold transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                    active
                      ? isWishlist
                        ? 'bg-[#CF6C87] text-[#FDF9F4] border-[#CF6C87]'
                        : 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                      : 'bg-[#FDF9F4] text-[#183923] border-[#A8B18F]/60 hover:border-[#183923]'
                  }`}
                >
                  {isWishlist && (
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        active
                          ? 'fill-current'
                          : wishlistSlugs.length > 0
                            ? 'text-[#CF6C87] fill-[#CF6C87]'
                            : 'text-[#CF6C87]'
                      }`}
                    />
                  )}
                  <span>
                    {category === 'All' ? `All pieces (${count})` : `${category} (${count})`}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="flex items-center gap-3 text-[12.5px] text-[#183923]/70"
            aria-live="polite"
          >
            <span>
              Showing <strong className="text-[#183923]">{filteredProducts.length}</strong> of{' '}
              {products.length} pieces
              {searchQuery.trim() ? ` for “${searchQuery.trim()}”` : ''}
              {isPriceFiltered
                ? ` · ${formatINR(priceRange[0])}–${formatINR(priceRange[1])}`
                : ''}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[#CF6C87] hover:text-[#183923] underline underline-offset-4 font-medium cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Sub-bar when active and populated */}
      {selectedCategory === 'Wishlist' && wishlistSlugs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#F9E4E7]/45 border border-[#CF6C87]/40">
          <p className="text-[13.5px] text-[#183923]">
            Your saved pieces are remembered on this browser even if you close the tab.
          </p>
          {onClearWishlist && (
            <button
              type="button"
              onClick={onClearWishlist}
              className="text-[12.5px] font-medium text-[#CF6C87] hover:text-[#183923] underline underline-offset-4 cursor-pointer"
            >
              Clear Wishlist
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        selectedCategory === 'Wishlist' && wishlistSlugs.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-2xl bg-[#EFE4D3]/55 border border-[#A8B18F]/50 space-y-3">
            <Heart className="w-8 h-8 text-[#CF6C87] mx-auto" />
            <p className="font-display text-2xl text-[#183923]">Your Wishlist is empty</p>
            <p className="text-[14px] text-[#183923]/75 max-w-md mx-auto">
              Tap the heart icon on any handmade piece to save your favourites here for later.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              Explore the Store
            </button>
          </div>
        ) : (
          <div className="py-16 px-6 text-center rounded-2xl bg-[#EFE4D3]/55 border border-[#A8B18F]/50 space-y-3">
            <p className="font-display text-2xl text-[#183923]">No matching pieces found</p>
            <p className="text-[14px] text-[#183923]/75">
              Try widening your price range, clearing search, or viewing all categories.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              Show All Pieces
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickAdd={(p) => onQuickAdd(p, 'basic')}
              isWishlisted={wishlistSlugs.includes(product.slug)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}

      {/* Gift Hampers Section (Silver · Gold · Platinum + Build Your Own Hamper) */}
      {giftHamperProduct && (
        <section
          aria-labelledby="hampers-showcase-heading"
          className="rounded-[1.8rem] border border-[#A8B18F]/60 bg-[#FDF9F4] p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-[#A8B18F]/35">
            <div>
              <p className="script-accent text-2xl text-[#CF6C87]">Curated Gift Boxes</p>
              <h2
                id="hampers-showcase-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[#183923]"
              >
                {giftHamperProduct.name}
              </h2>
            </div>
            <p className="text-[13.5px] text-[#183923]/75 max-w-md">
              Choose our ready Silver, Gold, or Platinum keepsake boxes — or build your own hamper
              with your favourite creations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 rounded-2xl bg-[#F9E4E7]/75 border border-[#E9A9AA]/55 p-4 flex items-center justify-center">
              <ResilientImage
                src={giftHamperProduct.image}
                alt="MITSU Crntzz curated Gift Hamper box with chocolates, dried bouquet, polaroids & birthday banner"
                aspectClassName="aspect-[4/5] w-full rounded-xl"
                objectFit="contain"
                className="!bg-transparent"
                titleFallback={giftHamperProduct.name}
              />
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {giftHamperProduct.tiers.map((tier, idx) => {
                const accentClass =
                  idx === 0
                    ? 'border-l-4 border-l-[#A8B18F]'
                    : idx === 1
                      ? 'border-l-4 border-l-[#B69A64]'
                      : 'border-l-4 border-l-[#CF6C87]';
                return (
                  <div
                    key={tier.key}
                    className={`rounded-2xl border border-[#A8B18F]/50 bg-[#F8F0E4]/75 p-5 flex flex-col justify-between space-y-4 ${accentClass}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-2xl font-semibold text-[#183923]">
                          {tier.label}
                        </h3>
                        <span className="font-display text-2xl font-semibold text-[#CF6C87] tabular-nums">
                          {tier.price !== null ? formatINR(tier.price) : 'Custom'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-[13px] text-[#183923]/85">
                        {tier.includes.map((line) => (
                          <li key={line} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#2F7A56] mt-0.5 shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => onQuickAdd(giftHamperProduct, tier.key)}
                      className="w-full py-2.5 px-4 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
                    >
                      Add {tier.label} · {tier.price !== null ? formatINR(tier.price) : ''}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#183923] text-[#F8F0E4] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Gift className="w-5 h-5 text-[#E9A9AA] shrink-0 hidden sm:block" />
              <p className="font-display text-xl sm:text-2xl font-semibold">
                Build Your Own Hamper — choose your favourites!
              </p>
            </div>
            <a
              href={buildWhatsAppLink(
                'Hello MITSU Crntzz ♡ I would like to Build My Own Gift Hamper with custom items!'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E9A9AA] text-[#183923] text-[13px] font-semibold hover:bg-[#f0b8b9] transition-colors shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Customise on WhatsApp</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
};
