import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { SetupBuilder } from "@/components/setup-builder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewBusinessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );

  return (
    <main className="configure-page">
      <div className="configure-bar">
        <Link href="/dashboard">
          <ArrowLeft /> Back to businesses
        </Link>
        <span>New business plan</span>
      </div>
      <SetupBuilder firstName={fullName.split(" ")[0]} />
    </main>
  );
}
