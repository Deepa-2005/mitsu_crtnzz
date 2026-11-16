import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function WhatsAppIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden {...props}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Z" />
      <path d="M16.53 14.32c-.25-.12-1.47-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35 1 2.51c.12.16 1.72 2.63 4.17 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

export function MailIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.3 5.2a1.6 1.6 0 0 0 1.8 0L20.2 7" />
    </svg>
  );
}

export function PhoneIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M5.5 3.5h2.2l1.6 4-2 1.4a11.4 11.4 0 0 0 5.8 5.8l1.4-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5A16.6 16.6 0 0 1 3 6.2 2.5 2.5 0 0 1 5.5 3.5Z" />
    </svg>
  );
}

export function BagIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M5 8h14l-1.1 11a2 2 0 0 1-2 1.8H8.1a2 2 0 0 1-2-1.8Z" />
      <path d="M9 8V6.4a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function HeartIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </svg>
  );
}

export function PaletteIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17h1.2a2 2 0 0 0 1.5-3.3 1.6 1.6 0 0 1 1.2-2.7h1.7a3 3 0 0 0 3-3A8.6 8.6 0 0 0 12 3.5Z" />
      <circle cx="8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="14.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GiftIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3.5 9h17v3h-17zM12 9v11" />
      <path d="M12 9c-1.5-3.6-6-3.6-5.5-.8.3 1.3 3 1 5.5.8ZM12 9c1.5-3.6 6-3.6 5.5-.8-.3 1.3-3 1-5.5.8Z" />
    </svg>
  );
}

export function PlantIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 2.5-7 7-7 0 4-2.5 7-7 7Z" />
      <path d="M12 15c0-3.3-2-5.5-5.5-5.5 0 3.3 2 5.5 5.5 5.5Z" />
      <path d="M7.5 21h9" />
    </svg>
  );
}

export function BulbIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M9 18h6M10 21h4" />
      <path d="M8.5 14.5A5.5 5.5 0 1 1 15.5 14.5c-.7.7-1 1.4-1 2.5h-5c0-1.1-.3-1.8-1-2.5Z" />
    </svg>
  );
}

export function LeafIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
      <path d="M5 19c3-4 6-7 10-10" />
    </svg>
  );
}

export function ArrowIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

export function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function SparkleIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.5c.9 4.6 3 6.9 7.5 7.5-4.5.6-6.6 2.9-7.5 7.5-.9-4.6-3-6.9-7.5-7.5 4.5-.6 6.6-2.9 7.5-7.5Z" />
    </svg>
  );
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function InstagramIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function TagIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...props}>
      <path d="M3.5 12V4.5A1 1 0 0 1 4.5 3.5H12L20.5 12a1.4 1.4 0 0 1 0 2L14 20.5a1.4 1.4 0 0 1-2 0Z" />
      <circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
