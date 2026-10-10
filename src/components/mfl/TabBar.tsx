"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

interface Tab {
  href: string;
  label: string;
  icon: IconName;
  /** Other routes that belong to this tab. */
  also?: string[];
}

const TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/scores", label: "Scores", icon: "pulse" },
  { href: "/dashboard/my-team", label: "Team", icon: "person", also: ["/dashboard/lineup"] },
  { href: "/dashboard/standings", label: "Standings", icon: "list" },
  {
    href: "/dashboard/more",
    label: "More",
    icon: "more",
    also: [
      "/dashboard/rosters",
      "/dashboard/schedule",
      "/dashboard/draft",
      "/dashboard/transactions",
      "/dashboard/league",
    ],
  },
];

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.href === "/dashboard") return pathname === "/dashboard";
  return [tab.href, ...(tab.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function TabBar() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="mfl-tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={isActive(pathname, tab) ? "page" : undefined}>
          <Icon name={tab.icon} />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
