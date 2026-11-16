import { TierKey } from '../types';

export interface ServerProductPricing {
  name: string;
  tiers: Record<TierKey, { label: string; price: number | null }>;
}

export const CATALOG_PRICING: Record<string, ServerProductPricing> = {
  'greeting-card': {
    name: 'Greeting Card',
    tiers: {
      basic: { label: 'Basic', price: 49 },
      premium: { label: 'Premium', price: 99 },
      customise: { label: 'Personalised', price: 129 },
    },
  },
  bookmark: {
    name: 'Bookmark',
    tiers: {
      basic: { label: 'Basic', price: 29 },
      premium: { label: 'Premium', price: 69 },
      customise: { label: 'Personalised', price: 89 },
    },
  },
  'mini-scrapbook': {
    name: 'Mini Scrapbook',
    tiers: {
      basic: { label: 'Basic', price: 199 },
      premium: { label: 'Premium', price: 269 },
      customise: { label: 'Personalised', price: 329 },
    },
  },
  'pipe-cleaner-bouquet': {
    name: 'Pipe Cleaner Bouquet',
    tiers: {
      basic: { label: 'Basic', price: 199 },
      premium: { label: 'Premium', price: 253 },
      customise: { label: 'Personalised', price: 355 },
    },
  },
  'paper-bouquet': {
    name: 'Paper Bouquet',
    tiers: {
      basic: { label: 'Basic', price: 149 },
      premium: { label: 'Premium', price: 185 },
      customise: { label: 'Personalised', price: 205 },
    },
  },
  'ribbon-bouquet': {
    name: 'Ribbon Bouquet',
    tiers: {
      basic: { label: 'Basic', price: 199 },
      premium: { label: 'Premium', price: 299 },
      customise: { label: 'Personalised', price: 399 },
    },
  },
  'photo-frame': {
    name: 'Photo Frame',
    tiers: {
      basic: { label: 'Basic', price: 199 },
      premium: { label: 'Premium', price: 349 },
      customise: { label: 'Personalised', price: 499 },
    },
  },
  'mini-polaroid-painting': {
    name: 'Mini Polaroid Painting',
    tiers: {
      basic: { label: 'Basic', price: 149 },
      premium: { label: 'Premium', price: 169 },
      customise: { label: 'Personalised', price: 213 },
    },
  },
  'kolka-art': {
    name: 'Kolka Art',
    tiers: {
      basic: { label: 'Basic', price: 99 },
      premium: { label: 'Premium', price: 249 },
      customise: { label: 'Personalised', price: 399 },
    },
  },
  keychain: {
    name: 'Keychain',
    tiers: {
      basic: { label: 'Basic', price: 49 },
      premium: { label: 'Premium', price: 169 },
      customise: { label: 'Personalised', price: 114 },
    },
  },
  'memory-jar': {
    name: 'Memory Jar',
    tiers: {
      basic: { label: 'Basic', price: 99 },
      premium: { label: 'Premium', price: 249 },
      customise: { label: 'Personalised', price: 299 },
    },
  },
  'real-flower-bouquet': {
    name: 'Real Flower Bouquet',
    tiers: {
      basic: { label: 'Basic', price: 139 },
      premium: { label: 'Premium', price: 205 },
      customise: { label: 'Personalised', price: 315 },
    },
  },
  'gift-hampers': {
    name: 'Gift Hampers',
    tiers: {
      basic: { label: 'Silver', price: 298 },
      premium: { label: 'Gold', price: 329 },
      customise: { label: 'Platinum', price: 529 },
    },
  },
};
