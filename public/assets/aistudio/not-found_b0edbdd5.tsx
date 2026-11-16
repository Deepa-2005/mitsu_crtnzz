import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { LotusLineArt } from "@/components/motif";
import { buildGeneralHelpMessage } from "@/lib/messages";
import { buildWhatsAppLink } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative mx-auto grid min-h-[55vh] max-w-3xl place-items-center overflow-hidden px-5 py-16 text-center sm:px-8">
      <LotusLineArt className="pointer-events-none absolute -top-6 left-1/2 h-40 w-52 -translate-x-1/2 text-sage/50" />
      <div className="relative">
        <p className="eyebrow">404 · not found</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4rem)] leading-tight">
          This page has <span className="script">wandered off</span>
        </h1>
        <p className="prose-note mx-auto mt-3 max-w-md">
          The piece or page you were looking for isn&apos;t here. Explore the store, or message us and we&apos;ll point
          you the right way.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Browse the store
          </Link>
          <a href={buildWhatsAppLink(buildGeneralHelpMessage())} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
