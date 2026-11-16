import React, { useEffect, useState } from 'react';
import { ArrowRight, Maximize2, Settings2, X } from 'lucide-react';
import { GalleryCollection, GalleryPiece, PageRoute, StudioManagerTab } from '../types';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useStudioCatalog } from '../context/StudioCatalogContext';
import { ResilientImage } from '../components/ResilientImage';

interface GalleryPageProps {
  onNavigate: (page: PageRoute) => void;
  onOpenStudioManager?: (tab?: StudioManagerTab) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate, onOpenStudioManager }) => {
  const { isOwnerVerified } = useOwnerAuth();
  const { galleryPieces, galleryCollections } = useStudioCatalog();
  const [activeCollection, setActiveCollection] = useState<'All' | GalleryCollection>('All');
  const [lightboxPiece, setLightboxPiece] = useState<GalleryPiece | null>(null);

  useEffect(() => {
    if (!lightboxPiece) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPiece(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxPiece]);

  const tabs: ('All' | GalleryCollection)[] = ['All', ...galleryCollections];

  useEffect(() => {
    if (activeCollection !== 'All' && !galleryCollections.includes(activeCollection)) {
      setActiveCollection('All');
    }
  }, [activeCollection, galleryCollections]);

  const visibleCollections =
    activeCollection === 'All' ? galleryCollections : [activeCollection];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#A8B18F]/45">
        <div className="space-y-2 max-w-2xl">
          <p className="script-accent text-2xl text-[#CF6C87]">Creations &amp; Heritage Archive</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#183923]">
            The Studio Gallery
          </h1>
          <p className="text-[15px] leading-relaxed text-[#183923]/75">
            Recent studio works, botanical studies, and a dedicated cultural wing preserving
            traditional Indian rangoli and devotional artwork separate from the main storefront.
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          {isOwnerVerified && onOpenStudioManager && (
            <button
              type="button"
              onClick={() => onOpenStudioManager('collections')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDF9F4] border border-[#CF6C87]/70 text-[12.5px] font-medium text-[#183923] hover:bg-[#F9E4E7] transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#CF6C87]" />
              <span>Manage Collections</span>
            </button>
          )}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gallery collections">
            {tabs.map((tab) => {
              const active = activeCollection === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCollection(tab)}
                  className={`px-4 py-2 rounded-full border font-display text-[15px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                      : 'bg-[#FDF9F4] text-[#183923] border-[#A8B18F]/60 hover:border-[#183923]'
                  }`}
                >
                  {tab === 'All' ? 'All Collections' : tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Gallery Collection Sections */}
      {visibleCollections.map((collectionName) => {
        const works = galleryPieces.filter((piece) => piece.collection === collectionName);
        if (works.length === 0 && activeCollection === 'All') return null;
        const isHeritage = collectionName === 'Rangoli & Devotional';

        if (isHeritage) {
          return (
            <section
              key={collectionName}
              aria-labelledby="heritage-heading"
              className="bg-[#EFE4D3]/70 border border-[#B69A64]/45 rounded-3xl p-6 sm:p-10 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#B69A64]/30">
                <div className="space-y-2 max-w-2xl">
                  <p className="script-accent text-2xl text-[#CF6C87]">
                    Dedicated Heritage Wing · Indian Creative Work
                  </p>
                  <h2
                    id="heritage-heading"
                    className="font-display text-3xl sm:text-4xl font-semibold text-[#183923]"
                  >
                    Traditional Rangoli &amp; Devotional Art
                  </h2>
                  <p className="text-[14px] leading-relaxed text-[#183923]/80">
                    Kept in its own dedicated gallery space separate from our botanical retail line.
                    Every courtyard mandala and devotional tempera study honors traditional Indian
                    iconography, organic flower petals, rice flour, and natural mineral pigments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('custom');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 font-display text-[16px] font-semibold text-[#183923] underline underline-offset-4 decoration-[#B69A64] hover:text-[#CF6C87] whitespace-nowrap cursor-pointer self-start md:self-auto"
                >
                  <span>Commission Custom Rangoli</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {works.map((piece) => (
                  <article
                    key={piece.id}
                    className="group bg-[#FDF9F4] border border-[#B69A64]/45 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxPiece(piece)}
                      className="relative block w-full overflow-hidden text-left cursor-pointer"
                    >
                      <ResilientImage
                        src={piece.image}
                        alt={piece.title}
                        aspectClassName="aspect-[4/3]"
                        className="group-hover:[&_img]:scale-[1.03]"
                        titleFallback={piece.title}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-[#183923]/85 text-[#F8F0E4] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </button>

                    <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[12px] text-[#7C6536]">
                          <span>{piece.collection}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{piece.year}</span>
                          <span aria-hidden="true">·</span>
                          <span>{piece.locationOrContext}</span>
                        </div>
                        <h3 className="font-display text-2xl font-semibold text-[#183923]">
                          {piece.title}
                        </h3>
                        <p className="text-[13px] text-[#183923]/75 leading-relaxed">
                          {piece.description}
                        </p>
                      </div>

                      <p className="pt-3 border-t border-[#B69A64]/25 text-[12px] text-[#183923]/65">
                        {piece.medium} · {piece.dimensions}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={collectionName} className="space-y-8">
            <div className="space-y-2 max-w-2xl">
              <p className="script-accent text-2xl text-[#CF6C87]">Studio Archive</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#183923]">
                {collectionName === 'Botanical & Studio'
                  ? 'Botanical & Designing Arts'
                  : collectionName}
              </h2>
              <p className="text-[14px] leading-relaxed text-[#183923]/75">
                {collectionName === 'Botanical & Studio'
                  ? 'Realistic floral paintings, alpona paper studies, and pressed-flora keepsakes created in gouache, mineral watercolor, and antique gold leaf.'
                  : `Curated studio showcase pieces from the ${collectionName} collection.`}
              </p>
            </div>

            {works.length === 0 ? (
              <div className="rounded-2xl border border-[#A8B18F]/50 bg-[#FDF9F4] p-8 text-center text-[14px] text-[#183923]/70">
                No pieces added to this collection yet. Use “Manage Collections” above to add artworks.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {works.map((piece) => (
                  <article
                    key={piece.id}
                    className="group bg-[#FDF9F4] border border-[#A8B18F]/50 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxPiece(piece)}
                      className="relative block w-full overflow-hidden text-left cursor-pointer"
                    >
                      <ResilientImage
                        src={piece.image}
                        alt={piece.title}
                        aspectClassName="aspect-[4/3]"
                        className="group-hover:[&_img]:scale-[1.03]"
                        titleFallback={piece.title}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-[#183923]/85 text-[#F8F0E4] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </button>

                    <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[12px] text-[#7C6536]">
                          <span>{piece.collection}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{piece.year}</span>
                          <span aria-hidden="true">·</span>
                          <span>{piece.locationOrContext}</span>
                        </div>
                        <h3 className="font-display text-2xl font-semibold text-[#183923]">
                          {piece.title}
                        </h3>
                        <p className="text-[13px] text-[#183923]/75 leading-relaxed">
                          {piece.description}
                        </p>
                      </div>

                      <p className="pt-3 border-t border-[#A8B18F]/25 text-[12px] text-[#183923]/65">
                        {piece.medium} · {piece.dimensions}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Fullscreen Lightbox */}
      {lightboxPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#183923]/85 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPiece.title}
        >
          <div
            className="fixed inset-0"
            onClick={() => setLightboxPiece(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-5xl bg-[#F8F0E4] text-[#183923] border border-[#B69A64] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]">
            <button
              type="button"
              onClick={() => setLightboxPiece(null)}
              aria-label="Close lightbox"
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-[#183923] text-[#F8F0E4] hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="lg:col-span-8 bg-[#183923] flex items-center justify-center p-2">
              <ResilientImage
                src={lightboxPiece.image}
                alt={lightboxPiece.title}
                aspectClassName="aspect-[4/3] w-full"
                objectFit="contain"
                className="!bg-[#183923]"
                titleFallback={lightboxPiece.title}
              />
            </div>

            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[12px] text-[#7C6536]">
                  <span>{lightboxPiece.collection}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{lightboxPiece.year}</span>
                </div>
                <h2 className="font-display text-3xl font-semibold text-[#183923] leading-tight">
                  {lightboxPiece.title}
                </h2>
                <p className="text-[14px] leading-relaxed text-[#183923]/80">
                  {lightboxPiece.description}
                </p>
              </div>

              <dl className="pt-4 border-t border-[#A8B18F]/40 space-y-2.5 text-[13px]">
                <div>
                  <dt className="text-[#183923]/60">Medium</dt>
                  <dd className="text-[#183923] mt-0.5">{lightboxPiece.medium}</dd>
                </div>
                <div>
                  <dt className="text-[#183923]/60">Dimensions</dt>
                  <dd className="text-[#183923] mt-0.5">{lightboxPiece.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-[#183923]/60">Context</dt>
                  <dd className="text-[#183923] mt-0.5">{lightboxPiece.locationOrContext}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
