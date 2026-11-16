import { JournalArticle } from '../types';
import alponaImg from '../assets/images/pdf/img_10_obj12_700x700.png';
import bookmarkImg from '../assets/images/pdf/img_02_obj4_467x700.png';
import atelierImg from '../assets/images/about_atelier_studio_1794649392696.jpg';

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'diy-pressed-floral-bookmark',
    title: 'How to Press Garden Daisies & Ferns for Handmade Bookmarks',
    subtitle: 'A weekend botanical pressing guide from our studio table to yours.',
    category: 'DIY Ideas',
    publishedAt: 'October 2026',
    readTime: '4 min read',
    author: 'MITSU Crntzz Studio',
    image: bookmarkImg,
    excerpt:
      'Learn which delicate petals hold their colour best, how to layer blotting paper inside heavy books, and how to tie a crisp braided cotton tassel.',
    content: [
      'Pressing real flowers is one of the gentlest ways to keep a memory of a season. Start by picking blooms mid-morning after dew has evaporated, choosing flat-faced daisies, larkspur, cosmos, and young fern fronds.',
      'Lay each stem face-down between two sheets of acid-free blotting paper or unbleached parchment, never letting petals overlap. Place them inside a thick hardcover book and weigh it down evenly.',
      'After 10 to 14 days, lift the dried blooms carefully with flat tweezers and arrange them onto 300 GSM textured cotton cardstock. A tiny dot of archival pH-neutral glue anchors the stem before sealing and punching a hole for a braided cotton tassel.',
    ],
  },
  {
    id: 'diy-home-alpona-kolka',
    title: 'Beginner’s Guide to Drawing Symmetric Courtyard Alpona & Kolka',
    subtitle: 'From a single centre dot to rhythmic lotus petals and paisley vines.',
    category: 'DIY Ideas',
    publishedAt: 'September 2026',
    readTime: '5 min read',
    author: 'MITSU Crntzz Studio',
    image: alponaImg,
    excerpt:
      'Traditional Bengali alpona looks intricate, yet every grand mandala grows out of four simple strokes: dots, concentric rings, lotus petals, and flowing vines.',
    content: [
      'Before dipping your brush or cotton tuft into crisp white rice paste (pithali), lightly mark a centre point and four cardinal ticks using a piece of chalk or a pencil.',
      'Begin with a tiny eight-petal rosette in the middle, then draw two clean concentric guide circles around it. Working from the inside outward keeps your hand from smudging fresh pigment.',
      'Fill the outer ring with repeating S-curved kolka vines and finish the rim with an even ring of pearl dots. Even a 15-minute doorway alpona instantly transforms festive mornings.',
    ],
  },
  {
    id: 'radha-krishna-lotus-mural',
    title: 'Hand-Painted Radha-Krishna & Mirrored Lotus Wall Mural',
    subtitle: 'A two-panel devotional and botanical diptych painted directly onto spring-green plaster.',
    category: 'Heritage & Rangoli',
    publishedAt: 'November 2026',
    readTime: '3 min read',
    author: 'MITSU Crntzz Studio',
    image: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_12.18.14_AM_4e5d50b9.jpeg',
    excerpt:
      'Rich cobalt, crimson, and emerald acrylic brushwork brings together a serene Radha-Krishna portrait alongside a symmetrical double-lotus vine mural.',
    content: [
      'Painted across two paired wall panels in a bright pistachio-green room, this commission pairs devotional storytelling with ornamental Indian floral brushwork. On the left panel, Krishna—rendered in vivid sapphire blue with his peacock-feather crown, pearl necklace, emerald drape, and bamboo bansuri—stands in quiet embrace beside Radha, draped in a crimson chunri edged with fine white pearl dots and holding a blooming pink lotus.',
      'The companion panel mirrors that sacred blossom into a vertical botanical study: two crimson-magenta lotuses—one opening upward and its twin curving below—framed by layered forest-green scrollwork, warm golden flourishes, and bright vermilion berries.',
      'Working freehand with matte exterior-grade artists’ acrylics and fine liner brushes lets crisp decorative outlines sit smoothly against luminous colour gradients, turning everyday home walls into lasting devotional keepsakes.',
    ],
  },
  {
    id: 'studio-notes-three-levels',
    title: 'Inside Our Three Transparent Levels: Basic, Premium & Personalised',
    subtitle: 'Designing handmade gifting that stays accessible from ₹29 upward.',
    category: 'Studio Notes',
    publishedAt: 'July 2026',
    readTime: '3 min read',
    author: 'MITSU Crntzz Studio',
    image: atelierImg,
    excerpt:
      'Handmade art should never feel gated behind luxury markups. Here is how we structure every piece across three honest price levels.',
    content: [
      'When we launched MITSU Crntzz, we noticed handmade gifts often came with either steep boutique pricing or vague “DM for price” barriers.',
      'So we organised every single offering — from a ₹29 bookmark and ₹49 greeting card to our ₹529 Platinum Gift Hamper — into three transparent levels: Basic, Premium, and Personalised.',
      'Whether you want a thoughtful everyday token or a deeply custom keepsake filled with printed photos and handwritten letters, you know the exact craft and price up front.',
    ],
  },
];
