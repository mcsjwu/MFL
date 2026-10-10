import type { ReactNode } from "react";
import { getLeagueName } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";
import Monogram from "@/components/mfl/Monogram";
import TabBar from "@/components/mfl/TabBar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookie = await getMflSessionCookie();
  const leagueName = (await getLeagueName({ cookie })) ?? "My league";

  return (
    <div className="mfl-screen">
      <div className="mfl-shell">
        <div className="mfl-topbar">
          <span className="mfl-chip">
            <Monogram name={leagueName} small />
            <span>{leagueName}</span>
          </span>
        </div>
        {children}
      </div>
      <TabBar />
    </div>
  );
}
