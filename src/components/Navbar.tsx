import React, { useState } from 'react';
import { Lock, Menu, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { PageRoute } from '../types';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { LotusMark } from './BrandMark';
import { OwnerLoginModal } from './OwnerLoginModal';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const NAV_ITEMS: { id: PageRoute; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'shop', label: 'Shop' },
  { id: 'custom', label: 'Custom Creations' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'journal', label: 'Journal' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
}) => {
  const { isOwnerVerified } = useOwnerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  const handleSelectPage = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#183923] text-[#F8F0E4] shadow-[0_10px_28px_-18px_rgba(24,57,35,0.85)] border-b border-[#B69A64]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4 lg:gap-6">
          {/* Zone 1: Brand Wordmark + Lotus Badge */}
          <button
            type="button"
            onClick={() => handleSelectPage('home')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9A9AA]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F8F0E4] p-[2px] shrink-0">
              <LotusMark className="h-full w-full" />
            </span>
            <span className="inline-flex items-baseline gap-1.5">
              <span className="font-display text-[22px] font-semibold tracking-[0.14em] text-[#F8F0E4]">
                MITSU
              </span>
              <span className="script-accent text-[25px] text-[#E9A9AA] leading-none">Crntzz</span>
            </span>
          </button>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-4 xl:gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1.5 font-display text-[17px] font-medium tracking-[0.03em] whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9A9AA] ${
                    isActive
                      ? 'text-[#F8F0E4]'
                      : 'text-[#F8F0E4]/75 hover:text-[#F8F0E4]'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#E9A9AA] transition-transform duration-200 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Owner Login Modal Trigger + Bag Action + Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setOwnerModalOpen(true)}
              aria-label={isOwnerVerified ? 'Owner session active — manage studio' : 'Owner sign in'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12.5px] font-medium border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9A9AA] ${
                isOwnerVerified
                  ? 'bg-[#2d4a3b] border-[#A8B18F]/70 text-[#F8F0E4] hover:border-[#E9A9AA]'
                  : 'bg-transparent border-[#F8F0E4]/30 text-[#F8F0E4]/90 hover:border-[#E9A9AA] hover:text-[#E9A9AA]'
              }`}
            >
              {isOwnerVerified ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#A8B18F]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#E9A9AA]" />
              )}
              <span className="hidden sm:inline">
                {isOwnerVerified ? 'Studio Owner' : 'Owner'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open shopping bag, ${cartCount} items`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-[#183923] bg-[#E9A9AA] hover:bg-[#f0b8b9] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9A9AA]"
            >
              <ShoppingBag className="w-4 h-4 text-[#183923]" strokeWidth={1.7} />
              <span>Bag</span>
              <span className="tabular-nums font-semibold">({cartCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#F8F0E4] border border-[#F8F0E4]/25 hover:bg-[#F8F0E4]/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden bg-[#183923] border-t border-[#F8F0E4]/15 px-5 py-4 space-y-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left font-display text-xl transition-colors cursor-pointer border-b border-[#F8F0E4]/10 ${
                    isActive ? 'text-[#E9A9AA]' : 'text-[#F8F0E4]/90 hover:text-[#F8F0E4]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="script-accent text-lg text-[#E9A9AA]">Current</span>}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setOwnerModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left font-display text-xl text-[#E9A9AA] cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                {isOwnerVerified ? (
                  <ShieldCheck className="w-4 h-4 text-[#A8B18F]" />
                ) : (
                  <Lock className="w-4 h-4 text-[#E9A9AA]" />
                )}
                <span>{isOwnerVerified ? 'Studio Owner Session' : 'Owner Sign-In'}</span>
              </span>
            </button>
          </nav>
        )}
      </header>

      <OwnerLoginModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
        onVerifiedSuccess={() => handleSelectPage('studio')}
      />
    </>
  );
};
