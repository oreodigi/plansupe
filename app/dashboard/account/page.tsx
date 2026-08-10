import {
  Buildings,
  Envelope,
  Plus,
  ShieldCheck,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { AccountForm } from "@/components/account-form";
import { SecurityForm } from "@/components/security-form";
import { signOutAction } from "@/app/auth-actions";
import { getBusinessData } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const query = await searchParams;
  const result = await getBusinessData(query.business);
  if (!result.business) redirect("/dashboard");
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <section className="page-head">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>My account</h1>
          <p>Manage your profile, businesses, and session.</p>
        </div>
      </section>
      <div className="account-layout">
        <section className="content-card">
          <div className="account-title">
            <span>
              <UserCircle size={28} weight="duotone" />
            </span>
            <div>
              <h2>Profile details</h2>
              <p>This name appears across your workspace.</p>
            </div>
          </div>
          <AccountForm defaultName={fullName} />
          <div className="readonly-field">
            <Envelope size={19} />
            <div>
              <span>Email address</span>
              <b>{data.user.email}</b>
            </div>
          </div>
        </section>
        <section className="content-card security-card">
          <div className="account-title">
            <span>
              <ShieldCheck size={28} weight="duotone" />
            </span>
            <div>
              <h2>Password &amp; security</h2>
              <p>Update your password or request a secure reset link.</p>
            </div>
          </div>
          <SecurityForm />
        </section>
        <section className="content-card">
          <div className="account-title account-businesses-title">
            <span>
              <Buildings size={28} weight="duotone" />
            </span>
            <div>
              <h2>Your businesses</h2>
              <p>
                {result.businesses.length} workspace
                {result.businesses.length === 1 ? "" : "s"} connected to this
                account.
              </p>
            </div>
            <Link className="btn secondary" href="/dashboard/businesses/new">
              <Plus size={17} weight="bold" />
              Add business
            </Link>
          </div>
          <div className="business-list">
            {result.businesses.map((business) => (
              <Link
                href={`/dashboard?business=${business.id}`}
                key={business.id}
                className={business.id === result.business!.id ? "active" : ""}
              >
                <span>{business.name[0]?.toUpperCase()}</span>
                <div>
                  <b>{business.name}</b>
                  <small>
                    {business.category} · {business.city}
                  </small>
                </div>
                {business.id === result.business!.id ? (
                  <em>Current</em>
                ) : business.owner_id !== data.user.id ? (
                  <em>Shared</em>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
        <section className="content-card danger-card">
          <div>
            <h2>Sign out</h2>
            <p>
              End this session on this device. Your business data stays safely
              saved.
            </p>
          </div>
          <form action={signOutAction}>
            <button className="btn signout-button">
              <SignOut size={19} weight="bold" />
              Sign out
            </button>
          </form>
        </section>
      </div>
    </AppFrame>
  );
}
