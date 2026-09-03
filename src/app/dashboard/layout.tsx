import type { ReactNode } from "react";
import { getLeagueName } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";
import NavLinks from "./NavLinks";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookie = await getMflSessionCookie();
  const leagueName = await getLeagueName({ cookie });

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-4 flex md:flex-col gap-4">
        <div className="flex flex-col gap-1 px-1">
          <span className="text-base font-semibold truncate">{leagueName ?? "My League"}</span>
          <LogoutButton />
        </div>
        <div className="flex-1">
          <NavLinks />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
