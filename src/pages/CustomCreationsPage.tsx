import React, { useEffect, useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { CustomEnquiry } from '../types';
import { buildEmailLink, buildWhatsAppLink, siteConfig } from '../lib/site';
import { ResilientImage } from '../components/ResilientImage';
import { WhatsAppIcon } from '../components/BrandMark';
import botanicalPaintingImg from '../assets/images/product_botanical_painting_1794649393512.jpg';
import bespokeGiftboxImg from '../assets/images/product_bespoke_giftbox_1794649394807.jpg';

const REQUEST_TYPES = [
  'Build Your Own Gift Hamper',
  'Greeting Card / Bookmark',
  'Mini Scrapbook / Memory Jar',
  'Pipe Cleaner, Paper, Ribbon or Real Flower Bouquet',
  'Photo Frame / Mini Polaroid Painting',
  'Kolka Art / Traditional Rangoli & Alpona',
  'Keychain (Crochet / Ribbon / Initial)',
  'Bulk or event gifting',
  'Something else',
];

interface DeliveryStatus {
  sent: boolean;
  provider: string;
  detail: string;
}

interface EnquiryConfirmation {
  enquiry: CustomEnquiry;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  whatsappUrl: string;
  mailtoUrl: string;
}

const STORAGE_KEY = 'mitsu_crntzz_custom_enquiries';

export const CustomCreationsPage: React.FC = () => {
  const [creationType, setCreationType] = useState(REQUEST_TYPES[0]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [occasion, setOccasion] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budgetRange, setBudgetRange] = useState('₹1,000 – ₹2,500');
  const [description, setDescription] = useState('');
  const [submittedEnquiries, setSubmittedEnquiries] = useState<CustomEnquiry[]>([]);
  const [latestConfirmation, setLatestConfirmation] = useState<EnquiryConfirmation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSubmittedEnquiries(JSON.parse(saved));
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const trimmedName = clientName.trim();
    const trimmedPhone = clientPhone.trim();
    const trimmedEmail = clientEmail.trim();
    const trimmedOccasion = occasion.trim();
    const trimmedTimeline = timeline.trim() || 'Flexible';
    const trimmedDescription = description.trim();

    const fallbackId = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const fallbackSummary = [
      `Hello ${siteConfig.name} ♡`,
      `Custom Order Enquiry · Ref ${fallbackId}`,
      ``,
      `Name: ${trimmedName}`,
      `WhatsApp: ${trimmedPhone}`,
      trimmedEmail ? `Email: ${trimmedEmail}` : null,
      `What I'd like made: ${creationType}`,
      trimmedOccasion ? `Occasion: ${trimmedOccasion}` : null,
      budgetRange ? `Budget: ${budgetRange}` : null,
      trimmedTimeline ? `Needed by: ${trimmedTimeline}` : null,
      ``,
      `Idea:`,
      trimmedDescription,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    let enquiryId = fallbackId;
    let emailStatus: DeliveryStatus = {
      sent: false,
      provider: 'mailto-fallback',
      detail: `Use "Send by Email Instead" below to email ${siteConfig.email.address} directly.`,
    };
    let whatsappStatus: DeliveryStatus = {
      sent: false,
      provider: 'wa-me-link',
      detail: `Press "Send on WhatsApp" below to share your pre-filled custom brief with ${siteConfig.phone.display}.`,
    };
    let whatsappUrl = buildWhatsAppLink(fallbackSummary);
    let mailtoUrl = buildEmailLink(
      `Custom Enquiry ${fallbackId} — ${creationType}`,
      fallbackSummary
    );

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: trimmedName,
          clientPhone: trimmedPhone,
          clientEmail: trimmedEmail,
          creationType,
          occasion: trimmedOccasion,
          timeline: trimmedTimeline,
          budgetRange,
          description: trimmedDescription,
        }),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (isJson) {
        const data = await response.json();
        if (!response.ok && response.status === 400) {
          throw new Error(data?.error || 'Please complete all required enquiry fields.');
        }
        if (response.ok && data?.ok) {
          enquiryId = data.enquiryId || enquiryId;
          emailStatus = data.emailStatus || emailStatus;
          whatsappStatus = data.whatsappStatus || whatsappStatus;
          whatsappUrl = data.whatsappUrl || whatsappUrl;
          mailtoUrl = data.mailtoUrl || mailtoUrl;
        }
      }

      const newEnquiry: CustomEnquiry = {
        id: enquiryId,
        submittedAt: new Date().toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        clientName: trimmedName,
        clientEmail: trimmedEmail,
        clientPhone: trimmedPhone,
        creationType,
        occasion: trimmedOccasion,
        timeline: trimmedTimeline,
        budgetRange,
        description: trimmedDescription,
      };

      const updated = [newEnquiry, ...submittedEnquiries];
      setSubmittedEnquiries(updated);
      setLatestConfirmation({
        enquiry: newEnquiry,
        emailStatus,
        whatsappStatus,
        whatsappUrl,
        mailtoUrl,
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage write errors
      }

      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setOccasion('');
      setTimeline('');
      setDescription('');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to send custom enquiry right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      {/* Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-10 border-b border-[#A8B18F]/45">
        <div className="lg:col-span-6 space-y-4">
          <p className="script-accent text-2xl text-[#CF6C87]">Custom Creations &amp; Commissions</p>
          <h1
            className="font-display text-4xl sm:text-5xl font-semibold text-[#183923] leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            Made to your brief, colours, and occasion — at minimal prices.
          </h1>
          <p className="text-[15px] leading-[1.7] text-[#183923]/80">
            Whether it is a fabric-painted saree, an alpona doorway motif, festive Diwali hampers,
            or a personalised memory diary, tell us what you have in mind. We prepare your WhatsApp
            &amp; Email brief directly with zero database tracking.
          </p>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <ResilientImage
            src={botanicalPaintingImg}
            alt="Framed custom botanical lotus gouache painting with gold accents"
            aspectClassName="aspect-[4/3]"
            className="rounded-2xl border border-[#A8B18F]/50"
            titleFallback="Designing Arts Commission"
          />
          <ResilientImage
            src={bespokeGiftboxImg}
            alt="Festive gift hamper wrapped in forest green cloth and sage ribbon"
            aspectClassName="aspect-[4/3]"
            className="rounded-2xl border border-[#A8B18F]/50"
            titleFallback="Bespoke Gift Hamper"
          />
        </div>
      </section>

      {/* Form & How it Works */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-[#FDF9F4] border border-[#A8B18F]/55 rounded-3xl p-6 sm:p-9 space-y-6">
          <div className="space-y-1.5">
            <p className="font-display text-[13px] font-semibold tracking-[0.22em] text-[#5d7a62] uppercase">
              Custom Order Enquiry
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#183923]">
              Tell us what you have in mind
            </h2>
            <p className="text-[14px] text-[#183923]/75">
              Fill this in and we will prepare your WhatsApp message for{' '}
              <strong>{siteConfig.phone.display}</strong> (plus an email copy to{' '}
              <strong>{siteConfig.email.address}</strong>).
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-[#E9A9AA]/30 border border-[#CF6C87] text-[13px] text-[#183923]">
              {submitError}
            </div>
          )}

          {latestConfirmation && (
            <div className="p-5 rounded-2xl bg-[#EFE4D3] border border-[#A8B18F] space-y-3">
              <div className="flex items-center gap-2 text-[#183923]">
                <CheckCircle2 className="w-5 h-5 text-[#2F7A56]" />
                <span className="font-semibold text-[14px]">
                  Enquiry Prepared · Reference{' '}
                  <span className="tabular-nums">{latestConfirmation.enquiry.id}</span>
                </span>
              </div>
              <p className="text-[13px] text-[#183923]/80 leading-relaxed">
                Press <strong>Send on WhatsApp</strong> below so we receive your idea and reply with
                sketches, making time, and a quote.
              </p>

              <div className="text-[12px] text-[#183923]/75 space-y-1">
                <p>
                  <strong>Email:</strong> {latestConfirmation.emailStatus.detail}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {latestConfirmation.whatsappStatus.detail}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={latestConfirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2F7A56] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#25643f] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </a>
                {!latestConfirmation.emailStatus.sent && (
                  <a
                    href={latestConfirmation.mailtoUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#183923]/40 text-[#183923] text-[13px] font-medium hover:bg-[#F8F0E4] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send by Email Instead</span>
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cust-name" className="block text-[13px] font-medium">
                  Your Name *
                </label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Priya Nair"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cust-phone" className="block text-[13px] font-medium">
                  WhatsApp Number *
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="98123 45678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cust-email" className="block text-[13px] font-medium">
                  Email (optional)
                </label>
                <input
                  id="cust-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cust-type" className="block text-[13px] font-medium">
                  What would you like made? *
                </label>
                <select
                  id="cust-type"
                  value={creationType}
                  onChange={(e) => setCreationType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87] cursor-pointer"
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cust-occasion" className="block text-[13px] font-medium">
                  Occasion
                </label>
                <input
                  id="cust-occasion"
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Diwali, wedding, birthday"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cust-budget" className="block text-[13px] font-medium">
                  Budget (INR)
                </label>
                <select
                  id="cust-budget"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87] cursor-pointer"
                >
                  <option value="Under ₹1,000">Under ₹1,000</option>
                  <option value="₹1,000 – ₹2,500">₹1,000 – ₹2,500</option>
                  <option value="₹2,500 – ₹6,000">₹2,500 – ₹6,000</option>
                  <option value="₹6,000+">₹6,000+</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cust-timeline" className="block text-[13px] font-medium">
                  When do you need it?
                </label>
                <input
                  id="cust-timeline"
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. Before 12 Nov"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cust-desc" className="block text-[13px] font-medium">
                Your Idea *
              </label>
              <textarea
                id="cust-desc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Names or wording to include, colours you love, size, or how it will be gifted..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-full bg-[#2F7A56] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#25643f] transition-colors cursor-pointer disabled:opacity-60"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Preparing Enquiry...' : 'Continue to WhatsApp & Email'}</span>
            </button>
          </form>
        </div>

        {/* Process & Local History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-[#A8B18F]/55 bg-[#FDF9F4] space-y-4">
            <h3 className="font-display text-2xl font-semibold text-[#183923]">
              How Custom Orders Work
            </h3>
            <ol className="space-y-4 text-[14px] text-[#183923]/80">
              <li className="space-y-1">
                <span className="font-semibold text-[#183923]">01. Share Your Idea</span>
                <p>Send your brief and reference photos on WhatsApp or by email.</p>
              </li>
              <li className="space-y-1">
                <span className="font-semibold text-[#183923]">02. Sketch &amp; Quote</span>
                <p>We reply personally with colour suggestions, making time, and a minimal quote.</p>
              </li>
              <li className="space-y-1">
                <span className="font-semibold text-[#183923]">03. Handcrafted &amp; Packed</span>
                <p>
                  Once confirmed in chat, we craft your piece by hand and share photos before
                  dispatch.
                </p>
              </li>
            </ol>
          </div>

          {submittedEnquiries.length > 0 && (
            <div className="p-6 rounded-3xl border border-[#A8B18F]/55 bg-[#EFE4D3]/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-[#183923]">
                  Recent Enquiries (Browser Saved)
                </h3>
                <span className="text-[12px] text-[#183923]/65 tabular-nums">
                  {submittedEnquiries.length}
                </span>
              </div>
              <ul className="divide-y divide-[#A8B18F]/35 text-[13px]">
                {submittedEnquiries.slice(0, 3).map((inq) => (
                  <li key={inq.id} className="py-2.5 space-y-0.5">
                    <div className="flex items-center justify-between font-medium text-[#183923]">
                      <span>{inq.creationType}</span>
                      <span className="tabular-nums text-[12px] text-[#7C6536]">{inq.id}</span>
                    </div>
                    <p className="text-[#183923]/75 line-clamp-2">{inq.description}</p>
                    <p className="text-[11px] text-[#183923]/60">
                      {inq.budgetRange} · {inq.submittedAt}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
