import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  GalleryPiece,
  Product,
  ProductTier,
  SpecialOffer,
  StudioDataState,
  TierKey,
} from '../types';
import { getStartingPrice, getTier, OFFERINGS_LIST, PRODUCT_CATALOG } from '../data/catalog';
import { SPECIAL_OFFERS } from '../data/offers';
import { GALLERY_COLLECTION } from '../data/gallery';
import { validateStudioDataState } from '../lib/studioValidation';
import { useOwnerAuth } from './OwnerAuthContext';

const DEFAULT_SHOP_COLLECTIONS = ['Art & Crafts', 'Giftables', 'Lifestyle'];
const DEFAULT_GALLERY_COLLECTIONS = ['Rangoli & Devotional', 'Botanical & Studio'];

function buildDefaultState(): StudioDataState {
  return {
    products: PRODUCT_CATALOG.map((p) => ({
      ...p,
      tiers: p.tiers.map((t) => ({ ...t, includes: [...t.includes] })),
    })),
    offers: SPECIAL_OFFERS.map((o) => ({ ...o })),
    shopCollections: [...DEFAULT_SHOP_COLLECTIONS],
    galleryPieces: GALLERY_COLLECTION.map((g) => ({ ...g })),
    galleryCollections: [...DEFAULT_GALLERY_COLLECTIONS],
    offerings: [...OFFERINGS_LIST],
  };
}

export interface StudioPhotoPreset {
  label: string;
  src: string;
}

export interface CatalogMutationResult {
  ok: boolean;
  error?: string;
  validationErrors?: string[];
}

export interface AuditEntry {
  timestamp: string;
  by: string;
  summary: string;
}

interface StudioCatalogContextValue {
  products: Product[];
  offers: SpecialOffer[];
  shopCollections: string[];
  galleryPieces: GalleryPiece[];
  galleryCollections: string[];
  offerings: string[];
  isCustomized: boolean;
  isSyncing: boolean;
  lastUpdatedAt: string | null;
  lastUpdatedBy: string | null;
  photoPresets: StudioPhotoPreset[];
  getProductBySlug: (slug: string) => Product | undefined;
  getTier: (product: Product, tierKey: TierKey) => ProductTier;
  getStartingPrice: (product: Product) => number;
  upsertProduct: (product: Product) => Promise<CatalogMutationResult>;
  deleteProduct: (id: string) => Promise<CatalogMutationResult>;
  upsertOffer: (offer: SpecialOffer) => Promise<CatalogMutationResult>;
  deleteOffer: (slug: string) => Promise<CatalogMutationResult>;
  addShopCollection: (name: string) => Promise<CatalogMutationResult>;
  renameShopCollection: (oldName: string, newName: string) => Promise<CatalogMutationResult>;
  deleteShopCollection: (name: string) => Promise<CatalogMutationResult>;
  addGalleryCollection: (name: string) => Promise<CatalogMutationResult>;
  renameGalleryCollection: (oldName: string, newName: string) => Promise<CatalogMutationResult>;
  deleteGalleryCollection: (name: string) => Promise<CatalogMutationResult>;
  upsertGalleryPiece: (piece: GalleryPiece) => Promise<CatalogMutationResult>;
  deleteGalleryPiece: (id: string) => Promise<CatalogMutationResult>;
  updateOfferings: (next: string[]) => Promise<CatalogMutationResult>;
  importStudioJson: (jsonText: string) => Promise<CatalogMutationResult>;
  exportStudioJson: () => string;
  resetToDefaults: () => Promise<CatalogMutationResult>;
  fetchAuditLog: () => Promise<AuditEntry[]>;
}

const StudioCatalogContext = createContext<StudioCatalogContextValue | null>(null);

