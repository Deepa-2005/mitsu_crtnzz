import { WhatsAppIcon } from "@/components/icons";
import { buildGeneralHelpMessage } from "@/lib/messages";
import { buildWhatsAppLink, siteConfig } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={buildWhatsAppLink(buildGeneralHelpMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${siteConfig.name} on WhatsApp at ${siteConfig.phone.display}`}
      className="group fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-cream/40 bg-whatsapp px-4 py-3.5 text-cream shadow-[0_18px_38px_-16px_rgba(47,122,86,0.85)] transition-transform hover:scale-[1.03] sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden font-display text-[0.98rem] font-semibold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-44 group-hover:opacity-100">
        Message the studio
      </span>
    </a>
  );
}
