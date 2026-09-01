import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME as SESSION_COOKIE, FRANCHISE_COOKIE_NAME as FRANCHISE_COOKIE } from "./config";

/** Returns the stored "NAME=VALUE" cookie string to send to MFL, if logged in. */
export async function getMflSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function setMflSessionCookie(cookieName: string, cookieValue: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, `${cookieName}=${cookieValue}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function setMyFranchiseId(franchiseId: string) {
  const store = await cookies();
  store.set(FRANCHISE_COOKIE, franchiseId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getMyFranchiseId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(FRANCHISE_COOKIE)?.value;
}

export async function clearMflSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(FRANCHISE_COOKIE);
}

export async function isLoggedIn(): Promise<boolean> {
  return Boolean(await getMflSessionCookie());
}
