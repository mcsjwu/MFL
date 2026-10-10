import Link from "next/link";
import ChipRow from "@/components/mfl/ChipRow";
import PageHeader from "@/components/mfl/PageHeader";
import RosterCards from "@/components/mfl/RosterCards";
import { getCurrentWeek, getLeague } from "@/lib/mfl/queries";
import { getRosterView } from "@/lib/mfl/roster";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function RostersPage({
  searchParams,
}: {
  searchParams: Promise<{ franchise?: string }>;
}) {
  const cookie = await getMflSessionCookie();
  const [league, week] = await Promise.all([getLeague({ cookie }), getCurrentWeek({ cookie })]);
  const franchises = league?.franchises ?? [];

  const { franchise: franchiseParam } = await searchParams;
  const selected = franchises.find((f) => f.id === franchiseParam) ?? franchises[0];
  const groups = selected
    ? await getRosterView({ franchiseId: selected.id, week, currentWeek: week, cookie })
    : [];

  return (
    <>
      <PageHeader title="Rosters" sub={selected?.name?.trim()} />

      <ChipRow label="Team">
        {franchises.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/rosters?franchise=${f.id}`}
            className="mfl-btn mfl-btn--sm"
            aria-current={f.id === selected?.id ? "true" : undefined}
          >
            {f.name.trim()}
          </Link>
        ))}
      </ChipRow>

      <RosterCards groups={groups} />
    </>
  );
}
