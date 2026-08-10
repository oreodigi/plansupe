"use client";

import { useActionState } from "react";
import { Check, PencilSimple } from "@phosphor-icons/react";
import { updateModuleBudgetAction, type ActionState } from "@/app/actions";
import type { ModuleKey } from "@/lib/setup-catalog";

const initialState: ActionState = {};

export function ModuleBudgetForm({
  businessId,
  module,
  currency,
  plannedBudget,
  requirementsTotal,
  totalLabel = "Requirements total",
}: {
  businessId: string;
  module: ModuleKey;
  currency: string;
  plannedBudget: number;
  requirementsTotal: number;
  totalLabel?: string;
}) {
  const [state, action, pending] = useActionState(
    updateModuleBudgetAction,
    initialState,
  );
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="module-budget-editor">
      <small>Editable planned cost</small>
      <form action={action}>
        <input type="hidden" name="businessId" value={businessId} />
        <input type="hidden" name="module" value={module} />
        <label>
          <span>{currency || "INR"}</span>
          <input
            name="plannedBudget"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={plannedBudget}
            aria-label={`Planned cost for ${module}`}
          />
        </label>
        <button type="submit" disabled={pending} aria-label="Save planned cost">
          {pending ? (
            <PencilSimple size={17} />
          ) : (
            <Check size={18} weight="bold" />
          )}
        </button>
      </form>
      <span>
        {totalLabel}: {formatter.format(requirementsTotal)}
      </span>
      {state.error && <em className="form-message error">{state.error}</em>}
      {state.message && (
        <em className="form-message success">{state.message}</em>
      )}
    </div>
  );
}
