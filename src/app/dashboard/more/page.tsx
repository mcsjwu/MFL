import Link from "next/link";
import Icon from "@/components/mfl/Icon";
import PageHeader from "@/components/mfl/PageHeader";
import LogoutButton from "../LogoutButton";

const LINKS = [
  { href: "/dashboard/rosters", title: "Rosters", sub: "Every team's players" },
  { href: "/dashboard/schedule", title: "Schedule", sub: "Matchups, week by week" },
  { href: "/dashboard/draft", title: "Draft", sub: "Every pick, by round" },
  { href: "/dashboard/transactions", title: "Transactions", sub: "Adds, drops, trades and IR" },
  { href: "/dashboard/league", title: "League info", sub: "Settings and franchises" },
];

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" />
      <div className="mfl-card">
        <ul className="mfl-rows">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="mfl-row">
                <span className="mfl-row__main">
                  <span className="mfl-row__title">{link.title}</span>
                  <span className="mfl-row__sub">{link.sub}</span>
                </span>
                <span className="mfl-row__end">
                  <Icon name="chevron" small />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <LogoutButton />
    </>
  );
}
