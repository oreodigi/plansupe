"use client";

import { useActionState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { addTeamMemberAction, type ActionState } from "@/app/actions";

export function TeamMemberForm({ businessId }: { businessId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addTeamMemberAction,
    {},
  );

  return (
    <form action={action} className="team-invite-form">
      <input type="hidden" name="businessId" value={businessId} />
      <label>
        <span>Team member email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="teammate@business.com"
        />
      </label>
      <p>
        Existing PlanSupe users get access immediately. New users join
        automatically when they create an account with this email.
      </p>
      {state.error && (
        <p className="form-message error" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="form-message success" role="status">
          {state.message}
        </p>
      )}
      <button className="btn primary" disabled={pending}>
        <PaperPlaneTilt size={18} weight="bold" />
        {pending ? "Adding…" : "Add team member"}
      </button>
    </form>
  );
}
