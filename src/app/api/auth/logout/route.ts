import { NextResponse } from "next/server";
import { clearMflSession } from "@/lib/mfl/session";

export async function POST() {
  await clearMflSession();
  return NextResponse.json({ ok: true });
}
