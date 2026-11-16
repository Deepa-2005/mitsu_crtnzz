export type PageRoute =
  | 'home'
  | 'about'
  | 'shop'
  | 'custom'
  | 'gallery'
  | 'journal'
  | 'contact'
  | 'studio';

export type StudioManagerTab = 'products' | 'offers' | 'collections';

export type ProductCategory = string;

export type TierKey = 'basic' | 'premium' | 'customise';

export interface ProductTier {
  key: TierKey;
  label: string;
  price: number | null;
  tagline: string;
  includes: string[];
}

export type AvailabilityStatus = 'Made to Order' | 'In Stock' | 'Festive Favorite';

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  blurb: string;
  description: string;
  craftTime: string;
  dimensions: string;
  materials: string;
  availability: AvailabilityStatus;
  badge?: string;
  image: string;
  secondaryImage?: string;
  featured?: boolean;
  tiers: ProductTier[];
}

export interface CartItem {
  slug: string;
  tier: TierKey;
  quantity: number;
}

export interface SpecialOffer {
  slug: string;
  badge: string;
  code: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
  productSlug?: string;
}

export type GalleryCollection = string;

export interface StudioDataState {
  products: Product[];
  offers: SpecialOffer[];
  shopCollections: string[];
  galleryPieces: GalleryPiece[];
  galleryCollections: string[];
  offerings: string[];
}

export interface GalleryPiece {
  id: string;
  title: string;
  collection: GalleryCollection;
  medium: string;
  dimensions: string;
  year: string;
  locationOrContext: string;
  description: string;
  image: string;
}

export type JournalCategory = 'Botanical Craft' | 'Heritage & Rangoli' | 'DIY Ideas' | 'Studio Notes';

export interface JournalArticle {
  id: string;
  title: string;
  subtitle: string;
  category: JournalCategory;
  publishedAt: string;
  readTime: string;
  author: string;
  image: string;
  excerpt: string;
  content: string[];
}

export interface CustomEnquiry {
  id: string;
  submittedAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  creationType: string;
  occasion: string;
  timeline: string;
  budgetRange: string;
  description: string;
}

export interface DeliveryLocation {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
  displayName?: string;
}

export interface CheckoutFormPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes: string;
  deliveryLocation?: DeliveryLocation | null;
}

export interface DeliveryStatus {
  sent: boolean;
  provider: string;
  detail: string;
}

export interface OrderConfirmationResult {
  reference: string;
  subtotal: number;
  pricedCount: number;
  quotedCount: number;
  message: string;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  whatsappUrl: string;
  mailtoUrl: string;
  studioWhatsappNumber: string;
  studioEmail: string;
  deliveryLocation?: DeliveryLocation | null;
}

export interface PublicStudioConfig {
  studioEmail: string;
  studioWhatsappNumber: string;
  googleMapsApiKey: string;
}

export interface SavedOrderLineItem {
  slug: string;
  name: string;
  tier: TierKey;
  tierLabel: string;
  quantity: number;
  price: number | null;
  lineTotal: number;
}

export interface SavedOrderRecord {
  reference: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  deliveryLocation?: DeliveryLocation | null;
  items: SavedOrderLineItem[];
  subtotal: number;
  pricedCount: number;
  quotedCount: number;
  message: string;
  whatsappUrl: string;
  mailtoUrl: string;
}

