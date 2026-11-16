import { SpecialOffer } from '../types';

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    slug: 'hello-50-first-order',
    badge: 'Welcome Gift',
    code: 'HELLO50',
    title: 'First Order Welcome',
    discount: '₹50 Off',
    description:
      'Enjoy ₹50 off your very first handmade order above ₹399 across any Basic, Premium, or Personalised piece.',
    validUntil: '31 Dec 2026',
  },
  {
    slug: 'card5-bundle',
    badge: 'Stationery Bundle',
    code: 'CARD5',
    title: '5 Greeting Cards Pack',
    discount: '5 for ₹199',
    description:
      'Pick any 5 Basic handmade Greeting Cards for ₹199 (regularly ₹245) — ideal for birthdays, thank-yous & notes.',
    validUntil: '31 Dec 2026',
    productSlug: 'greeting-card',
  },
  {
    slug: 'hamper-bouquet-pair',
    badge: 'Celebration Pair',
    code: 'HAMPER10',
    title: 'Hamper + Bouquet Duo',
    discount: '10% Off',
    description:
      'Save 10% when you pair any Silver, Gold, or Platinum Gift Hamper with a Paper, Ribbon, or Pipe Cleaner Bouquet.',
    validUntil: '31 Dec 2026',
    productSlug: 'gift-hampers',
  },
];
