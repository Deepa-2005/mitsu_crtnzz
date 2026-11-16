"use client";

import { useState } from "react";
import { CheckIcon, MailIcon, SparkleIcon, WhatsAppIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";
import {
  LIMITS,
  validateCustomEnquiry,
  type CustomEnquiry,
  type CustomEnquiryErrors,
} from "@/lib/validation";

const requestTypes = [
  "Alpona — paper, canvas or floor",
  "Rangoli — plates or floor rangoli",
  "Fabric painting — your garment or ours",
  "Designing arts — name art, portraits, invites",
  "Festive gift hamper",
  "Greeting cards",
  "Photo framing & polaroids",
  "Customised diary / journal",
  "Bulk or corporate order",
  "Something else",
];

const initialEnquiry: CustomEnquiry = {
  name: "",
  phone: "",
  email: "",
  requestType: requestTypes[0],
  occasion: "",
  budget: "",
  deadline: "",
  description: "",
};

type EnquiryResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: CustomEnquiryErrors;
  reference?: string;
  whatsappUrl?: string;
  emailLink?: string;
  message?: string;
  persisted?: boolean;
  emailDelivery?: { configured: boolean; delivered: boolean; reason?: string };
};

type PreparedEnquiry = {
  reference: string;
  whatsappUrl: string;
  emailLink: string;
  message: string;
  persisted: boolean;
  emailDelivery?: { configured: boolean; delivered: boolean; reason?: string };
  draft: CustomEnquiry;
};

