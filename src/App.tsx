import React, { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Check } from 'lucide-react';
import {
  CartItem,
  CheckoutFormPayload,
  JournalCategory,
  OrderConfirmationResult,
  PageRoute,
  Product,
  ProductCategory,
  PublicStudioConfig,
  SavedOrderLineItem,
  SavedOrderRecord,
  StudioManagerTab,
  TierKey,
} from './types';
import { useStudioCatalog } from './context/StudioCatalogContext';
import {
  buildEmailLink,
  buildWhatsAppLink,
  formatINR,
  normalizeWhatsAppNumber,
  siteConfig,
} from './lib/site';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppFab } from './components/BrandMark';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ShopPage } from './pages/ShopPage';
import { CustomCreationsPage } from './pages/CustomCreationsPage';
import { GalleryPage } from './pages/GalleryPage';
import { JournalPage } from './pages/JournalPage';
import { ContactPage } from './pages/ContactPage';
import { StudioManagerPage } from './pages/StudioManagerPage';

const VALID_ROUTES: PageRoute[] = [
  'home',
  'about',
  'shop',
  'custom',
  'gallery',
  'journal',
  'contact',
  'studio',
];

const CART_STORAGE_KEY = 'mitsu_crntzz_cart_v2';
const WISHLIST_STORAGE_KEY = 'mitsu_crntzz_wishlist_v1';
const ORDER_HISTORY_STORAGE_KEY = 'mitsu_crntzz_order_history_v1';

function parseRouteFromLocation(): PageRoute {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'dashboard') return 'studio';
  if (VALID_ROUTES.includes(hash as PageRoute)) return hash as PageRoute;

  const pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (pathSlug === 'dashboard' || pathSlug === 'studio') return 'studio';
  if (VALID_ROUTES.includes(pathSlug as PageRoute)) return pathSlug as PageRoute;

  return 'home';
}

function getInitialRoute(): PageRoute {
  return parseRouteFromLocation();
}

