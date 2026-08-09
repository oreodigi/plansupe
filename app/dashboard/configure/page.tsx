import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { SetupBuilder } from "@/components/setup-builder";
import { getBusinessData } from "@/lib/db";
import { MODULES, requirementsFor, type ModuleKey } from "@/lib/setup-catalog";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConfigureBusinessPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  const params = await searchParams;
  const result = await getBusinessData(params.business);
  if (!result.business) redirect("/dashboard");
  const validModules = new Set(MODULES.map((entry) => entry.key));
  const initialModules = result.businessModules.map((entry) => entry.module_key).filter((entry): entry is ModuleKey => validModules.has(entry as ModuleKey));
  const existingKeys = new Set(result.items.map((entry) => `${entry.module}::${entry.name}`));
  const initialRequirements = MODULES.flatMap(({ key }) => requirementsFor(result.business!.category, key)).filter((entry) => existingKeys.has(`${entry.module}::${entry.title}`)).map((entry) => entry.id);

  return <main className="configure-page"><div className="configure-bar"><Link href={`/dashboard?business=${result.business.id}`}><ArrowLeft/> Back to workspace</Link><span>{result.business.name}</span></div><SetupBuilder business={result.business} initialModules={initialModules} initialRequirements={initialRequirements}/></main>;
}
