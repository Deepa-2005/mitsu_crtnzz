import React, { useState } from 'react';
import { Check, Copy, History, Mail, Minus, PackageSearch, Plus, Search, Trash2, X } from 'lucide-react';
import {
  CartItem,
  CheckoutFormPayload,
  DeliveryLocation,
  OrderConfirmationResult,
  SavedOrderRecord,
} from '../types';
import { useStudioCatalog } from '../context/StudioCatalogContext';
import {
  ORDER_TIMELINE_STEPS,
  SAMPLE_TRACKABLE_ORDERS,
  lookupMockOrderStatus,
  MockOrderStatusRecord,
} from '../data/orderTracking';
import { buildWhatsAppLink, formatINR, siteConfig } from '../lib/site';
import { ResilientImage } from './ResilientImage';
import { WhatsAppIcon } from './BrandMark';
import { DeliveryAddressMapPicker } from './DeliveryAddressMapPicker';
import { OrderHistory } from './OrderHistory';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (slug: string, tier: CartItem['tier'], delta: number) => void;
  onRemoveItem: (slug: string, tier: CartItem['tier']) => void;
  onClearCart: () => void;
  onBrowseShop: () => void;
  onCompleteCheckout: (payload: CheckoutFormPayload) => Promise<OrderConfirmationResult>;
  confirmation: OrderConfirmationResult | null;
  onResetConfirmation: () => void;
  mapsEnabled?: boolean;
  studioWhatsappNumber?: string;
  orderHistory: SavedOrderRecord[];
  onReorderFromHistory: (order: SavedOrderRecord) => void;
  onRemoveOrderFromHistory: (reference: string) => void;
  onClearOrderHistory: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBrowseShop,
  onCompleteCheckout,
  confirmation,
  onResetConfirmation,
  mapsEnabled = false,
  studioWhatsappNumber = siteConfig.phone.number,
  orderHistory,
  onReorderFromHistory,
  onRemoveOrderFromHistory,
  onClearOrderHistory,
}) => {
  const { getProductBySlug, getTier } = useStudioCatalog();
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed' | 'track' | 'history'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openedWhatsApp, setOpenedWhatsApp] = useState(false);
  const [openedEmail, setOpenedEmail] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<MockOrderStatusRecord | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  if (!isOpen) return null;

  const lines = items.flatMap((item) => {
    const product = getProductBySlug(item.slug);
    if (!product) return [];
    const tier = getTier(product, item.tier);
    const quoted = tier.price === null;
    return [
      {
        key: `${item.slug}:${item.tier}`,
        product,
        tier,
        quantity: item.quantity,
        quoted,
        lineTotal: quoted ? 0 : (tier.price ?? 0) * item.quantity,
      },
    ];
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const quotedCount = lines.filter((l) => l.quoted).reduce((sum, l) => sum + l.quantity, 0);

  const handleSelectMapLocation = (loc: DeliveryLocation | null) => {
    setDeliveryLocation(loc);
    if (loc?.formattedAddress) {
      setShippingAddress(loc.formattedAddress);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onCompleteCheckout({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        deliveryLocation,
      });
      setStep('confirmed');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to prepare your order notification right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!confirmation) return;
    try {
      await navigator.clipboard.writeText(confirmation.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const handleClose = () => {
    setStep('bag');
    setSubmitError(null);
    setOpenedWhatsApp(false);
    setOpenedEmail(false);
    setTrackError(null);
    onClose();
  };

  const runTrackLookup = (refCode: string) => {
    setTrackInput(refCode);
    setTrackError(null);
    const found = lookupMockOrderStatus(refCode, confirmation?.reference);
    if (!found) {
      setTrackedOrder(null);
      setTrackError(
        'Please enter a valid reference code (for example, MC-4812-LOTS or INQ-3105-DIAR).'
      );
      return;
    }
    setTrackedOrder(found);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTrackLookup(trackInput);
  };

  const handleMarkSentAndClear = () => {
    onClearCart();
    onResetConfirmation();
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setShippingAddress('');
    setDeliveryLocation(null);
    setNotes('');
    setOpenedWhatsApp(false);
    setOpenedEmail(false);
    setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#183923]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Your Atelier Bag"
    >
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-md bg-[#F8F0E4] text-[#183923] h-full flex flex-col border-l border-[#A8B18F]/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#A8B18F]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#183923]">
                {step === 'bag' && 'Your Atelier Bag'}
                {step === 'checkout' && 'Delivery Details'}
                {step === 'confirmed' && 'Order Confirmation Ready'}
                {step === 'track' && 'Track Order'}
                {step === 'history' && 'Order History'}
              </h2>
              <p className="text-[12px] text-[#183923]/65 mt-0.5">
                {step === 'track'
                  ? 'Reference lookup · Mock preview & live WhatsApp check'
                  : step === 'history'
                    ? 'Past completed orders saved on this device · No database'
                    : 'Confirmed personally via WhatsApp & Email · No database'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close bag"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#EFE4D3]/80 border border-[#A8B18F]/45 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setStep(confirmation && step === 'confirmed' ? 'confirmed' : 'bag')}
              className={`py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                step !== 'track' && step !== 'history'
                  ? 'bg-[#183923] text-[#F8F0E4]'
                  : 'text-[#183923]/75 hover:text-[#183923]'
              }`}
            >
              Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('track');
                if (!trackInput && confirmation?.reference) {
                  runTrackLookup(confirmation.reference);
                }
              }}
              className={`py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                step === 'track'
                  ? 'bg-[#183923] text-[#F8F0E4]'
                  : 'text-[#183923]/75 hover:text-[#183923]'
              }`}
            >
              <PackageSearch className="w-3.5 h-3.5" />
              <span>Track</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('history')}
              className={`py-1.5 px-2 rounded-lg inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                step === 'history'
                  ? 'bg-[#183923] text-[#F8F0E4]'
                  : 'text-[#183923]/75 hover:text-[#183923]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({orderHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'history' ? (
            <OrderHistory
              orders={orderHistory}
              onTrackOrder={(refCode) => {
                setStep('track');
                runTrackLookup(refCode);
              }}
              onReorder={(order) => {
                onReorderFromHistory(order);
                setStep('bag');
              }}
              onRemoveOrder={onRemoveOrderFromHistory}
              onClearHistory={onClearOrderHistory}
              onBrowseShop={() => {
                onClose();
                onBrowseShop();
              }}
            />
          ) : step === 'track' ? (
            <div className="space-y-5">
              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <label htmlFor="track-ref-input" className="block text-[12px] font-medium text-[#183923]">
                  Enter Order or Enquiry Reference Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#183923]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="track-ref-input"
                      type="text"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="e.g. MC-4812-LOTS"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[13.5px] uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-[#CF6C87]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <p className="text-[11.5px] text-[#7C6536] font-medium">
                  Try a sample reference (mock lookup):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {confirmation?.reference && (
                    <button
                      type="button"
                      onClick={() => runTrackLookup(confirmation.reference)}
                      className="px-2.5 py-1 rounded-lg bg-[#E9A9AA]/35 border border-[#CF6C87]/50 text-[11.5px] font-medium text-[#183923] hover:bg-[#E9A9AA]/55 transition-colors cursor-pointer"
                    >
                      {confirmation.reference} (Current)
                    </button>
                  )}
                  {Object.keys(SAMPLE_TRACKABLE_ORDERS).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => runTrackLookup(code)}
                      className="px-2.5 py-1 rounded-lg bg-[#EFE4D3] border border-[#A8B18F]/55 text-[11.5px] font-medium text-[#183923] hover:border-[#B69A64] transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {trackError && (
                <div className="p-3.5 rounded-xl bg-[#E9A9AA]/30 border border-[#CF6C87]/60 text-[12.5px] text-[#183923]">
                  {trackError}
                </div>
              )}

              {trackedOrder ? (
                <div className="p-5 rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/65 space-y-5">
                  <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-[#A8B18F]/35">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7C6536]">
                        {trackedOrder.reference} · {trackedOrder.updatedAtLabel}
                      </span>
                      <h3 className="font-display text-2xl font-semibold text-[#183923] mt-0.5">
                        {trackedOrder.stageTitle}
                      </h3>
                      <p className="text-[12px] text-[#183923]/70 mt-0.5">
                        {trackedOrder.pieceSummary}
                      </p>
                    </div>
                    {trackedOrder.isSample && (
                      <span className="px-2.5 py-1 rounded-md bg-[#EFE4D3] border border-[#B69A64]/45 text-[10.5px] font-semibold uppercase tracking-wider text-[#7C6536] shrink-0">
                        Sample
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-[#183923]/80 leading-relaxed">
                    {trackedOrder.stageNote}
                  </p>

                  {/* 4-Step Botanical Timeline */}
                  <ol className="space-y-3.5">
                    {ORDER_TIMELINE_STEPS.map((stepMeta, idx) => {
                      const isDone = idx < trackedOrder.currentStage;
                      const isCurrent = idx === trackedOrder.currentStage;
                      return (
                        <li key={stepMeta.title} className="flex gap-3 items-start">
                          <span
                            className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 border ${
                              isDone
                                ? 'bg-[#2F7A56] border-[#2F7A56] text-[#F8F0E4]'
                                : isCurrent
                                  ? 'bg-[#B69A64] border-[#183923] text-[#183923]'
                                  : 'bg-[#EFE4D3] border-[#A8B18F]/60 text-[#183923]/45'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-[13.5px] font-semibold leading-snug ${
                                isDone || isCurrent ? 'text-[#183923]' : 'text-[#183923]/45'
                              }`}
                            >
                              {stepMeta.title}
                            </p>
                            <p
                              className={`text-[12px] leading-relaxed ${
                                isDone || isCurrent ? 'text-[#183923]/75' : 'text-[#183923]/40'
                              }`}
                            >
                              {stepMeta.detail}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="pt-3 border-t border-[#A8B18F]/35 space-y-3">
                    <p className="text-[12px] font-medium text-[#7C6536]">
                      {trackedOrder.estimatedDispatch}
                    </p>
                    <a
                      href={buildWhatsAppLink(
                        `Hello ${siteConfig.name} ♡ Could you share a live status update for reference ${trackedOrder.reference}?`,
                        studioWhatsappNumber
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#2F7A56] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#25643f] transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Ask Studio for Live Update on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#EFE4D3]/55 border border-[#A8B18F]/45 text-[12.5px] text-[#183923]/75 leading-relaxed">
                  Because MITSU Crntzz operates without a customer database, live tracking links are
                  shared directly in your WhatsApp chat. Enter a reference above to preview the
                  studio crafting stages or ask us directly.
                </div>
              )}
            </div>
          ) : step === 'confirmed' && confirmation ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#EFE4D3] border border-[#A8B18F]/60 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C6536]">
                  Ref {confirmation.reference} · Ready to notify studio
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#183923] leading-snug">
                  Send your order via WhatsApp or Email
                </h3>
                <p className="text-[13px] text-[#183923]/80 leading-relaxed">
                  Your bag details have been formatted below. Click WhatsApp to notify{' '}
                  <strong>+{confirmation.studioWhatsappNumber}</strong> or open your email app to
                  send to <strong>{confirmation.studioEmail}</strong>.
                </p>
              </div>

              {/* WhatsApp Primary Action */}
              <div className="space-y-2.5">
                <a
                  href={confirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpenedWhatsApp(true)}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-[#2F7A56] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#25643f] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Open WhatsApp &amp; press Send</span>
                </a>

                <a
                  href={confirmation.mailtoUrl}
                  onClick={() => setOpenedEmail(true)}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#E9A9AA]" />
                  <span>Notify by Email ({confirmation.studioEmail})</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-[#183923]/35 text-[#183923] text-[13px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#2F7A56]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Order message copied' : 'Copy order message'}</span>
                </button>
              </div>

              {/* Delivery & Email Status */}
              <div className="p-4 rounded-2xl border border-[#A8B18F]/50 bg-[#FDF9F4] space-y-2 text-[12px]">
                <div className="flex items-center justify-between font-medium text-[#183923]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#CF6C87]" />
                    <span>Email Notification</span>
                  </span>
                  <span className="text-[#7C6536]">
                    {confirmation.emailStatus.sent ? 'Sent' : 'mailto: link ready'}
                  </span>
                </div>
                <p className="text-[#183923]/75 leading-relaxed">
                  {confirmation.emailStatus.detail}
                </p>
              </div>

              {/* Message Preview */}
              <details open className="rounded-xl border border-[#A8B18F]/45 bg-[#EFE4D3]/50 p-3.5 text-[12px]">
                <summary className="cursor-pointer font-medium text-[#183923]">
                  Formatted order summary
                </summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] text-[#183923]/80 leading-relaxed">
                  {confirmation.message}
                </pre>
              </details>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('track');
                    runTrackLookup(confirmation.reference);
                  }}
                  className="w-full py-2.5 rounded-full border border-[#B69A64] text-[#183923] text-[13px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <PackageSearch className="w-4 h-4 text-[#7C6536]" />
                  <span>Track status ({confirmation.reference})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('history')}
                  className="w-full py-2.5 rounded-full border border-[#A8B18F]/70 text-[#183923] text-[13px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <History className="w-4 h-4 text-[#7C6536]" />
                  <span>View Order History</span>
                </button>
                {openedWhatsApp || openedEmail ? (
                  <button
                    type="button"
                    onClick={handleMarkSentAndClear}
                    className="w-full py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
                  >
                    I sent my order — clear my bag
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep('bag')}
                    className="w-full py-2.5 rounded-full border border-[#183923]/30 text-[#183923] text-[13px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                  >
                    Back to bag
                  </button>
                )}
              </div>
            </div>
          ) : lines.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-display text-2xl text-[#183923]">Your bag is empty</p>
              <p className="text-[14px] text-[#183923]/70 max-w-xs mx-auto leading-relaxed">
                Add a handmade piece in Basic, Premium, or Personalised level (or a Silver, Gold, or
                Platinum Gift Hamper) to prepare your WhatsApp &amp; Email order.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseShop();
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                Browse the Store
              </button>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-4">
              <ul className="divide-y divide-[#A8B18F]/35">
                {lines.map((line) => (
                  <li key={line.key} className="py-4 flex gap-4">
                    <div className="w-20 shrink-0">
                      <ResilientImage
                        src={line.product.image}
                        alt={line.product.name}
                        aspectClassName="aspect-square"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-xl font-semibold text-[#183923] leading-snug">
                            {line.product.name}
                          </h3>
                          <span className="text-[14px] font-medium tabular-nums text-[#183923] shrink-0">
                            {line.quoted ? 'To be quoted' : formatINR(line.lineTotal)}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#7C6536] mt-0.5">
                          {line.tier.label} level ·{' '}
                          {line.quoted
                            ? 'Quoted on WhatsApp'
                            : `${formatINR(line.tier.price ?? 0)} each`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div className="inline-flex items-center rounded-full border border-[#183923]/25">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${line.product.name}`}
                            onClick={() => onUpdateQuantity(line.product.slug, line.tier.key, -1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-[13px] tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${line.product.name}`}
                            onClick={() => onUpdateQuantity(line.product.slug, line.tier.key, 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(line.product.slug, line.tier.key)}
                          aria-label={`Remove ${line.product.name}`}
                          className="text-[12px] text-[#183923]/60 hover:text-[#CF6C87] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#EFE4D3] border border-[#A8B18F]/45 text-[12px] text-[#183923]/80">
                Your details are formatted into a WhatsApp &amp; Email order enquiry for{' '}
                <strong>{siteConfig.phone.display}</strong> — no order is placed automatically.
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-[#E9A9AA]/35 border border-[#CF6C87] text-[13px] text-[#183923]">
                  {submitError}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="chk-name" className="block text-[12px] font-medium">
                  Full Name *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="chk-phone" className="block text-[12px] font-medium">
                  WhatsApp Number *
                </label>
                <input
                  id="chk-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="chk-email" className="block text-[12px] font-medium">
                  Email Address (for email copy, optional)
                </label>
                <input
                  id="chk-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              {mapsEnabled && (
                <div className="space-y-1.5">
                  <span className="block text-[12px] font-medium">
                    Find &amp; Pin Delivery Location (Google Maps, optional)
                  </span>
                  <DeliveryAddressMapPicker
                    selectedLocation={deliveryLocation}
                    onSelectLocation={handleSelectMapLocation}
                    mapHeightClassName="h-44"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="chk-address" className="block text-[12px] font-medium">
                  Delivery Address *
                </label>
                <textarea
                  id="chk-address"
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House / flat, street, area, city, PIN code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="chk-notes" className="block text-[12px] font-medium">
                  Order Notes (colours, customisation, gift message)
                </label>
                <textarea
                  id="chk-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional custom colours, names, or delivery date..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Totals */}
        {lines.length > 0 && (step === 'bag' || step === 'checkout') && (
          <div className="px-6 py-5 border-t border-[#A8B18F]/40 bg-[#EFE4D3]/70 space-y-4">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#183923]/80">
                <span>Subtotal (priced items)</span>
                <span className="tabular-nums font-medium text-[#183923]">
                  {formatINR(subtotal)}
                </span>
              </div>
              {quotedCount > 0 && (
                <div className="flex justify-between text-[#7C6536]">
                  <span>Customise pieces</span>
                  <span>{quotedCount} quoted on WhatsApp</span>
                </div>
              )}
              <div className="flex justify-between text-[#183923]/70">
                <span>Delivery charges</span>
                <span>Confirmed on WhatsApp</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                Continue to Delivery Details
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep('bag')}
                  className="px-4 py-3 rounded-full border border-[#183923]/30 text-[#183923] text-[13px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-[#2F7A56] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#25643f] transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{isSubmitting ? 'Preparing...' : 'Complete Checkout'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
