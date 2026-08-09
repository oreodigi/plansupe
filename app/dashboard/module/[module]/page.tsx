import Link from "next/link";
import { ArrowLeft, CalendarBlank, CheckCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import { notFound, redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { createSetupItemAction, updateSetupStatusAction } from "@/app/actions";
import { getBusinessData } from "@/lib/db";
import { moduleUi } from "@/lib/module-ui";
import { MODULES, type ModuleKey } from "@/lib/setup-catalog";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const statuses = ["Not started", "In progress", "Blocked", "Completed", "Not applicable"];

export default async function ModulePage({ params, searchParams }: { params: Promise<{ module: string }>; searchParams: Promise<{ business?: string }> }) {
  const supabase = await createClient(); const { data, error } = await supabase.auth.getUser(); if (error || !data.user) redirect("/sign-in");
  const [{ module: slug }, query] = await Promise.all([params, searchParams]);
  const moduleDef = MODULES.find((entry) => entry.key.toLowerCase() === slug.toLowerCase()); if (!moduleDef) notFound();
  const key = moduleDef.key as ModuleKey; const result = await getBusinessData(query.business); if (!result.business) redirect("/dashboard");
  const selected = result.businessModules.some((entry) => entry.module_key === key) || result.items.some((item) => item.module === key); if (!selected) redirect(`/dashboard?business=${result.business.id}`);
  const items = result.items.filter((item) => item.module === key); const done = items.filter((item) => item.status === "Completed").length; const blocked = items.filter((item) => item.status === "Blocked").length; const percent = items.length ? Math.round(done / items.length * 100) : 0; const planned = items.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0);
  const fullName = String(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Founder"); const Icon = moduleUi[key].icon;
  return <AppFrame businesses={result.businesses} business={result.business} name={fullName} email={data.user.email || ""}>
    <Link className="back-link" href={`/dashboard?business=${result.business.id}`}><ArrowLeft size={18} />All modules</Link>
    <section className="module-hero"><span className="module-hero-icon"><Icon size={34} weight="duotone" /></span><div><p className="eyebrow">{result.business.name}</p><h1>{key}</h1><p>{moduleUi[key].description}</p></div></section>
    <section className="module-summary"><div><small>Progress</small><b>{percent}%</b><span>{done} of {items.length} complete</span></div><div><small>Needs attention</small><b>{blocked}</b><span>Blocked requirements</span></div><div><small>Planned cost</small><b>{new Intl.NumberFormat("en-IN", { style: "currency", currency: result.business.currency || "INR", maximumFractionDigits: 0 }).format(planned)}</b><span>Across this module</span></div></section>
    <div className="section-heading"><div><h2>Requirements</h2><p>Update each status as you move toward launch.</p></div><span className="count-pill">{items.length} items</span></div>
    <section className="requirement-list">
      {items.length === 0 && <div className="empty-state"><CheckCircle size={34} weight="duotone" /><h3>No requirements yet</h3><p>Add your first requirement below.</p></div>}
      {items.map((item) => <article className={`requirement-row status-${item.status.toLowerCase().replaceAll(" ", "-")}`} key={item.id}>
        <span className="requirement-check">{item.status === "Completed" ? <CheckCircle size={25} weight="fill" /> : <span />}</span>
        <div className="requirement-copy"><h3>{item.name}</h3><p>{item.due_date ? <><CalendarBlank size={15} /> Due {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${item.due_date}T12:00:00`))}</> : "No due date"}<span>•</span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: result.business!.currency || "INR", maximumFractionDigits: 0 }).format(item.estimated_cost)}</p></div>
        <form action={updateSetupStatusAction}><input type="hidden" name="itemId" value={item.id} /><select name="status" defaultValue={item.status} aria-label={`Status for ${item.name}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button className="btn save-status">Save</button></form>
      </article>)}
    </section>
    <details className="add-panel"><summary><Plus size={19} weight="bold" />Add a custom requirement</summary><form action={createSetupItemAction}><input type="hidden" name="businessId" value={result.business.id} /><input type="hidden" name="module" value={key} /><label><span>Requirement</span><input name="name" placeholder={`e.g. Confirm ${key.toLowerCase()} supplier`} minLength={2} required /></label><div className="form-grid"><label><span>Estimated cost</span><input name="estimate" type="number" min="0" placeholder="0" /></label><label><span>Due date</span><input name="dueDate" type="date" /></label></div><button className="btn primary">Add requirement</button></form></details>
  </AppFrame>;
}

