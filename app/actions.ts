"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  dueDateFor,
  MODULES,
  requirementMap,
  type ModuleKey,
  type RequirementOption,
} from "@/lib/setup-catalog";

export type ActionState = { error?: string; message?: string };

export async function updateAccountAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await authenticatedClient();
  const parsed = z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(80, "Keep your name under 80 characters")
    .safeParse(formData.get("fullName"));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check your name" };
  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data },
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { message: "Profile updated." };
}

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
  launchDate: z.string().date("Choose a target launch date"),
  modulesJson: z.string(),
  requirementsJson: z.string(),
});

const moduleKeys = MODULES.map((module) => module.key);
const moduleSchema = z.enum(moduleKeys as [ModuleKey, ...ModuleKey[]]);

function parseSelections(
  category: string,
  modulesJson: string,
  requirementsJson: string,
) {
  const selectedModules = z
    .array(moduleSchema)
    .min(1, "Choose at least one module")
    .parse(JSON.parse(modulesJson));
  const modules = Array.from(
    new Set<ModuleKey>([...selectedModules, "Assets"]),
  );
  const requested = z
    .array(z.string())
    .min(1, "Choose at least one requirement")
    .parse(JSON.parse(requirementsJson));
  const catalog = requirementMap(category);
  const requirements = requested
    .map((id) => catalog.get(id))
    .filter(
      (entry): entry is RequirementOption =>
        Boolean(entry) && modules.includes(entry!.module),
    );
  if (requirements.length !== requested.length)
    throw new Error(
      "One or more selected requirements are not available for this business category",
    );
  return { modules, requirements } as const;
}

export async function createBusinessAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await authenticatedClient();
  const parsed = businessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the business details",
    };
  const {
    name,
    category,
    stage,
    city,
    budget,
    launchDate,
    modulesJson,
    requirementsJson,
  } = parsed.data;
  let selections;
  try {
    selections = parseSelections(category, modulesJson, requirementsJson);
  } catch (selectionError) {
    return {
      error:
        selectionError instanceof Error
          ? selectionError.message
          : "Check your setup choices",
    };
  }
  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name,
      category,
      stage,
      city,
      budget,
      launch_date: launchDate || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  const items = selections.requirements.map((requirement) => ({
    business_id: business.id,
    module: requirement.module,
    name: requirement.title,
    estimated_cost: requirement.estimatedCost,
    due_date: dueDateFor(launchDate, requirement.leadWeeks),
    source: `catalog:${requirement.id}`,
  }));
  const [{ error: itemError }, { error: moduleError }] = await Promise.all([
    supabase.from("setup_items").insert(items),
    supabase.from("business_modules").insert(
      selections.modules.map((module, sortOrder) => ({
        business_id: business.id,
        module_key: module,
        sort_order: sortOrder,
      })),
    ),
  ]);
  if (itemError || moduleError) {
    await supabase.from("businesses").delete().eq("id", business.id);
    return { error: itemError?.message ?? moduleError?.message };
  }
  redirect(`/dashboard?business=${business.id}`);
}

const configureSchema = z.object({
  businessId: z.string().uuid(),
  modulesJson: z.string(),
  requirementsJson: z.string(),
});

