import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';
import { useStudioCatalog } from '../context/StudioCatalogContext';
import { ResilientImage } from '../components/ResilientImage';
import { FaqAccordion } from '../components/FaqAccordion';
import atelierStudioImg from '../assets/images/about_atelier_studio_1794649392696.jpg';
import pressedFolioImg from '../assets/images/product_pressed_folio_1794649393455.jpg';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { offerings } = useStudioCatalog();
  const navigateTo = (page: PageRoute) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-20 space-y-16">
      {/* Intro Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6 space-y-5">
          <p className="script-accent text-2xl text-[#CF6C87]">About the Studio</p>
          <h1
            className="font-display text-4xl sm:text-5xl font-semibold text-[#183923] leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            Inspired by art, nature, and meaningful self-expression.
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#183923]/80">
            MITSU Crntzz was created to bring handmade elegance into everyday life—without
            intimidating luxury markups. Every painting, greeting card, polaroid keepsake, and
            festive hamper is finished by hand at minimal prices.
          </p>
          <p className="text-[15px] leading-[1.7] text-[#183923]/80">
            We craft across our signature handmade collection:
          </p>
          <ul className="flex flex-wrap gap-2">
            {offerings.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[#A8B18F] bg-[#FDF9F4] px-3 py-1 font-display text-[15px] font-semibold text-[#183923]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <ResilientImage
            src={atelierStudioImg}
            alt="Inside the MITSU Crntzz botanical art studio with natural mineral pigments and pressed leaves"
            aspectClassName="aspect-[4/3]"
            className="rounded-2xl border border-[#A8B18F]/60"
            titleFallback="MITSU Crntzz Studio Worktable"
          />
        </div>
      </section>

      {/* Three Pillars */}
      <section className="border-y border-[#A8B18F]/45 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2.5">
            <span className="script-accent text-2xl text-[#CF6C87]">01. Botanical &amp; Honest</span>
            <h2 className="font-display text-2xl font-semibold text-[#183923]">
              Eco-Friendly Craft
            </h2>
            <p className="text-[14px] leading-relaxed text-[#183923]/75">
              Handmade cotton rag paper, pressed blooms, eternal ribbon &amp; paper florals,
              and kraft ribbon packaging without plastic filler.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="script-accent text-2xl text-[#CF6C87]">02. Three Clear Levels</span>
            <h2 className="font-display text-2xl font-semibold text-[#183923]">
              Basic, Premium &amp; Personalised
            </h2>
            <p className="text-[14px] leading-relaxed text-[#183923]/75">
              From a ₹29 bookmark or ₹49 greeting card to a Platinum gift hamper, you choose
              the exact level that fits your occasion and budget.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="script-accent text-2xl text-[#CF6C87]">03. Cultural Reverence</span>
            <h2 className="font-display text-2xl font-semibold text-[#183923]">
              Dedicated Rangoli &amp; Devotional Wing
            </h2>
            <p className="text-[14px] leading-relaxed text-[#183923]/75">
              Traditional Indian rangoli, alpona, and devotional artwork live in their own dedicated
              heritage gallery, separate from everyday lifestyle items.
            </p>
          </div>
        </div>
      </section>

      {/* Studio FAQ Accordion */}
      <FaqAccordion onNavigate={navigateTo} />

      {/* Bottom CTA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-t border-[#A8B18F]/45 pt-14">
        <div className="lg:col-span-5">
          <ResilientImage
            src={pressedFolioImg}
            alt="Handmade cotton rag cards tied with sage silk ribbon and lotus wax seal"
            aspectClassName="aspect-[4/3]"
            className="rounded-2xl border border-[#A8B18F]/60"
            titleFallback="Handmade Stationery Craft"
          />
        </div>

        <div className="lg:col-span-7 space-y-5">
          <p className="script-accent text-2xl text-[#CF6C87]">Personal Confirmation</p>
          <h2 className="font-display text-3xl font-semibold text-[#183923]">
            Direct WhatsApp &amp; Email Ordering — No Hidden Fees.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#183923]/80 max-w-2xl">
            Every order or custom brief is shared directly with our studio on WhatsApp and Email so
            we can confirm custom details, making time, and exact delivery charges before any payment.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              <span>Browse the Store</span>
              <ArrowRight className="w-4 h-4 text-[#E9A9AA]" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('custom')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#183923]/40 text-[#183923] font-display text-[16px] font-semibold hover:bg-[#EFE4D3] transition-colors cursor-pointer"
            >
              <span>Request a Custom Order</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
