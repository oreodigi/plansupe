"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/auth-actions";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, {});
  return <form className="form" action={formAction}>
    {mode === "sign-up" && <div className="field"><label htmlFor="fullName">Your name</label><input id="fullName" name="fullName" autoComplete="name" required placeholder="How should we address you?"/></div>}
    <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com"/></div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters"/></div>
    {state.error && <div className="form-error" role="alert">{state.error}</div>}
    {state.message && <div className="form-message" role="status">{state.message}</div>}
    <button className="btn primary" disabled={pending}>{pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button>
    <p className="auth-alt">{mode === "sign-in" ? <>New to PlanSupe? <Link href="/sign-up">Create an account</Link></> : <>Already have an account? <Link href="/sign-in">Sign in</Link></>}</p>
  </form>;
}
