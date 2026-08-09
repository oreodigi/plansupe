"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { templateFor } from "@/lib/templates";

export type ActionState = { error?: string; message?: string };

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return { supabase, user: data.user };
}

const businessSchema = z.object({
  name: z.string().trim().min(2, "Enter a business name"),
  category: z.string().trim().min(2, "Choose a business category"),
  stage: z.string().trim().min(2),
  city: z.string().trim().min(2, "Enter the operating city"),
  budget: z.coerce.number().min(0),
  launchDate: z.string().optional(),
});

export async function createBusinessAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await authenticatedClient();
  const parsed = businessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the business details" };
  const { name, category, stage, city, budget, launchDate } = parsed.data;
  const { data: business, error } = await supabase.from("businesses").insert({
    owner_id: user.id, name, category, stage, city, budget, launch_date: launchDate || null,
  }).select("id").single();
  if (error) return { error: error.message };
  const items = templateFor(category).map(([module, itemName, estimated]) => ({
    business_id: business.id, module, name: itemName, estimated_cost: estimated, source: "template",
  }));
  const [{ error: itemError }, { error: taskError }] = await Promise.all([
    supabase.from("setup_items").insert(items),
    supabase.from("tasks").insert({ business_id: business.id, title: "Review your generated setup plan", module: "Planning", priority: "High", due_date: launchDate || null }),
  ]);
  if (itemError || taskError) return { error: itemError?.message ?? taskError?.message };
  redirect(`/dashboard?business=${business.id}`);
}

export async function createSetupItemAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("setup_items").insert({
    business_id: z.string().uuid().parse(formData.get("businessId")),
    name: z.string().trim().min(2).parse(formData.get("name")),
    module: z.string().trim().min(2).parse(formData.get("module")),
    estimated_cost: z.coerce.number().min(0).parse(formData.get("estimate") || 0),
    due_date: z.string().optional().parse(formData.get("dueDate") || undefined) || null,
  });
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function updateSetupStatusAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const itemId = z.string().uuid().parse(formData.get("itemId"));
  const status = z.enum(["Not started", "In progress", "Blocked", "Completed", "Not applicable"]).parse(formData.get("status"));
  const { error } = await supabase.from("setup_items").update({ status }).eq("id", itemId);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function createTaskAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("tasks").insert({
    business_id: z.string().uuid().parse(formData.get("businessId")),
    title: z.string().trim().min(2).parse(formData.get("title")),
    module: z.string().trim().min(2).parse(formData.get("module") || "General"),
    priority: z.enum(["Low", "Medium", "High"]).parse(formData.get("priority") || "Medium"),
    due_date: z.string().optional().parse(formData.get("dueDate") || undefined) || null,
  });
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function toggleTaskAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const taskId = z.string().uuid().parse(formData.get("taskId"));
  const status = z.enum(["To do", "Done"]).parse(formData.get("nextStatus"));
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function createVendorAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("vendors").insert({
    business_id: z.string().uuid().parse(formData.get("businessId")),
    name: z.string().trim().min(2).parse(formData.get("name")),
    category: String(formData.get("category") || ""),
    contact_name: String(formData.get("contactName") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
  });
  if (error) throw error;
  revalidatePath("/dashboard");
}
