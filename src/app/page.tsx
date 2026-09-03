import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/mfl/session";

export default async function Home() {
  redirect((await isLoggedIn()) ? "/dashboard" : "/login");
}
