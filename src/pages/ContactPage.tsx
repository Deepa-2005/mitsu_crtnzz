import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { DeliveryLocation, PageRoute } from '../types';
import { buildEmailLink, buildWhatsAppLink, siteConfig } from '../lib/site';
import { WhatsAppIcon } from '../components/BrandMark';
import { DeliveryAddressMapPicker } from '../components/DeliveryAddressMapPicker';

interface ContactPageProps {
  onNavigate: (page: PageRoute) => void;
  mapsEnabled?: boolean;
  studioWhatsappNumber?: string;
}

interface DeliveryStatus {
  sent: boolean;
  provider: string;
  detail: string;
}

interface ContactConfirmation {
  referenceId: string;
  name: string;
  subject: string;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  whatsappUrl: string;
  mailtoUrl: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigate,
  mapsEnabled = false,
  studioWhatsappNumber = siteConfig.phone.number,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Order or Delivery Question');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentConfirmation, setSentConfirmation] = useState<ContactConfirmation | null>(null);
  const [deliveryPin, setDeliveryPin] = useState<DeliveryLocation | null>(null);

  const whatsappDirect = buildWhatsAppLink(
    `Hello ${siteConfig.name} ♡ I'd love some help with an order or custom piece.`,
    studioWhatsappNumber
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const fallbackReference = `MSG-${Math.floor(1000 + Math.random() * 9000)}`;
    const fallbackSummary = [
      `Hello ${siteConfig.name} ♡`,
      `Website Message · Ref ${fallbackReference}`,
      ``,
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      trimmedPhone ? `Phone: ${trimmedPhone}` : null,
      `Subject: ${subject || 'Studio Enquiry'}`,
      ``,
      trimmedMessage,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    let confirmation: ContactConfirmation = {
      referenceId: fallbackReference,
      name: trimmedName,
      subject,
      emailStatus: {
        sent: false,
        provider: 'mailto-fallback',
        detail: `Use the "Open Email App" button below to email ${siteConfig.email.address} directly.`,
      },
      whatsappStatus: {
        sent: false,
        provider: 'wa-me-link',
        detail: `Press "Send on WhatsApp" below to send your pre-filled note to ${siteConfig.phone.display}.`,
      },
      whatsappUrl: buildWhatsAppLink(fallbackSummary, studioWhatsappNumber),
      mailtoUrl: buildEmailLink(
        `Website enquiry ${fallbackReference} — ${subject}`,
        fallbackSummary,
        siteConfig.email.address
      ),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          subject,
          message: trimmedMessage,
        }),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (isJson) {
        const data = await response.json();
        if (!response.ok && response.status === 400) {
          throw new Error(data?.error || 'Please fill in all required contact fields.');
        }
        if (response.ok && data?.ok) {
          confirmation = {
            referenceId: data.referenceId || confirmation.referenceId,
            name: trimmedName,
            subject,
            emailStatus: data.emailStatus || confirmation.emailStatus,
            whatsappStatus: data.whatsappStatus || confirmation.whatsappStatus,
            whatsappUrl: data.whatsappUrl || confirmation.whatsappUrl,
            mailtoUrl: data.mailtoUrl || confirmation.mailtoUrl,
          };
        }
      }

      setSentConfirmation(confirmation);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-12">
      <div className="space-y-2 max-w-2xl pb-8 border-b border-[#A8B18F]/45">
        <p className="script-accent text-2xl text-[#CF6C87]">Say Hello</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#183923]">
          Contact the Studio
        </h1>
        <p className="text-[15px] leading-relaxed text-[#183923]/75">
          We reply personally to every WhatsApp message and email. Reach out for orders, custom
          pieces, bulk gifting, or delivery estimates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Direct Studio Contact Cards */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-[#FDF9F4] border border-[#A8B18F]/55 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#183923]">
              WhatsApp (Fastest)
            </h2>
            <p className="text-[14px] text-[#183923]/75 leading-relaxed">
              Share reference photos, ask about Basic / Premium / Personalised tiers or Silver, Gold
              &amp; Platinum Gift Hampers, or confirm delivery charges directly in chat.
            </p>
            <a
              href={whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-5 rounded-full bg-[#2F7A56] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#25643f] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chat on WhatsApp · {siteConfig.phone.display}</span>
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-[#FDF9F4] border border-[#A8B18F]/55 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#183923]">Email &amp; Call</h2>
            <div className="space-y-3 text-[14px]">
              <a
                href={`mailto:${siteConfig.email.address}`}
                className="flex items-center gap-3 text-[#183923] hover:text-[#CF6C87] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#CF6C87] shrink-0" />
                <span className="break-all">{siteConfig.email.address}</span>
              </a>
              <a
                href={`tel:+${siteConfig.phone.number}`}
                className="flex items-center gap-3 text-[#183923] hover:text-[#CF6C87] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#CF6C87] shrink-0" />
                <span className="tabular-nums">{siteConfig.phone.display}</span>
              </a>
              <p className="text-[13px] text-[#183923]/70 pt-1">{siteConfig.studio.hours}</p>
            </div>

            <div className="pt-4 border-t border-[#A8B18F]/30">
              <button
                type="button"
                onClick={() => {
                  onNavigate('custom');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="font-display text-[16px] font-semibold text-[#183923] underline underline-offset-4 decoration-[#CF6C87] hover:text-[#CF6C87] cursor-pointer"
              >
                Looking for a custom order? Open Custom Creations →
              </button>
            </div>
          </div>

          {mapsEnabled && (
            <div className="p-6 rounded-3xl bg-[#FDF9F4] border border-[#A8B18F]/55 space-y-3.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#CF6C87]" />
                <h2 className="font-display text-2xl font-semibold text-[#183923]">
                  Delivery Coverage Lookup
                </h2>
              </div>
              <p className="text-[13px] text-[#183923]/75 leading-relaxed">
                Search your delivery city or street to pin your location and request a delivery
                estimate on WhatsApp.
              </p>
              <DeliveryAddressMapPicker
                selectedLocation={deliveryPin}
                onSelectLocation={setDeliveryPin}
                alwaysShowMap
                mapHeightClassName="h-52"
                placeholder="Search delivery city or street across India..."
              />
              {deliveryPin && (
                <a
                  href={buildWhatsAppLink(
                    `Hello ${siteConfig.name} ♡ Could you share delivery charges & timeline to:\n${deliveryPin.formattedAddress}\nhttps://www.google.com/maps/search/?api=1&query=${deliveryPin.lat},${deliveryPin.lng}`,
                    studioWhatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#2F7A56] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#25643f] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Ask delivery estimate for this pin</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 p-6 sm:p-9 rounded-3xl bg-[#FDF9F4] border border-[#A8B18F]/55 space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-semibold text-[#183923]">
              Send us a message
            </h2>
            <p className="text-[14px] text-[#183923]/75">
              Your message is prepared for Email and WhatsApp directly — nothing is stored in a
              database.
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-[#E9A9AA]/30 border border-[#CF6C87] text-[13px] text-[#183923]">
              {submitError}
            </div>
          )}

          {sentConfirmation && (
            <div className="p-5 rounded-2xl bg-[#EFE4D3] border border-[#A8B18F] space-y-3">
              <div className="flex items-center gap-2 text-[#183923] font-semibold text-[14px]">
                <CheckCircle2 className="w-5 h-5 text-[#2F7A56]" />
                <span>
                  Message Prepared ({sentConfirmation.referenceId}) — Thank you,{' '}
                  {sentConfirmation.name}
                </span>
              </div>
              <div className="text-[12px] text-[#183923]/75 space-y-1">
                <p>
                  <strong>Email:</strong> {sentConfirmation.emailStatus.detail}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {sentConfirmation.whatsappStatus.detail}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={sentConfirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F7A56] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#25643f] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </a>
                {!sentConfirmation.emailStatus.sent && (
                  <a
                    href={sentConfirmation.mailtoUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#183923]/40 text-[#183923] text-[13px] font-medium hover:bg-[#F8F0E4] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open Email App</span>
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-[13px] font-medium">
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-[13px] font-medium">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="block text-[13px] font-medium">
                  Phone / WhatsApp (optional)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="block text-[13px] font-medium">
                  Subject *
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87] cursor-pointer"
                >
                  <option value="Order or Delivery Question">Order or Delivery Question</option>
                  <option value="Custom Piece / Commission">Custom Piece / Commission</option>
                  <option value="Bulk or Festive Hampers">Bulk or Festive Hampers</option>
                  <option value="General Studio Note">General Studio Note</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-[13px] font-medium">
                Message *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[14px] focus:outline-none focus:border-[#CF6C87]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Preparing Message...' : 'Submit & Notify Studio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
