import { NextRequest, NextResponse } from "next/server";
import { MflApiError } from "@/lib/mfl/client";
import { submitLineup } from "@/lib/mfl/mutations";
import { getMflSessionCookie } from "@/lib/mfl/session";

export async function POST(request: NextRequest) {
  const cookie = await getMflSessionCookie();
  if (!cookie) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { week?: number; starters?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { week, starters } = body;
  if (!week || !Array.isArray(starters) || starters.length === 0) {
    return NextResponse.json({ error: "week and starters are required" }, { status: 400 });
  }

  try {
    await submitLineup({ cookie, week, starters });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MflApiError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Failed to submit lineup" }, { status: 502 });
  }
}
