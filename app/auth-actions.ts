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

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect" };
  redirect("/dashboard");
}

export async function signUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.extend({ fullName: z.string().trim().min(2, "Enter your name") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "https://plansupe.vercel.app";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
