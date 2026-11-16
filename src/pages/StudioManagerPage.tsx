import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Download,
  Edit3,
  FolderPlus,
  ImagePlus,
  Layers,
  LogOut,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  AvailabilityStatus,
  GalleryPiece,
  PageRoute,
  Product,
  ProductTier,
  SpecialOffer,
  StudioManagerTab,
} from '../types';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { AuditEntry, useStudioCatalog } from '../context/StudioCatalogContext';
import { OwnerVerificationGate } from '../components/OwnerVerificationGate';
import {
  validateGalleryPiece,
  validateOffer,
  validateProduct,
} from '../lib/studioValidation';
import { formatINR } from '../lib/site';
import { ResilientImage } from '../components/ResilientImage';

interface StudioManagerPageProps {
  initialTab?: StudioManagerTab;
  onNavigate: (page: PageRoute) => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function createEmptyProduct(defaultCategory: string, defaultImage: string): Product {
  const uid = Math.random().toString(36).slice(2, 6);
  return {
    id: `prod-custom-${Date.now()}-${uid}`,
    slug: '',
    sku: `MC-CUS-${uid.toUpperCase()}`,
    name: '',
    category: defaultCategory,
    blurb: '',
    description: '',
    craftTime: '2–4 days',
    dimensions: 'Studio handmade size',
    materials: 'Handmade cotton paper, botanical accents, ribbon',
    availability: 'Made to Order',
    badge: '',
    image: defaultImage,
    featured: false,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 99,
        tagline: 'Clean studio handmade finish',
        includes: ['Handcrafted piece', 'Kraft protective sleeve'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 199,
        tagline: 'Expanded detailing & gift-ready wrap',
        includes: ['Richer botanical finish', 'Ribbon-tied gift wrap'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 299,
        tagline: 'Custom colours, names & personal message',
        includes: ['Custom name or date', 'Handwritten note card', 'Gift box'],
      },
    ],
  };
}

function createEmptyOffer(): SpecialOffer {
  return {
    slug: '',
    badge: 'Studio Special',
    code: '',
    title: '',
    discount: '',
    description: '',
    validUntil: '31 Dec 2026',
    productSlug: '',
  };
}

function createEmptyGalleryPiece(defaultCollection: string, defaultImage: string): GalleryPiece {
  return {
    id: `gal-custom-${Date.now()}`,
    title: '',
    collection: defaultCollection,
    medium: 'Handmade paper, mineral pigments & pressed blooms',
    dimensions: '30 × 40 cm',
    year: String(new Date().getFullYear()),
    locationOrContext: 'Studio Archive',
    description: '',
    image: defaultImage,
  };
}

export const StudioManagerPage: React.FC<StudioManagerPageProps> = ({
  initialTab = 'products',
  onNavigate,
}) => {
  const { isOwnerVerified, checkingSession, ownerEmail, logout } = useOwnerAuth();
  const {
    products,
    offers,
    shopCollections,
    galleryPieces,
    galleryCollections,
    offerings,
    isCustomized,
    isSyncing,
    photoPresets,
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
  } = useStudioCatalog();

  const [activeTab, setActiveTab] = useState<StudioManagerTab>(initialTab);
  const [statusBanner, setStatusBanner] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);

