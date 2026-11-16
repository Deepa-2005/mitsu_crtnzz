"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  BagIcon,
  BulbIcon,
  GiftIcon,
  HeartIcon,
  PaletteIcon,
  PlantIcon,
  SparkleIcon,
} from "@/components/icons";
import { categoryTabs, type TabIcon } from "@/lib/site";

const icons: Record<TabIcon, (props: { className?: string }) => React.JSX.Element> = {
  palette: PaletteIcon,
  gift: GiftIcon,
  plant: PlantIcon,
  bag: BagIcon,
  bulb: BulbIcon,
  heart: HeartIcon,
};

/** The six arch-shaped tabs from the approved design. Each opens its own page. */
export function CategoryTabs({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Explore by category" className={compact ? "" : "py-9 sm:py-10"}>
      <ul className="mx-auto flex max-w-6xl flex-wrap items-end justify-center gap-x-3 gap-y-5 px-4 sm:gap-x-5">
        {categoryTabs.map((tab, index) => {
          const Icon = icons[tab.icon];
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`));
          return (
            <Fragment key={tab.href}>
              <li>
                <Link href={tab.href} className="tab-arch" aria-current={active ? "page" : undefined} title={tab.blurb}>
                  <span className="tab-arch__icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="tab-arch__label">{tab.label}</span>
                </Link>
              </li>
              {index < categoryTabs.length - 1 ? (
                <li aria-hidden className="hidden self-center pb-8 text-gold lg:block">
                  <SparkleIcon className="h-3.5 w-3.5" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
