import Link from "next/link";
import type { ReactNode } from "react";
import { LotusLineArt } from "@/components/motif";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

/**
 * Compact page header shared by every inner page. Keeps the top of each
 * page short so content is visible without scrolling.
 */
export function PageHero({
  eyebrow,
  title,
  scriptWord,
  lead,
  actions,
  crumbs,
  aside,
}: {
  eyebrow: string;
  title: string;
  scriptWord?: string;
  lead?: string;
  actions?: ReactNode;
  crumbs?: Array<{ label: string; href?: string }>;
  aside?: ReactNode;
}) {
  return (
    <section className="band-petal relative overflow-hidden border-b border-sage/40">
      <LotusLineArt className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-60 text-sage/50 sm:h-56 sm:w-72" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          {crumbs ? (
            <nav aria-label="Breadcrumb" className="mb-3 text-[0.72rem] tracking-[0.12em] text-ink-soft uppercase">
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-forest">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-forest">{crumb.label}</span>
                  )}
                  {index < crumbs.length - 1 ? (
                    <span aria-hidden className="px-2 text-rose">
                      ·
                    </span>
                  ) : null}
                </span>
              ))}
            </nav>
          ) : null}
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.3rem,5vw,3.7rem)] leading-[1.02]">
            {title}
            {scriptWord ? <span className="script ml-3 text-[0.9em] leading-none">{scriptWord}</span> : null}
          </h1>
          {lead ? <p className="prose-note mt-3 max-w-xl text-[0.98rem]">{lead}</p> : null}
          {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="hidden lg:block">{aside}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  scriptWord,
  lead,
  align = "left",
  action,
}: {
  eyebrow: string;
  title: string;
  scriptWord?: string;
  lead?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-3 ${centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div className={centered ? "max-w-2xl" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,3.8vw,2.8rem)] leading-tight">
          {title}
          {scriptWord ? <span className="script ml-3 text-[0.95em]">{scriptWord}</span> : null}
        </h2>
        {lead ? <p className="prose-note mt-2 max-w-xl">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CtaBand({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-sage/50 bg-ivory/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="prose-note mt-1 max-w-xl">{copy}</p>
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
