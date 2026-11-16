export interface OrderTimelineStep {
  title: string;
  detail: string;
}

export interface MockOrderStatusRecord {
  reference: string;
  updatedAtLabel: string;
  stageTitle: string;
  pieceSummary: string;
  isSample: boolean;
  stageNote: string;
  currentStage: number;
  estimatedDispatch: string;
}

export const ORDER_TIMELINE_STEPS: OrderTimelineStep[] = [
  {
    title: 'Enquiry Received in Studio',
    detail: 'Your WhatsApp or Email order brief has arrived at the MITSU Crntzz desk.',
  },
  {
    title: 'Materials & Colours Confirmed',
    detail: 'Shades, custom names, and delivery PIN code confirmed together in chat.',
  },
  {
    title: 'Handcrafting at the Worktable',
    detail: 'Your piece is being painted, folded, arranged, or pressed by hand.',
  },
  {
    title: 'Ribbon Wrapped & Ready for Dispatch',
    detail: 'Photos shared on WhatsApp and packed securely in kraft wrapping.',
  },
];

export const SAMPLE_TRACKABLE_ORDERS: Record<string, MockOrderStatusRecord> = {
  'MC-4812-LOTS': {
    reference: 'MC-4812-LOTS',
    updatedAtLabel: 'Sample · Stage 3 of 4',
    stageTitle: 'Handcrafting at the Worktable',
    pieceSummary: 'Gold Gift Hamper (₹329) + Pipe Cleaner Bouquet (Premium)',
    isSample: true,
    stageNote:
      'Chenille sunflower petals and mini scrapbook pages are finished. Final ribbon wrapping & photo check tomorrow.',
    currentStage: 2,
    estimatedDispatch: 'Estimated dispatch: 1–2 working days',
  },
  'INQ-3105-DIAR': {
    reference: 'INQ-3105-DIAR',
    updatedAtLabel: 'Sample · Stage 2 of 4',
    stageTitle: 'Materials & Colours Confirmed',
    pieceSummary: 'Personalised Kolka Art (₹399) + Memory Jar (₹299)',
    isSample: true,
    stageNote:
      'Terracotta base coat and 35 custom scroll messages approved on WhatsApp. Brushwork begins today.',
    currentStage: 1,
    estimatedDispatch: 'Estimated dispatch: 3–4 working days',
  },
};

export function lookupMockOrderStatus(
  rawRef: string,
  activeConfirmationRef?: string
): MockOrderStatusRecord | null {
  const normalized = rawRef.trim().toUpperCase();
  if (!normalized) return null;

  if (SAMPLE_TRACKABLE_ORDERS[normalized]) {
    return SAMPLE_TRACKABLE_ORDERS[normalized];
  }

  if (activeConfirmationRef && normalized === activeConfirmationRef.trim().toUpperCase()) {
    return {
      reference: normalized,
      updatedAtLabel: 'Current Bag Session',
      stageTitle: 'Enquiry Prepared — Ready to Send',
      pieceSummary: 'Your current MITSU Crntzz order enquiry',
      isSample: false,
      stageNote:
        'Once you tap "Open WhatsApp & press Send", the studio will confirm your materials and delivery fee right in chat.',
      currentStage: 0,
      estimatedDispatch: 'Craft time begins as soon as confirmed on WhatsApp',
    };
  }

  if (/^(MC|INQ|MSG)-[A-Z0-9]{4}-[A-Z0-9]{3,6}$/.test(normalized)) {
    return {
      reference: normalized,
      updatedAtLabel: 'Preview · Studio Queue',
      stageTitle: 'Enquiry Logged via WhatsApp / Email',
      pieceSummary: 'Handmade MITSU Crntzz Order',
      isSample: false,
      stageNote:
        'Live tracking links and pre-dispatch photos are shared directly in your WhatsApp conversation with the studio.',
      currentStage: 1,
      estimatedDispatch: 'Tap below to ask for your live courier update on WhatsApp',
    };
  }

  return null;
}