function createOrderReference(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MC-${num}-${code}`;
}

function formatCartOrderContents(
  items: CartItem[],
  payload: CheckoutFormPayload,
  reference: string,
  getProductBySlug: (slug: string) => Product | undefined,
  getTier: (product: Product, tierKey: TierKey) => Product['tiers'][number]
) {
  const lineSummaries: string[] = [];
  let subtotal = 0;
  let pricedCount = 0;
  let quotedCount = 0;

  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) continue;
    const tier = getTier(product, item.tier);
    if (tier.price === null) {
      quotedCount += item.quantity;
      lineSummaries.push(
        `• ${product.name} — ${tier.label} · Qty ${item.quantity} · price to be quoted`
      );
    } else {
      const lineTotal = tier.price * item.quantity;
      pricedCount += item.quantity;
      subtotal += lineTotal;
      lineSummaries.push(
        `• ${product.name} — ${tier.label} · Qty ${item.quantity} × ${formatINR(tier.price)} = ${formatINR(lineTotal)}`
      );
    }
  }

  const deliveryPinUrl = payload.deliveryLocation
    ? `https://www.google.com/maps/search/?api=1&query=${payload.deliveryLocation.lat},${payload.deliveryLocation.lng}`
    : null;

  const formattedMessage = [
    `Hello ${siteConfig.name} ♡`,
    `Order Enquiry · Ref ${reference}`,
    ``,
    `Items:`,
    ...lineSummaries,
    ``,
    pricedCount > 0
      ? `Subtotal (${pricedCount} priced ${pricedCount === 1 ? 'item' : 'items'}): ${formatINR(subtotal)}`
      : null,
    quotedCount > 0 ? `Customise item to be quoted: ${quotedCount}` : null,
    `Delivery charges: to be confirmed on WhatsApp`,
    ``,
    `Customer Details:`,
    `Name: ${payload.customerName}`,
    `WhatsApp: ${payload.customerPhone}`,
    payload.customerEmail ? `Email: ${payload.customerEmail}` : null,
    `Address: ${payload.shippingAddress}`,
    deliveryPinUrl ? `Location Pin: ${deliveryPinUrl}` : null,
    payload.notes ? `Notes: ${payload.notes}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return {
    formattedMessage,
    subtotal,
    pricedCount,
    quotedCount,
    deliveryPinUrl,
  };
}

export default function App() {
  const { getProductBySlug, getTier } = useStudioCatalog();
  const [currentPage, setCurrentPage] = useState<PageRoute>(getInitialRoute);
  const [studioManagerTab, setStudioManagerTab] = useState<StudioManagerTab>('products');
  const [shopCategory, setShopCategory] = useState<'All' | ProductCategory>('All');
  const [journalCategory, setJournalCategory] = useState<'All' | JournalCategory>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(
            (i) =>
              typeof i?.slug === 'string' &&
              ['basic', 'premium', 'customise'].includes(i?.tier) &&
              typeof i?.quantity === 'number'
          )
        : [];
    } catch {
      return [];
    }
  });
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
        : [];
    } catch {
      return [];
    }
  });
  const [orderHistory, setOrderHistory] = useState<SavedOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(
            (entry): entry is SavedOrderRecord =>
              typeof entry?.reference === 'string' &&
              typeof entry?.createdAt === 'string' &&
              Array.isArray(entry?.items)
          )
        : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationResult | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [studioConfig, setStudioConfig] = useState<PublicStudioConfig>({
    studioEmail: siteConfig.email.address,
    studioWhatsappNumber: siteConfig.phone.number,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '',
  });

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/public-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setStudioConfig((prev) => ({
          studioEmail:
            typeof data.studioEmail === 'string' && data.studioEmail.trim()
              ? data.studioEmail.trim()
              : prev.studioEmail,
          studioWhatsappNumber:
            typeof data.studioWhatsappNumber === 'string' && data.studioWhatsappNumber.trim()
              ? normalizeWhatsAppNumber(data.studioWhatsappNumber)
              : prev.studioWhatsappNumber,
          googleMapsApiKey:
            prev.googleMapsApiKey ||
            (typeof data.googleMapsApiKey === 'string' ? data.googleMapsApiKey.trim() : ''),
        }));
      })
      .catch(() => {
        // Keep fallback studioConfig when offline
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistSlugs));
    } catch {
      // Ignore storage write errors
    }
  }, [wishlistSlugs]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(orderHistory));
    } catch {
      // Ignore storage write errors
    }
  }, [orderHistory]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPage(parseRouteFromLocation());
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const navigateTo = (page: PageRoute) => {
    setCurrentPage(page);
    if (window.location.hash !== `#${page}`) {
      window.history.pushState(null, '', `#${page}`);
    }
  };

  const handleOpenShopCategory = (category: 'All' | ProductCategory) => {
    setShopCategory(category);
    navigateTo('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenJournalCategory = (category: 'All' | JournalCategory) => {
    setJournalCategory(category);
    navigateTo('journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudioManager = (tab: StudioManagerTab = 'products') => {
    setStudioManagerTab(tab);
    navigateTo('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, tier: TierKey, quantity = 1) => {
    setOrderConfirmation(null);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.slug === product.slug && item.tier === tier
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(20, updated[existingIndex].quantity + quantity),
        };
        return updated;
      }
      return [
        ...prev,
        {
          slug: product.slug,
          tier,
          quantity: Math.min(20, quantity),
        },
      ];
    });
    const tierLabel = getTier(product, tier).label;
    setToastMessage(`Added ${product.name} (${tierLabel}) to your bag`);
  };

  const handleQuickAdd = (product: Product, tier: TierKey = 'basic') => {
    handleAddToCart(product, tier, 1);
  };

  const handleUpdateQuantity = (slug: string, tier: TierKey, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.slug === slug && item.tier === tier
            ? { ...item, quantity: Math.min(20, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (slug: string, tier: TierKey) => {
    setCartItems((prev) => prev.filter((item) => !(item.slug === slug && item.tier === tier)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistSlugs((prev) => {
      const exists = prev.includes(product.slug);
      const next = exists ? prev.filter((s) => s !== product.slug) : [...prev, product.slug];
      setToastMessage(
        exists
          ? `Removed ${product.name} from Wishlist`
          : `Saved ${product.name} to Wishlist ♡`
      );
      return next;
    });
  };

  const handleClearWishlist = () => {
    setWishlistSlugs([]);
    setToastMessage('Cleared your Wishlist');
  };

  const handleReorderFromHistory = (order: SavedOrderRecord) => {
    setOrderConfirmation(null);
    setCartItems((prev) => {
      const next = [...prev];
      for (const line of order.items) {
        if (!getProductBySlug(line.slug)) continue;
        const idx = next.findIndex((i) => i.slug === line.slug && i.tier === line.tier);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: Math.min(20, next[idx].quantity + line.quantity),
          };
        } else {
          next.push({
            slug: line.slug,
            tier: line.tier,
            quantity: Math.min(20, Math.max(1, line.quantity)),
          });
        }
      }
      return next;
    });
    setToastMessage(`Added items from ${order.reference} to your bag`);
  };

  const handleRemoveOrderFromHistory = (reference: string) => {
    setOrderHistory((prev) => prev.filter((o) => o.reference !== reference));
  };

  const handleClearOrderHistory = () => {
    setOrderHistory([]);
    setToastMessage('Cleared saved Order History');
  };

  // Order confirmation logic triggered when a user completes their cart checkout.
  // Formats cart contents into a summary string and builds the browser mailto: link
  // and WhatsApp link to the configured STUDIO_WHATSAPP_NUMBER.
  const handleCompleteCheckout = async (
    payload: CheckoutFormPayload
  ): Promise<OrderConfirmationResult> => {
    if (cartItems.length === 0) {
      throw new Error('Your bag is empty.');
    }

    const reference = createOrderReference();
    const { formattedMessage, subtotal, pricedCount, quotedCount, deliveryPinUrl } =
      formatCartOrderContents(cartItems, payload, reference, getProductBySlug, getTier);

    const whatsappNumber = normalizeWhatsAppNumber(studioConfig.studioWhatsappNumber);
    const studioEmail = studioConfig.studioEmail || siteConfig.email.address;

    const clientMailtoUrl = buildEmailLink(
      `Order Enquiry ${reference} — ${payload.customerName}`,
      formattedMessage,
      studioEmail
    );
    const clientWhatsappUrl = buildWhatsAppLink(formattedMessage, whatsappNumber);

    let confirmation: OrderConfirmationResult = {
      reference,
      subtotal,
      pricedCount,
      quotedCount,
      message: formattedMessage,
      emailStatus: {
        sent: false,
        provider: 'mailto-link',
        detail: `Use the email button below to open your email app addressed to ${studioEmail}.`,
      },
      whatsappStatus: {
        sent: false,
        provider: 'wa-me-link',
        detail: `Press "Open WhatsApp & press Send" below to send your pre-filled order message to +${whatsappNumber}.`,
      },
      whatsappUrl: clientWhatsappUrl,
      mailtoUrl: clientMailtoUrl,
      studioWhatsappNumber: whatsappNumber,
      studioEmail,
      deliveryLocation: payload.deliveryLocation || null,
    };

    const checkoutItemsPayload = cartItems.map((item) => {
      const product = getProductBySlug(item.slug);
      const tierInfo = product ? getTier(product, item.tier) : null;
      return {
        slug: item.slug,
        tier: item.tier,
        quantity: item.quantity,
        name: product?.name,
        tierLabel: tierInfo?.label,
        price: tierInfo?.price,
      };
    });

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          customerEmail: payload.customerEmail,
          shippingAddress: payload.shippingAddress,
          deliveryMapUrl: deliveryPinUrl,
          notes: payload.notes,
          items: checkoutItemsPayload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.ok) {
          confirmation = {
            reference: data.reference || confirmation.reference,
            subtotal: typeof data.subtotal === 'number' ? data.subtotal : confirmation.subtotal,
            pricedCount:
              typeof data.pricedCount === 'number' ? data.pricedCount : confirmation.pricedCount,
            quotedCount:
              typeof data.quotedCount === 'number' ? data.quotedCount : confirmation.quotedCount,
            message: data.message || confirmation.message,
            emailStatus: data.emailStatus || confirmation.emailStatus,
            whatsappStatus: data.whatsappStatus || confirmation.whatsappStatus,
            whatsappUrl: data.whatsappUrl || confirmation.whatsappUrl,
            mailtoUrl: data.mailtoUrl || confirmation.mailtoUrl,
            studioWhatsappNumber: whatsappNumber,
            studioEmail,
            deliveryLocation: payload.deliveryLocation || null,
          };
        }
      }
    } catch {
      // Keep client-generated mailto: and wa.me links if network dispatch is unavailable
    }

    const historyItems: SavedOrderLineItem[] = cartItems.flatMap((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return [];
      const tier = getTier(product, item.tier);
      const lineTotal = tier.price === null ? 0 : tier.price * item.quantity;
      return [
        {
          slug: product.slug,
          name: product.name,
          tier: tier.key,
          tierLabel: tier.label,
          quantity: item.quantity,
          price: tier.price,
          lineTotal,
        },
      ];
    });

    const newSavedOrder: SavedOrderRecord = {
      reference: confirmation.reference,
      createdAt: new Date().toISOString(),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail || undefined,
      shippingAddress: payload.shippingAddress,
      deliveryLocation: payload.deliveryLocation || null,
      items: historyItems,
      subtotal: confirmation.subtotal,
      pricedCount: confirmation.pricedCount,
      quotedCount: confirmation.quotedCount,
      message: confirmation.message,
      whatsappUrl: confirmation.whatsappUrl,
      mailtoUrl: confirmation.mailtoUrl,
    };

    setOrderHistory((prev) =>
      [newSavedOrder, ...prev.filter((o) => o.reference !== newSavedOrder.reference)].slice(0, 30)
    );

    setOrderConfirmation(confirmation);
    return confirmation;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const appShell = (
    <div className="min-h-screen flex flex-col bg-[#F8F0E4] text-[#183923]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'shop') setShopCategory('All');
          if (page === 'journal') setJournalCategory('All');
          navigateTo(page);
        }}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onOpenShopCategory={handleOpenShopCategory}
            onOpenJournalCategory={handleOpenJournalCategory}
            onSelectProduct={setSelectedProduct}
            onQuickAdd={handleQuickAdd}
            wishlistSlugs={wishlistSlugs}
            onToggleWishlist={handleToggleWishlist}
            onOpenStudioManager={handleOpenStudioManager}
          />
        )}
        {currentPage === 'about' && <AboutPage onNavigate={navigateTo} />}
        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={shopCategory}
            onSelectProduct={setSelectedProduct}
            onQuickAdd={handleQuickAdd}
            wishlistSlugs={wishlistSlugs}
            onToggleWishlist={handleToggleWishlist}
            onClearWishlist={handleClearWishlist}
            onOpenStudioManager={handleOpenStudioManager}
          />
        )}
        {currentPage === 'custom' && <CustomCreationsPage />}
        {currentPage === 'gallery' && (
          <GalleryPage
            onNavigate={navigateTo}
            onOpenStudioManager={handleOpenStudioManager}
          />
        )}
        {currentPage === 'journal' && <JournalPage initialCategory={journalCategory} />}
        {currentPage === 'contact' && (
          <ContactPage
            onNavigate={navigateTo}
            mapsEnabled={Boolean(studioConfig.googleMapsApiKey)}
            studioWhatsappNumber={studioConfig.studioWhatsappNumber}
          />
        )}
        {currentPage === 'studio' && (
          <StudioManagerPage initialTab={studioManagerTab} onNavigate={navigateTo} />
        )}
      </main>

      <Footer onNavigate={navigateTo} />

      <WhatsAppFab />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlistSlugs.includes(selectedProduct.slug) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onBrowseShop={() => handleOpenShopCategory('All')}
        onCompleteCheckout={handleCompleteCheckout}
        confirmation={orderConfirmation}
        onResetConfirmation={() => setOrderConfirmation(null)}
        mapsEnabled={Boolean(studioConfig.googleMapsApiKey)}
        studioWhatsappNumber={studioConfig.studioWhatsappNumber}
        orderHistory={orderHistory}
        onReorderFromHistory={handleReorderFromHistory}
        onRemoveOrderFromHistory={handleRemoveOrderFromHistory}
        onClearOrderHistory={handleClearOrderHistory}
      />

      {/* Ephemeral Add-to-Bag Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-5 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-[#183923] text-[#F8F0E4] border border-[#E9A9AA]/50 shadow-lg text-[13px]"
        >
          <Check className="w-4 h-4 text-[#A8B18F] shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setIsCartOpen(true);
            }}
            className="ml-2 text-[#E9A9AA] underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            View Bag
          </button>
        </div>
      )}
    </div>
  );

  if (studioConfig.googleMapsApiKey) {
    return (
      <APIProvider
        apiKey={studioConfig.googleMapsApiKey}
        language="en"
        region="IN"
        libraries={['places', 'marker']}
      >
        {appShell}
      </APIProvider>
    );
  }

  return appShell;
}
