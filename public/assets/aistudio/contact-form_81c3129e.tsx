"use client";

import { useState } from "react";
import { CheckIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { buildEmailLink, siteConfig } from "@/lib/site";
import {
  LIMITS,
  validateContact,
  type ContactErrors,
  type ContactMessage,
} from "@/lib/validation";

type ContactResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: ContactErrors;
  reference?: string;
  persisted?: boolean;
  whatsappUrl?: string;
  emailDelivery?: { configured: boolean; delivered: boolean; reason?: string };
};

const initialMessage: ContactMessage = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm({ emailConfigured }: { emailConfigured: boolean }) {
  const [form, setForm] = useState<ContactMessage>(initialMessage);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    delivered: boolean;
    emailConfigured: boolean;
    whatsappUrl: string;
    mailto: string;
    saved: boolean;
  } | null>(null);

  const update = (field: keyof ContactMessage, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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
    const { errors: clientErrors } = validateContact(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormError("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as ContactResponse;
      if (!response.ok || !data.ok || !data.reference) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "We couldn't submit the form. Please use WhatsApp or email instead.");
        return;
      }

      const body = [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        form.phone ? `Phone: +91 ${form.phone}` : "",
        "",
        form.message,
        "",
        `Reference: ${data.reference}`,
      ]
        .filter((line) => line !== "")
        .join("\n");

      setResult({
        reference: data.reference,
        delivered: Boolean(data.emailDelivery?.delivered),
        emailConfigured: Boolean(data.emailDelivery?.configured),
        whatsappUrl: data.whatsappUrl ?? "",
        mailto: buildEmailLink(`Website enquiry ${data.reference} — ${form.subject}`, body),
        saved: Boolean(data.persisted),
      });
      window.scrollTo({ top: 260, behavior: "smooth" });
    } catch {
      setFormError("We couldn't reach the studio server. Please message us on WhatsApp or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const delivered = result.delivered;
    return (
      <div className="animate-rise">
        <div
          className={`rounded-3xl border p-6 sm:p-8 ${
            delivered ? "border-whatsapp/30 bg-whatsapp/5" : "border-rose/35 bg-rose/5"
          }`}
          role="status"
        >
          <span className={`chip ${delivered ? "border-whatsapp/40! text-whatsapp!" : ""}`}>
            {delivered ? "Emailed to the studio" : "Saved — but not emailed automatically"}
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight">
            {delivered ? "Your message is in our inbox" : "Please send this one on WhatsApp or email"}
          </h2>
          <p className="prose-note mt-3">
            {delivered
              ? `Your message was delivered to ${siteConfig.email.address} and saved to our records. We reply to every enquiry personally, usually the same day.`
              : result.emailConfigured
                ? "Your message was saved to our records, but our email provider did not accept it just now. It has not reached the studio inbox automatically — please use one of the options below."
                : "Your message was saved to our records, but automatic email sending is not connected on this website yet. It has not reached the studio inbox automatically — please send it with one of the options below."}
          </p>
          <p className="mt-2 text-[0.78rem] tracking-[0.08em] text-ink-soft">
            Reference {result.reference} · {result.saved ? "Saved to our enquiry records" : "Not saved to records"}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={result.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp sm:flex-1"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Send on WhatsApp
            </a>
            <a href={result.mailto} className="btn btn-outline sm:flex-1">
              <MailIcon className="h-4 w-4" />
              Open email app
            </a>
          </div>
          <p className="mt-3 text-[0.76rem] leading-relaxed text-ink-soft">
            Quoting reference {result.reference} helps us find your saved message. You can also write directly to{" "}
            <a href={`mailto:${siteConfig.email.address}`} className="ink-link break-all">
              {siteConfig.email.address}
            </a>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setResult(null);
            setForm(initialMessage);
          }}
          className="mt-5 text-[0.72rem] tracking-[0.16em] text-ink-soft uppercase hover:text-forest"
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface rounded-3xl p-5 sm:p-8">
      <span className="eyebrow">Write to the studio</span>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl">Send us a message</h2>
      <p className="prose-note mt-2">
        {emailConfigured
          ? "Your message is saved securely and emailed to the studio inbox. Never share payment details here."
          : "Your message is saved securely on our website. Email delivery is not connected right now — WhatsApp is the fastest way to reach us."}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Name <span className="text-rose">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="field-input"
            placeholder="Aarav Sharma"
            aria-invalid={errors.name ? "true" : undefined}
          />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="field-label">
            Email <span className="text-rose">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="field-input"
            placeholder="Your email address"
            aria-invalid={errors.email ? "true" : undefined}
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-phone" className="field-label">
            Phone <span className="font-normal tracking-normal normal-case text-ink-soft">(optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="field-input"
            placeholder="98765 43210"
            aria-invalid={errors.phone ? "true" : undefined}
          />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-subject" className="field-label">
            Subject <span className="text-rose">*</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            required
            maxLength={LIMITS.subject}
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="field-input"
            placeholder="Order, custom piece, delivery…"
            aria-invalid={errors.subject ? "true" : undefined}
          />
          {errors.subject ? <p className="field-error">{errors.subject}</p> : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="field-label">
            Message <span className="text-rose">*</span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            maxLength={LIMITS.message}
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className="field-input resize-y"
            placeholder="How can we help?"
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby="contact-message-hint"
          />
          {errors.message ? (
            <p className="field-error">{errors.message}</p>
          ) : (
            <p id="contact-message-hint" className="mt-1 text-[0.72rem] text-ink-soft">
              {form.message.length}/{LIMITS.message} characters
            </p>
          )}
        </div>
      </div>

      {formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose/40 bg-rose/5 px-4 py-3 text-[0.82rem]">
          {formError}
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className="btn btn-primary mt-6 w-full">
        {submitting ? "Sending…" : "Submit message"}
      </button>

      <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-soft">
        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-whatsapp" />
        We only confirm a message as received when it actually reaches us. If automatic email is unavailable, we&apos;ll
        offer WhatsApp and direct email instead.
      </p>
    </form>
  );
}
