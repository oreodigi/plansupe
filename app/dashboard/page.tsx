import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessData } from "@/lib/db";
import { Onboarding } from "@/components/onboarding";
import { Workspace } from "@/components/workspace";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/auth-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const params = await searchParams;
  const result = await getBusinessData(params.business);
  const fullName = String(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Founder");
  const firstName = fullName.split(" ")[0];
  if (!result.business) return <><header className="container public-nav"><Logo/><form action={signOutAction}><button className="btn secondary">Sign out</button></form></header><Onboarding firstName={firstName}/></>;
  return <Workspace {...result} business={result.business} email={data.user.email||""} firstName={firstName}/>;
}