  // Audit log view
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Product editor state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newInlineCategory, setNewInlineCategory] = useState('');
  const [productErrors, setProductErrors] = useState<string[]>([]);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);

  // Offer editor state
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [isNewOffer, setIsNewOffer] = useState(false);
  const [offerErrors, setOfferErrors] = useState<string[]>([]);
  const [confirmDeleteOfferSlug, setConfirmDeleteOfferSlug] = useState<string | null>(null);

  // Collections editor state
  const [newShopColName, setNewShopColName] = useState('');
  const [renamingShopCol, setRenamingShopCol] = useState<{ from: string; to: string } | null>(null);
  const [newGalleryColName, setNewGalleryColName] = useState('');
  const [renamingGalleryCol, setRenamingGalleryCol] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [newOfferingText, setNewOfferingText] = useState('');

  // Gallery piece editor state
  const [editingPiece, setEditingPiece] = useState<GalleryPiece | null>(null);
  const [isNewPiece, setIsNewPiece] = useState(false);
  const [pieceErrors, setPieceErrors] = useState<string[]>([]);
  const [confirmDeletePieceId, setConfirmDeletePieceId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!statusBanner) return;
    const t = window.setTimeout(() => setStatusBanner(null), 4500);
    return () => window.clearTimeout(t);
  }, [statusBanner]);

  const showStatus = (text: string, type: 'ok' | 'error' = 'ok') => {
    setStatusBanner({ text, type });
  };

  if (checkingSession) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-[#CF6C87] mx-auto animate-pulse" />
        <p className="font-display text-2xl text-[#183923]">Verifying owner session...</p>
      </div>
    );
  }

  if (!isOwnerVerified) {
    return <OwnerVerificationGate onNavigate={onNavigate} />;
  }

  const handleToggleAuditLog = async () => {
    const next = !showAuditLog;
    setShowAuditLog(next);
    if (next) {
      const list = await fetchAuditLog();
      setAuditEntries(list);
    }
  };

  const handleExport = () => {
    const json = exportStudioJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mitsu-studio-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Studio catalog exported as JSON backup.');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await importStudioJson(text);
      if (result.ok) {
        showStatus('Validated and published imported studio catalog.');
      } else {
        showStatus(result.error || 'Import failed validation.', 'error');
      }
    } catch {
      showStatus('Could not read the selected JSON file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const cleanName = editingProduct.name.trim();
    const finalCategory =
      newInlineCategory.trim() || editingProduct.category || shopCollections[0] || 'Giftables';
    const baseSlug = editingProduct.slug.trim() || slugify(cleanName) || `item-${Date.now()}`;
    let finalSlug = baseSlug;
    if (isNewProduct) {
      const existingSlugs = new Set(products.map((p) => p.slug));
      let suffix = 2;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
    }

    const candidateProduct: Product = {
      ...editingProduct,
      name: cleanName,
      slug: finalSlug,
      sku: editingProduct.sku.trim() || `MC-${finalSlug.slice(0, 4).toUpperCase()}`,
      category: finalCategory,
      blurb: editingProduct.blurb.trim(),
      description: editingProduct.description.trim() || editingProduct.blurb.trim(),
      badge: editingProduct.badge?.trim() || undefined,
      tiers: editingProduct.tiers.map((tier) => ({
        ...tier,
        label: tier.label.trim() || tier.key,
        includes: tier.includes.map((l) => l.trim()).filter(Boolean),
      })),
    };

    const allowedCollections = shopCollections.includes(finalCategory)
      ? shopCollections
      : [...shopCollections, finalCategory];

    const validation = validateProduct(candidateProduct, allowedCollections);
    if (!validation.valid) {
      setProductErrors(validation.errors);
      return;
    }

    const res = await upsertProduct(candidateProduct);
    if (!res.ok) {
      setProductErrors(res.validationErrors || [res.error || 'Could not save product.']);
      return;
    }

    setProductErrors([]);
    setEditingProduct(null);
    setNewInlineCategory('');
    showStatus(
      isNewProduct
        ? `Validated & published "${cleanName}" to the live Store.`
        : `Validated & updated "${cleanName}".`
    );
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'secondaryImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setEditingProduct({ ...editingProduct, [field]: dataUrl });
      showStatus('Photo uploaded and optimised.');
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Could not upload photo.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    const cleanTitle = editingOffer.title.trim();
    const cleanCode = editingOffer.code.trim().toUpperCase();
    const cleanSlug = editingOffer.slug.trim() || slugify(cleanCode) || `offer-${Date.now()}`;

    const candidateOffer: SpecialOffer = {
      ...editingOffer,
      slug: cleanSlug,
      code: cleanCode,
      title: cleanTitle,
      badge: editingOffer.badge.trim(),
      discount: editingOffer.discount.trim(),
      description: editingOffer.description.trim(),
      validUntil: editingOffer.validUntil.trim(),
      productSlug: editingOffer.productSlug?.trim() || undefined,
    };

    const validation = validateOffer(
      candidateOffer,
      new Set(products.map((p) => p.slug))
    );
    if (!validation.valid) {
      setOfferErrors(validation.errors);
      return;
    }

    const res = await upsertOffer(candidateOffer);
    if (!res.ok) {
      setOfferErrors(res.validationErrors || [res.error || 'Could not publish offer.']);
      return;
    }

    setOfferErrors([]);
    setEditingOffer(null);
    showStatus(isNewOffer ? `Published offer ${cleanCode}.` : `Updated offer ${cleanCode}.`);
  };

  const handleSaveGalleryPiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPiece) return;

    const candidatePiece: GalleryPiece = {
      ...editingPiece,
      title: editingPiece.title.trim(),
      collection: editingPiece.collection || galleryCollections[0] || 'Botanical & Studio',
      medium: editingPiece.medium.trim(),
      dimensions: editingPiece.dimensions.trim(),
      year: editingPiece.year.trim(),
      locationOrContext: editingPiece.locationOrContext.trim() || 'Studio Archive',
      description: editingPiece.description.trim(),
    };

    const validation = validateGalleryPiece(candidatePiece, galleryCollections);
    if (!validation.valid) {
      setPieceErrors(validation.errors);
      return;
    }

    const res = await upsertGalleryPiece(candidatePiece);
    if (!res.ok) {
      setPieceErrors(res.validationErrors || [res.error || 'Could not save gallery piece.']);
      return;
    }

    setPieceErrors([]);
    setEditingPiece(null);
    showStatus(
      isNewPiece
        ? `Added "${candidatePiece.title}" to Gallery.`
        : `Updated "${candidatePiece.title}".`
    );
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPiece) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setEditingPiece({ ...editingPiece, image: dataUrl });
      showStatus('Gallery image uploaded.');
    } catch (err) {
      showStatus(err instanceof Error ? err.message : 'Could not upload image.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const updateEditingTier = (index: number, patch: Partial<ProductTier>) => {
    if (!editingProduct) return;
    const nextTiers = editingProduct.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t));
    setEditingProduct({ ...editingProduct, tiers: nextTiers });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-14 space-y-8">
      {/* Verified Owner Bar */}
      <div className="rounded-2xl bg-[#183923] text-[#F8F0E4] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
          <ShieldCheck className="w-4 h-4 text-[#A8B18F] shrink-0" />
          <span>
            Verified Owner: <strong className="text-[#E9A9AA]">{ownerEmail}</strong>
          </span>
          <span className="text-[#F8F0E4]/45">·</span>
          <span className="text-[#F8F0E4]/80">
            {isSyncing ? 'Validating & publishing...' : 'Server-protected & schema-validated'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAuditLog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#F8F0E4]/25 text-[12px] hover:bg-[#F8F0E4]/10 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#E9A9AA]" />
            <span>{showAuditLog ? 'Hide Audit Log' : 'Audit Log'}</span>
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E9A9AA] text-[#183923] text-[12px] font-semibold hover:bg-[#f0b8b9] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock &amp; Sign Out</span>
          </button>
        </div>
      </div>

      {/* Audit Log Panel */}
      {showAuditLog && (
        <div className="rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/60 p-5 space-y-3">
          <h2 className="font-display text-2xl font-semibold text-[#183923]">
            Recent Owner Activity
          </h2>
          {auditEntries.length === 0 ? (
            <p className="text-[13px] text-[#183923]/70">
              No custom changes published yet on this server.
            </p>
          ) : (
            <ul className="space-y-1.5 text-[13px] max-h-48 overflow-y-auto">
              {auditEntries.map((entry, idx) => (
                <li
                  key={`${entry.timestamp}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-[#A8B18F]/25 last:border-b-0"
                >
                  <span className="text-[#183923] font-medium">{entry.summary}</span>
                  <span className="text-[11.5px] text-[#183923]/65 tabular-nums">
                    {entry.by} · {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-[#A8B18F]/45">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onNavigate('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#183923]/75 hover:text-[#183923] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <span className="text-[#A8B18F]">·</span>
            <span className="text-[12px] font-medium text-[#CF6C87]">
              {isCustomized ? 'Published custom studio catalog active' : 'Using default studio catalog'}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#183923]">
            Studio Catalog Manager
          </h1>
          <p className="text-[14.5px] text-[#183923]/75 leading-relaxed">
            Every update is verified against your Owner session token and validated for pricing,
            image safety, and unique codes before publishing live to customers.
          </p>
        </div>

        {/* Backup / Reset Tools */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FDF9F4] border border-[#A8B18F]/70 text-[12.5px] font-medium text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FDF9F4] border border-[#A8B18F]/70 text-[12.5px] font-medium text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept="application/json" onChange={handleImportFile} className="sr-only" />
          </label>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={!isCustomized || isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#CF6C87]/50 text-[12.5px] font-medium text-[#CF6C87] hover:bg-[#F9E4E7] transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F9E4E7] border border-[#CF6C87] text-[12px]">
              <span className="text-[#183923] font-medium">Restore defaults?</span>
              <button
                type="button"
                onClick={async () => {
                  const res = await resetToDefaults();
                  setConfirmReset(false);
                  showStatus(
                    res.ok
                      ? 'Restored original MITSU Crntzz studio catalog.'
                      : res.error || 'Could not reset.',
                    res.ok ? 'ok' : 'error'
                  );
                }}
                className="px-2 py-0.5 rounded-full bg-[#183923] text-[#F8F0E4] font-medium cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-0.5 text-[#183923]/75 hover:text-[#183923] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Toast/Banner */}
      {statusBanner && (
        <div
          role={statusBanner.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-[13.5px] ${
            statusBanner.type === 'error'
              ? 'bg-[#F9E4E7] border border-[#CF6C87] text-[#183923]'
              : 'bg-[#183923] text-[#F8F0E4]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#CF6C87] shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-[#A8B18F] shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="opacity-75 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Studio management sections">
          {(
            [
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'offers', label: `Special Offers (${offers.length})`, icon: Tag },
              {
                id: 'collections',
                label: `Collections & Gallery (${shopCollections.length + galleryCollections.length})`,
                icon: Layers,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-display text-[16px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                    : 'bg-[#FDF9F4] text-[#183923] border-[#A8B18F]/60 hover:border-[#183923]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 rounded-full border border-[#A8B18F]/60 text-[12.5px] font-medium text-[#183923] hover:bg-[#EFE4D3] cursor-pointer"
          >
            View Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="px-3.5 py-2 rounded-full border border-[#A8B18F]/60 text-[12.5px] font-medium text-[#183923] hover:bg-[#EFE4D3] cursor-pointer"
          >
            View Shop
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gallery')}
            className="px-3.5 py-2 rounded-full border border-[#A8B18F]/60 text-[12.5px] font-medium text-[#183923] hover:bg-[#EFE4D3] cursor-pointer"
          >
            View Gallery
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#183923]">
                Store Products &amp; 3-Tier Pricing
              </h2>
              <p className="text-[13.5px] text-[#183923]/70">
                Add new handmade items, upload photos, or update prices for Basic, Premium, and Personalised levels.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsNewProduct(true);
                setNewInlineCategory('');
                setProductErrors([]);
                setEditingProduct(
                  createEmptyProduct(
                    shopCollections[0] || 'Giftables',
                    photoPresets[0]?.src || ''
                  )
                );
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E9A9AA]" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-[#A8B18F]/60 bg-[#FDF9F4] p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex gap-3.5 items-start">
                  <div className="w-20 h-20 rounded-xl bg-[#F9E4E7]/75 border border-[#E9A9AA]/50 overflow-hidden shrink-0">
                    <ResilientImage
                      src={product.image}
                      alt={product.name}
                      aspectClassName="w-full h-full"
                      objectFit="contain"
                      className="!bg-transparent"
                      titleFallback={product.name}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6536]">
                        {product.category}
                      </span>
                      {product.featured && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#F9E4E7] text-[#CF6C87] text-[10px] font-semibold">
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#183923] leading-snug truncate">
                      {product.name}
                    </h3>
                    <p className="text-[12px] text-[#183923]/70">
                      From {formatINR(getStartingPrice(product))} · {product.availability}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {product.tiers.map((tier) => (
                    <div
                      key={tier.key}
                      className="rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/40 px-1.5 py-1.5"
                    >
                      <span className="block text-[9.5px] uppercase tracking-wider text-[#7C6536] truncate">
                        {tier.label}
                      </span>
                      <span className="block font-display text-[15px] font-semibold text-[#183923] tabular-nums">
                        {tier.price !== null ? formatINR(tier.price) : 'Quote'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#A8B18F]/30">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewProduct(false);
                      setNewInlineCategory('');
                      setProductErrors([]);
                      setEditingProduct({
                        ...product,
                        tiers: product.tiers.map((t) => ({ ...t, includes: [...t.includes] })),
                      });
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-[#183923]/35 text-[12.5px] font-medium text-[#183923] hover:bg-[#183923] hover:text-[#F8F0E4] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteProductId === product.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={async () => {
                          const res = await deleteProduct(product.id);
                          setConfirmDeleteProductId(null);
                          showStatus(
                            res.ok
                              ? `Removed "${product.name}".`
                              : res.error || 'Could not remove product.',
                            res.ok ? 'ok' : 'error'
                          );
                        }}
                        className="px-3 py-2 rounded-full bg-[#CF6C87] text-[#FDF9F4] text-[12px] font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteProductId(null)}
                        className="px-2.5 py-2 text-[12px] text-[#183923]/70 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProductId(product.id)}
                      aria-label={`Delete ${product.name}`}
                      className="p-2 rounded-full border border-[#CF6C87]/45 text-[#CF6C87] hover:bg-[#F9E4E7] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: OFFERS */}
      {activeTab === 'offers' && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#183923]">
                Special Offers &amp; Promo Codes
              </h2>
              <p className="text-[13.5px] text-[#183923]/70">
                Offers listed here appear live inside the Special Offers section on the Home page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsNewOffer(true);
                setOfferErrors([]);
                setEditingOffer(createEmptyOffer());
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E9A9AA]" />
              <span>Add New Offer</span>
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-2xl border border-[#A8B18F]/55 bg-[#FDF9F4] p-10 text-center space-y-3">
              <p className="font-display text-2xl text-[#183923]">No active offers right now</p>
              <p className="text-[13.5px] text-[#183923]/70">
                Add a seasonal or bundle offer to highlight it on the Home page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.map((offer) => (
                <div
                  key={offer.slug}
                  className="rounded-2xl border-2 border-dashed border-[#CF6C87]/55 bg-[#FDF9F4] p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#CF6C87]">
                        {offer.badge}
                      </span>
                      <span className="rounded-full bg-[#183923] px-3 py-0.5 text-[11px] font-semibold tracking-wider text-[#F8F0E4] uppercase">
                        {offer.code}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-[#183923]">
                      {offer.title}
                    </h3>
                    <p className="script-accent text-3xl text-[#CF6C87] leading-tight">
                      {offer.discount}
                    </p>
                    <p className="text-[13px] text-[#183923]/75 leading-relaxed">
                      {offer.description}
                    </p>
                    <p className="text-[11.5px] text-[#183923]/60 uppercase tracking-wider">
                      Valid until {offer.validUntil}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#A8B18F]/30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewOffer(false);
                        setOfferErrors([]);
                        setEditingOffer({ ...offer });
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-[#183923]/35 text-[12.5px] font-medium text-[#183923] hover:bg-[#183923] hover:text-[#F8F0E4] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Offer</span>
                    </button>

                    {confirmDeleteOfferSlug === offer.slug ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={async () => {
                            const res = await deleteOffer(offer.slug);
                            setConfirmDeleteOfferSlug(null);
                            showStatus(
                              res.ok
                                ? `Removed offer ${offer.code}.`
                                : res.error || 'Could not remove offer.',
                              res.ok ? 'ok' : 'error'
                            );
                          }}
                          className="px-3 py-2 rounded-full bg-[#CF6C87] text-[#FDF9F4] text-[12px] font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteOfferSlug(null)}
                          className="px-2 py-2 text-[12px] text-[#183923]/70 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteOfferSlug(offer.slug)}
                        aria-label={`Delete offer ${offer.code}`}
                        className="p-2 rounded-full border border-[#CF6C87]/45 text-[#CF6C87] hover:bg-[#F9E4E7] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: COLLECTIONS & GALLERY */}
      {activeTab === 'collections' && (
        <section className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shop Categories / Collections */}
            <div className="rounded-3xl border border-[#A8B18F]/60 bg-[#FDF9F4] p-6 space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#183923]">
                  Shop Collections (Categories)
                </h2>
                <p className="text-[13px] text-[#183923]/70">
                  Add, rename, or remove store category tabs shown on the Shop page.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newShopColName.trim()) return;
                  const res = await addShopCollection(newShopColName);
                  if (res.ok) {
                    showStatus(`Added shop collection "${newShopColName.trim()}".`);
                    setNewShopColName('');
                  } else {
                    showStatus(res.error || 'Could not add collection.', 'error');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newShopColName}
                  onChange={(e) => setNewShopColName(e.target.value)}
                  placeholder="New collection (e.g. Festive Editions)..."
                  className="flex-1 px-4 py-2 rounded-full bg-[#F8F0E4] border border-[#A8B18F]/70 text-[13.5px] focus:outline-none focus:border-[#CF6C87]"
                />
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#E9A9AA]" />
                  <span>Add</span>
                </button>
              </form>

              <ul className="space-y-2">
                {shopCollections.map((col) => {
                  const count = products.filter((p) => p.category === col).length;
                  const isRenaming = renamingShopCol?.from === col;
                  return (
                    <li
                      key={col}
                      className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/45"
                    >
                      {isRenaming ? (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const res = await renameShopCollection(col, renamingShopCol.to);
                            if (res.ok) {
                              showStatus(`Renamed "${col}" to "${renamingShopCol.to.trim()}".`);
                              setRenamingShopCol(null);
                            } else {
                              showStatus(res.error || 'Could not rename collection.', 'error');
                            }
                          }}
                          className="flex-1 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={renamingShopCol.to}
                            onChange={(e) =>
                              setRenamingShopCol({ ...renamingShopCol, to: e.target.value })
                            }
                            className="flex-1 px-3 py-1 rounded-lg bg-[#FDF9F4] border border-[#CF6C87] text-[13.5px]"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-full bg-[#183923] text-[#F8F0E4] text-[12px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingShopCol(null)}
                            className="text-[12px] text-[#183923]/70 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <div>
                            <span className="font-display text-lg font-semibold text-[#183923]">
                              {col}
                            </span>
                            <span className="ml-2 text-[12px] text-[#183923]/60">
                              ({count} {count === 1 ? 'product' : 'products'})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setRenamingShopCol({ from: col, to: col })}
                              className="px-2.5 py-1 rounded-full border border-[#A8B18F]/60 text-[12px] text-[#183923] hover:bg-[#EFE4D3] cursor-pointer"
                            >
                              Rename
                            </button>
                            {shopCollections.length > 1 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await deleteShopCollection(col);
                                  showStatus(
                                    res.ok
                                      ? `Removed collection "${col}".`
                                      : res.error || 'Could not delete collection.',
                                    res.ok ? 'ok' : 'error'
                                  );
                                }}
                                aria-label={`Delete collection ${col}`}
                                className="p-1.5 rounded-full text-[#CF6C87] hover:bg-[#F9E4E7] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Studio "What We Make" Offerings Tags */}
            <div className="rounded-3xl border border-[#A8B18F]/60 bg-[#FDF9F4] p-6 space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#183923]">
                  Studio Craft Offerings List
                </h2>
                <p className="text-[13px] text-[#183923]/70">
                  Displayed in the Hero &amp; About sections to highlight what MITSU Crntzz crafts.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const val = newOfferingText.trim();
                  if (!val) return;
                  if (!offerings.includes(val)) {
                    const res = await updateOfferings([...offerings, val]);
                    if (res.ok) {
                      showStatus(`Added "${val}" to Studio Offerings.`);
                    } else {
                      showStatus(res.error || 'Could not add offering.', 'error');
                    }
                  }
                  setNewOfferingText('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newOfferingText}
                  onChange={(e) => setNewOfferingText(e.target.value)}
                  placeholder="Add an offering tag (e.g. Resin Coasters)..."
                  className="flex-1 px-4 py-2 rounded-full bg-[#F8F0E4] border border-[#A8B18F]/70 text-[13.5px] focus:outline-none focus:border-[#CF6C87]"
                />
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E9A9AA]" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {offerings.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#A8B18F] bg-[#F8F0E4] pl-3 pr-2 py-1 font-display text-[15px] font-semibold text-[#183923]"
                  >
                    <span>{item}</span>
                    {offerings.length > 1 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await updateOfferings(offerings.filter((o) => o !== item));
                          if (!res.ok) showStatus(res.error || 'Could not remove.', 'error');
                        }}
                        aria-label={`Remove ${item}`}
                        className="p-0.5 rounded-full text-[#183923]/60 hover:text-[#CF6C87] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery Collections & Showcase Pieces */}
          <div className="rounded-3xl border border-[#A8B18F]/60 bg-[#FDF9F4] p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#A8B18F]/35">
              <div>
                <h2 className="font-display text-3xl font-semibold text-[#183923]">
                  Gallery Collections &amp; Showcase Pieces
                </h2>
                <p className="text-[13.5px] text-[#183923]/70">
                  Manage Gallery wings and upload new artworks for the Gallery page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewPiece(true);
                  setPieceErrors([]);
                  setEditingPiece(
                    createEmptyGalleryPiece(
                      galleryCollections[0] || 'Botanical & Studio',
                      photoPresets[0]?.src || ''
                    )
                  );
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[16px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-4 h-4 text-[#E9A9AA]" />
                <span>Add Gallery Piece</span>
              </button>
            </div>

            {/* Gallery Wing Names */}
            <div className="space-y-3">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newGalleryColName.trim()) return;
                  const res = await addGalleryCollection(newGalleryColName);
                  if (res.ok) {
                    showStatus(`Added gallery collection "${newGalleryColName.trim()}".`);
                    setNewGalleryColName('');
                  } else {
                    showStatus(res.error || 'Could not add gallery wing.', 'error');
                  }
                }}
                className="flex flex-wrap gap-2 max-w-lg"
              >
                <input
                  type="text"
                  value={newGalleryColName}
                  onChange={(e) => setNewGalleryColName(e.target.value)}
                  placeholder="New gallery collection wing..."
                  className="flex-1 min-w-[200px] px-4 py-2 rounded-full bg-[#F8F0E4] border border-[#A8B18F]/70 text-[13.5px] focus:outline-none focus:border-[#CF6C87]"
                />
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#E9A9AA]" />
                  <span>Add Wing</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {galleryCollections.map((col) => {
                  const isRenaming = renamingGalleryCol?.from === col;
                  return isRenaming ? (
                    <form
                      key={col}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await renameGalleryCollection(col, renamingGalleryCol.to);
                        if (res.ok) {
                          setRenamingGalleryCol(null);
                          showStatus('Renamed gallery wing.');
                        } else {
                          showStatus(res.error || 'Could not rename wing.', 'error');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F0E4] border border-[#CF6C87]"
                    >
                      <input
                        type="text"
                        value={renamingGalleryCol.to}
                        onChange={(e) =>
                          setRenamingGalleryCol({ ...renamingGalleryCol, to: e.target.value })
                        }
                        className="w-40 bg-transparent text-[13px] focus:outline-none"
                      />
                      <button type="submit" className="text-[12px] font-semibold text-[#183923] cursor-pointer">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingGalleryCol(null)}
                        className="text-[12px] text-[#183923]/60 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div
                      key={col}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE4D3] border border-[#A8B18F]/55 text-[13px]"
                    >
                      <span className="font-semibold text-[#183923]">{col}</span>
                      <button
                        type="button"
                        onClick={() => setRenamingGalleryCol({ from: col, to: col })}
                        className="text-[11.5px] text-[#183923]/70 hover:text-[#183923] underline cursor-pointer"
                      >
                        Rename
                      </button>
                      {galleryCollections.length > 1 && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await deleteGalleryCollection(col);
                            showStatus(
                              res.ok ? `Removed wing "${col}".` : res.error || 'Could not remove.',
                              res.ok ? 'ok' : 'error'
                            );
                          }}
                          className="text-[#CF6C87] hover:text-[#183923] cursor-pointer"
                          aria-label={`Remove ${col}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gallery Pieces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="rounded-2xl border border-[#A8B18F]/50 bg-[#F8F0E4]/75 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <ResilientImage
                      src={piece.image}
                      alt={piece.title}
                      aspectClassName="aspect-[4/3] rounded-xl"
                      titleFallback={piece.title}
                    />
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#7C6536]">
                      {piece.collection} · {piece.year}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[#183923] leading-snug">
                      {piece.title}
                    </h3>
                    <p className="text-[12.5px] text-[#183923]/75 line-clamp-2">
                      {piece.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#A8B18F]/30">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPiece(false);
                        setPieceErrors([]);
                        setEditingPiece({ ...piece });
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full border border-[#183923]/35 text-[12px] font-medium text-[#183923] hover:bg-[#183923] hover:text-[#F8F0E4] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {confirmDeletePieceId === piece.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await deleteGalleryPiece(piece.id);
                            setConfirmDeletePieceId(null);
                            showStatus(
                              res.ok
                                ? `Removed "${piece.title}".`
                                : res.error || 'Could not remove.',
                              res.ok ? 'ok' : 'error'
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-full bg-[#CF6C87] text-[#FDF9F4] text-[11.5px] cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePieceId(null)}
                          className="px-2 text-[11.5px] text-[#183923]/70 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePieceId(piece.id)}
                        className="p-1.5 rounded-full border border-[#CF6C87]/45 text-[#CF6C87] hover:bg-[#F9E4E7] cursor-pointer"
                        aria-label={`Delete ${piece.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODAL: PRODUCT EDITOR */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183923]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={isNewProduct ? 'Add New Product' : `Edit ${editingProduct.name}`}
        >
          <div className="fixed inset-0" onClick={() => setEditingProduct(null)} aria-hidden="true" />
          <form
            onSubmit={handleSaveProduct}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8F0E4] border border-[#A8B18F] p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#A8B18F]/40">
              <h2 className="font-display text-3xl font-semibold text-[#183923]">
                {isNewProduct ? 'Add New Handmade Product' : `Edit ${editingProduct.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#A8B18F] text-[#183923] hover:bg-[#EFE4D3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {productErrors.length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#F9E4E7] border border-[#CF6C87] text-[13px] text-[#183923] space-y-1"
              >
                {productErrors.map((err) => (
                  <p key={err} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#CF6C87] shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingProduct({
                      ...editingProduct,
                      name,
                      slug: isNewProduct ? slugify(name) : editingProduct.slug,
                    });
                  }}
                  placeholder="e.g. Crochet Lotus Coaster"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Collection / Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
                >
                  {shopCollections.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newInlineCategory}
                  onChange={(e) => setNewInlineCategory(e.target.value)}
                  placeholder="Or type a brand new collection name..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#FDF9F4] border border-[#A8B18F]/50 text-[12.5px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Availability</label>
                <select
                  value={editingProduct.availability}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      availability: e.target.value as AvailabilityStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Made to Order">Made to Order</option>
                  <option value="Festive Favorite">Festive Favorite</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Craft Time</label>
                <input
                  type="text"
                  value={editingProduct.craftTime}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, craftTime: e.target.value })
                  }
                  placeholder="e.g. 2–4 days"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Badge (Optional)</label>
                <input
                  type="text"
                  value={editingProduct.badge || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, badge: e.target.value })
                  }
                  placeholder="e.g. New Arrival"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Dimensions</label>
                <input
                  type="text"
                  value={editingProduct.dimensions}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, dimensions: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Materials</label>
                <input
                  type="text"
                  value={editingProduct.materials}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, materials: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Short Card Summary *</label>
              <input
                type="text"
                required
                value={editingProduct.blurb}
                onChange={(e) => setEditingProduct({ ...editingProduct, blurb: e.target.value })}
                placeholder="One-line poetic description shown on product cards"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Full Studio Description *</label>
              <textarea
                rows={2}
                required
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
              />
            </div>

            {/* Product Photo Selection / Upload */}
            <div className="rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/55 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold text-[#183923]">
                  Product Photo
                </span>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[12px] font-medium hover:bg-[#2d4a3b] cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5 text-[#E9A9AA]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageUpload(e, 'image')}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-24 h-24 rounded-xl bg-[#F9E4E7]/75 border border-[#E9A9AA]/55 overflow-hidden shrink-0">
                  <ResilientImage
                    src={editingProduct.image}
                    alt="Preview"
                    aspectClassName="w-full h-full"
                    objectFit="contain"
                    className="!bg-transparent"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <select
                    value={
                      photoPresets.some((p) => p.src === editingProduct.image)
                        ? editingProduct.image
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditingProduct({ ...editingProduct, image: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[13px]"
                  >
                    <option value="">Choose an existing studio photo preset...</option>
                    {photoPresets.map((preset) => (
                      <option key={preset.src} value={preset.src}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                    placeholder="Or paste an image URL..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[12.5px]"
                  />
                </div>
              </div>
            </div>

            {/* Three Pricing Tiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-[#183923]">
                  Three Pricing Tiers (INR)
                </h3>
                <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.featured)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                    className="accent-[#183923]"
                  />
                  <span>Feature on Home Page</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {editingProduct.tiers.map((tier, idx) => (
                  <div
                    key={tier.key}
                    className="rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/60 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#CF6C87]">
                        Tier {idx + 1}
                      </span>
                      <label className="inline-flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tier.price === null}
                          onChange={(e) =>
                            updateEditingTier(idx, { price: e.target.checked ? null : 199 })
                          }
                          className="accent-[#183923]"
                        />
                        <span>Quote only</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => updateEditingTier(idx, { label: e.target.value })}
                      placeholder="Tier label"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50 text-[13px] font-semibold"
                    />

                    {tier.price !== null && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#183923]/60">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={500000}
                          value={tier.price}
                          onChange={(e) =>
                            updateEditingTier(idx, {
                              price: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50 text-[14px] font-semibold tabular-nums"
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      value={tier.tagline}
                      onChange={(e) => updateEditingTier(idx, { tagline: e.target.value })}
                      placeholder="Short tier tagline"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50 text-[12px]"
                    />

                    <textarea
                      rows={3}
                      value={tier.includes.join('\n')}
                      onChange={(e) =>
                        updateEditingTier(idx, {
                          includes: e.target.value.split('\n'),
                        })
                      }
                      placeholder="One included item per line"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50 text-[11.5px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-[#A8B18F]/40">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 rounded-full border border-[#183923]/40 text-[14px] font-medium text-[#183923] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] cursor-pointer disabled:opacity-60"
              >
                {isSyncing
                  ? 'Validating & Publishing...'
                  : isNewProduct
                    ? 'Validate & Publish Product'
                    : 'Validate & Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: OFFER EDITOR */}
      {editingOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183923]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={isNewOffer ? 'Add Special Offer' : `Edit ${editingOffer.code}`}
        >
          <div className="fixed inset-0" onClick={() => setEditingOffer(null)} aria-hidden="true" />
          <form
            onSubmit={handleSaveOffer}
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8F0E4] border border-[#A8B18F] p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#A8B18F]/40">
              <h2 className="font-display text-3xl font-semibold text-[#183923]">
                {isNewOffer ? 'Create Special Offer' : `Edit ${editingOffer.code}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#A8B18F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {offerErrors.length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#F9E4E7] border border-[#CF6C87] text-[13px] text-[#183923] space-y-1"
              >
                {offerErrors.map((err) => (
                  <p key={err} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#CF6C87] shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.code}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. FESTIVE15"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px] uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Offer Badge *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.badge}
                  onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                  placeholder="e.g. Festive Deal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. Diwali Hamper Treat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Discount Highlight *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.discount}
                  onChange={(e) => setEditingOffer({ ...editingOffer, discount: e.target.value })}
                  placeholder="e.g. 15% off / ₹75 off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Offer Description *</label>
              <textarea
                rows={3}
                required
                value={editingOffer.description}
                onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                placeholder="Explain eligible products, minimum order, or bundle terms..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Valid Until *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.validUntil}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, validUntil: e.target.value })
                  }
                  placeholder="e.g. 31 Dec 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Linked Product (Optional)</label>
                <select
                  value={editingOffer.productSlug || ''}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, productSlug: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                >
                  <option value="">All eligible pieces</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#A8B18F]/40">
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="px-5 py-2.5 rounded-full border border-[#183923]/40 text-[14px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] cursor-pointer disabled:opacity-60"
              >
                {isSyncing ? 'Publishing...' : isNewOffer ? 'Validate & Publish Offer' : 'Validate & Save Offer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: GALLERY PIECE EDITOR */}
      {editingPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183923]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={isNewPiece ? 'Add Gallery Piece' : `Edit ${editingPiece.title}`}
        >
          <div className="fixed inset-0" onClick={() => setEditingPiece(null)} aria-hidden="true" />
          <form
            onSubmit={handleSaveGalleryPiece}
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8F0E4] border border-[#A8B18F] p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#A8B18F]/40">
              <h2 className="font-display text-3xl font-semibold text-[#183923]">
                {isNewPiece ? 'Add Gallery Piece' : `Edit ${editingPiece.title}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPiece(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#A8B18F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pieceErrors.length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#F9E4E7] border border-[#CF6C87] text-[13px] text-[#183923] space-y-1"
              >
                {pieceErrors.map((err) => (
                  <p key={err} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#CF6C87] shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Artwork Title *</label>
              <input
                type="text"
                required
                value={editingPiece.title}
                onChange={(e) => setEditingPiece({ ...editingPiece, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[14px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Gallery Collection</label>
                <select
                  value={editingPiece.collection}
                  onChange={(e) =>
                    setEditingPiece({ ...editingPiece, collection: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                >
                  {galleryCollections.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Year *</label>
                <input
                  type="text"
                  required
                  value={editingPiece.year}
                  onChange={(e) => setEditingPiece({ ...editingPiece, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13.5px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Medium *</label>
                <input
                  type="text"
                  required
                  value={editingPiece.medium}
                  onChange={(e) => setEditingPiece({ ...editingPiece, medium: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-medium">Dimensions *</label>
                <input
                  type="text"
                  required
                  value={editingPiece.dimensions}
                  onChange={(e) =>
                    setEditingPiece({ ...editingPiece, dimensions: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Context / Series</label>
              <input
                type="text"
                value={editingPiece.locationOrContext}
                onChange={(e) =>
                  setEditingPiece({ ...editingPiece, locationOrContext: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12.5px] font-medium">Description *</label>
              <textarea
                rows={3}
                required
                value={editingPiece.description}
                onChange={(e) =>
                  setEditingPiece({ ...editingPiece, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/70 text-[13px]"
              />
            </div>

            <div className="rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/55 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#183923]">Artwork Photo</span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[12px] cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5 text-[#E9A9AA]" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              <input
                type="text"
                value={editingPiece.image}
                onChange={(e) => setEditingPiece({ ...editingPiece, image: e.target.value })}
                placeholder="Image URL or select preset..."
                className="w-full px-3 py-2 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/60 text-[12.5px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#A8B18F]/40">
              <button
                type="button"
                onClick={() => setEditingPiece(null)}
                className="px-5 py-2.5 rounded-full border border-[#183923]/40 text-[14px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] cursor-pointer disabled:opacity-60"
              >
                {isSyncing
                  ? 'Saving...'
                  : isNewPiece
                    ? 'Validate & Add Piece'
                    : 'Validate & Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
