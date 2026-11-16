import React from 'react';
import { Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { PageRoute } from '../types';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { buildWhatsAppLink, siteConfig } from '../lib/site';
import { LeafSprig, LotusMark, WhatsAppIcon } from './BrandMark';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isOwnerVerified } = useOwnerAuth();
  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappHelp = buildWhatsAppLink(
    `Hello ${siteConfig.name} ♡ I'd love some help choosing a handmade piece or placing a custom order.`
  );

  return (
    <footer className="relative overflow-hidden bg-[#183923] text-[#F8F0E4] border-t border-[#B69A64]/30">
      <LeafSprig className="pointer-events-none absolute -top-6 right-6 h-52 w-32 text-[#F8F0E4]/10" />
      <LeafSprig className="pointer-events-none absolute -bottom-10 left-2 h-44 w-28 -scale-x-100 text-[#F8F0E4]/10" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#F8F0E4]/15">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-13 w-13 place-items-center rounded-full bg-[#F8F0E4] p-[3px] shrink-0">
                <LotusMark className="h-full w-full" />
              </span>
              <div className="inline-flex flex-col leading-none">
                <span className="font-display text-2xl font-semibold tracking-[0.16em] text-[#F8F0E4]">
                  {siteConfig.shortName}
                </span>
                <span className="script-accent -mt-1.5 self-end text-2xl text-[#E9A9AA]">
                  {siteConfig.scriptName}
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-[#F8F0E4]/80 max-w-sm">
              A creative handmade studio inspired by art, nature, and self-expression — crafting
              greeting cards, bookmarks, mini scrapbooks, handmade bouquets, kolka art, photo
              frames, memory jars, and gift hampers at minimal prices.
            </p>
            <p className="script-accent text-2xl text-[#E9A9AA]">{siteConfig.motto}</p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-display text-lg font-semibold tracking-[0.12em] text-[#E9A9AA] uppercase">
              Explore
            </h3>
            <ul className="space-y-2 text-[14px] text-[#F8F0E4]/85">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  About the Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shop')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  Our Store (From ₹29)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('custom')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  Custom Creations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('gallery')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  Gallery &amp; Rangoli Heritage
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('journal')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  Journal &amp; DIY Ideas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-[#E9A9AA] transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('studio')}
                  className="inline-flex items-center gap-1.5 hover:text-[#E9A9AA] transition-colors cursor-pointer text-[#E9A9AA]/90"
                >
                  {isOwnerVerified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A8B18F]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#E9A9AA]/75" />
                  )}
                  <span>{isOwnerVerified ? 'Studio Manager (Owner)' : 'Owner Portal'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Studio Contact */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-display text-lg font-semibold tracking-[0.12em] text-[#E9A9AA] uppercase">
              Say Hello
            </h3>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a
                  href={whatsappHelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#F8F0E4]/85 hover:text-[#E9A9AA] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#E9A9AA] mt-0.5 shrink-0" />
                  <span>
                    WhatsApp
                    <span className="block text-[#F8F0E4] tabular-nums">
                      {siteConfig.phone.display}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email.address}`}
                  className="flex items-start gap-3 text-[#F8F0E4]/85 hover:text-[#E9A9AA] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#E9A9AA] mt-0.5 shrink-0" />
                  <span>
                    Email
                    <span className="block break-all text-[#F8F0E4]">
                      {siteConfig.email.address}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${siteConfig.phone.number}`}
                  className="flex items-start gap-3 text-[#F8F0E4]/85 hover:text-[#E9A9AA] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#E9A9AA] mt-0.5 shrink-0" />
                  <span>
                    Call
                    <span className="block text-[#F8F0E4] tabular-nums">
                      {siteConfig.phone.display}
                    </span>
                  </span>
                </a>
              </li>
            </ul>

            <a
              href={whatsappHelp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 rounded-full bg-[#E9A9AA] text-[#183923] font-display text-[16px] font-semibold hover:bg-[#f0b8b9] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-[#F8F0E4]/65">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.studio.location}. Prices in
            INR.
          </p>
          <p>
            Orders are confirmed personally via WhatsApp &amp; Email — delivery charges are shared
            before payment.
          </p>
        </div>
      </div>
    </footer>
  );
};
