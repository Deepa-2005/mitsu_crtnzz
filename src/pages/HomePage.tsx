import React from 'react';
import {
  ArrowRight,
  Gift,
  Heart,
  Leaf,
  Lightbulb,
  Palette,
  ShoppingBag,
  Sparkles,
  Sprout,
  Settings2,
  Tag,
} from 'lucide-react';
import { JournalCategory, PageRoute, Product, ProductCategory, StudioManagerTab } from '../types';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useStudioCatalog } from '../context/StudioCatalogContext';
import { buildWhatsAppLink, siteConfig } from '../lib/site';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';
import { HeartDoodle, LeafSprig, LotusMark, WhatsAppIcon } from '../components/BrandMark';
import heroLotusImg from '../assets/images/hero_botanical_lotus_1794649392611.jpg';
import atelierStudioImg from '../assets/images/about_atelier_studio_1794649392696.jpg';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
  onOpenShopCategory: (category: 'All' | ProductCategory) => void;
  onOpenJournalCategory: (category: 'All' | JournalCategory) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  wishlistSlugs: string[];
  onToggleWishlist: (product: Product) => void;
  onOpenStudioManager?: (tab?: StudioManagerTab) => void;
}

const PROMISES = [
  {
    icon: Sparkles,
    title: 'Premium Quality',
    copy: 'Artist paints, colour-fast fabric pigments, and sealed finishes — at minimal prices.',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    copy: 'Handmade cotton rag paper, organic fabrics, kraft packing, and zero plastic fill.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    copy: 'Basic, Premium, or Personalised — every piece is finished by hand, to order.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenShopCategory,
  onOpenJournalCategory,
  onSelectProduct,
  onQuickAdd,
  wishlistSlugs,
  onToggleWishlist,
  onOpenStudioManager,
}) => {
  const { isOwnerVerified } = useOwnerAuth();
  const { products, offers, offerings } = useStudioCatalog();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const helpLink = buildWhatsAppLink(
    `Hello ${siteConfig.name} ♡ I'd love some help choosing a piece or placing a custom order.`
  );

  const navigateTo = (page: PageRoute) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToOffers = () => {
    const el = document.getElementById('special-offers-band');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* 1. Botanical Lotus Hero with Medallion */}
      <section className="relative isolate overflow-hidden border-b border-[#A8B18F]/40">
        <img
          src={heroLotusImg}
          alt="Pink lotus flowers and green leaves beside handmade cotton paper"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#F8F0E4]/95 via-[#F8F0E4]/85 to-[#F8F0E4]/35"
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="inline-flex items-center gap-2 font-display text-[15px] font-semibold tracking-[0.2em] text-[#2d4a3b] uppercase">
              <Leaf className="w-4 h-4 text-[#7f957b]" />
              <span>
                Create <span className="text-[#CF6C87]">•</span> Inspire{' '}
                <span className="text-[#CF6C87]">•</span> Bloom
              </span>
            </p>

            <div className="space-y-2">
              <span className="block font-display text-3xl sm:text-4xl font-medium text-[#2d4a3b]">
                Welcome to
              </span>
              <h1 className="flex flex-wrap items-baseline gap-x-4 leading-none">
                <span
                  className="font-display font-semibold tracking-[0.08em] text-[#183923]"
                  style={{ fontSize: 'clamp(3rem, 7vw, 5.25rem)' }}
                >
                  {siteConfig.shortName}
                </span>
                <span
                  className="script-accent text-[#CF6C87] leading-none"
                  style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)' }}
                >
                  {siteConfig.scriptName} ♡
                </span>
              </h1>
            </div>

            <p className="font-display text-xl sm:text-2xl text-[#183923]/90 max-w-xl leading-snug">
              {siteConfig.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 text-[#E9A9AA]" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('custom')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#183923]/45 bg-[#F8F0E4]/85 text-[#183923] font-display text-[17px] font-semibold hover:bg-[#183923] hover:text-[#F8F0E4] transition-colors cursor-pointer"
              >
                <span>Custom Order</span>
              </button>
            </div>

            {/* Real Offerings List */}
            <ul className="flex flex-wrap gap-1.5 pt-1 max-w-xl" aria-label="What we make">
              {offerings.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[#183923]/25 bg-[#F8F0E4]/85 px-3 py-1 font-display text-[14px] font-semibold text-[#183923]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-display text-[16px] font-semibold text-[#183923] hover:text-[#CF6C87] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#2F7A56]" />
              <span>Order or ask on WhatsApp · {siteConfig.phone.display}</span>
            </a>
          </div>

          {/* Right Column: Pure SVG Lotus Medallion */}
          <div className="lg:col-span-5 hidden lg:flex justify-center">
            <LotusMark
              showText
              className="w-76 h-76 drop-shadow-[0_24px_40px_rgba(24,57,35,0.22)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Six Sage Arch Category Tabs */}
      <section aria-label="Explore by category" className="bg-[#F8F0E4] border-b border-[#A8B18F]/40 py-9">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-end justify-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => onOpenShopCategory('Art & Crafts')}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <Palette className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">Art &amp; Crafts</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenShopCategory('Giftables')}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <Gift className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">Giftables</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenShopCategory('Lifestyle')}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <Sprout className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">Lifestyle</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenShopCategory('All')}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">Our Store</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenJournalCategory('DIY Ideas')}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <Lightbulb className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">DIY Ideas</span>
          </button>

          <button
            type="button"
            onClick={scrollToOffers}
            className="tab-arch cursor-pointer"
          >
            <span className="tab-arch__icon">
              <Heart className="w-5 h-5" />
            </span>
            <span className="tab-arch__label">Offers</span>
          </button>
        </div>
      </section>

      {/* 3. Special Offers Strip */}
      <section
        id="special-offers-band"
        aria-labelledby="offers-heading"
        className="bg-[#F9E4E7]/50 border-b border-[#A8B18F]/40 py-10 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="font-display text-[13px] font-semibold tracking-[0.24em] text-[#5d7a62] uppercase">
                Special Offers
              </p>
              <h2
                id="offers-heading"
                className="font-display text-3xl sm:text-4xl font-semibold text-[#183923] mt-1"
              >
                Little extras, <span className="script-accent text-[#CF6C87] font-normal">for now</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {isOwnerVerified && onOpenStudioManager && (
                <button
                  type="button"
                  onClick={() => onOpenStudioManager('offers')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF9F4] border border-[#CF6C87]/60 text-[12.5px] font-medium text-[#183923] hover:bg-[#F9E4E7] transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-[#CF6C87]" />
                  <span>Manage Offers</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="inline-flex items-center gap-1.5 font-display text-[16px] font-semibold text-[#183923] hover:text-[#CF6C87] cursor-pointer"
              >
                <span>Shop eligible pieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offers.map((offer) => {
              const claimMessage = `Hello ${siteConfig.name} ♡ I'd like to claim offer *${offer.code}* (${offer.title} — ${offer.discount}).`;
              return (
                <li
                  key={offer.slug}
                  className="flex flex-col justify-between rounded-[1.4rem] border-2 border-dashed border-[#CF6C87]/55 bg-[#FDF9F4] p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#CF6C87]">
                        <Tag className="w-3.5 h-3.5" />
                        {offer.badge}
                      </span>
                      <span className="rounded-full bg-[#183923] px-3 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-[#F8F0E4] uppercase">
                        {offer.code}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[22px] font-semibold text-[#183923]">
                      {offer.title}
                    </h3>
                    <p className="script-accent text-3xl text-[#CF6C87] leading-tight">
                      {offer.discount}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#183923]/75">
                      {offer.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#A8B18F]/30 space-y-3">
                    <p className="text-[11px] tracking-[0.08em] text-[#183923]/60 uppercase">
                      Valid until {offer.validUntil}
                    </p>
                    <a
                      href={buildWhatsAppLink(claimMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-full bg-[#2F7A56] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#25643f] transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Claim on WhatsApp</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4. About Teaser with Washi-Tape Polaroid & Forest Promises Blob */}
      <section className="relative overflow-hidden bg-[#F8F0E4] py-16">
        <div className="blob-forest pointer-events-none absolute top-[-3rem] right-[-9rem] bottom-[-3rem] hidden w-[36%] lg:block" />
        <LeafSprig className="pointer-events-none absolute right-6 bottom-0 hidden h-60 w-36 text-[#F8F0E4]/15 lg:block" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Polaroid Card */}
          <div className="lg:col-span-4 relative mx-auto w-full max-w-sm">
            <HeartDoodle className="absolute -top-7 -left-5 h-9 w-9 -rotate-12 text-[#183923]/55" />
            <div className="bg-[#FDF9F4] border border-[#A8B18F]/50 shadow-lg -rotate-2 rounded-md p-3 pb-7 relative">
              <ResilientImage
                src={atelierStudioImg}
                alt="MITSU Crntzz studio worktable with paintbrushes, mineral pigments, and botanicals"
                aspectClassName="aspect-[4/3]"
                titleFallback="MITSU Crntzz Studio"
              />
              <p className="script-accent mt-3 text-center text-2xl text-[#183923]">
                {siteConfig.scriptMotto}
              </p>
            </div>
            <span className="washi-tape -top-2 left-8 -rotate-6" aria-hidden="true" />
            <span className="washi-tape -top-2 right-8 rotate-6" aria-hidden="true" />
          </div>

          {/* Studio Story */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-display text-[13px] font-semibold tracking-[0.24em] text-[#5d7a62] uppercase">
              About Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#183923]">
              MITSU <span className="script-accent text-[#CF6C87] font-normal">Crntzz ♡</span>
            </h2>
            <p className="text-[14px] leading-relaxed text-[#183923]/80">
              We are a creative brand inspired by art, nature, and self-expression. From aesthetic
              handmade creations to meaningful gifts, we bring quiet artistry into everyday life.
            </p>
            <p className="text-[14px] leading-relaxed text-[#183923]/80">
              Every piece—greeting cards, bookmarks, mini scrapbooks, handmade bouquets, photo
              frames, kolka art, keychains, memory jars, and gift hampers—is crafted in{' '}
              <strong>Basic, Premium</strong>, and <strong>Personalised</strong> levels at minimal
              prices.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                Know More
              </button>
              <button
                type="button"
                onClick={() => navigateTo('gallery')}
                className="px-5 py-2.5 rounded-full border border-[#183923]/40 text-[#183923] font-display text-[16px] font-semibold hover:bg-[#EFE4D3] transition-colors cursor-pointer"
              >
                Rangoli &amp; Art Gallery
              </button>
            </div>
          </div>

          {/* Promises Card */}
          <ul className="lg:col-span-4 bg-[#FDF9F4]/95 border border-[#A8B18F]/55 rounded-[1.5rem] p-6 space-y-5 shadow-md">
            {PROMISES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#183923]/30 bg-[#F8F0E4] text-[#183923]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-semibold text-[#183923] leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-[#183923]/75 mt-0.5 leading-snug">
                      {item.copy}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5. Featured Pieces Row */}
      <section className="bg-[#EFE4D3]/60 border-t border-[#A8B18F]/40 py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="font-display text-[13px] font-semibold tracking-[0.24em] text-[#5d7a62] uppercase">
                Fresh from the Studio
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#183923] mt-1">
                Loved pieces,{' '}
                <span className="script-accent text-[#CF6C87] font-normal">from ₹29</span>
              </h2>
              <p className="text-[14px] text-[#183923]/75 mt-1">
                Every piece in three clear levels — Basic, Premium, and Personalised (plus Silver,
                Gold &amp; Platinum Gift Hampers).
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#183923]/40 text-[#183923] font-display text-[16px] font-semibold hover:bg-[#183923] hover:text-[#F8F0E4] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Visit the Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
                isWishlisted={wishlistSlugs.includes(product.slug)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
