"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./actions";

const credentials = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signInAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect" };
  redirect("/dashboard");
}

export async function signUpAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentials
    .extend({ fullName: z.string().trim().min(2, "Enter your name") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const origin =
    (await headers()).get("origin") ?? "https://plansupe.vercel.app";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

const passwordUpdateSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function updatePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user)
    return { error: "Sign in again before updating your password." };
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) return { error: error.message };
  return { message: "Password updated successfully." };
}

export async function sendPasswordResetAction(
  _: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email)
    return { error: "Sign in again to request a reset email." };
  const origin =
    (await headers()).get("origin") ?? "https://plansupe.vercel.app";
  const { error } = await supabase.auth.resetPasswordForEmail(data.user.email, {
    redirectTo: `${origin}/auth/confirm?next=/dashboard/account`,
  });
  if (error) return { error: error.message };
  return { message: "Password reset email sent. Check your inbox." };
}
