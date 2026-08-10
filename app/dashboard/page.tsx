import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessData } from "@/lib/db";
import { Onboarding } from "@/components/onboarding";
import { AppFrame } from "@/components/app-frame";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/auth-actions";
import { moduleUi, moduleSlug } from "@/lib/module-ui";
import { MODULES, type ModuleKey } from "@/lib/setup-catalog";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const params = await searchParams;
  const result = await getBusinessData(params.business);
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  const firstName = fullName.split(" ")[0];
  if (!result.business)
    return (
      <>
        <header className="container public-nav">
          <Logo />
          <form action={signOutAction}>
            <button className="btn secondary">Sign out</button>
          </form>
        </header>
        <Onboarding firstName={firstName} />
      </>
    );

  const selectedKeys = result.businessModules.map(
    (entry) => entry.module_key as ModuleKey,
  );
  const selected = selectedKeys.length
    ? selectedKeys
    : MODULES.filter((module) =>
        result.items.some((item) => item.module === module.key),
      ).map((module) => module.key);
  const completed = result.items.filter(
    (item) => item.status === "Completed",
  ).length;
  const progress = result.items.length
    ? Math.round((completed / result.items.length) * 100)
    : 0;
  const requirementsEstimate = result.items.reduce(
    (sum, item) => sum + Number(item.estimated_cost || 0),
    0,
  );
  const estimated = result.businessModules.length
    ? result.businessModules.reduce((sum, module) => {
        const moduleRequirements = result.items
          .filter((item) => item.module === module.module_key)
          .reduce((total, item) => total + Number(item.estimated_cost || 0), 0);
        return sum + Number(module.planned_budget ?? moduleRequirements);
      }, 0)
    : requirementsEstimate;
  const currency = result.business.currency || "INR";

  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <section className="dashboard-head">
        <div>
          <p className="eyebrow">Your launch workspace</p>
          <h1>Good to see you, {firstName}.</h1>
          <p>
            Pick a module to see exactly what is done, what is next, and where
            you need attention.
          </p>
        </div>
        <Link
          className="btn secondary"
          href={`/dashboard/configure?business=${result.business.id}`}
        >
          <Plus size={18} weight="bold" />
          Change modules
        </Link>
      </section>

      <section className="readiness-card">
        <div className="readiness-main">
          <span className="readiness-score">{progress}%</span>
          <div>
            <b>Launch readiness</b>
            <p>
              {completed} of {result.items.length} requirements complete
            </p>
          </div>
        </div>
        <div className="progress-track" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="readiness-meta">
          <span>
            <CalendarBlank size={18} />
            Target{" "}
            <b>
              {result.business.launch_date
                ? new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(`${result.business.launch_date}T12:00:00`))
                : "Not set"}
            </b>
          </span>
          <span>
            Planned{" "}
            <b>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
              }).format(estimated)}
            </b>
          </span>
          <span>
            Budget{" "}
            <b>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
              }).format(result.business.budget)}
            </b>
          </span>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h2>Your modules</h2>
          <p>
            Only the modules you selected for {result.business.name} are shown.
          </p>
        </div>
        <span className="count-pill">{selected.length} selected</span>
      </div>
      <section className="module-grid">
        {selected.map((key) => {
          const config = moduleUi[key];
          const Icon = config.icon;
          const items = result.items.filter((item) => item.module === key);
          const done = items.filter(
            (item) => item.status === "Completed",
          ).length;
          const blocked = items.filter(
            (item) => item.status === "Blocked",
          ).length;
          const percent = items.length
            ? Math.round((done / items.length) * 100)
            : 0;
          return (
            <Link
              className="module-card"
              key={key}
              href={`/dashboard/module/${moduleSlug(key)}?business=${result.business!.id}`}
            >
              <div className="module-card-top">
                <span className="module-icon">
                  <Icon size={27} weight="duotone" />
                </span>
                <ArrowRight className="module-arrow" size={21} />
              </div>
              <h3>{key}</h3>
              <p>{config.description}</p>
              <div className="module-card-progress">
                <span>
                  <b>
                    {done}/{items.length}
                  </b>{" "}
                  complete
                </span>
                <b>{percent}%</b>
              </div>
              <div className="mini-track">
                <span style={{ width: `${percent}%` }} />
              </div>
              <div className="module-card-foot">
                {blocked > 0 ? (
                  <span className="status blocked">{blocked} blocked</span>
                ) : done === items.length && items.length ? (
                  <span className="status complete">
                    <CheckCircle size={15} weight="fill" />
                    Complete
                  </span>
                ) : (
                  <span className="status">
                    {items.length - done} remaining
                  </span>
                )}
                <span>Open module</span>
              </div>
            </Link>
          );
        })}
      </section>
    </AppFrame>
  );
}
