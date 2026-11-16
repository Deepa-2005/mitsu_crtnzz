"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LotusMark, Wordmark } from "@/components/brand";
import { useCart } from "@/components/cart-provider";
import { BagIcon, CloseIcon, MailIcon, MenuIcon, SearchIcon, WhatsAppIcon } from "@/components/icons";
import { buildGeneralHelpMessage } from "@/lib/messages";
import {
  buildWhatsAppLink,
  categoryTabs,
  FOLLOW_IS_EXTERNAL,
  FOLLOW_LINK,
  navigation,
  siteConfig,
} from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const helpLink = buildWhatsAppLink(buildGeneralHelpMessage());
  const count = hydrated ? itemCount : 0;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  const followProps = FOLLOW_IS_EXTERNAL ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header className="sticky top-0 z-50 bg-forest text-cream shadow-[0_10px_30px_-18px_rgba(36,48,41,0.8)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`} onClick={() => setMobileOpen(false)}>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-cream/95 p-[3px] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)] sm:h-14 sm:w-14">
            <LotusMark className="h-full w-full" />
          </span>
          <Wordmark tone="light" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative font-display text-[1.05rem] font-semibold tracking-[0.04em] transition-colors ${
                  active ? "text-cream" : "text-cream/80 hover:text-cream"
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-px w-full bg-blush transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/search"
            className="grid h-10 w-10 place-items-center rounded-full text-cream/85 transition-colors hover:bg-cream/10 hover:text-cream"
            aria-label="Search the site"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-cream/85 transition-colors hover:bg-cream/10 hover:text-cream"
            aria-label={`Your bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <BagIcon className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-blush px-1 text-[0.65rem] font-semibold text-forest">
              {count}
            </span>
          </Link>
          <Link href={FOLLOW_LINK} {...followProps} className="btn btn-blush hidden px-4 py-2 text-[0.95rem] sm:inline-flex">
            Follow Us <span aria-hidden>♡</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full text-cream hover:bg-cream/10 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-nav" className="animate-rise border-t border-cream/15 bg-forest px-5 pb-6 lg:hidden">
          <nav aria-label="Mobile" className="grid grid-cols-2 gap-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`border-b border-cream/10 py-3 font-display text-xl font-semibold ${
                  isActive(item.href) ? "text-blush" : "text-cream"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-[0.7rem] tracking-[0.22em] text-cream/60 uppercase">Explore</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-cream/25 px-3 py-1.5 font-display text-[0.95rem] font-semibold text-cream/90"
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a href={helpLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp {siteConfig.phone.display}
            </a>
            <a href={`mailto:${siteConfig.email.address}`} className="btn btn-light w-full">
              <MailIcon className="h-4 w-4" />
              {siteConfig.email.address}
            </a>
            <Link href={FOLLOW_LINK} {...followProps} onClick={() => setMobileOpen(false)} className="btn btn-blush w-full sm:col-span-2">
              Follow Us <span aria-hidden>♡</span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
