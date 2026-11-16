import { Product, ProductTier, TierKey } from '../types';
import imgGreetingCard from '../assets/images/pdf/img_01_obj1_700x700.png';
import imgBookmark from '../assets/images/pdf/img_02_obj4_467x700.png';
import imgMiniScrapbook from '../assets/images/pdf/img_03_obj5_525x700.png';
import imgPipeCleanerPrimary from '../assets/images/pdf/img_04_obj6_436x700.png';
import imgPipeCleanerSecondary from '../assets/images/pdf/img_05_obj7_467x700.png';
import imgPaperBouquet from '../assets/images/pdf/img_06_obj8_481x700.png';
import imgRibbonBouquet from '../assets/images/pdf/img_07_obj9_525x700.png';
import imgPhotoFrame from '../assets/images/pdf/img_08_obj10_559x700.png';
import imgPolaroidPainting from '../assets/images/pdf/img_09_obj11_394x700.png';
import imgKolkaArt from '../assets/images/pdf/img_10_obj12_700x700.png';
import imgKeychain from '../assets/images/pdf/img_11_obj13_700x700.png';
import imgMemoryJar from '../assets/images/pdf/img_12_obj15_525x700.png';
import imgRealFlowerBouquet from '../assets/images/pdf/img_13_obj16_394x700.png';
import imgGiftHampers from '../assets/images/pdf/img_14_obj17_562x693.png';

export const OFFERINGS_LIST: string[] = [
  'Alpona & Kolka',
  'Rangoli Art',
  'Greeting Cards',
  'Bookmarks',
  'Mini Scrapbooks',
  'Handmade Bouquets',
  'Photo Framing',
  'Polaroid Paintings',
  'Memory Jars',
  'Keychains',
  'Gift Hampers',
];