export function CustomOrderForm() {
  const [enquiry, setEnquiry] = useState<CustomEnquiry>(initialEnquiry);
  const [errors, setErrors] = useState<CustomEnquiryErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prepared, setPrepared] = useState<PreparedEnquiry | null>(null);

  const update = (field: keyof CustomEnquiry, value: string) => {
    setEnquiry((current) => ({ ...current, [field]: value }));
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
    const { errors: clientErrors } = validateCustomEnquiry(enquiry);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormError("Please complete the highlighted fields so we can help properly.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      const data = (await response.json()) as EnquiryResponse;
      if (!response.ok || !data.ok || !data.whatsappUrl || !data.reference || !data.message) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "We couldn't prepare your enquiry. Please try again or message us on WhatsApp.");
        return;
      }
      setPrepared({
        reference: data.reference,
        whatsappUrl: data.whatsappUrl,
        emailLink: data.emailLink ?? siteConfig.email.address,
        message: data.message,
        persisted: Boolean(data.persisted),
        emailDelivery: data.emailDelivery,
        draft: enquiry,
      });
      window.scrollTo({ top: 220, behavior: "smooth" });
    } catch {
      setFormError("We couldn't reach the studio server. Please try again, or message us directly on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (prepared) {
    const emailNote = prepared.emailDelivery?.delivered
      ? "A copy of this enquiry was also emailed to the studio."
      : prepared.emailDelivery?.configured
        ? "We couldn't email a copy just now — please send the WhatsApp message so your enquiry reaches us."
        : "Automatic email delivery is not set up on this website, so please send the WhatsApp message (or use the email option below).";

    return (
      <div className="animate-rise card-surface rounded-3xl p-6 sm:p-9">
        <span className="chip">Enquiry prepared · not sent yet</span>
        <h2 className="mt-4 font-display text-3xl leading-tight">Send your enquiry to the studio</h2>
        <p className="prose-note mt-3 max-w-2xl">
          Your reference is <strong className="text-ink">{prepared.reference}</strong>. Nothing has reached us yet —
          press Send inside WhatsApp (or send the email) and we&apos;ll reply personally with ideas, making time and a
          quote.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={prepared.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp sm:flex-1"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Send on WhatsApp &amp; press Send
          </a>
          <a href={prepared.emailLink} className="btn btn-outline sm:flex-1">
            <MailIcon className="h-4 w-4" />
            Send by email instead
          </a>
        </div>

        <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-soft">{emailNote}</p>

        {!prepared.persisted ? (
          <p className="mt-3 rounded-xl border border-rose/30 bg-rose/5 px-4 py-3 text-[0.8rem] text-ink-soft">
            We couldn&apos;t save a copy in the studio records just now. Your message is ready — please send it so we can
            reply.
          </p>
        ) : null}

        <details className="mt-5 rounded-xl border border-sage/30 bg-linen/50 p-4">
          <summary className="cursor-pointer text-[0.72rem] font-medium tracking-[0.14em] text-ink uppercase">
            Preview your enquiry message
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto font-sans text-[0.78rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
            {prepared.message}
          </pre>
        </details>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.72rem] tracking-[0.14em] uppercase">
          <button
            type="button"
            onClick={() => {
              setPrepared(null);
              setEnquiry(initialEnquiry);
            }}
            className="text-ink-soft hover:text-ink"
          >
            Start another enquiry
          </button>
          <a href={`mailto:${siteConfig.email.address}`} className="break-all text-ink-soft hover:text-ink">
            {siteConfig.email.address}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface rounded-3xl p-5 sm:p-8">
      <div className="flex items-center gap-2 text-rose">
        <SparkleIcon className="h-4 w-4" />
        <span className="eyebrow">Custom order enquiry</span>
      </div>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl">Tell us what you have in mind</h2>
      <p className="prose-note mt-2">
        Custom orders are quoted to your brief and budget — always at minimal prices. Fill this in and we&apos;ll prepare
        a WhatsApp message for you; you review it and press Send yourself. Prefer email? You can send the same details by
        email at the end.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="custom-name" className="field-label">
            Your name <span className="text-rose">*</span>
          </label>
          <input
            id="custom-name"
            type="text"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            value={enquiry.name}
            onChange={(event) => update("name", event.target.value)}
            className="field-input"
            placeholder="Aarav Sharma"
            aria-invalid={errors.name ? "true" : undefined}
          />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="custom-phone" className="field-label">
            WhatsApp number <span className="text-rose">*</span>
          </label>
          <input
            id="custom-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={LIMITS.phone}
            value={enquiry.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="field-input"
            placeholder="98765 43210"
            aria-invalid={errors.phone ? "true" : undefined}
          />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
        </div>

        <div>
          <label htmlFor="custom-email" className="field-label">
            Email <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
          </label>
          <input
            id="custom-email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            value={enquiry.email}
            onChange={(event) => update("email", event.target.value)}
            className="field-input"
            placeholder="Your email address"
            aria-invalid={errors.email ? "true" : undefined}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="custom-type" className="field-label">
            What would you like made? <span className="text-rose">*</span>
          </label>
          <select
            id="custom-type"
            value={enquiry.requestType}
            onChange={(event) => update("requestType", event.target.value)}
            className="field-input"
            aria-invalid={errors.requestType ? "true" : undefined}
          >
            {requestTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.requestType ? <p className="field-error">{errors.requestType}</p> : null}
        </div>

        <div>
          <label htmlFor="custom-occasion" className="field-label">
            Occasion <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
          </label>
          <input
            id="custom-occasion"
            type="text"
            maxLength={LIMITS.occasion}
            value={enquiry.occasion}
            onChange={(event) => update("occasion", event.target.value)}
            className="field-input"
            placeholder="Diwali, wedding, birthday, housewarming…"
          />
        </div>

        <div>
          <label htmlFor="custom-budget" className="field-label">
            Budget <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
          </label>
          <input
            id="custom-budget"
            type="text"
            maxLength={LIMITS.budget}
            value={enquiry.budget}
            onChange={(event) => update("budget", event.target.value)}
            className="field-input"
            placeholder="₹2,000 – ₹3,500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="custom-deadline" className="field-label">
            When do you need it?{" "}
            <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
          </label>
          <input
            id="custom-deadline"
            type="text"
            maxLength={LIMITS.deadline}
            value={enquiry.deadline}
            onChange={(event) => update("deadline", event.target.value)}
            className="field-input"
            placeholder="Before 12 November, or not urgent"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="custom-description" className="field-label">
            Your idea <span className="text-rose">*</span>
          </label>
          <textarea
            id="custom-description"
            required
            rows={5}
            maxLength={LIMITS.message}
            value={enquiry.description}
            onChange={(event) => update("description", event.target.value)}
            className="field-input resize-y"
            placeholder="Names or wording to include, colours you love, size, how it will be used, and anything else that helps us picture it…"
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby="custom-description-hint"
          />
          {errors.description ? (
            <p className="field-error">{errors.description}</p>
          ) : (
            <p id="custom-description-hint" className="mt-1 text-[0.72rem] text-ink-soft">
              {enquiry.description.length}/{LIMITS.message} characters · reference photos can be shared on WhatsApp.
            </p>
          )}
        </div>
      </div>

      {formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose/40 bg-rose/5 px-4 py-3 text-[0.82rem]">
          {formError}
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className="btn btn-whatsapp mt-6 w-full">
        <WhatsAppIcon className="h-4 w-4" />
        {submitting ? "Preparing your enquiry…" : "Continue to WhatsApp"}
      </button>
      <p className="mt-3 flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-soft">
        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-whatsapp" />
        We prepare the message and open WhatsApp with it filled in. You review it and press Send — we never send it for
        you.
      </p>
    </form>
  );
}
