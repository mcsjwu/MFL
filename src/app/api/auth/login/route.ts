import { NextRequest, NextResponse } from "next/server";
import { findMyFranchiseId, MflAuthError, mflLogin } from "@/lib/mfl/client";
import { setMflSessionCookie, setMyFranchiseId } from "@/lib/mfl/session";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  try {
    const { cookieName, cookieValue } = await mflLogin(username, password);
    await setMflSessionCookie(cookieName, cookieValue);

    const myLeague = await findMyFranchiseId(`${cookieName}=${cookieValue}`).catch(() => undefined);
    if (myLeague?.franchise_id) {
      await setMyFranchiseId(myLeague.franchise_id);
    }

    return NextResponse.json({ ok: true, franchiseId: myLeague?.franchise_id ?? null });
  } catch (err) {
    if (err instanceof MflAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Login failed, please try again" }, { status: 502 });
  }
}
