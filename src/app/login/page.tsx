import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/mfl/session";
import { MFL_LEAGUE_ID } from "@/lib/mfl/config";
import { getLeagueName } from "@/lib/mfl/queries";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect("/dashboard");
  }

  const leagueName = await getLeagueName();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">{leagueName ?? "MyFantasyLeague"}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          MyFantasyLeague app &middot; League #{MFL_LEAGUE_ID}
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
