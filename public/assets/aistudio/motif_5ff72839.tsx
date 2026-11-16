/** Hand-drawn style ornaments. Pure SVG, no images needed. */

export function LotusLineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M100 118c-14-9-20-28-10-48 10 10 14 30 10 48Z" />
      <path d="M100 118c14-9 20-28 10-48-10 10-14 30-10 48Z" />
      <path d="M100 118c-20-4-34-18-34-38 18 4 30 18 34 38Z" />
      <path d="M100 118c20-4 34-18 34-38-18 4-30 18-34 38Z" />
      <path d="M100 118c-10-20-6-44 0-56 6 12 10 36 0 56Z" />
      <path d="M100 122c-22 12-46 8-60-8 26-4 46 0 60 8Z" />
      <path d="M100 122c22 12 46 8 60-8-26-4-46 0-60 8Z" />
      <path d="M30 40c10-14 28-18 40-10-10 12-26 16-40 10ZM170 40c-10-14-28-18-40-10 10 12 26 16 40 10Z" />
      <path d="M22 140c20-10 40-10 60 0M118 140c20-10 40-10 60 0" strokeDasharray="3 5" />
    </svg>
  );
}

export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M60 196C58 140 54 80 70 10" />
      <path d="M62 150c-20-2-34-12-40-30 18 2 32 12 40 30ZM63 118c20-2 34-12 40-30-18 2-32 12-40 30ZM64 86c-18-2-30-12-36-28 16 2 28 12 36 28ZM66 56c18-2 30-12 36-28-16 2-28 12-36 28Z" />
    </svg>
  );
}

export function HeartDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M32 52S10 38 10 22c0-7 5.5-12 12-12 4.5 0 8 2.5 10 6 2-3.5 5.5-6 10-6 6.5 0 12 5 12 12 0 16-22 30-22 30Z" />
      <path d="M18 20c-2 2-3 5-2.5 8" opacity="0.6" />
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sage-deep ${className ?? ""}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-sage-deep/80" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-rose" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-sage-deep/80" />
    </div>
  );
}

export function SparkleTrail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2c.6 3.4 2.2 5 5.6 5.6C14.2 8.2 12.6 9.8 12 13.2c-.6-3.4-2.2-5-5.6-5.6C9.8 7 11.4 5.4 12 2Z" />
      <circle cx="30" cy="12" r="1.2" />
      <circle cx="40" cy="12" r="1.2" opacity="0.6" />
      <circle cx="50" cy="12" r="1.2" />
      <path d="M68 10c.4 2.2 1.4 3.2 3.6 3.6-2.2.4-3.2 1.4-3.6 3.6-.4-2.2-1.4-3.2-3.6-3.6 2.2-.4 3.2-1.4 3.6-3.6Z" />
    </svg>
  );
}