export async function configureBusinessAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await authenticatedClient();
  const parsed = configureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check your setup choices",
    };
  const { businessId, modulesJson, requirementsJson } = parsed.data;
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("category,launch_date")
    .eq("id", businessId)
    .single();
  if (businessError || !business)
    return {
      error: "This business could not be opened. Refresh and try again.",
    };
  let selections;
  try {
    selections = parseSelections(
      business.category,
      modulesJson,
      requirementsJson,
    );
  } catch (selectionError) {
    return {
      error:
        selectionError instanceof Error
          ? selectionError.message
          : "Check your setup choices",
    };
  }

  const [existingResult, savedModulesResult] = await Promise.all([
    supabase
      .from("setup_items")
      .select("id,module,name,source")
      .eq("business_id", businessId),
    supabase
      .from("business_modules")
      .select("module_key,planned_budget")
      .eq("business_id", businessId),
  ]);
  if (existingResult.error) return { error: existingResult.error.message };
  if (savedModulesResult.error)
    return { error: savedModulesResult.error.message };
  const existing = existingResult.data;
  const savedBudgets = new Map(
    (savedModulesResult.data ?? []).map((entry) => [
      entry.module_key,
      entry.planned_budget,
    ]),
  );
  const desiredKeys = new Set(
    selections.requirements.map((entry) => `${entry.module}::${entry.title}`),
  );
  const existingKeys = new Set(
    (existing ?? []).map((entry) => `${entry.module}::${entry.name}`),
  );
  const removableIds = (existing ?? [])
    .filter(
      (entry) =>
        (entry.source === "template" || entry.source.startsWith("catalog:")) &&
        !desiredKeys.has(`${entry.module}::${entry.name}`),
    )
    .map((entry) => entry.id);
  const additions = selections.requirements
    .filter((entry) => !existingKeys.has(`${entry.module}::${entry.title}`))
    .map((entry) => ({
      business_id: businessId,
      module: entry.module,
      name: entry.title,
      estimated_cost: entry.estimatedCost,
      due_date: dueDateFor(business.launch_date ?? undefined, entry.leadWeeks),
      source: `catalog:${entry.id}`,
    }));

  const { error: clearModulesError } = await supabase
    .from("business_modules")
    .delete()
    .eq("business_id", businessId);
  if (clearModulesError) return { error: clearModulesError.message };
  const operations = [
    supabase.from("business_modules").insert(
      selections.modules.map((module, sortOrder) => ({
        business_id: businessId,
        module_key: module,
        sort_order: sortOrder,
        planned_budget: savedBudgets.get(module) ?? null,
      })),
    ),
    additions.length
      ? supabase.from("setup_items").insert(additions)
      : Promise.resolve({ error: null }),
    removableIds.length
      ? supabase.from("setup_items").delete().in("id", removableIds)
      : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(operations);
  const failure = results.find((result) => result.error)?.error;
  if (failure) return { error: failure.message };
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard?business=${businessId}`);
}

export async function createSetupItemAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("setup_items").insert({
    business_id: z.string().uuid().parse(formData.get("businessId")),
    name: z.string().trim().min(2).parse(formData.get("name")),
    module: moduleSchema.parse(formData.get("module")),
    estimated_cost: z.coerce
      .number()
      .min(0)
      .parse(formData.get("estimate") || 0),
    due_date:
      z
        .string()
        .optional()
        .parse(formData.get("dueDate") || undefined) || null,
  });
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

const detailedSetupItemSchema = z
  .object({
    businessId: z.string().uuid(),
    module: moduleSchema,
    name: z
      .string()
      .trim()
      .min(2, "Enter an item name")
      .max(140, "Keep the item name under 140 characters"),
    plannedCost: z.coerce.number().min(0, "Planned cost cannot be negative"),
    committedCost: z.coerce.number().min(0, "Agreed cost cannot be negative"),
    paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative"),
    dueDate: z.union([z.string().date(), z.literal("")]),
    vendorId: z.union([z.string().uuid(), z.literal("")]),
  })
  .refine((values) => values.paidAmount <= values.committedCost, {
    message: "Paid amount cannot be more than the agreed cost",
    path: ["paidAmount"],
  });

export async function createDetailedSetupItemAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await authenticatedClient();
  const parsed = detailedSetupItemSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the item details",
    };
  }
  const {
    businessId,
    module,
    name,
    plannedCost,
    committedCost,
    paidAmount,
    dueDate,
    vendorId,
  } = parsed.data;
  const { data: selectedModule, error: moduleError } = await supabase
    .from("business_modules")
    .select("id")
    .eq("business_id", businessId)
    .eq("module_key", module)
    .single();
  if (moduleError || !selectedModule) {
    return { error: "This module is not available for the selected business." };
  }

  if (vendorId) {
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .eq("business_id", businessId)
      .single();
    if (vendorError || !vendor)
      return { error: "Choose a vendor from this business." };
  }

  const { error } = await supabase.from("setup_items").insert({
    business_id: businessId,
    module,
    name,
    estimated_cost: plannedCost,
    committed_cost: committedCost,
    paid_amount: paidAmount,
    due_date: dueDate || null,
    vendor_id: vendorId || null,
    source: "custom",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { message: `${name} added.` };
}

export async function addCatalogRequirementAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const businessId = z.string().uuid().parse(formData.get("businessId"));
  const requirementId = z.string().min(3).parse(formData.get("requirementId"));
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("category,launch_date")
    .eq("id", businessId)
    .single();
  if (businessError || !business) throw new Error("Business not found");
  const requirement = requirementMap(business.category).get(requirementId);
  if (!requirement)
    throw new Error("Requirement is not available for this business category");
  const source = `catalog:${requirement.id}`;
  const { data: existing, error: existingError } = await supabase
    .from("setup_items")
    .select("id")
    .eq("business_id", businessId)
    .eq("source", source)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return;
  const { error } = await supabase.from("setup_items").insert({
    business_id: businessId,
    module: requirement.module,
    name: requirement.title,
    estimated_cost: requirement.estimatedCost,
    due_date: dueDateFor(
      business.launch_date ?? undefined,
      requirement.leadWeeks,
    ),
    source,
  });
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function updateSetupStatusAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const itemId = z.string().uuid().parse(formData.get("itemId"));
  const status = z
    .enum([
      "Not started",
      "In progress",
      "Blocked",
      "Completed",
      "Not applicable",
    ])
    .parse(formData.get("status"));
  const { error } = await supabase
    .from("setup_items")
    .update({ status })
    .eq("id", itemId);
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

const moduleBudgetSchema = z.object({
  businessId: z.string().uuid(),
  module: moduleSchema,
  plannedBudget: z.coerce.number().min(0, "Planned cost cannot be negative"),
});

export async function updateModuleBudgetAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await authenticatedClient();
  const parsed = moduleBudgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the planned cost",
    };
  }
  const { businessId, module, plannedBudget } = parsed.data;
  const { data, error } = await supabase
    .from("business_modules")
    .update({ planned_budget: plannedBudget })
    .eq("business_id", businessId)
    .eq("module_key", module)
    .select("id")
    .single();
  if (error || !data) return { error: "This module could not be updated." };
  revalidatePath("/dashboard", "layout");
  return { message: "Planned cost updated." };
}

const setupItemDetailsSchema = z
  .object({
    itemId: z.string().uuid(),
    name: z
      .string()
      .trim()
      .min(2, "Enter a requirement name")
      .max(140, "Keep the requirement name under 140 characters"),
    dueDate: z.union([z.string().date(), z.literal("")]),
    estimatedCost: z.coerce.number().min(0, "Planned cost cannot be negative"),
    committedCost: z.coerce.number().min(0, "Agreed cost cannot be negative"),
    paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative"),
    vendorId: z.union([z.string().uuid(), z.literal("")]),
  })
  .refine((values) => values.paidAmount <= values.committedCost, {
    message: "Paid amount cannot be more than the agreed cost",
    path: ["paidAmount"],
  });

export async function updateSetupItemDetailsAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await authenticatedClient();
  const parsed = setupItemDetailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the pricing details",
    };
  }

  const {
    itemId,
    name,
    dueDate,
    estimatedCost,
    committedCost,
    paidAmount,
    vendorId,
  } = parsed.data;
  const { data: item, error: itemError } = await supabase
    .from("setup_items")
    .select("business_id")
    .eq("id", itemId)
    .single();
  if (itemError || !item)
    return { error: "This requirement could not be opened." };

  if (vendorId) {
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", vendorId)
      .eq("business_id", item.business_id)
      .single();
    if (vendorError || !vendor)
      return { error: "Choose a vendor from this business." };
  }

  const { error } = await supabase
    .from("setup_items")
    .update({
      name,
      due_date: dueDate || null,
      estimated_cost: estimatedCost,
      committed_cost: committedCost,
      paid_amount: paidAmount,
      vendor_id: vendorId || null,
    })
    .eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { message: "Requirement updated." };
}

export async function deleteSetupItemAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const itemId = z.string().uuid().parse(formData.get("itemId"));
  const { data: item, error: itemError } = await supabase
    .from("setup_items")
    .select("id")
    .eq("id", itemId)
    .single();
  if (itemError || !item) throw new Error("Requirement not found");
  const { error } = await supabase
    .from("setup_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function createTaskAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const { error } = await supabase.from("tasks").insert({
    business_id: z.string().uuid().parse(formData.get("businessId")),
    title: z.string().trim().min(2).parse(formData.get("title")),
    module: z
      .string()
      .trim()
      .min(2)
      .parse(formData.get("module") || "General"),
    priority: z
      .enum(["Low", "Medium", "High"])
      .parse(formData.get("priority") || "Medium"),
    due_date:
      z
        .string()
        .optional()
        .parse(formData.get("dueDate") || undefined) || null,
  });
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
}

export async function toggleTaskAction(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const taskId = z.string().uuid().parse(formData.get("taskId"));
  const status = z.enum(["To do", "Done"]).parse(formData.get("nextStatus"));
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);
  if (error) throw error;
  revalidatePath("/dashboard", "layout");
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
  revalidatePath("/dashboard", "layout");
}
