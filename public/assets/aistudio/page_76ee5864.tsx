import Image from "next/image";
import Link from "next/link";
import { BrandHeading, LotusMark } from "@/components/brand";
import { CategoryTabs } from "@/components/category-tabs";
import { OffersBand } from "@/components/offers-band";
import { ArrowIcon, HeartIcon, LeafIcon, SparkleIcon, WhatsAppIcon } from "@/components/icons";
import { HeartDoodle, LeafSprig } from "@/components/motif";
import { ProductCard } from "@/components/product-card";
import { Eyebrow } from "@/components/ui";
import { getFeaturedProducts, offerings } from "@/lib/catalog";
import { buildGeneralHelpMessage } from "@/lib/messages";
import { buildWhatsAppLink, siteConfig } from "@/lib/site";

const promises = [
  { icon: SparkleIcon, title: "Premium Quality", copy: "Artist paints, colour-fast fabric colours and sealed finishes — at minimal prices." },
  { icon: LeafIcon, title: "Eco-Friendly", copy: "Handmade paper, cotton fabrics, kraft packing and no plastic fill." },
  { icon: HeartIcon, title: "Made with Love", copy: "Basic, Premium or Customise — every piece is finished by hand, to order." },
];

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 4);
  const helpLink = buildWhatsAppLink(buildGeneralHelpMessage());

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/hero-lotus.jpg"
          alt="Pink lotus flowers and green leaves arranged on cream silk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="hero-veil absolute inset-0 lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-cream/85 via-cream/45 to-transparent lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-16 lg:min-h-[33rem] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 font-display text-[1rem] font-semibold tracking-[0.2em] text-moss uppercase">
              <LeafIcon className="h-4 w-4 text-sage-deep" />
              Create <span className="text-rose">•</span> Inspire <span className="text-rose">•</span> Bloom
              <LeafIcon className="h-4 w-4 -scale-x-100 text-sage-deep" />
            </p>
            <h1 className="mt-4">
              <span className="block font-display text-[clamp(2rem,4.2vw,3rem)] font-medium leading-none text-moss">
                Welcome to
              </span>
              <BrandHeading className="mt-2" />
            </h1>
            <p className="mt-5 max-w-md font-display text-[1.25rem] leading-snug text-ink">
              {siteConfig.tagline} <span aria-hidden className="text-rose">♡</span>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-primary">
                Explore Our World
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="btn btn-outline">
                Shop Now <span aria-hidden>♡</span>
              </Link>
            </div>
            <ul className="mt-6 flex max-w-lg flex-wrap gap-1.5" aria-label="What we make">
              {offerings.map((item) => (
                <li key={item} className="rounded-full border border-forest/25 bg-cream/80 px-2.5 py-1 font-display text-[0.85rem] font-semibold text-forest">
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-display text-[1rem] font-semibold text-forest hover:text-rose"
            >
              <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
              Order or ask on WhatsApp · {siteConfig.phone.display}
            </a>
          </div>

          <div className="relative hidden justify-center lg:flex">
            <span className="absolute top-6 right-14 text-gold">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <span className="absolute bottom-8 left-10 text-gold">
              <SparkleIcon className="h-4 w-4" />
            </span>
            <LotusMark showText className="h-[19rem] w-[19rem] drop-shadow-[0_24px_40px_rgba(45,74,59,0.25)]" />
          </div>
        </div>
      </section>

      {/* Category tabs — each opens its own page */}
      <section className="border-b border-sage/40 bg-cream">
        <CategoryTabs />
      </section>

      {/* Special offers — a small strip, full details on /offers */}
      <OffersBand />

      {/* About teaser */}
      <section className="relative overflow-hidden bg-cream">
        <div className="blob-forest pointer-events-none absolute top-[-4rem] right-[-9rem] bottom-[-4rem] hidden w-[38%] lg:block" />
        <LeafSprig className="pointer-events-none absolute right-6 bottom-0 hidden h-64 w-36 text-cream/15 lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.15fr_0.8fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <HeartDoodle className="absolute -top-8 -left-6 h-10 w-10 -rotate-12 text-forest/60" />
            <HeartDoodle className="absolute -right-5 bottom-14 h-7 w-7 rotate-12 text-rose/70" />
            <div className="card-surface -rotate-2 rounded-md p-3 pb-9">
              <div className="relative aspect-5/4 overflow-hidden rounded-sm">
                <Image
                  src="/images/about-studio.jpg"
                  alt="A mug of paintbrushes beside a stack of pastel books and a pink lotus"
                  fill
                  sizes="(max-width: 1024px) 90vw, 30vw"
                  className="object-cover"
                />
              </div>
              <p className="script mt-3 text-center text-2xl text-forest">dream • plan • create</p>
            </div>
            <span className="tape top-[-0.5rem] left-8 -rotate-6" aria-hidden />
            <span className="tape top-[-0.5rem] right-8 rotate-6" aria-hidden />
          </div>

          <div className="lg:px-4">
            <Eyebrow>About Us</Eyebrow>
            <h2 className="mt-3">
              <BrandHeading size="md" />
            </h2>
            <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-ink-soft">
              We are a creative brand inspired by art, nature and self-expression. From aesthetic creations to
              meaningful gifts, we bring a touch of elegance to your everyday life.
            </p>
            <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
              We make <strong className="font-medium text-forest">alpona, rangolis, fabric paintings, designing arts, festive gift hampers, greeting cards,
              photo framing &amp; polaroids and customised diaries</strong> — each in Basic, Premium and Customise
              levels at minimal prices. Custom orders are always welcome.
            </p>
            <p className="script mt-4 text-[1.9rem] leading-none text-forest">
              Let&apos;s create something beautiful together <span className="text-rose">♡</span>
            </p>
            <Link href="/about" className="btn btn-primary mt-6">
              Know More
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <ul className="card-surface relative grid gap-5 rounded-[1.6rem] p-6 lg:bg-cream/95">
            {promises.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/30 bg-ivory text-forest">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block font-display text-[1.2rem] font-semibold leading-tight text-forest">{item.title}</span>
                  <span className="text-[0.82rem] text-ink-soft">{item.copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured — a single compact row, swipeable on mobile */}
      <section className="border-t border-sage/40 bg-linen/50">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Fresh from the studio</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(1.9rem,3.8vw,2.7rem)] leading-tight">
                Loved pieces, <span className="script">from ₹99</span>
              </h2>
              <p className="prose-note mt-1 max-w-md">Every piece in three levels — Basic, Premium and Customise.</p>
            </div>
            <Link href="/shop" className="btn btn-outline self-start sm:self-auto">
              Visit the store
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="snap-row mt-7 -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {featured.map((product, index) => (
              <div key={product.slug} className="w-[72vw] shrink-0 sm:w-[46vw] lg:w-auto">
                <ProductCard product={product} priority={index < 2} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
