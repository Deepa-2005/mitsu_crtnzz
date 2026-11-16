import type {
  GalleryPiece,
  Product,
  SpecialOffer,
  StudioDataState,
  TierKey,
} from '../types/index.ts';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const SAFE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_CODE_RE = /^[A-Z0-9_-]{2,20}$/;
const ALLOWED_AVAILABILITY = new Set(['Made to Order', 'In Stock', 'Festive Favorite']);
const REQUIRED_TIERS: TierKey[] = ['basic', 'premium', 'customise'];

export function isSafeImageUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  if (/^https:\/\//i.test(trimmed) || /^http:\/\//i.test(trimmed)) return true;
  if (
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(trimmed) &&
    trimmed.length <= 1_800_000
  ) {
    return true;
  }
  return false;
}

export function validateProduct(
  product: unknown,
  validCollections?: string[]
): ValidationResult {
  const errors: string[] = [];
  if (!product || typeof product !== 'object') {
    return { valid: false, errors: ['Product payload must be a valid object.'] };
  }
  const p = product as Partial<Product>;

  if (typeof p.id !== 'string' || p.id.trim().length < 2) {
    errors.push('Product ID is missing.');
  }
  if (typeof p.name !== 'string' || p.name.trim().length < 2 || p.name.trim().length > 100) {
    errors.push('Product name must be between 2 and 100 characters.');
  }
  if (typeof p.slug !== 'string' || !SAFE_SLUG_RE.test(p.slug.trim())) {
    errors.push('Product slug must contain only lowercase letters, numbers, and hyphens.');
  }
  if (typeof p.sku !== 'string' || p.sku.trim().length < 2 || p.sku.trim().length > 32) {
    errors.push('Product SKU must be between 2 and 32 characters.');
  }
  if (typeof p.category !== 'string' || p.category.trim().length < 2 || p.category.trim().length > 50) {
    errors.push('Product collection/category must be between 2 and 50 characters.');
  } else if (validCollections && !validCollections.includes(p.category.trim())) {
    errors.push(`Category "${p.category}" does not match an active shop collection.`);
  }
  if (typeof p.blurb !== 'string' || p.blurb.trim().length < 5 || p.blurb.trim().length > 260) {
    errors.push('Short card summary must be between 5 and 260 characters.');
  }
  if (
    typeof p.description !== 'string' ||
    p.description.trim().length < 5 ||
    p.description.trim().length > 1500
  ) {
    errors.push('Full studio description must be between 5 and 1500 characters.');
  }
  if (typeof p.craftTime !== 'string' || p.craftTime.trim().length < 2 || p.craftTime.trim().length > 60) {
    errors.push('Craft time is required (2–60 characters).');
  }
  if (typeof p.availability !== 'string' || !ALLOWED_AVAILABILITY.has(p.availability)) {
    errors.push('Availability must be In Stock, Made to Order, or Festive Favorite.');
  }
  if (!isSafeImageUrl(p.image)) {
    errors.push('Primary product photo must be a valid studio asset, HTTPS URL, or uploaded image.');
  }
  if (p.secondaryImage !== undefined && p.secondaryImage !== '' && !isSafeImageUrl(p.secondaryImage)) {
    errors.push('Secondary product photo URL is invalid.');
  }

  if (!Array.isArray(p.tiers) || p.tiers.length !== 3) {
    errors.push('Every product must define exactly 3 pricing tiers (Basic, Premium, Personalised).');
  } else {
    REQUIRED_TIERS.forEach((reqKey, index) => {
      const tier = p.tiers?.[index];
      if (!tier || tier.key !== reqKey) {
        errors.push(`Tier ${index + 1} must have key "${reqKey}".`);
        return;
      }
      if (typeof tier.label !== 'string' || tier.label.trim().length < 1 || tier.label.trim().length > 40) {
        errors.push(`Tier ${index + 1} label must be between 1 and 40 characters.`);
      }
      if (
        tier.price !== null &&
        (typeof tier.price !== 'number' ||
          !Number.isFinite(tier.price) ||
          tier.price < 0 ||
          tier.price > 500000)
      ) {
        errors.push(`Tier "${tier.label || reqKey}" price must be ₹0–₹5,00,000 or Quote only.`);
      }
      if (!Array.isArray(tier.includes)) {
        errors.push(`Tier "${tier.label || reqKey}" includes list must be an array.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateOffer(
  offer: unknown,
  validProductSlugs?: Set<string>
): ValidationResult {
  const errors: string[] = [];
  if (!offer || typeof offer !== 'object') {
    return { valid: false, errors: ['Offer payload must be a valid object.'] };
  }
  const o = offer as Partial<SpecialOffer>;

  if (typeof o.slug !== 'string' || !SAFE_SLUG_RE.test(o.slug.trim())) {
    errors.push('Offer slug must be URL-safe lowercase alphanumeric.');
  }
  if (typeof o.code !== 'string' || !SAFE_CODE_RE.test(o.code.trim().toUpperCase())) {
    errors.push('Promo code must be 2–20 uppercase letters, numbers, hyphens, or underscores.');
  }
  if (typeof o.badge !== 'string' || o.badge.trim().length < 2 || o.badge.trim().length > 40) {
    errors.push('Offer badge must be 2–40 characters.');
  }
  if (typeof o.title !== 'string' || o.title.trim().length < 2 || o.title.trim().length > 90) {
    errors.push('Offer title must be 2–90 characters.');
  }
  if (typeof o.discount !== 'string' || o.discount.trim().length < 2 || o.discount.trim().length > 40) {
    errors.push('Discount highlight must be 2–40 characters.');
  }
  if (
    typeof o.description !== 'string' ||
    o.description.trim().length < 5 ||
    o.description.trim().length > 400
  ) {
    errors.push('Offer description must be 5–400 characters.');
  }
  if (typeof o.validUntil !== 'string' || o.validUntil.trim().length < 3 || o.validUntil.trim().length > 40) {
    errors.push('Valid until text is required.');
  }
  if (
    o.productSlug &&
    validProductSlugs &&
    !validProductSlugs.has(o.productSlug.trim())
  ) {
    errors.push(`Linked product "${o.productSlug}" does not exist in the catalog.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateGalleryPiece(
  piece: unknown,
  validCollections?: string[]
): ValidationResult {
  const errors: string[] = [];
  if (!piece || typeof piece !== 'object') {
    return { valid: false, errors: ['Gallery piece must be a valid object.'] };
  }
  const g = piece as Partial<GalleryPiece>;

  if (typeof g.id !== 'string' || g.id.trim().length < 2) {
    errors.push('Gallery piece ID is missing.');
  }
  if (typeof g.title !== 'string' || g.title.trim().length < 2 || g.title.trim().length > 120) {
    errors.push('Artwork title must be between 2 and 120 characters.');
  }
  if (typeof g.collection !== 'string' || g.collection.trim().length < 2 || g.collection.trim().length > 60) {
    errors.push('Gallery collection is required.');
  } else if (validCollections && !validCollections.includes(g.collection.trim())) {
    errors.push(`Gallery collection "${g.collection}" does not exist.`);
  }
  if (typeof g.medium !== 'string' || g.medium.trim().length < 2 || g.medium.trim().length > 160) {
    errors.push('Medium is required (2–160 characters).');
  }
  if (typeof g.dimensions !== 'string' || g.dimensions.trim().length < 2 || g.dimensions.trim().length > 80) {
    errors.push('Dimensions are required.');
  }
  if (typeof g.year !== 'string' || !/^\d{4}$/.test(g.year.trim())) {
    errors.push('Year must be a 4-digit year (e.g. 2026).');
  }
  if (typeof g.description !== 'string' || g.description.trim().length < 5 || g.description.trim().length > 800) {
    errors.push('Artwork description must be between 5 and 800 characters.');
  }
  if (!isSafeImageUrl(g.image)) {
    errors.push('Artwork image must be a valid studio asset, HTTPS URL, or uploaded image.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateStudioDataState(state: unknown): ValidationResult {
  const errors: string[] = [];
  if (!state || typeof state !== 'object') {
    return { valid: false, errors: ['Studio catalog payload must be a JSON object.'] };
  }
  const s = state as Partial<StudioDataState>;

  if (!Array.isArray(s.shopCollections) || s.shopCollections.length === 0 || s.shopCollections.length > 25) {
    errors.push('At least 1 (and at most 25) shop collections are required.');
  } else {
    const seen = new Set<string>();
    for (const col of s.shopCollections) {
      if (typeof col !== 'string' || col.trim().length < 2 || col.trim().length > 50) {
        errors.push('Each shop collection name must be 2–50 characters.');
      } else {
        const lower = col.trim().toLowerCase();
        if (seen.has(lower)) errors.push(`Duplicate shop collection "${col}".`);
        seen.add(lower);
      }
    }
  }

  if (
    !Array.isArray(s.galleryCollections) ||
    s.galleryCollections.length === 0 ||
    s.galleryCollections.length > 20
  ) {
    errors.push('At least 1 (and at most 20) gallery collections are required.');
  } else {
    const seen = new Set<string>();
    for (const col of s.galleryCollections) {
      if (typeof col !== 'string' || col.trim().length < 2 || col.trim().length > 60) {
        errors.push('Each gallery collection name must be 2–60 characters.');
      } else {
        const lower = col.trim().toLowerCase();
        if (seen.has(lower)) errors.push(`Duplicate gallery collection "${col}".`);
        seen.add(lower);
      }
    }
  }

  const productSlugs = new Set<string>();
  if (!Array.isArray(s.products) || s.products.length === 0 || s.products.length > 150) {
    errors.push('Studio catalog must include between 1 and 150 products.');
  } else {
    s.products.forEach((prod, index) => {
      const res = validateProduct(
        prod,
        Array.isArray(s.shopCollections) ? s.shopCollections : undefined
      );
      if (!res.valid) {
        errors.push(`Product #${index + 1} (${(prod as Partial<Product>)?.name || 'Untitled'}): ${res.errors[0]}`);
      }
      if (prod && typeof prod.slug === 'string') {
        if (productSlugs.has(prod.slug)) {
          errors.push(`Duplicate product slug "${prod.slug}".`);
        }
        productSlugs.add(prod.slug);
      }
    });
  }

  if (!Array.isArray(s.offers) || s.offers.length > 30) {
    errors.push('Offers must be an array of at most 30 items.');
  } else {
    const offerCodes = new Set<string>();
    s.offers.forEach((offer, index) => {
      const res = validateOffer(offer, productSlugs);
      if (!res.valid) {
        errors.push(`Offer #${index + 1}: ${res.errors[0]}`);
      }
      if (offer && typeof offer.code === 'string') {
        const code = offer.code.trim().toUpperCase();
        if (offerCodes.has(code)) errors.push(`Duplicate offer promo code "${code}".`);
        offerCodes.add(code);
      }
    });
  }

  if (!Array.isArray(s.galleryPieces) || s.galleryPieces.length > 100) {
    errors.push('Gallery pieces must be an array of at most 100 items.');
  } else {
    s.galleryPieces.forEach((piece, index) => {
      const res = validateGalleryPiece(
        piece,
        Array.isArray(s.galleryCollections) ? s.galleryCollections : undefined
      );
      if (!res.valid) {
        errors.push(`Gallery piece #${index + 1}: ${res.errors[0]}`);
      }
    });
  }

  if (!Array.isArray(s.offerings) || s.offerings.length === 0 || s.offerings.length > 40) {
    errors.push('Offerings tags must include 1–40 entries.');
  }

  return { valid: errors.length === 0, errors };
}
