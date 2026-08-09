"use client";

import { useActionState } from "react";
import { updateAccountAction, type ActionState } from "@/app/actions";

const initialState: ActionState = {};

export function AccountForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(updateAccountAction, initialState);
  return <form className="account-form" action={action}>
    <label><span>Your name</span><input name="fullName" defaultValue={defaultName} minLength={2} required /></label>
    <button className="btn primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    {state.error && <p className="form-message error" role="alert">{state.error}</p>}
    {state.message && <p className="form-message success" role="status">{state.message}</p>}
  </form>;
}

