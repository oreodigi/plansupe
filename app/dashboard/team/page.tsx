import Link from "next/link";
import {
  ClockCountdown,
  CrownSimple,
  Trash,
  UserCircle,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { TeamMemberForm } from "@/components/team-member-form";
import { removeTeamMemberAction } from "@/app/actions";
import { getBusinessData, getBusinessTeam } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeamPage({
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
  const team = await getBusinessTeam(result.business.id);
  const isOwner = result.business.owner_id === data.user.id;
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  const signupUrl = "https://plansupe.vercel.app/sign-up";

  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <section className="page-head team-page-head">
        <div>
          <p className="eyebrow">Shared workspace</p>
          <h1>Team</h1>
          <p>
            Plan {result.business.name} together. Team members can update
            modules, costs, tasks, assets, and vendors.
          </p>
        </div>
        <span className="team-count">
          <UsersThree size={20} weight="duotone" />
          {team.filter((member) => member.accepted_at).length + 1} active
        </span>
      </section>

      <div className="split-layout team-layout">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>People with access</h2>
              <p>Access is limited to this business plan.</p>
            </div>
            <span className="count-pill">{team.length + 1}</span>
          </div>
          <div className="team-list">
            <article className="team-member-card owner">
              <span className="team-avatar">
                <CrownSimple size={21} weight="fill" />
              </span>
              <div>
                <h3>{isOwner ? fullName : "Business owner"}</h3>
                <p>{isOwner ? data.user.email : "Workspace owner"}</p>
              </div>
              <span className="member-role">Owner</span>
            </article>
            {team.map((member) => {
              const pending = !member.accepted_at;
              const inviteMessage = encodeURIComponent(
                `Join me on PlanSupe to plan ${result.business!.name}. Create your account with ${member.email}: ${signupUrl}`,
              );
              return (
                <article className="team-member-card" key={member.id}>
                  <span className={`team-avatar ${pending ? "pending" : ""}`}>
                    {pending ? (
                      <ClockCountdown size={21} weight="duotone" />
                    ) : (
                      <UserCircle size={23} weight="duotone" />
                    )}
                  </span>
                  <div>
                    <h3>{member.display_name || member.email}</h3>
                    <p>{member.email}</p>
                  </div>
                  <span className={`member-role ${pending ? "pending" : ""}`}>
                    {pending ? "Pending" : member.role}
                  </span>
                  {isOwner && (
                    <div className="team-member-actions">
                      {pending && (
                        <Link
                          className="icon-button whatsapp-share"
                          href={`https://wa.me/?text=${inviteMessage}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Share invitation with ${member.email}`}
                          title="Share on WhatsApp"
                        >
                          <WhatsappLogo size={19} weight="fill" />
                        </Link>
                      )}
                      <form action={removeTeamMemberAction}>
                        <input
                          type="hidden"
                          name="businessId"
                          value={result.business.id}
                        />
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.id}
                        />
                        <button
                          className="icon-button remove-member"
                          aria-label={`Remove ${member.email}`}
                          title="Remove member"
                        >
                          <Trash size={18} />
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="content-card add-card team-invite-card">
          <h2>
            <UsersThree size={21} weight="duotone" />
            Add a team member
          </h2>
          {isOwner ? (
            <TeamMemberForm businessId={result.business.id} />
          ) : (
            <div className="team-readonly-note">
              <CrownSimple size={25} weight="duotone" />
              <b>Owner-managed access</b>
              <p>Only the business owner can add or remove team members.</p>
            </div>
          )}
        </aside>
      </div>
    </AppFrame>
  );
}
