import React from 'react';
import { siteConfig, buildWhatsAppLink } from '../lib/site';

/**
 * Pure SVG MITSU Crntzz lotus medallion from the brand reference.
 * Pass showText={true} for large hero medallions; omit for compact header/footer badges.
 */
export const LotusMark: React.FC<{ className?: string; showText?: boolean }> = ({
  className = '',
  showText = false,
}) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label={`${siteConfig.name} lotus emblem`}
  >
    <defs>
      <linearGradient id="mitsu-lotus-petal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f8d3db" />
        <stop offset="1" stopColor="#e59bae" />
      </linearGradient>
      <linearGradient id="mitsu-lotus-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4c3cd" />
        <stop offset="1" stopColor="#d9859b" />
      </linearGradient>
      <linearGradient id="mitsu-lotus-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8aa387" />
        <stop offset="1" stopColor="#4f6d57" />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="98" fill="#fbf4ec" />
    <circle cx="100" cy="100" r="91.5" fill="none" stroke="#183923" strokeWidth="2.4" />
    <circle
      cx="100"
      cy="100"
      r="85"
      fill="none"
      stroke="#A8B18F"
      strokeWidth="1"
      strokeDasharray="2 4"
    />

    <path
      d="M100 50c-2.8-6.2-13-6.4-13 2.2 0 6.4 9.4 13.2 13 15.8 3.6-2.6 13-9.4 13-15.8 0-8.6-10.2-8.4-13-2.2Z"
      fill="none"
      stroke="#183923"
      strokeWidth="1.5"
    />
    <circle cx="100" cy="42" r="1.6" fill="#B69A64" />

    <g transform={showText ? 'translate(0 0)' : 'translate(0 8) scale(1.08) translate(-8 -10)'}>
      <path
        d="M100 124c-21 0-38-10-44-26 20-1 36 7 44 26Z"
        fill="url(#mitsu-lotus-side)"
        stroke="#c8768e"
        strokeWidth="0.7"
      />
      <path
        d="M100 124c21 0 38-10 44-26-20-1-36 7-44 26Z"
        fill="url(#mitsu-lotus-side)"
        stroke="#c8768e"
        strokeWidth="0.7"
      />
      <path
        d="M100 124c-17-7-27-24-21-44 15 10 22 26 21 44Z"
        fill="url(#mitsu-lotus-petal)"
        stroke="#c8768e"
        strokeWidth="0.7"
      />
      <path
        d="M100 124c17-7 27-24 21-44-15 10-22 26-21 44Z"
        fill="url(#mitsu-lotus-petal)"
        stroke="#c8768e"
        strokeWidth="0.7"
      />
      <path
        d="M100 124c-12-13-13-34 0-50 13 16 12 37 0 50Z"
        fill="url(#mitsu-lotus-petal)"
        stroke="#c8768e"
        strokeWidth="0.7"
      />
      <ellipse cx="100" cy="112" rx="5" ry="3" fill="#f2d28a" opacity="0.9" />

      <path
        d="M100 126c-20 12-40 10-54-6 22-4 40-2 54 6Z"
        fill="url(#mitsu-lotus-leaf)"
        stroke="#183923"
        strokeWidth="0.7"
      />
      <path
        d="M100 126c20 12 40 10 54-6-22-4-40-2-54 6Z"
        fill="url(#mitsu-lotus-leaf)"
        stroke="#183923"
        strokeWidth="0.7"
      />
      <path
        d="M58 118c12 1 26 3 42 8M142 118c-12 1-26 3-42 8"
        fill="none"
        stroke="#fbf4ec"
        strokeWidth="0.8"
        opacity="0.7"
      />
    </g>

    {showText && (
      <>
        <text
          x="100"
          y="156"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="23"
          fontWeight="600"
          letterSpacing="4"
          fill="#183923"
        >
          MITSU
        </text>
        <text
          x="104"
          y="178"
          textAnchor="middle"
          fontFamily="var(--font-script)"
          fontSize="27"
          fill="#cf6c87"
        >
          Crntzz
        </text>
      </>
    )}
  </svg>
);

export const LeafSprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 200"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    <path d="M60 196C58 140 54 80 70 10" />
    <path d="M62 150c-20-2-34-12-40-30 18 2 32 12 40 30ZM63 118c20-2 34-12 40-30-18 2-32 12-40 30ZM64 86c-18-2-30-12-36-28 16 2 28 12 36 28ZM66 56c18-2 30-12 36-28-16 2-28 12-36 28Z" />
  </svg>
);

export const HeartDoodle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M32 52S10 38 10 22c0-7 5.5-12 12-12 4.5 0 8 2.5 10 6 2-3.5 5.5-6 10-6 6.5 0 12 5 12 12 0 16-22 30-22 30Z" />
    <path d="M18 20c-2 2-3 5-2.5 8" opacity="0.6" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Z" />
    <path d="M16.53 14.32c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35 1 2.51c.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
  </svg>
);

export const WhatsAppFab: React.FC = () => {
  const link = buildWhatsAppLink(
    `Hello ${siteConfig.name}, I'd love some help choosing a handmade piece or placing a custom order.`
  );
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${siteConfig.name} on WhatsApp at ${siteConfig.phone.display}`}
      className="group fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#F8F0E4]/40 bg-[#2F7A56] px-4 py-3 text-[#F8F0E4] shadow-[0_14px_30px_-14px_rgba(24,57,35,0.85)] transition-transform hover:scale-[1.03] sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden font-display text-[1rem] font-semibold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-44 group-hover:opacity-100">
        Message the studio
      </span>
    </a>
  );
};
