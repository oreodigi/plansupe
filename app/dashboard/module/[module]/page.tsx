import Link from "next/link";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  Info,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { notFound, redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { AddModuleItemForm } from "@/components/add-module-item-form";
import { ModuleBudgetForm } from "@/components/module-budget-form";
import { RequirementDetailsForm } from "@/components/requirement-details-form";
import {
  addCatalogRequirementAction,
  updateSetupStatusAction,
} from "@/app/actions";
import { getBusinessData } from "@/lib/db";
import { moduleUi } from "@/lib/module-ui";
import {
  moduleItemLabels,
  moduleItemSuggestions,
} from "@/lib/module-item-suggestions";
import {
  MODULES,
  requirementMap,
  requirementsFor,
  type ModuleKey,
} from "@/lib/setup-catalog";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const statuses = [
  "Not started",
  "In progress",
  "Blocked",
  "Completed",
  "Not applicable",
];

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const [{ module: slug }, query] = await Promise.all([params, searchParams]);
  const moduleDef = MODULES.find(
    (entry) => entry.key.toLowerCase() === slug.toLowerCase(),
  );
  if (!moduleDef) notFound();
  const key = moduleDef.key as ModuleKey;
  const result = await getBusinessData(query.business);
  if (!result.business) redirect("/dashboard");
  const selected =
    result.businessModules.some((entry) => entry.module_key === key) ||
    result.items.some((item) => item.module === key);
  if (!selected) redirect(`/dashboard?business=${result.business.id}`);
  const items = result.items.filter((item) => item.module === key);
  const done = items.filter((item) => item.status === "Completed").length;
  const blocked = items.filter((item) => item.status === "Blocked").length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;
  const planned = items.reduce(
    (sum, item) => sum + Number(item.estimated_cost || 0),
    0,
  );
  const activeBusinessModule = result.businessModules.find(
    (entry) => entry.module_key === key,
  );
  const editablePlanned = Number(
    activeBusinessModule?.planned_budget ?? planned,
  );
  const catalog = requirementMap(result.business.category);
  const selectedSources = new Set(items.map((item) => item.source));
  const recommendations = requirementsFor(result.business.category, key).filter(
    (option) => !selectedSources.has(`catalog:${option.id}`),
  );
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  const Icon = moduleUi[key].icon;
  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <Link
        className="back-link"
        href={`/dashboard?business=${result.business.id}`}
      >
        <ArrowLeft size={18} />
        All modules
      </Link>
      <section className="module-hero">
        <span className="module-hero-icon">
          <Icon size={34} weight="duotone" />
        </span>
        <div>
          <p className="eyebrow">{result.business.name}</p>
          <h1>{key}</h1>
          <p>{moduleUi[key].description}</p>
        </div>
      </section>
      <section className="module-summary">
        <div>
          <small>Progress</small>
          <b>{percent}%</b>
          <span>
            {done} of {items.length} complete
          </span>
        </div>
        <div>
          <small>Needs attention</small>
          <b>{blocked}</b>
              <span>{key === "Assets" ? "Blocked assets" : "Blocked requirements"}</span>
        </div>
        <div className="module-budget-summary">
          <ModuleBudgetForm
            businessId={result.business.id}
            module={key}
            currency={result.business.currency}
            plannedBudget={editablePlanned}
            requirementsTotal={planned}
            totalLabel={
              key === "Assets" ? "Assets total" : "Requirements total"
            }
          />
        </div>
      </section>
      {key === "Licenses" && (
        <aside className="compliance-notice">
          <Info size={22} weight="duotone" />
          <div>
            <b>Use this as a guided compliance checklist.</b>
            <p>
              Final requirements depend on the state, municipal area, premises,
              turnover and activities. Verify each item with the named authority
              or a qualified local professional before relying on it.
            </p>
          </div>
        </aside>
      )}
      <div className="section-heading">
        <div>
          <h2>{key === "Assets" ? "Asset register" : "Requirements"}</h2>
          <p>
            {key === "Assets"
              ? "Add everything the business owns and track its cost and vendor."
              : "Update each status as you move toward launch."}
          </p>
        </div>
        <span className="count-pill">{items.length} items</span>
      </div>
      <section className="requirement-list">
        {items.length === 0 && (
          <div className="empty-state">
            <CheckCircle size={34} weight="duotone" />
            <h3>
              {key === "Assets" ? "No assets yet" : "No requirements yet"}
            </h3>
            <p>
              Add your first {key === "Assets" ? "asset" : "requirement"} below.
            </p>
          </div>
        )}
        {items.map((item) => {
          const guidance = item.source?.startsWith("catalog:")
            ? catalog.get(item.source.slice(8))
            : undefined;
          return (
            <article
              className={`requirement-row status-${item.status.toLowerCase().replaceAll(" ", "-")}`}
              key={item.id}
            >
              <span className="requirement-check">
                {item.status === "Completed" ? (
                  <CheckCircle size={25} weight="fill" />
                ) : (
                  <span />
                )}
              </span>
              <div className="requirement-copy">
                <h3>{item.name}</h3>
                {guidance && (
                  <small className="requirement-guidance">
                    {guidance.description}
                  </small>
                )}
                <p>
                  {item.due_date ? (
                    <>
                      <CalendarBlank size={15} /> Due{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(`${item.due_date}T12:00:00`))}
                    </>
                  ) : (
                    "No due date"
                  )}
                  <span>•</span>
                  {guidance?.authority || "Custom requirement"}
                </p>
                {guidance?.appliesWhen && (
                  <p className="applies-note">
                    <b>Applies when:</b> {guidance.appliesWhen}
                    {guidance.sourceUrl && (
                      <a
                        href={guidance.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official guidance ↗
                      </a>
                    )}
                  </p>
                )}
              </div>
              <form action={updateSetupStatusAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <select
                  name="status"
                  defaultValue={item.status}
                  aria-label={`Status for ${item.name}`}
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <button className="btn save-status">Save</button>
              </form>
              <RequirementDetailsForm
                item={item}
                vendors={result.vendors}
                currency={result.business!.currency}
                businessId={result.business!.id}
                businessName={result.business!.name}
              />
            </article>
          );
        })}
      </section>
      <AddModuleItemForm
        businessId={result.business.id}
        businessCategory={result.business.category}
        module={key}
        itemLabel={moduleItemLabels[key]}
        suggestions={moduleItemSuggestions(result.business.category, key)}
        vendors={result.vendors}
        currency={result.business.currency}
      />
      {recommendations.length > 0 && (
        <section className="recommendation-panel">
          <div className="section-heading">
            <div>
              <h2>
                {key === "Licenses"
                  ? `Other licences to review for ${result.business.category}`
                  : "Other suggested requirements"}
              </h2>
              <p>Add only the items that apply to this business.</p>
            </div>
            <span className="count-pill">
              {recommendations.length} to review
            </span>
          </div>
          <div className="recommendation-grid">
            {recommendations.map((option) => (
              <article key={option.id}>
                <div>
                  <span
                    className={`requirement-tag ${option.tag.toLowerCase()}`}
                  >
                    {option.tag}
                  </span>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  {option.authority && (
                    <small>
                      <b>{option.authority}</b> · {option.appliesWhen}
                    </small>
                  )}
                  {option.sourceUrl && (
                    <a href={option.sourceUrl} target="_blank" rel="noreferrer">
                      Official guidance ↗
                    </a>
                  )}
                </div>
                <form action={addCatalogRequirementAction}>
                  <input
                    type="hidden"
                    name="businessId"
                    value={result.business!.id}
                  />
                  <input type="hidden" name="requirementId" value={option.id} />
                  <button className="btn secondary">
                    <Plus size={16} weight="bold" />
                    Add
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}
    </AppFrame>
  );
}
