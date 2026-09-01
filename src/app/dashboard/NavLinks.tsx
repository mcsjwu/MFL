"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/standings", label: "Standings" },
  { href: "/dashboard/scores", label: "Scores" },
  { href: "/dashboard/my-team", label: "My Team" },
  { href: "/dashboard/lineup", label: "Set Lineup" },
  { href: "/dashboard/rosters", label: "Rosters" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/draft", label: "Draft" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/league", label: "League Info" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard" ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