export const TIER_META: Record<TierKey, { label: string; short: string; blurb: string }> = {
  basic: {
    label: 'Basic',
    short: 'Simple handmade elegance at minimal prices.',
    blurb: 'Minimal, clean studio craft on handmade cotton paper or kraft wraps — ready for everyday gifting.',
  },
  premium: {
    label: 'Premium',
    short: 'Layered botanical details & ribbon packaging.',
    blurb: 'Richer floral detailing, layered cardstock or satin accents, and signature ribbon-tied gift finishing.',
  },
  customise: {
    label: 'Personalised',
    short: 'Names, dates, colour palettes & custom notes.',
    blurb: 'Tailored to your exact colour theme, recipient names, handwritten notes, or custom keepsake photos.',
  },
};

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'prod-greeting-card',
    slug: 'greeting-card',
    sku: 'MC-GC-001',
    name: 'Greeting Card',
    category: 'Giftables',
    blurb: 'Handmade layered collage & botanical greeting cards crafted on textured cotton cardstock.',
    description:
      'Every occasion deserves a keepsake note rather than a mass-printed card. Our handmade greeting cards combine layered vintage ephemera, botanical cutouts, hand-lettered sentiments, and delicate wax or ribbon accents.',
    craftTime: '1–2 days',
    dimensions: '13 × 18 cm (folded) with matching envelope',
    materials: '300 GSM textured cardstock, botanical prints, kraft envelope',
    availability: 'In Stock',
    badge: 'From ₹49',
    image: imgGreetingCard,
    featured: true,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 49,
        tagline: 'Clean handmade folded card with matching kraft envelope',
        includes: ['Hand-cut floral or typography motif', 'Blank interior for your note', 'Kraft envelope'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 99,
        tagline: 'Multi-layered collage front with lace & butterfly accents',
        includes: ['3D layered scrapbook elements', 'Calligraphy cover title', 'Wax-sealed envelope'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 129,
        tagline: 'Custom name, milestone number, photo & printed note inside',
        includes: ['Custom milestone age or name', 'Mini polaroid photo inset', 'Handwritten message inside'],
      },
    ],
  },
  {
    id: 'prod-bookmark',
    slug: 'bookmark',
    sku: 'MC-BM-002',
    name: 'Bookmark',
    category: 'Giftables',
    blurb: 'Pressed real botanical and hand-painted cotton paper bookmarks finished with braided tassels.',
    description:
      'Delicate daisies, larkspur, and fern fronds pressed flat and sealed cleanly with a soft woven tassel. Designed for quiet reading corners and thoughtful small gifts.',
    craftTime: '1–2 days',
    dimensions: '5 × 15 cm',
    materials: 'Pressed botanicals, clear laminating sleeve or 350 GSM rag paper, cotton tassel',
    availability: 'In Stock',
    badge: 'Bestseller · ₹29',
    image: imgBookmark,
    featured: true,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 29,
        tagline: 'Minimal hand-painted botanical strip with ribbon tie',
        includes: ['Hand-painted leaf or floral motif', '300 GSM textured paper', 'Satin ribbon tie'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 69,
        tagline: 'Real pressed flowers sealed with braided cotton tassel',
        includes: ['Real pressed wildflowers & ferns', 'Protective crystal-clear seal', 'Hand-knotted cotton tassel'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 89,
        tagline: 'Custom name calligraphy, favourite quote & birth-month blooms',
        includes: ['Pressed flowers in chosen palette', 'Hand-lettered name or quote', 'Gift sleeve packaging'],
      },
    ],
  },
  {
    id: 'prod-mini-scrapbook',
    slug: 'mini-scrapbook',
    sku: 'MC-SB-003',
    name: 'Mini Scrapbook',
    category: 'Giftables',
    blurb: 'Hand-bound black cardstock memory album with filmstrip pockets, flaps & butterfly motifs.',
    description:
      'Compact enough to tuck inside a keepsake box yet rich with fold-outs, photo mats, vintage tickets, and handwritten spaces for birthdays, anniversaries, and friendships.',
    craftTime: '3–5 days',
    dimensions: '15 × 15 cm · 10–16 interactive pages',
    materials: 'Heavyweight black & kraft cardstock, binder rings, satin ribbon, embellishments',
    availability: 'Made to Order',
    badge: 'Keepsake',
    image: imgMiniScrapbook,
    featured: true,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 199,
        tagline: '8-page handmade mini album with classic photo mats',
        includes: ['8 decorated cardstock pages', 'Space for 10–12 mini photos', 'Ribbon tie closure'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 269,
        tagline: '12 interactive waterfall & filmstrip pages with floral cover',
        includes: ['Interactive pull-out flaps', 'Vintage filmstrip & butterfly cover', 'Gift-ready wrap'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 329,
        tagline: 'Printed customer photos mounted inside with custom captions',
        includes: ['Up to 16 printed mini photos included', 'Custom cover title & dates', 'Personalised note pocket'],
      },
    ],
  },
  {
    id: 'prod-pipe-cleaner-bouquet',
    slug: 'pipe-cleaner-bouquet',
    sku: 'MC-PCB-004',
    name: 'Pipe Cleaner Bouquet',
    category: 'Art & Crafts',
    blurb: 'Velvety handcrafted chenille sunflowers, daisies & tulips wrapped in vintage newsprint.',
    description:
      'Forever blooms twisted petal-by-petal from plush chenille stems that never wilt. Choose sunny sunflowers with chamomile daisies or deep crimson velvet tulips.',
    craftTime: '2–4 days',
    dimensions: '28–36 cm tall wrapped bouquet',
    materials: 'Plush chenille pipe cleaners, floral wire, vintage newsprint & kraft wrap, organza ribbon',
    availability: 'Made to Order',
    badge: 'Forever Blooms',
    image: imgPipeCleanerPrimary,
    secondaryImage: imgPipeCleanerSecondary,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 199,
        tagline: 'Single statement bloom (sunflower or tulip pair) with foliage',
        includes: ['1–2 plush chenille blooms', 'Crafted eucalyptus leaf stem', 'Kraft paper cone wrap'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 253,
        tagline: 'Full sunflower & mini daisy arrangement in layered wrap',
        includes: ['Statement flower + 3 mini daisies', 'Honeycomb mesh & newsprint wrap', 'Printed gift tag & ribbon'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 355,
        tagline: 'Multi-stem custom colour bouquet with personalised card',
        includes: ['5–6 custom chenille flowers', 'Choice of sunflower, tulip, or lily palette', 'Custom note card'],
      },
    ],
  },
  {
    id: 'prod-paper-bouquet',
    slug: 'paper-bouquet',
    sku: 'MC-PB-005',
    name: 'Paper Bouquet',
    category: 'Art & Crafts',
    blurb: 'Sculpted botanical paper blossoms & layered leaves wrapped in pleated ivory parchment.',
    description:
      'Every petal is hand-cut, curled, and assembled from rich pastel and jewel-toned art papers with fine foliage stems — lightweight, sculptural, and lasting.',
    craftTime: '2–4 days',
    dimensions: '30 × 22 cm bouquet',
    materials: 'Coloured textured craft paper, floral stems, pleated parchment wrap, satin ribbon',
    availability: 'Made to Order',
    image: imgPaperBouquet,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 149,
        tagline: '3 hand-sculpted paper flowers with eucalyptus paper leaves',
        includes: ['3 layered paper blossoms', 'Cut foliage sprigs', 'Minimal kraft wrap'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 185,
        tagline: '5-bloom pastel & autumn garden mix in pleated parchment',
        includes: ['5 multi-petal paper flowers', 'Layered tissue & parchment wrap', 'Satin ribbon bow'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 205,
        tagline: '7-bloom bouquet in your custom colour story & gift card',
        includes: ['7 custom-palette paper blooms', 'Extra fern & berry sprigs', 'Personalised message card'],
      },
    ],
  },
  {
    id: 'prod-ribbon-bouquet',
    slug: 'ribbon-bouquet',
    sku: 'MC-RB-006',
    name: 'Ribbon Bouquet',
    category: 'Art & Crafts',
    blurb: 'Lustrous hand-folded satin ribbon roses accented with faux pearls, butterflies & newsprint.',
    description:
      'Rich satin ribbon folded into luminous forever roses — topped with delicate metallic butterflies, baby’s breath sprigs, and a signature layered wrap.',
    craftTime: '3–4 days',
    dimensions: '32–38 cm tall',
    materials: 'Double-faced satin ribbon, newsprint & ivory floral wrap, butterfly charms, pearl pins',
    availability: 'Festive Favorite',
    badge: 'Satin Craft',
    image: imgRibbonBouquet,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 199,
        tagline: '3 satin ribbon roses in neat kraft-and-tissue cone',
        includes: ['3 hand-folded satin roses', 'Baby’s breath accents', 'Ribbon-tied wrap'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 299,
        tagline: '5–7 satin roses with butterfly accents & newsprint styling',
        includes: ['5–7 luminous satin roses', '3D butterfly charms & greenery', 'Gold-trimmed floral wrap'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 399,
        tagline: '9+ rose bouquet with pearl centres, LED fairy light & custom card',
        includes: ['9+ roses in chosen colour', 'Pearl centres & fairy-light option', 'Customised sleeve & gift note'],
      },
    ],
  },
  {
    id: 'prod-photo-frame',
    slug: 'photo-frame',
    sku: 'MC-PF-007',
    name: 'Photo Frame',
    category: 'Lifestyle',
    blurb: 'Hand-decorated collage photo frames with scalloped mats, pressed florals & heartfelt quotes.',
    description:
      'Turn favourite snapshots into a warm wall or desk keepsake. Framed in classic black or wood with kraft paper layering, die-cut butterflies, lace doilies, and sweet captions.',
    craftTime: '3–5 days',
    dimensions: 'A4 (21 × 30 cm) or 8 × 10 inch frame',
    materials: 'MDF/wood frame with acrylic front, kraft & patterned papers, printed photos, embellishments',
    availability: 'Made to Order',
    image: imgPhotoFrame,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 199,
        tagline: 'Single-photo decorated mat frame with botanical border',
        includes: ['6 × 8 inch frame', 'Handmade botanical mat border', 'Gift wrap'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 349,
        tagline: 'Multi-window scrapbook collage frame with butterflies & quotes',
        includes: ['A4 multi-photo collage layout', 'Lace doily & typography accents', 'Protective corner packaging'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 499,
        tagline: 'Your printed photos mounted with custom names, dates & dedication',
        includes: ['Up to 6 printed & mounted photos', 'Custom title & date lettering', 'Personalised gift box wrap'],
      },
    ],
  },
  {
    id: 'prod-mini-polaroid-painting',
    slug: 'mini-polaroid-painting',
    sku: 'MC-MPP-008',
    name: 'Mini Polaroid Painting',
    category: 'Art & Crafts',
    blurb: 'Hand-painted gouache & watercolor miniature polaroids — display on a desk or hanging twine grid.',
    description:
      'Bite-sized original artworks painted on thick cotton polaroid cards: pastel skies, lotus ponds, moonlit florals, or cosy memories ready to clip onto twine or tuck in a journal.',
    craftTime: '2–4 days',
    dimensions: '7.5 × 9 cm per polaroid card',
    materials: '300 GSM cold-press watercolor paper, artists’ gouache, jute twine & wooden clips',
    availability: 'In Stock',
    image: imgPolaroidPainting,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 149,
        tagline: 'Set of 3 hand-painted mini polaroid artworks',
        includes: ['3 original painted polaroids', 'Handwritten date or title on border', 'Kraft sleeve'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 169,
        tagline: 'Set of 5 polaroid paintings with jute string & mini wooden clips',
        includes: ['5 original botanical/sky paintings', 'Jute hanging cord + 5 wooden clips', 'Gold ink highlights'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 213,
        tagline: 'Custom 6-piece wall-hanging set painted from your memory prompts',
        includes: ['6 bespoke mini paintings from your brief', 'Wooden dowel + hanging twine & clips', 'Custom captioning'],
      },
    ],
  },
  {
    id: 'prod-kolka-art',
    slug: 'kolka-art',
    sku: 'MC-KA-009',
    name: 'Kolka Art',
    category: 'Art & Crafts',
    blurb: 'Traditional Bengali alpona & kolka mandala studies painted in crisp ivory pigment on terracotta.',
    description:
      'Rooted in Bengal’s sacred courtyard alpona and bridal kolka motifs, these concentric floral mandalas celebrate symmetry, lotus petals, and auspicious celebration.',
    craftTime: '3–5 days',
    dimensions: '20 × 20 cm up to 30 × 30 cm art board or canvas',
    materials: 'Terracotta/crimson matte base, crisp white acrylic & rice-paste pigment, matte sealer',
    availability: 'Festive Favorite',
    badge: 'Heritage Craft',
    image: imgKolkaArt,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 99,
        tagline: 'A5 hand-painted kolka motif card or mini roundel',
        includes: ['15 × 15 cm traditional alpona study', 'Fine brush detailing', 'Protective sleeve'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 249,
        tagline: '8-inch concentric alpona mandala on rigid art board',
        includes: ['Multi-ring lotus & vine mandala', 'Matte archival sealer', 'Ready-to-display easel backing'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 399,
        tagline: 'Custom bridal, Puja, or housewarming kolka piece with names & blessings',
        includes: ['12-inch bespoke kolka artwork', 'Custom couple initials or Shubho Bibaho motif', 'Framed or gift-boxed'],
      },
    ],
  },
  {
    id: 'prod-keychain',
    slug: 'keychain',
    sku: 'MC-KC-010',
    name: 'Keychain',
    category: 'Lifestyle',
    blurb: 'Handmade crochet bears, gingham bows, pressed-flower resin charms & miniature bouquets.',
    description:
      'Pocket-sized studio charms crafted by hand — from soft amigurumi critters and checkered bows to crystal-clear resin tags filled with real baby’s breath blooms.',
    craftTime: '1–3 days',
    dimensions: '6–11 cm charm drop with gold or silver clasp',
    materials: 'Cotton yarn, gingham ribbon, UV resin & dried flora, alloy lobster clasp',
    availability: 'In Stock',
    image: imgKeychain,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 49,
        tagline: 'Classic gingham ribbon bow or miniature chenille tulip charm',
        includes: ['Hand-tied ribbon or chenille charm', 'Sturdy metal clasp', 'MITSU Crntzz studio tag'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 169,
        tagline: 'Hand-crocheted bear, bunny, or floral daisy amigurumi keychain',
        includes: ['Detailed hand-crocheted plushie', 'Pearl & gingham bow finish', 'Pouch gift wrapping'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 114,
        tagline: 'Pressed-flower resin charm with custom name, initial, or date',
        includes: ['Real dried flowers in clear resin', 'Custom name or initial lettering', 'Gold clasp & pearl drop'],
      },
    ],
  },
  {
    id: 'prod-memory-jar',
    slug: 'memory-jar',
    sku: 'MC-MJ-011',
    name: 'Memory Jar',
    category: 'Lifestyle',
    blurb: 'Glass keepsake jar glowing with warm fairy lights and twine-tied pastel memory scrolls.',
    description:
      'A glowing jar filled with rolled pastel notes — open one each day, save shared inside jokes, or gift 30 reasons why someone is loved, illuminated by warm copper fairy lights.',
    craftTime: '2–3 days',
    dimensions: '350 ml – 500 ml cork/wood-lid glass jar',
    materials: 'Clear glass jar with wooden lid, pastel paper scrolls, jute twine, warm LED fairy string',
    availability: 'Made to Order',
    image: imgMemoryJar,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 99,
        tagline: 'Mini keepsake jar with 15 blank twine-tied pastel scrolls',
        includes: ['Glass jar with lid', '15 rolled pastel scrolls tied in twine', 'Kraft gift tag'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 249,
        tagline: 'Illuminated fairy-light memory jar with 30 pre-rolled scrolls',
        includes: ['500 ml glass jar', 'Warm micro-LED fairy lights', '30 twine-tied pastel scrolls'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 299,
        tagline: '35 custom-written messages printed or handwritten inside + name label',
        includes: ['Your 35 custom notes rolled inside', 'Warm fairy lights included', 'Custom jar label & ribbon wrap'],
      },
    ],
  },
  {
    id: 'prod-real-flower-bouquet',
    slug: 'real-flower-bouquet',
    sku: 'MC-RFB-012',
    name: 'Real Flower Bouquet',
    category: 'Art & Crafts',
    blurb: 'Fresh garden rose & eucalyptus stems arranged in editorial newsprint and soft vellum.',
    description:
      'Timeless fresh stems wrapped in our signature minimalist aesthetic — pairing crisp ivory or blush roses with aromatic eucalyptus foliage, frosted vellum, and satin ribbon.',
    craftTime: '1–2 days (scheduled fresh)',
    dimensions: '32–40 cm hand-tied bouquet',
    materials: 'Fresh locally sourced roses & eucalyptus, frosted tissue, kraft newsprint wrap, satin ribbon',
    availability: 'Made to Order',
    image: imgRealFlowerBouquet,
    tiers: [
      {
        key: 'basic',
        label: 'Basic',
        price: 139,
        tagline: 'Single fresh rose with eucalyptus sprigs in newsprint cone',
        includes: ['1 fresh focal rose', 'Fresh eucalyptus greens', 'Newsprint & satin ribbon wrap'],
      },
      {
        key: 'premium',
        label: 'Premium',
        price: 205,
        tagline: '3-stem rose & baby’s breath bouquet with frosted vellum layers',
        includes: ['3 fresh roses + filler blooms', 'Layered vellum & kraft wrap', 'Hydration wrap at base'],
      },
      {
        key: 'customise',
        label: 'Personalised',
        price: 315,
        tagline: 'Custom stem count & rose colour with handwritten studio card',
        includes: ['5+ fresh roses in chosen colour', 'Custom ribbon & message card', 'Coordinated delivery timing'],
      },
    ],
  },
  {
    id: 'prod-gift-hampers',
    slug: 'gift-hampers',
    sku: 'MC-GH-013',
    name: 'Gift Hampers',
    category: 'Giftables',
    blurb: 'Curated Silver, Gold & Platinum keepsake gift boxes filled with handmade treasures & chocolates.',
    description:
      'Our signature celebration boxes bring together handmade stationery, dried flower bouquets, polaroids, chocolates, and personalised keepsakes — finished with a birthday or celebration banner.',
    craftTime: '3–5 days',
    dimensions: 'Kraft keepsake box (22 × 18 cm to 30 × 24 cm)',
    materials: 'Corrugated kraft gift box, handmade crafts, chocolates, dried baby’s breath, jute twine',
    availability: 'Festive Favorite',
    badge: 'Silver · Gold · Platinum',
    image: imgGiftHampers,
    featured: true,
    tiers: [
      {
        key: 'basic',
        label: 'Silver',
        price: 298,
        tagline: 'Sweet starter keepsake box for birthdays & thank-yous',
        includes: [
          'Mini handmade greeting card',
          '2–3 chocolates',
          'Mini flower bouquet',
          'Cute bookmark',
          'Personalised message',
          'Decorative wrapping',
        ],
      },
      {
        key: 'premium',
        label: 'Gold',
        price: 329,
        tagline: 'Expanded celebration box with mini scrapbook & photo frame',
        includes: [
          'Mini scrapbook',
          'Flowery bouquet',
          'Photo frame',
          'Bookmark',
          'Something special from customer',
          'Chocolates & decorative gift packaging',
        ],
      },
      {
        key: 'customise',
        label: 'Platinum',
        price: 529,
        tagline: 'Our grandest memory box packed with bespoke handmade pieces',
        includes: [
          'Memory scrapbook',
          'Large handmade bouquet',
          'Personalised letter',
          'Multiple handmade creations & 2–3 bookmarks',
          'Polaroid-style cards & customised PF',
          'Premium keepsake gift box & chocolates',
        ],
      },
    ],
  },
];

export function getTier(product: Product, tierKey: TierKey): ProductTier {
  return product.tiers.find((t) => t.key === tierKey) ?? product.tiers[0];
}

export function getStartingPrice(product: Product): number {
  const prices = product.tiers
    .map((t) => t.price)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p));
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}
