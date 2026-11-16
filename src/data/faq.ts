export type FaqCategory = 'All' | 'Shipping' | 'Custom Commissions' | 'Care Instructions';

export interface StudioFaqItem {
  id: string;
  category: Exclude<FaqCategory, 'All'>;
  question: string;
  answer: string;
  highlights?: string[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  'All',
  'Shipping',
  'Custom Commissions',
  'Care Instructions',
];

export const STUDIO_FAQS: StudioFaqItem[] = [
  {
    id: 'faq-shipping-1',
    category: 'Shipping',
    question: 'How are orders confirmed and how much does delivery cost?',
    answer:
      'Because MITSU Crntzz crafts every order by hand without automated checkout markups, your Atelier Bag prepares a formatted WhatsApp & Email enquiry. Once you send it, we confirm exact courier charges based on your PIN code and parcel weight before any payment.',
    highlights: [
      'Standard dispatch across India via tracked courier partners.',
      'Delivery fee is shared transparently on WhatsApp prior to payment.',
      'Local hand-delivery or pickup can be arranged for delicate fresh-flower bouquets.',
    ],
  },
  {
    id: 'faq-shipping-2',
    category: 'Shipping',
    question: 'How long does it take to craft and dispatch an order?',
    answer:
      'Ready-to-wrap pieces like Basic greeting cards, bookmarks, and keychains typically ship within 1–2 working days. Layered scrapbooks, photo frames, kolka boards, and Silver/Gold/Platinum gift hampers take 3–5 working days to handcraft carefully.',
    highlights: [
      'Urgent birthday or anniversary? Mention your needed-by date in the notes.',
      'We share photos of your finished order on WhatsApp before sealing the box.',
    ],
  },
  {
    id: 'faq-custom-1',
    category: 'Custom Commissions',
    question: 'What is the difference between Basic, Premium, and Personalised levels?',
    answer:
      'Every product in our store is offered in three clear tiers so you only pay for the level of detailing you want.',
    highlights: [
      'Basic: Minimal handmade elegance at our lowest studio price.',
      'Premium: Extra floral layers, ribbons, textures, and gift-ready wrapping.',
      'Personalised: Your custom names, dates, photos, colour theme, and handwritten notes.',
    ],
  },
  {
    id: 'faq-custom-2',
    category: 'Custom Commissions',
    question: 'Can I Build My Own Gift Hamper or customise a bulk festive order?',
    answer:
      'Yes! Alongside our ready Silver (₹298), Gold (₹329), and Platinum (₹529) Gift Hampers, you can mix and match bookmarks, memory jars, mini polaroid paintings, bouquets, and greeting cards in a custom box.',
    highlights: [
      'Share your budget and favourite items via the Custom Creations page or WhatsApp.',
      'Bulk wedding, Rakhi, Teacher’s Day, and Diwali return-gift pricing is available.',
    ],
  },
  {
    id: 'faq-care-1',
    category: 'Care Instructions',
    question: 'How do I care for Pipe Cleaner, Paper, and Ribbon Bouquets?',
    answer:
      'Our handmade bouquets are designed as forever keepsakes that never need water. Keep them out of direct rain and harsh afternoon sunlight to preserve ribbon lustre and paper vibrancy.',
    highlights: [
      'Dust gently using a soft dry makeup brush or cool hairdryer on low.',
      'Store upright in a dry vase or keep wrapped in their kraft presentation cone.',
    ],
  },
  {
    id: 'faq-care-2',
    category: 'Care Instructions',
    question: 'How should I preserve Pressed-Flower Bookmarks, Kolka Art & Memory Jars?',
    answer:
      'Store cotton paper art and pressed florals away from dampness. Our Kolka Art boards are sealed with a matte protective coat so they can be wiped lightly with a dry microfibre cloth.',
    highlights: [
      'Avoid placing pressed botanicals on sunny windowsills for months at a time.',
      'Memory Jar fairy lights run on replaceable button cells — switch off when not displaying.',
    ],
  },
];
