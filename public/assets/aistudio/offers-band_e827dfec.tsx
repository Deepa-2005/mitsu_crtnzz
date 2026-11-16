import Link from "next/link";
import { ArrowIcon, ClockIcon, TagIcon, WhatsAppIcon } from "@/components/icons";
import { buildOfferClaimMessage } from "@/lib/messages";
import { formatOfferDate, getActiveOffers, type Offer } from "@/lib/offers";
import { buildWhatsAppLink } from "@/lib/site";

function OfferCard({ offer }: { offer: Offer }) {
  const claimLink = buildWhatsAppLink(buildOfferClaimMessage(offer));
  return (
    <li className="flex h-full flex-col rounded-[1.4rem] border-2 border-dashed border-rose/50 bg-ivory/90 p-5">
      <p className="flex flex-wrap items-center justify-between gap-2">
        <span className="chip border-rose/60! text-rose!">
          <TagIcon className="h-3.5 w-3.5" />
          {offer.badge}
        </span>
        <span className="rounded-full bg-forest px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-cream uppercase">
          {offer.code}
        </span>
      </p>
      <h3 className="mt-3 font-display text-[1.4rem] leading-tight text-forest">{offer.title}</h3>
      <p className="script text-[1.9rem] leading-none text-rose">{offer.discount}</p>
      <p className="prose-note mt-2 flex-1 text-[0.84rem]">{offer.description}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[0.74rem] tracking-[0.06em] text-ink-soft uppercase">
        <ClockIcon className="h-3.5 w-3.5 text-moss" />
        Valid until {formatOfferDate(offer.validUntil)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={claimLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp flex-1 px-4 py-2 text-[0.92rem]">
          <WhatsAppIcon className="h-4 w-4" />
          Claim
        </a>
        {offer.productSlug ? (
          <Link href={`/shop/${offer.productSlug}`} className="btn btn-outline flex-1 px-4 py-2 text-[0.92rem]">
            View piece
          </Link>
        ) : (
          <Link href="/shop" className="btn btn-outline flex-1 px-4 py-2 text-[0.92rem]">
            Shop
          </Link>
        )}
      </div>
    </li>
  );
}

/** Small special-offers strip. Hides itself when no offer is live. */
export function OffersBand({ limit = 3 }: { limit?: number }) {
  const active = getActiveOffers().slice(0, limit);
  if (active.length === 0) return null;

  return (
    <section aria-labelledby="offers-heading" className="border-b border-sage/40 bg-petal/40">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Special Offers</p>
            <h2 id="offers-heading" className="mt-2 font-display text-[clamp(1.9rem,3.8vw,2.7rem)] leading-tight">
              Little extras, <span className="script">for now</span>
            </h2>
          </div>
          <Link href="/offers" className="inline-flex items-center gap-1.5 self-start font-display text-[1rem] font-semibold text-forest hover:text-rose sm:self-auto">
            All offers &amp; terms
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {active.map((offer) => (
            <OfferCard key={offer.slug} offer={offer} />
          ))}
        </ul>
      </div>
    </section>
  );
}