export const StudioCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwnerVerified, authToken, invalidateSession } = useOwnerAuth();
  const [state, setState] = useState<StudioDataState>(buildDefaultState);
  const [isCustomized, setIsCustomized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);

  // Load published catalog from server on startup (read-only for all visitors)
  useEffect(() => {
    let active = true;
    fetch('/api/studio/catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.ok || !data?.customized || !data?.catalog) return;
        const validation = validateStudioDataState(data.catalog);
        if (validation.valid) {
          setState(data.catalog);
          setIsCustomized(true);
          setLastUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : null);
          setLastUpdatedBy(typeof data.updatedBy === 'string' ? data.updatedBy : null);
        }
      })
      .catch(() => {
        // Keep built-in defaults if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const photoPresets = useMemo<StudioPhotoPreset[]>(() => {
    const seen = new Set<string>();
    const list: StudioPhotoPreset[] = [];
    for (const p of PRODUCT_CATALOG) {
      if (p.image && !seen.has(p.image)) {
        seen.add(p.image);
        list.push({ label: p.name, src: p.image });
      }
      if (p.secondaryImage && !seen.has(p.secondaryImage)) {
        seen.add(p.secondaryImage);
        list.push({ label: `${p.name} (Alt)`, src: p.secondaryImage });
      }
    }
    for (const g of GALLERY_COLLECTION) {
      if (g.image && !seen.has(g.image)) {
        seen.add(g.image);
        list.push({ label: g.title, src: g.image });
      }
    }
    return list;
  }, []);

  const commitOwnerCatalogUpdate = useCallback(
    async (nextState: StudioDataState, summary: string): Promise<CatalogMutationResult> => {
      if (!isOwnerVerified || !authToken) {
        return {
          ok: false,
          error: 'Owner verification required. Only the verified studio owner can save changes.',
        };
      }

      const validation = validateStudioDataState(nextState);
      if (!validation.valid) {
        return {
          ok: false,
          error: validation.errors[0] || 'Validation failed.',
          validationErrors: validation.errors,
        };
      }

      setIsSyncing(true);
      try {
        const res = await fetch('/api/studio/catalog', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ catalog: nextState, summary }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          invalidateSession();
          return {
            ok: false,
            error: data?.error || 'Owner session expired. Please verify again.',
          };
        }
        if (!res.ok || !data?.ok) {
          return {
            ok: false,
            error:
              data?.error ||
              (res.status === 413
                ? 'Catalog payload is too large. Please use smaller compressed images.'
                : `Server returned status ${res.status} while saving catalog update.`),
            validationErrors: Array.isArray(data?.validationErrors)
              ? data.validationErrors
              : undefined,
          };
        }

        setState(nextState);
        setIsCustomized(true);
        setLastUpdatedAt(typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString());
        setLastUpdatedBy(typeof data.updatedBy === 'string' ? data.updatedBy : null);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while saving catalog to server.' };
      } finally {
        setIsSyncing(false);
      }
    },
    [authToken, invalidateSession, isOwnerVerified]
  );

  const getProductBySlugLive = useCallback(
    (slug: string) => state.products.find((p) => p.slug === slug),
    [state.products]
  );

  const upsertProduct = useCallback(
    async (product: Product): Promise<CatalogMutationResult> => {
      const idx = state.products.findIndex((p) => p.id === product.id || p.slug === product.slug);
      const nextProducts = [...state.products];
      if (idx >= 0) {
        nextProducts[idx] = product;
      } else {
        nextProducts.unshift(product);
      }
      const nextShopCollections = state.shopCollections.includes(product.category)
        ? state.shopCollections
        : [...state.shopCollections, product.category];

      return commitOwnerCatalogUpdate(
        {
          ...state,
          products: nextProducts,
          shopCollections: nextShopCollections,
        },
        idx >= 0 ? `Updated product "${product.name}"` : `Added product "${product.name}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<CatalogMutationResult> => {
      const target = state.products.find((p) => p.id === id);
      const nextProducts = state.products.filter((p) => p.id !== id);
      const nextOffers = target
        ? state.offers.map((o) =>
            o.productSlug === target.slug ? { ...o, productSlug: undefined } : o
          )
        : state.offers;
      return commitOwnerCatalogUpdate(
        { ...state, products: nextProducts, offers: nextOffers },
        `Removed product "${target?.name || id}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const upsertOffer = useCallback(
    async (offer: SpecialOffer): Promise<CatalogMutationResult> => {
      const idx = state.offers.findIndex((o) => o.slug === offer.slug);
      const nextOffers = [...state.offers];
      if (idx >= 0) {
        nextOffers[idx] = offer;
      } else {
        nextOffers.unshift(offer);
      }
      return commitOwnerCatalogUpdate(
        { ...state, offers: nextOffers },
        idx >= 0 ? `Updated offer "${offer.code}"` : `Published offer "${offer.code}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const deleteOffer = useCallback(
    async (slug: string): Promise<CatalogMutationResult> => {
      const target = state.offers.find((o) => o.slug === slug);
      return commitOwnerCatalogUpdate(
        { ...state, offers: state.offers.filter((o) => o.slug !== slug) },
        `Removed offer "${target?.code || slug}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const addShopCollection = useCallback(
    async (rawName: string): Promise<CatalogMutationResult> => {
      const name = rawName.trim();
      if (!name) return { ok: false, error: 'Collection name cannot be empty.' };
      if (state.shopCollections.some((c) => c.toLowerCase() === name.toLowerCase())) {
        return { ok: false, error: `Collection "${name}" already exists.` };
      }
      return commitOwnerCatalogUpdate(
        { ...state, shopCollections: [...state.shopCollections, name] },
        `Added shop collection "${name}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const renameShopCollection = useCallback(
    async (oldName: string, rawNewName: string): Promise<CatalogMutationResult> => {
      const newName = rawNewName.trim();
      if (!newName) return { ok: false, error: 'Collection name cannot be empty.' };
      if (oldName === newName) return { ok: true };
      return commitOwnerCatalogUpdate(
        {
          ...state,
          shopCollections: state.shopCollections.map((c) => (c === oldName ? newName : c)),
          products: state.products.map((p) =>
            p.category === oldName ? { ...p, category: newName } : p
          ),
        },
        `Renamed shop collection "${oldName}" to "${newName}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const deleteShopCollection = useCallback(
    async (name: string): Promise<CatalogMutationResult> => {
      const remaining = state.shopCollections.filter((c) => c !== name);
      if (remaining.length === 0) {
        return { ok: false, error: 'At least one shop collection must remain.' };
      }
      const fallback = remaining[0];
      return commitOwnerCatalogUpdate(
        {
          ...state,
          shopCollections: remaining,
          products: state.products.map((p) =>
            p.category === name ? { ...p, category: fallback } : p
          ),
        },
        `Removed shop collection "${name}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const addGalleryCollection = useCallback(
    async (rawName: string): Promise<CatalogMutationResult> => {
      const name = rawName.trim();
      if (!name) return { ok: false, error: 'Gallery collection name cannot be empty.' };
      if (state.galleryCollections.some((c) => c.toLowerCase() === name.toLowerCase())) {
        return { ok: false, error: `Gallery collection "${name}" already exists.` };
      }
      return commitOwnerCatalogUpdate(
        { ...state, galleryCollections: [...state.galleryCollections, name] },
        `Added gallery wing "${name}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const renameGalleryCollection = useCallback(
    async (oldName: string, rawNewName: string): Promise<CatalogMutationResult> => {
      const newName = rawNewName.trim();
      if (!newName) return { ok: false, error: 'Gallery collection name cannot be empty.' };
      if (oldName === newName) return { ok: true };
      return commitOwnerCatalogUpdate(
        {
          ...state,
          galleryCollections: state.galleryCollections.map((c) => (c === oldName ? newName : c)),
          galleryPieces: state.galleryPieces.map((g) =>
            g.collection === oldName ? { ...g, collection: newName } : g
          ),
        },
        `Renamed gallery wing "${oldName}" to "${newName}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const deleteGalleryCollection = useCallback(
    async (name: string): Promise<CatalogMutationResult> => {
      const remaining = state.galleryCollections.filter((c) => c !== name);
      if (remaining.length === 0) {
        return { ok: false, error: 'At least one gallery collection must remain.' };
      }
      const fallback = remaining[0];
      return commitOwnerCatalogUpdate(
        {
          ...state,
          galleryCollections: remaining,
          galleryPieces: state.galleryPieces.map((g) =>
            g.collection === name ? { ...g, collection: fallback } : g
          ),
        },
        `Removed gallery wing "${name}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const upsertGalleryPiece = useCallback(
    async (piece: GalleryPiece): Promise<CatalogMutationResult> => {
      const idx = state.galleryPieces.findIndex((g) => g.id === piece.id);
      const nextPieces = [...state.galleryPieces];
      if (idx >= 0) {
        nextPieces[idx] = piece;
      } else {
        nextPieces.unshift(piece);
      }
      const nextCollections = state.galleryCollections.includes(piece.collection)
        ? state.galleryCollections
        : [...state.galleryCollections, piece.collection];

      return commitOwnerCatalogUpdate(
        {
          ...state,
          galleryPieces: nextPieces,
          galleryCollections: nextCollections,
        },
        idx >= 0 ? `Updated artwork "${piece.title}"` : `Added artwork "${piece.title}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const deleteGalleryPiece = useCallback(
    async (id: string): Promise<CatalogMutationResult> => {
      const target = state.galleryPieces.find((g) => g.id === id);
      return commitOwnerCatalogUpdate(
        { ...state, galleryPieces: state.galleryPieces.filter((g) => g.id !== id) },
        `Removed artwork "${target?.title || id}"`
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const updateOfferings = useCallback(
    async (next: string[]): Promise<CatalogMutationResult> => {
      const cleaned = next.map((s) => s.trim()).filter(Boolean);
      return commitOwnerCatalogUpdate(
        { ...state, offerings: cleaned },
        'Updated studio craft offerings list'
      );
    },
    [commitOwnerCatalogUpdate, state]
  );

  const exportStudioJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importStudioJson = useCallback(
    async (jsonText: string): Promise<CatalogMutationResult> => {
      try {
        const parsed = JSON.parse(jsonText) as StudioDataState;
        const validation = validateStudioDataState(parsed);
        if (!validation.valid) {
          return {
            ok: false,
            error: validation.errors[0] || 'Imported JSON failed validation.',
            validationErrors: validation.errors,
          };
        }
        return commitOwnerCatalogUpdate(parsed, 'Imported full studio catalog JSON');
      } catch {
        return { ok: false, error: 'Could not parse JSON. Please verify the file contents.' };
      }
    },
    [commitOwnerCatalogUpdate]
  );

  const resetToDefaults = useCallback(async (): Promise<CatalogMutationResult> => {
    if (!isOwnerVerified || !authToken) {
      return {
        ok: false,
        error: 'Owner verification required to reset the studio catalog.',
      };
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/studio/catalog/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        invalidateSession();
        return { ok: false, error: data?.error || 'Owner session expired.' };
      }
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'Could not reset catalog.' };
      }
      setState(buildDefaultState());
      setIsCustomized(false);
      setLastUpdatedAt(null);
      setLastUpdatedBy(null);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while resetting catalog.' };
    } finally {
      setIsSyncing(false);
    }
  }, [authToken, invalidateSession, isOwnerVerified]);

  const fetchAuditLog = useCallback(async (): Promise<AuditEntry[]> => {
    if (!isOwnerVerified || !authToken) return [];
    try {
      const res = await fetch('/api/owner/audit', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json().catch(() => ({}));
      return Array.isArray(data?.auditLog) ? data.auditLog : [];
    } catch {
      return [];
    }
  }, [authToken, isOwnerVerified]);

  const value = useMemo<StudioCatalogContextValue>(
    () => ({
      products: state.products,
      offers: state.offers,
      shopCollections: state.shopCollections,
      galleryPieces: state.galleryPieces,
      galleryCollections: state.galleryCollections,
      offerings: state.offerings,
      isCustomized,
      isSyncing,
      lastUpdatedAt,
      lastUpdatedBy,
      photoPresets,
      getProductBySlug: getProductBySlugLive,
      getTier,
      getStartingPrice,
      upsertProduct,
      deleteProduct,
      upsertOffer,
      deleteOffer,
      addShopCollection,
      renameShopCollection,
      deleteShopCollection,
      addGalleryCollection,
      renameGalleryCollection,
      deleteGalleryCollection,
      upsertGalleryPiece,
      deleteGalleryPiece,
      updateOfferings,
      importStudioJson,
      exportStudioJson,
      resetToDefaults,
      fetchAuditLog,
    }),
    [
      state,
      isCustomized,
      isSyncing,
      lastUpdatedAt,
      lastUpdatedBy,
      photoPresets,
      getProductBySlugLive,
      upsertProduct,
      deleteProduct,
      upsertOffer,
      deleteOffer,
      addShopCollection,
      renameShopCollection,
      deleteShopCollection,
      addGalleryCollection,
      renameGalleryCollection,
      deleteGalleryCollection,
      upsertGalleryPiece,
      deleteGalleryPiece,
      updateOfferings,
      importStudioJson,
      exportStudioJson,
      resetToDefaults,
      fetchAuditLog,
    ]
  );

  return <StudioCatalogContext.Provider value={value}>{children}</StudioCatalogContext.Provider>;
};

export function useStudioCatalog(): StudioCatalogContextValue {
  const ctx = useContext(StudioCatalogContext);
  if (!ctx) {
    throw new Error('useStudioCatalog must be used inside StudioCatalogProvider');
  }
  return ctx;
}
