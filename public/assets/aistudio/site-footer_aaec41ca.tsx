import Link from "next/link";
import { LotusMark, Wordmark } from "@/components/brand";
import { InstagramIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { LeafSprig } from "@/components/motif";
import { buildGeneralHelpMessage } from "@/lib/messages";
import { buildWhatsAppLink, categoryTabs, navigation, siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const helpLink = buildWhatsAppLink(buildGeneralHelpMessage());

  return (
    <footer className="relative mt-16 overflow-hidden bg-forest text-cream">
      <LeafSprig className="pointer-events-none absolute -top-6 right-6 h-56 w-32 text-cream/10" />
      <LeafSprig className="pointer-events-none absolute -bottom-10 left-2 h-48 w-28 -scale-x-100 text-cream/10" />
      <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-cream/95 p-[3px]">
                <LotusMark className="h-full w-full" />
              </span>
              <Wordmark tone="light" />
            </div>
            <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-cream/75">
              A creative brand inspired by art, nature and self-expression — handmade pieces and meaningful gifts for
              your everyday life.
            </p>
            <p className="script mt-3 text-2xl text-blush">{siteConfig.motto.replaceAll(" · ", " • ")}</p>
          </div>

          <nav aria-label="Footer" className="text-[0.92rem]">
            <h2 className="font-display text-lg font-semibold tracking-[0.12em] text-blush uppercase">Explore</h2>
            <ul className="mt-3 space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-cream/80 transition-colors hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" className="text-cream/80 transition-colors hover:text-cream">
                  Your Bag
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Categories" className="text-[0.92rem]">
            <h2 className="font-display text-lg font-semibold tracking-[0.12em] text-blush uppercase">Discover</h2>
            <ul className="mt-3 space-y-2">
              {categoryTabs.map((tab) => (
                <li key={tab.href}>
                  <Link href={tab.href} className="text-cream/80 transition-colors hover:text-cream">
                    {tab.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/custom-orders" className="text-cream/80 transition-colors hover:text-cream">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-cream/80 transition-colors hover:text-cream">
                  Special Offers
                </Link>
              </li>
            </ul>
          </nav>

          <div className="text-[0.92rem]">
            <h2 className="font-display text-lg font-semibold tracking-[0.12em] text-blush uppercase">Say hello</h2>
            <ul className="mt-3 space-y-3">
              <li>
                <a href={helpLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-cream/80 hover:text-cream">
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush" />
                  <span>
                    WhatsApp
                    <span className="block text-cream">{siteConfig.phone.display}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email.address}`} className="flex items-start gap-3 text-cream/80 hover:text-cream">
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush" />
                  <span>
                    Email
                    <span className="block break-all text-cream">{siteConfig.email.address}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`tel:+${siteConfig.phone.number}`} className="flex items-start gap-3 text-cream/80 hover:text-cream">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush" />
                  <span>
                    Call
                    <span className="block text-cream">{siteConfig.phone.display}</span>
                  </span>
                </a>
              </li>
              {siteConfig.socials.instagram ? (
                <li>
                  <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-cream/80 hover:text-cream">
                    <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush" />
                    <span>Instagram</span>
                  </a>
                </li>
              ) : null}
            </ul>
            <a href={helpLink} target="_blank" rel="noopener noreferrer" className="btn btn-blush mt-5 w-full">
              <WhatsAppIcon className="h-4 w-4" />
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-cream/15 pt-5 text-[0.74rem] text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. {siteConfig.studio.location}. Prices in INR.
          </p>
          <p className="sm:text-right">Orders are confirmed personally on WhatsApp — delivery charges are shared before payment.</p>
        </div>
      </div>
    </footer>
  );
}
