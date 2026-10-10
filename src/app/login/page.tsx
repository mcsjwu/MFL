import { redirect } from "next/navigation";
import Monogram from "@/components/mfl/Monogram";
import { getLeagueName } from "@/lib/mfl/queries";
import { isLoggedIn } from "@/lib/mfl/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect("/dashboard");
  }

  const leagueName = (await getLeagueName()) ?? "MyFantasyLeague";

  return (
    <main className="mfl-screen">
      <div className="mfl-shell mfl-login">
        <header className="mfl-pagehead" style={{ alignItems: "flex-start", gap: "var(--space-4)" }}>
          <Monogram name={leagueName} />
          <h1 className="mfl-large-title">{leagueName}</h1>
          <p className="mfl-callout" style={{ margin: 0 }}>
            Sign in with your MyFantasyLeague login.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
