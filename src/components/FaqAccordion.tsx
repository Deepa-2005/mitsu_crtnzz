import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Package, Sparkles, Truck } from 'lucide-react';
import { FAQ_CATEGORIES, FaqCategory, STUDIO_FAQS } from '../data/faq';
import { PageRoute } from '../types';

interface FaqAccordionProps {
  onNavigate?: (page: PageRoute) => void;
}

const CATEGORY_ICON: Record<Exclude<FaqCategory, 'All'>, React.ReactNode> = {
  Shipping: <Truck className="w-3.5 h-3.5 text-[#CF6C87]" />,
  'Custom Commissions': <Sparkles className="w-3.5 h-3.5 text-[#CF6C87]" />,
  'Care Instructions': <Package className="w-3.5 h-3.5 text-[#CF6C87]" />,
};

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('All');
  const [openId, setOpenId] = useState<string | null>(STUDIO_FAQS[0]?.id ?? null);

  const visibleFaqs =
    selectedCategory === 'All'
      ? STUDIO_FAQS
      : STUDIO_FAQS.filter((item) => item.category === selectedCategory);

  const handleCategoryChange = (category: FaqCategory) => {
    setSelectedCategory(category);
    const nextList =
      category === 'All'
        ? STUDIO_FAQS
        : STUDIO_FAQS.filter((item) => item.category === category);
    if (nextList.length > 0 && !nextList.some((item) => item.id === openId)) {
      setOpenId(nextList[0].id);
    }
  };

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="studio-faq"
      aria-labelledby="faq-heading"
      className="border-t border-[#A8B18F]/45 pt-14 space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <p className="script-accent text-2xl text-[#CF6C87]">Frequently Asked Questions</p>
          <h2
            id="faq-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-[#183923] leading-tight"
          >
            Shipping, Custom Commissions &amp; Craft Care
          </h2>
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#183923]/75">
            Answers to common questions before placing an order or caring for your handmade keepsake.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter studio FAQs by topic"
          className="flex flex-wrap gap-2"
        >
          {FAQ_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategoryChange(category)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#183923] text-[#F8F0E4] shadow-sm'
                    : 'bg-[#FDF9F4] text-[#183923] border border-[#A8B18F]/60 hover:bg-[#EFE4D3]'
                }`}
              >
                {category !== 'All' && CATEGORY_ICON[category]}
                <span>{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {visibleFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          const panelId = `faq-panel-${faq.id}`;
          const buttonId = `faq-button-${faq.id}`;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-colors ${
                isOpen
                  ? 'bg-[#FDF9F4] border-[#CF6C87]/70 shadow-sm'
                  : 'bg-[#FDF9F4]/80 border-[#A8B18F]/55 hover:border-[#183923]/40'
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#CF6C87]">
                      {CATEGORY_ICON[faq.category]}
                      <span>{faq.category}</span>
                    </span>
                    <p className="font-display text-xl sm:text-[22px] font-semibold text-[#183923] leading-snug">
                      {faq.question}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 grid place-items-center w-9 h-9 rounded-full border transition-all ${
                      isOpen
                        ? 'bg-[#183923] text-[#F8F0E4] border-[#183923] rotate-180'
                        : 'bg-[#F8F0E4] text-[#183923] border-[#A8B18F]/60'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
              </h3>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-5 sm:px-7 pb-5 sm:pb-6 pt-1 border-t border-[#A8B18F]/25 space-y-3"
                >
                  <p className="text-[14px] sm:text-[15px] leading-[1.7] text-[#183923]/80">
                    {faq.answer}
                  </p>
                  {faq.highlights && faq.highlights.length > 0 && (
                    <ul className="space-y-1.5 pl-1">
                      {faq.highlights.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-[13.5px] sm:text-[14px] leading-relaxed text-[#183923]/75"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 w-1.5 h-1.5 rounded-full bg-[#CF6C87] shrink-0"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle studio prompt */}
      {onNavigate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#EFE4D3]/70 border border-[#A8B18F]/50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#CF6C87] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-display text-xl font-semibold text-[#183923]">
                Still have a specific question?
              </p>
              <p className="text-[13.5px] text-[#183923]/75">
                Message the studio directly for custom hamper mixes, urgent delivery timelines, or bulk festive orders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[15px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
          >
            Contact the Studio
          </button>
        </div>
      )}
    </section>
  );
};
