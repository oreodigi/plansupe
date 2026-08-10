"use client";

import { useActionState } from "react";
import { Key, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  sendPasswordResetAction,
  updatePasswordAction,
} from "@/app/auth-actions";
import type { ActionState } from "@/app/actions";

const initialState: ActionState = {};

export function SecurityForm() {
  const [updateState, updateAction, updatePending] = useActionState(
    updatePasswordAction,
    initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    sendPasswordResetAction,
    initialState,
  );

  return (
    <div className="security-settings">
      <form className="account-form" action={updateAction}>
        <label>
          <span>New password</span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label>
          <span>Confirm new password</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className="btn primary" disabled={updatePending}>
          <Key size={18} weight="bold" />
          {updatePending ? "Updating…" : "Update password"}
        </button>
        {updateState.error && (
          <p className="form-message error" role="alert">
            {updateState.error}
          </p>
        )}
        {updateState.message && (
          <p className="form-message success" role="status">
            {updateState.message}
          </p>
        )}
      </form>
      <div className="reset-password-row">
        <div>
          <b>Forgot your password?</b>
          <p>We’ll email you a secure reset link.</p>
        </div>
        <form action={resetAction}>
          <button className="btn secondary" disabled={resetPending}>
            <PaperPlaneTilt size={17} />
            {resetPending ? "Sending…" : "Send reset email"}
          </button>
        </form>
      </div>
      {resetState.error && (
        <p className="form-message error" role="alert">
          {resetState.error}
        </p>
      )}
      {resetState.message && (
        <p className="form-message success" role="status">
          {resetState.message}
        </p>
      )}
    </div>
  );
}
