import React, { useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  History,
  Mail,
  PackageSearch,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { SavedOrderRecord } from '../types';
import { formatINR } from '../lib/site';
import { WhatsAppIcon } from './BrandMark';

interface OrderHistoryProps {
  orders: SavedOrderRecord[];
  onTrackOrder: (reference: string) => void;
  onReorder: (order: SavedOrderRecord) => void;
  onRemoveOrder: (reference: string) => void;
  onClearHistory: () => void;
  onBrowseShop: () => void;
}

function formatSavedDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onTrackOrder,
  onReorder,
  onRemoveOrder,
  onClearHistory,
  onBrowseShop,
}) => {
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const handleCopySummary = async (order: SavedOrderRecord) => {
    try {
      await navigator.clipboard.writeText(order.message);
      setCopiedRef(order.reference);
      window.setTimeout(() => {
        setCopiedRef((prev) => (prev === order.reference ? null : prev));
      }, 2200);
    } catch {
      setCopiedRef(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#EFE4D3] border border-[#B69A64]/45 mx-auto flex items-center justify-center text-[#183923]">
          <History className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-2xl text-[#183923]">No past orders saved yet</p>
          <p className="text-[13.5px] text-[#183923]/70 max-w-xs mx-auto leading-relaxed">
            When you complete checkout in your Atelier Bag, your unique reference number and
            formatted order summary are saved right here on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={onBrowseShop}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
        >
          Explore the Shop
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-[#EFE4D3]/80 border border-[#A8B18F]/45">
        <p className="text-[12px] text-[#183923]/80 leading-snug">
          Saved locally in this browser ({orders.length}{' '}
          {orders.length === 1 ? 'order' : 'orders'}). No database is used.
        </p>
        {confirmClearAll ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setConfirmClearAll(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#CF6C87] text-[#F8F0E4] text-[11.5px] font-medium cursor-pointer"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmClearAll(false)}
              className="px-2 py-1 rounded-lg border border-[#183923]/25 text-[11.5px] text-[#183923] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClearAll(true)}
            className="text-[11.5px] font-medium text-[#7C6536] hover:text-[#CF6C87] underline underline-offset-2 shrink-0 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.reference}
            className="p-4 rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/60 space-y-3.5 shadow-sm"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#A8B18F]/30">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#183923] text-[#F8F0E4] text-[11px] font-semibold tracking-wider uppercase">
                    {order.reference}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-[#7C6536]">
                    <Clock className="w-3 h-3" />
                    <span>{formatSavedDate(order.createdAt)}</span>
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-[#183923] truncate">
                  {order.customerName} · {order.customerPhone}
                </p>
                <p className="text-[12px] text-[#183923]/70 leading-snug line-clamp-2">
                  {order.shippingAddress}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveOrder(order.reference)}
                aria-label={`Remove order ${order.reference} from history`}
                className="p-1.5 rounded-lg text-[#183923]/45 hover:text-[#CF6C87] hover:bg-[#EFE4D3] transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Line Items */}
            <ul className="space-y-1.5 text-[12.5px]">
              {order.items.map((item, idx) => (
                <li
                  key={`${order.reference}:${item.slug}:${item.tier}:${idx}`}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="text-[#183923]/90">
                    {item.name}{' '}
                    <span className="text-[#7C6536]">
                      ({item.tierLabel} × {item.quantity})
                    </span>
                  </span>
                  <span className="tabular-nums font-medium text-[#183923] shrink-0">
                    {item.price === null ? 'To be quoted' : formatINR(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="pt-2.5 border-t border-[#A8B18F]/30 flex items-center justify-between text-[12.5px]">
              <span className="text-[#183923]/70">
                {order.quotedCount > 0
                  ? `Priced subtotal (+ ${order.quotedCount} custom quote)`
                  : 'Priced subtotal'}
              </span>
              <span className="font-semibold tabular-nums text-[#183923]">
                {order.pricedCount > 0 ? formatINR(order.subtotal) : 'Quote via WhatsApp'}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onTrackOrder(order.reference)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#B69A64]/70 bg-[#EFE4D3]/60 text-[#183923] text-[12px] font-medium hover:bg-[#EFE4D3] transition-colors cursor-pointer"
              >
                <PackageSearch className="w-3.5 h-3.5 text-[#7C6536]" />
                <span>Track Status</span>
              </button>
              <button
                type="button"
                onClick={() => onReorder(order)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#183923] text-[#F8F0E4] text-[12px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#E9A9AA]" />
                <span>Order Again</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
              <a
                href={order.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2F7A56]/12 text-[#183923] hover:bg-[#2F7A56]/20 transition-colors font-medium"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#2F7A56]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={order.mailtoUrl}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFE4D3] text-[#183923] hover:bg-[#E9A9AA]/35 transition-colors font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-[#CF6C87]" />
                <span>Email</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopySummary(order)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#A8B18F]/50 text-[#183923] hover:bg-[#EFE4D3] transition-colors font-medium cursor-pointer ml-auto"
              >
                {copiedRef === order.reference ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2F7A56]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
