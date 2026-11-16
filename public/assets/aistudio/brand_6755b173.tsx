import { siteConfig } from "@/lib/site";

/**
 * MITSU Crntzz lotus mark — pure SVG so it stays crisp at any size.
 * `showText` renders the wordmark inside the medallion (hero / footer);
 * omit it for the small header badge.
 */
export function LotusMark({ className, showText = false }: { className?: string; showText?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${siteConfig.name} lotus emblem`}>
      <defs>
        <linearGradient id="lotus-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8d3db" />
          <stop offset="1" stopColor="#e59bae" />
        </linearGradient>
        <linearGradient id="lotus-petal-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4c3cd" />
          <stop offset="1" stopColor="#d9859b" />
        </linearGradient>
        <linearGradient id="lotus-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8aa387" />
          <stop offset="1" stopColor="#4f6d57" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="#fbf4ec" />
      <circle cx="100" cy="100" r="91.5" fill="none" stroke="#2d4a3b" strokeWidth="2.4" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="#a6b79c" strokeWidth="1" strokeDasharray="2 4" />

      {/* heart outline above the lotus */}
      <path
        d="M100 50c-2.8-6.2-13-6.4-13 2.2 0 6.4 9.4 13.2 13 15.8 3.6-2.6 13-9.4 13-15.8 0-8.6-10.2-8.4-13-2.2Z"
        fill="none"
        stroke="#2d4a3b"
        strokeWidth="1.5"
      />
      <circle cx="100" cy="42" r="1.6" fill="#cfae6e" />

      {/* lotus petals */}
      <g transform={showText ? "translate(0 0)" : "translate(0 8) scale(1.08) translate(-8 -10)"}>
        <path d="M100 124c-21 0-38-10-44-26 20-1 36 7 44 26Z" fill="url(#lotus-petal-side)" stroke="#c8768e" strokeWidth="0.7" />
        <path d="M100 124c21 0 38-10 44-26-20-1-36 7-44 26Z" fill="url(#lotus-petal-side)" stroke="#c8768e" strokeWidth="0.7" />
        <path d="M100 124c-17-7-27-24-21-44 15 10 22 26 21 44Z" fill="url(#lotus-petal)" stroke="#c8768e" strokeWidth="0.7" />
        <path d="M100 124c17-7 27-24 21-44-15 10-22 26-21 44Z" fill="url(#lotus-petal)" stroke="#c8768e" strokeWidth="0.7" />
        <path d="M100 124c-12-13-13-34 0-50 13 16 12 37 0 50Z" fill="url(#lotus-petal)" stroke="#c8768e" strokeWidth="0.7" />
        <ellipse cx="100" cy="112" rx="5" ry="3" fill="#f2d28a" opacity="0.9" />

        {/* cupped leaves / hands */}
        <path d="M100 126c-20 12-40 10-54-6 22-4 40-2 54 6Z" fill="url(#lotus-leaf)" stroke="#2d4a3b" strokeWidth="0.7" />
        <path d="M100 126c20 12 40 10 54-6-22-4-40-2-54 6Z" fill="url(#lotus-leaf)" stroke="#2d4a3b" strokeWidth="0.7" />
        <path d="M58 118c12 1 26 3 42 8M142 118c-12 1-26 3-42 8" fill="none" stroke="#fbf4ec" strokeWidth="0.8" opacity="0.7" />
      </g>

      {showText ? (
        <>
          <text
            x="100"
            y="156"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="23"
            fontWeight="600"
            letterSpacing="4"
            fill="#2d4a3b"
          >
            MITSU
          </text>
          <text x="104" y="178" textAnchor="middle" fontFamily="var(--font-script)" fontSize="27" fill="#cf6c87">
            Crntzz
          </text>
        </>
      ) : null}
    </svg>
  );
}

/** Two-line wordmark: MITSU in serif, Crntzz in pink script tucked beneath. */
export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const serif = tone === "light" ? "text-cream" : "text-forest";
  return (
    <span className={`relative inline-flex flex-col leading-none ${className}`}>
      <span className={`font-display text-[1.55rem] font-semibold tracking-[0.18em] ${serif}`}>
        {siteConfig.shortName}
      </span>
      <span className="script -mt-2 self-end text-[1.5rem] leading-none text-blush">{siteConfig.scriptName}</span>
    </span>
  );
}

/** Big heading treatment used on the hero and about: MITSU + Crntzz + heart. */
export function BrandHeading({ className = "", size = "lg" }: { className?: string; size?: "lg" | "md" }) {
  const serif = size === "lg" ? "text-[clamp(3.4rem,8.5vw,6rem)]" : "text-[clamp(2.4rem,5vw,3.6rem)]";
  const script = size === "lg" ? "text-[clamp(2.6rem,6.8vw,4.8rem)]" : "text-[clamp(2rem,4vw,3rem)]";
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-4 ${className}`}>
      <span className={`font-display font-semibold leading-none tracking-[0.08em] text-forest ${serif}`}>
        {siteConfig.shortName}
      </span>
      <span className={`script leading-none ${script}`}>
        {siteConfig.scriptName}
        <span aria-hidden className="ml-2 inline-block text-[0.5em] text-rose">
          ♡
        </span>
      </span>
    </span>
  );
}
