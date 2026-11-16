"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ArrowIcon, CheckIcon, MailIcon, MinusIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { getCategoryLabel } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { buildGeneralHelpMessage } from "@/lib/messages";
import { buildWhatsAppLink, siteConfig } from "@/lib/site";
import {
  LIMITS,
  validateCustomer,
  type CustomerDetails,
  type CustomerErrors,
} from "@/lib/validation";

type PreparedOrder = {
  reference: string;
  whatsappUrl: string;
  message: string;
  subtotal: number;
  itemCount: number;
  persisted: boolean;
  quotedCount: number;
  lines: { slug: string; name: string; tier: string; tierLabel: string; quantity: number; price: number | null; lineTotal: number }[];
};

type OrderApiResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: CustomerErrors;
} & Partial<Pick<PreparedOrder, "reference" | "whatsappUrl" | "message" | "subtotal" | "itemCount" | "quotedCount" | "persisted" | "lines">>;

const emptyDetails: CustomerDetails = { name: "", phone: "", address: "", notes: "" };

export function CartCheckout() {
  const { lines, subtotal, itemCount, quotedCount, hydrated, setQuantity, removeItem, clearCart } = useCart();
  const [details, setDetails] = useState<CustomerDetails>(emptyDetails);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<PreparedOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [openedWhatsApp, setOpenedWhatsApp] = useState(false);

  const helpLink = buildWhatsAppLink(buildGeneralHelpMessage());

  const update = (field: keyof CustomerDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const { errors: clientErrors } = validateCustomer(details);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormError("Please check the highlighted details before continuing.");
      return;
    }
    if (lines.length === 0) {
      setFormError("Your bag is empty. Add a piece before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: details,
          items: lines.map((line) => ({ slug: line.product.slug, tier: line.tier.key, quantity: line.quantity })),
        }),
      });
      const data = (await response.json()) as OrderApiResponse;

      if (!response.ok || !data.ok || !data.whatsappUrl || !data.reference || !data.message) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "We couldn't prepare your order message. Please try again.");
        return;
      }

      setOrder({
        reference: data.reference,
        whatsappUrl: data.whatsappUrl,
        message: data.message,
        subtotal: data.subtotal ?? subtotal,
        itemCount: data.itemCount ?? itemCount,
        quotedCount: data.quotedCount ?? quotedCount,
        persisted: Boolean(data.persisted),
        lines: data.lines ?? [],
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError(
        "We couldn't reach the studio server. Please check your connection and try again, or message us directly on WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyMessage = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="card-surface animate-pulse rounded-3xl p-10">
        <p className="eyebrow">Loading your bag…</p>
        <div className="mt-6 h-24 rounded-xl bg-linen" />
      </div>
    );
  }

  if (order) {
    return (
      <div className="animate-rise space-y-8">
        <div className="card-surface rounded-3xl p-6 sm:p-9">
          <span className="chip">Message prepared · not sent yet</span>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            One last step — send your order on WhatsApp
          </h2>
          <p className="prose-note mt-3 max-w-2xl">
            We have prepared a WhatsApp message with your details and order summary. Nothing has reached the studio
            yet: WhatsApp will open with the message already typed, and <strong>you must press Send yourself</strong>.
            Your order is confirmed only after we reply to you.
          </p>

          {!order.persisted ? (
            <p className="mt-4 rounded-xl border border-rose/30 bg-rose/5 px-4 py-3 text-sm text-ink-soft">
              We couldn&apos;t save a copy in the studio records just now, but your WhatsApp message is complete. Please
              send it so we can help.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={order.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenedWhatsApp(true)}
              className="btn btn-whatsapp sm:flex-1"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Open WhatsApp &amp; press Send
            </a>
            <button type="button" onClick={copyMessage} className="btn btn-outline">
              {copied ? <CheckIcon className="h-4 w-4" /> : null}
              {copied ? "Message copied" : "Copy message"}
            </button>
          </div>

          <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-soft">
            If WhatsApp does not open, use <strong>Copy message</strong> and send it to{" "}
            <a href={helpLink} target="_blank" rel="noopener noreferrer" className="ink-link">
              {siteConfig.phone.display}
            </a>{" "}
            — or email{" "}
            <a href={`mailto:${siteConfig.email.address}`} className="ink-link">
              {siteConfig.email.address}
            </a>
            .
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="card-surface rounded-3xl p-6" aria-labelledby="prepared-summary">
            <h3 id="prepared-summary" className="font-display text-2xl">
              Order summary
            </h3>
            <p className="mt-1 text-[0.72rem] tracking-[0.16em] text-ink-soft uppercase">
              Reference {order.reference}
            </p>
            <ul className="mt-5 divide-y divide-sage/20">
              {order.lines.map((line) => (
                <li key={`${line.slug}:${line.tier}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="text-ink">{line.name}</span>
                    <span className="ml-2 rounded-full border border-sage/60 px-2 py-0.5 text-[0.65rem] tracking-[0.08em] text-forest uppercase">{line.tierLabel}</span>
                    <span className="block text-[0.78rem] text-ink-soft">
                      {line.price === null ? `Qty ${line.quantity} × quoted on WhatsApp` : `Qty ${line.quantity} × ${formatINR(line.price)}`}
                    </span>
                  </span>
                  <span className="whitespace-nowrap">{line.price === null ? "To be quoted" : formatINR(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-sage/30 pt-4 text-sm">
              <span className="tracking-[0.12em] text-ink-soft uppercase">Subtotal · priced items</span>
              <span className="font-display text-2xl">{formatINR(order.subtotal)}</span>
            </div>
            {order.quotedCount > 0 ? (
              <p className="mt-1 text-[0.78rem] text-ink-soft">
                + {order.quotedCount} Customise {order.quotedCount === 1 ? "piece" : "pieces"} to be quoted on WhatsApp.
              </p>
            ) : null}
            <p className="mt-2 text-[0.75rem] text-ink-soft">
              Delivery charges are confirmed on WhatsApp before any payment.
            </p>
          </section>

          <section className="card-surface rounded-3xl p-6" aria-labelledby="message-preview">
            <h3 id="message-preview" className="font-display text-2xl">
              Your WhatsApp message
            </h3>
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-linen/70 p-4 font-sans text-[0.76rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {order.message}
            </pre>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {openedWhatsApp ? (
            <button
              type="button"
              onClick={() => {
                clearCart();
                setOrder(null);
                setDetails(emptyDetails);
                setOpenedWhatsApp(false);
              }}
              className="btn btn-outline"
            >
              I pressed Send — clear my bag
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setOrder(null);
              setOpenedWhatsApp(false);
            }}
            className="text-[0.72rem] tracking-[0.16em] text-ink-soft uppercase hover:text-forest"
          >
            Back to my bag
          </button>
          <Link href="/shop" className="text-[0.72rem] tracking-[0.16em] text-ink-soft uppercase hover:text-forest">
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card-surface rounded-3xl p-8 text-center sm:p-12">
        <span className="chip">Your bag</span>
        <h2 className="mt-4 font-display text-3xl">Your bag is empty</h2>
        <p className="prose-note mx-auto mt-3 max-w-md">
          Add a handmade piece to your bag to prepare a WhatsApp order enquiry, or message us for something made just
          for you.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Browse the pieces
            <ArrowIcon className="h-4 w-4" />
          </Link>
          <a href={helpLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="space-y-8">
        <section className="card-surface rounded-3xl p-5 sm:p-7" aria-labelledby="bag-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="bag-heading" className="font-display text-2xl">
              Your bag · {itemCount} {itemCount === 1 ? "piece" : "pieces"}
            </h2>
            <button
              type="button"
              onClick={clearCart}
              className="text-[0.65rem] tracking-[0.14em] text-ink-soft uppercase hover:text-rose"
            >
              Clear bag
            </button>
          </div>

          <ul className="mt-5 divide-y divide-sage/20">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[0.6rem] font-medium tracking-[0.2em] text-rose uppercase">
                    {getCategoryLabel(line.product.category)}
                    <span className={`rounded-full border px-2 py-0.5 ${line.quoted ? "border-forest bg-forest text-cream" : "border-sage/60 text-forest"}`}>
                      {line.tier.label}
                    </span>
                  </p>
                  <Link href={`/shop/${line.product.slug}`} className="font-display text-xl hover:text-forest">
                    {line.product.name}
                  </Link>
                  <p className="mt-0.5 text-[0.8rem] text-ink-soft">
                    {line.quoted ? "Quoted to your brief on WhatsApp" : `${formatINR(line.tier.price ?? 0)} each`} · {line.product.craftTime}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-ink/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.product.slug, line.tier.key, line.quantity - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-linen"
                        aria-label={`Decrease quantity of ${line.product.name}`}
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.product.slug, line.tier.key, line.quantity + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-linen"
                        aria-label={`Increase quantity of ${line.product.name}`}
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.product.slug, line.tier.key)}
                      className="text-[0.66rem] tracking-[0.12em] text-ink-soft uppercase hover:text-rose"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm whitespace-nowrap">{line.quoted ? "To be quoted" : formatINR(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-surface rounded-3xl p-5 sm:p-7" aria-labelledby="details-heading">
          <span className="eyebrow">Step 1 of 2</span>
          <h2 id="details-heading" className="mt-2 font-display text-2xl">
            Your delivery details
          </h2>
          <p className="prose-note mt-2">
            These details are added to your WhatsApp order message. We use them only to discuss and deliver your order.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-name" className="field-label">
                Full name <span aria-hidden className="text-rose">*</span>
              </label>
              <input
                id="customer-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={LIMITS.name}
                value={details.name}
                onChange={(event) => update("name", event.target.value)}
                className="field-input"
                placeholder="Aarav Sharma"
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "customer-name-error" : undefined}
              />
              {errors.name ? (
                <p id="customer-name-error" className="field-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="customer-phone" className="field-label">
                WhatsApp number <span aria-hidden className="text-rose">*</span>
              </label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={LIMITS.phone}
                value={details.phone}
                onChange={(event) => update("phone", event.target.value)}
                className="field-input"
                placeholder="98765 43210"
                aria-invalid={errors.phone ? "true" : undefined}
                aria-describedby={errors.phone ? "customer-phone-error" : "customer-phone-hint"}
              />
              {errors.phone ? (
                <p id="customer-phone-error" className="field-error">
                  {errors.phone}
                </p>
              ) : (
                <p id="customer-phone-hint" className="mt-1 text-[0.72rem] text-ink-soft">
                  Indian numbers can be entered with or without +91.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customer-address" className="field-label">
                Delivery address <span aria-hidden className="text-rose">*</span>
              </label>
              <textarea
                id="customer-address"
                name="address"
                required
                rows={3}
                maxLength={LIMITS.address}
                value={details.address}
                onChange={(event) => update("address", event.target.value)}
                className="field-input resize-y"
                placeholder="House / flat, street, area, city, state, PIN code"
                aria-invalid={errors.address ? "true" : undefined}
                aria-describedby={errors.address ? "customer-address-error" : undefined}
              />
              {errors.address ? (
                <p id="customer-address-error" className="field-error">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customer-notes" className="field-label">
                Order notes <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
              </label>
              <textarea
                id="customer-notes"
                name="notes"
                rows={3}
                maxLength={LIMITS.notes}
                value={details.notes}
                onChange={(event) => update("notes", event.target.value)}
                className="field-input resize-y"
                placeholder="Colours, personalisation, gifting note, preferred delivery date…"
                aria-describedby="customer-notes-hint"
              />
              <p id="customer-notes-hint" className="mt-1 text-[0.72rem] text-ink-soft">
                {details.notes.length}/{LIMITS.notes} characters
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="card-surface rounded-3xl p-6 lg:sticky lg:top-36">
        <span className="eyebrow">Step 2 of 2</span>
        <h2 className="mt-2 font-display text-2xl">Order summary</h2>

        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.key} className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-ink">{line.product.name}</span>
                <span className="text-[0.76rem] text-ink-soft">{line.tier.label} · Qty {line.quantity}</span>
              </span>
              <span className="whitespace-nowrap text-[0.85rem]">{line.quoted ? "Quoted" : formatINR(line.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-sage/30 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Subtotal (priced items)</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          {quotedCount > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Customise pieces</span>
              <span className="text-[0.78rem] text-ink-soft">{quotedCount} quoted on WhatsApp</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">Delivery</span>
            <span className="text-[0.78rem] text-ink-soft">Confirmed on WhatsApp</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-sage/20 pt-3">
            <span className="tracking-[0.12em] text-ink uppercase">Total</span>
            <span className="font-display text-2xl">{formatINR(subtotal)}</span>
          </div>
        </div>

        {formError ? (
          <p role="alert" className="mt-4 rounded-xl border border-rose/40 bg-rose/5 px-3 py-2.5 text-[0.8rem] text-ink">
            {formError}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} className="btn btn-primary mt-5 w-full">
          {submitting ? "Preparing message…" : "Continue on WhatsApp"}
          {!submitting ? <ArrowIcon className="h-4 w-4" /> : null}
        </button>

        <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-soft">
          This prepares an order message for <strong>{siteConfig.phone.display}</strong>. It opens WhatsApp for you to
          review and press Send — no order is placed automatically.
        </p>

        <div className="mt-5 border-t border-sage/25 pt-4 text-[0.8rem]">
          <p className="text-ink-soft">Need help before ordering?</p>
          <div className="mt-2 flex flex-col gap-2">
            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-whatsapp hover:text-ink"
            >
              <WhatsAppIcon className="h-4 w-4" /> {siteConfig.phone.display}
            </a>
            <a
              href={`mailto:${siteConfig.email.address}`}
              className="inline-flex items-center gap-2 break-all text-ink-soft hover:text-ink"
            >
              <MailIcon className="h-4 w-4 shrink-0" /> {siteConfig.email.address}
            </a>
          </div>
        </div>
      </aside>
    </form>
  );
}
