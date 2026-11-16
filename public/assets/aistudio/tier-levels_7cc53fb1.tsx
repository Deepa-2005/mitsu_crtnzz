import { SparkleIcon } from "@/components/icons";
import { tierMeta, tierOrder } from "@/lib/catalog";

/** Explains the three levels available in every category. */
export function TierLevels({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "rounded-[1.6rem] border border-sage/50 bg-ivory/80 p-5 sm:p-6"}>
      {!compact ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl">
            Three levels in <span className="script">every category</span>
          </h2>
          <p className="text-[0.8rem] text-ink-soft">Handmade at minimal prices — pick the level that suits the moment.</p>
        </div>
      ) : null}
      <ul className={`grid gap-3 sm:grid-cols-3 ${compact ? "" : "mt-4"}`}>
        {tierOrder.map((key, index) => {
          const tier = tierMeta[key];
          const styles =
            key === "basic"
              ? "border-sage/60 bg-cream"
              : key === "premium"
                ? "border-blush/80 bg-petal/70"
                : "border-forest/40 bg-forest text-cream";
          const dark = key === "customise";
          return (
            <li key={key} className={`rounded-[1.3rem] border p-4 ${styles}`}>
              <p className={`flex items-center gap-2 font-display text-[1.15rem] font-semibold ${dark ? "text-cream" : "text-forest"}`}>
                <span className={`script text-2xl leading-none ${dark ? "text-blush" : "text-rose"}`}>{String(index + 1).padStart(2, "0")}</span>
                {tier.label}
                {key === "premium" ? <SparkleIcon className="h-3.5 w-3.5 text-gold" /> : null}
              </p>
              <p className={`mt-1 text-[0.82rem] leading-snug ${dark ? "text-cream/80" : "text-ink-soft"}`}>{compact ? tier.short : tier.blurb}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
