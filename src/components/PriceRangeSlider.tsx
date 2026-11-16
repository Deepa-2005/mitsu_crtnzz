import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { formatINR } from '../lib/site';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  onReset?: () => void;
  isFiltered: boolean;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  onReset,
  isFiltered,
}) => {
  const safeMax = Math.max(min + 1, max);
  const currentMin = Math.max(min, Math.min(value[0], value[1]));
  const currentMax = Math.min(safeMax, Math.max(value[1], value[0]));

  const minPercent = ((currentMin - min) / (safeMax - min)) * 100;
  const maxPercent = ((currentMax - min) / (safeMax - min)) * 100;

  const step = safeMax - min > 1000 ? 10 : 5;

  const handleMinChange = (raw: number) => {
    const clamped = Math.min(raw, currentMax);
    onChange([Math.max(min, clamped), currentMax]);
  };

  const handleMaxChange = (raw: number) => {
    const clamped = Math.max(raw, currentMin);
    onChange([currentMin, Math.min(safeMax, clamped)]);
  };

  const midPoint = Math.round((min + safeMax) / 2);
  const budgetPresets: { label: string; range: [number, number] }[] = [
    { label: 'All Prices', range: [min, safeMax] },
    { label: `Under ${formatINR(Math.min(150, midPoint))}`, range: [min, Math.min(150, midPoint)] },
    {
      label: `${formatINR(Math.min(150, midPoint))} – ${formatINR(Math.min(350, safeMax))}`,
      range: [Math.min(150, midPoint), Math.min(350, safeMax)],
    },
    { label: `${formatINR(Math.min(300, midPoint))}+`, range: [Math.min(300, midPoint), safeMax] },
  ];

  return (
    <div className="rounded-2xl bg-[#FDF9F4] border border-[#A8B18F]/60 px-4 sm:px-5 py-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#CF6C87]" />
          <span className="font-display text-[16px] font-semibold text-[#183923]">
            Filter by Price Range
          </span>
          <span className="hidden sm:inline text-[12px] text-[#183923]/60">
            (matches any tier inside range)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-display text-[18px] font-semibold text-[#183923] tabular-nums">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50">
              {formatINR(currentMin)}
            </span>
            <span className="text-[#CF6C87]">–</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#F8F0E4] border border-[#A8B18F]/50">
              {formatINR(currentMax)}
            </span>
          </div>

          {isFiltered && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[12px] text-[#CF6C87] hover:text-[#183923] underline underline-offset-4 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dual-Handle Slider Track */}
      <div className="relative h-7 flex items-center select-none">
        <div className="relative w-full h-1.5 rounded-full bg-[#A8B18F]/35">
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#183923] to-[#CF6C87]"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>

        <label htmlFor="price-range-min" className="sr-only">
          Minimum price in INR
        </label>
        <input
          id="price-range-min"
          type="range"
          min={min}
          max={safeMax}
          step={1}
          value={currentMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          style={{ zIndex: currentMin > safeMax - step * 3 ? 5 : 3 }}
          className="price-range-input absolute inset-0 w-full h-7 m-0"
        />

        <label htmlFor="price-range-max" className="sr-only">
          Maximum price in INR
        </label>
        <input
          id="price-range-max"
          type="range"
          min={min}
          max={safeMax}
          step={1}
          value={currentMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          style={{ zIndex: 4 }}
          className="price-range-input absolute inset-0 w-full h-7 m-0"
        />
      </div>

      {/* Min / Max ticks & Quick Budget Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="flex items-center justify-between sm:justify-start gap-3 text-[11.5px] text-[#183923]/60 tabular-nums">
          <span>Min {formatINR(min)}</span>
          <span aria-hidden="true">·</span>
          <span>Max {formatINR(safeMax)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {budgetPresets.map((preset) => {
            const active =
              currentMin === preset.range[0] && currentMax === preset.range[1];
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.range)}
                className={`px-2.5 py-1 rounded-lg border text-[11.5px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#183923] text-[#F8F0E4] border-[#183923]'
                    : 'bg-[#F8F0E4] text-[#183923]/80 border-[#A8B18F]/50 hover:border-[#183923]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
