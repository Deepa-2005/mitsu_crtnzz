export const siteConfig = {
  name: 'MITSU Crntzz',
  shortName: 'MITSU',
  scriptName: 'Crntzz',
  tagline: 'Handmade botanical art, rangoli, meaningful gifting & custom creations',
  motto: 'Create • Inspire • Bloom',
  scriptMotto: 'dream • plan • create',
  phone: {
    display: '+91 86170 62980',
    number: '918617062980',
  },
  email: {
    address: 'mitsucrtnzz@gmail.com',
  },
  studio: {
    location: 'Handcrafted in India · Custom Orders Welcome',
    hours: 'Tuesday – Saturday, 10:30 AM – 6:30 PM IST',
  },
} as const;

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = (raw || '').replace(/[^\d]/g, '');
  if (!digits) return siteConfig.phone.number;
  return digits.length === 10 ? `91${digits}` : digits;
}

export function buildWhatsAppLink(
  message: string,
  whatsappNumber: string = siteConfig.phone.number
): string {
  const target = normalizeWhatsAppNumber(whatsappNumber);
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function buildEmailLink(
  subject: string,
  body: string,
  emailAddress: string = siteConfig.email.address
): string {
  const target = (emailAddress || siteConfig.email.address).trim();
  return `mailto:${target}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
