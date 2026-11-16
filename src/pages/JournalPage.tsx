import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { JournalArticle, JournalCategory } from '../types';
import { JOURNAL_ARTICLES } from '../data/journal';
import { ResilientImage } from '../components/ResilientImage';

interface JournalPageProps {
  initialCategory?: 'All' | JournalCategory;
}

const JOURNAL_FILTERS: ('All' | JournalCategory)[] = [
  'All',
  'DIY Ideas',
  'Botanical Craft',
  'Heritage & Rangoli',
  'Studio Notes',
];

export const JournalPage: React.FC<JournalPageProps> = ({ initialCategory = 'All' }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | JournalCategory>(
    initialCategory
  );
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setActiveArticle(null);
  }, [initialCategory]);

  const visibleArticles =
    selectedCategory === 'All'
      ? JOURNAL_ARTICLES
      : JOURNAL_ARTICLES.filter((a) => a.category === selectedCategory);

  if (activeArticle) {
    return (
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-8">
        <button
          type="button"
          onClick={() => setActiveArticle(null)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#183923] hover:text-[#CF6C87] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Journal</span>
        </button>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#7C6536]">
            <span>{activeArticle.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activeArticle.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{activeArticle.readTime}</span>
          </div>

          <h1
            className="font-display text-3xl sm:text-5xl font-semibold text-[#183923] leading-[1.1]"
            style={{ textWrap: 'balance' }}
          >
            {activeArticle.title}
          </h1>

          <p className="text-[16px] text-[#183923]/75 leading-relaxed">{activeArticle.subtitle}</p>
        </header>

        <ResilientImage
          src={activeArticle.image}
          alt={activeArticle.title}
          aspectClassName="aspect-[16/10]"
          className="rounded-2xl border border-[#A8B18F]/55"
          titleFallback={activeArticle.title}
        />

        <div className="space-y-5 text-[16px] leading-[1.8] text-[#183923]/85 pt-2">
          {activeArticle.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <footer className="pt-8 border-t border-[#A8B18F]/40 flex items-center justify-between text-[13px] text-[#183923]/70">
          <span>Written by {activeArticle.author}</span>
          <button
            type="button"
            onClick={() => setActiveArticle(null)}
            className="underline underline-offset-4 decoration-[#CF6C87] text-[#183923] cursor-pointer"
          >
            Read More Notes &amp; DIY Ideas
          </button>
        </footer>
      </article>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#A8B18F]/45">
        <div className="space-y-2 max-w-2xl">
          <p className="script-accent text-2xl text-[#CF6C87]">Studio Notes &amp; DIY Guides</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#183923]">
            Journal &amp; DIY Ideas
          </h1>
          <p className="text-[15px] leading-relaxed text-[#183923]/75">
            Reflections on our three pricing levels, step-by-step home alpona guides, natural flora
            rangoli, and cotton rag correspondence.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Journal categories">
          {JOURNAL_FILTERS.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border font-display text-[15px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                    : 'bg-[#FDF9F4] text-[#183923] border-[#A8B18F]/60 hover:border-[#183923]'
                }`}
              >
                {cat === 'All' ? 'All Essays' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleArticles.map((article) => (
          <article
            key={article.id}
            className="group bg-[#FDF9F4] border border-[#A8B18F]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#CF6C87]"
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setActiveArticle(article);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block w-full overflow-hidden text-left cursor-pointer"
              >
                <ResilientImage
                  src={article.image}
                  alt={article.title}
                  aspectClassName="aspect-[4/3]"
                  className="group-hover:[&_img]:scale-[1.03]"
                  titleFallback={article.title}
                />
              </button>

              <div className="p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-[12px] text-[#7C6536]">
                  <span>{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.publishedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveArticle(article);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="block text-left cursor-pointer"
                >
                  <h2 className="font-display text-2xl sm:text-[26px] font-semibold text-[#183923] leading-snug group-hover:text-[#CF6C87] transition-colors">
                    {article.title}
                  </h2>
                </button>

                <p className="text-[14px] leading-relaxed text-[#183923]/75">{article.excerpt}</p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-[#A8B18F]/25 flex items-center justify-between">
              <span className="text-[12px] text-[#183923]/60">{article.author}</span>
              <button
                type="button"
                onClick={() => {
                  setActiveArticle(article);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 font-display text-[16px] font-semibold text-[#183923] hover:text-[#CF6C87] cursor-pointer"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
