import { createClient } from "@/lib/supabase/server";
import type {
  Business,
  BusinessModule,
  BusinessTask,
  SetupItem,
  Vendor,
} from "./types";

export async function getBusinessData(requestedId?: string) {
  const supabase = await createClient();
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(
      "id,name,category,stage,city,currency,budget,launch_date,created_at",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const list = (businesses ?? []) as Business[];
  const business =
    list.find((item) => item.id === requestedId) ?? list[0] ?? null;
  if (!business)
    return {
      businesses: list,
      business: null,
      items: [],
      tasks: [],
      vendors: [],
      businessModules: [],
    };
  const [itemsResult, tasksResult, vendorsResult, modulesResult] =
    await Promise.all([
      supabase
        .from("setup_items")
        .select(
          "id,business_id,module,name,status,estimated_cost,committed_cost,paid_amount,vendor_id,due_date,source",
        )
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("id,business_id,title,module,status,priority,due_date")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vendors")
        .select("id,business_id,name,category,contact_name,phone,email")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("business_modules")
        .select("id,business_id,module_key,sort_order,planned_budget")
        .eq("business_id", business.id)
        .order("sort_order"),
    ]);
  if (itemsResult.error) throw itemsResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (vendorsResult.error) throw vendorsResult.error;
  if (modulesResult.error) throw modulesResult.error;
  return {
    businesses: list,
    business,
    items: (itemsResult.data ?? []) as SetupItem[],
    tasks: (tasksResult.data ?? []) as BusinessTask[],
    vendors: (vendorsResult.data ?? []) as Vendor[],
    businessModules: (modulesResult.data ?? []) as BusinessModule[],
  };
}
