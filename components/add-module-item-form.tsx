"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Coins, Plus, Storefront } from "@phosphor-icons/react";
import { createDetailedSetupItemAction, type ActionState } from "@/app/actions";
import type { ModuleKey } from "@/lib/setup-catalog";
import type { Vendor } from "@/lib/types";

const initialState: ActionState = {};

export function AddModuleItemForm({
  businessId,
  businessCategory,
  module,
  itemLabel,
  suggestions,
  vendors,
  currency,
}: {
  businessId: string;
  businessCategory: string;
  module: ModuleKey;
  itemLabel: string;
  suggestions: string[];
  vendors: Vendor[];
  currency: string;
}) {
  const [name, setName] = useState("");
  const [state, action, pending] = useActionState(
    createDetailedSetupItemAction,
    initialState,
  );

  return (
    <details className="add-panel module-item-builder">
      <summary>
        <Plus size={19} weight="bold" />
        Add {itemLabel}
      </summary>
      <div className="item-builder-intro">
        <p>
          Add exactly what your {businessCategory.toLowerCase()} needs, then
          track its price and supplier.
        </p>
        <div
          className="suggestion-chips"
          aria-label={`Suggested ${module} items`}
        >
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => setName(suggestion)}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>
      <form action={action}>
        <input type="hidden" name="businessId" value={businessId} />
        <input type="hidden" name="module" value={module} />
        <label>
          <span>Item or service name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`e.g. ${suggestions[0] || itemLabel}`}
            minLength={2}
            maxLength={140}
            required
          />
        </label>
        <div className="pricing-fields item-builder-pricing">
          <label>
            <span>
              <Coins size={14} /> Planned cost ({currency})
            </span>
            <input
              name="plannedCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue="0"
            />
          </label>
          <label>
            <span>Agreed / quoted</span>
            <input
              name="committedCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue="0"
            />
          </label>
          <label>
            <span>Paid so far</span>
            <input
              name="paidAmount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue="0"
            />
          </label>
        </div>
        <div className="form-grid item-builder-meta">
          <label>
            <span>Vendor</span>
            <select name="vendorId" defaultValue="">
              <option value="">No vendor assigned</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                  {vendor.category ? ` · ${vendor.category}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Due date</span>
            <input name="dueDate" type="date" />
          </label>
        </div>
        {vendors.length === 0 && (
          <Link
            className="add-vendor-link"
            href={`/dashboard/vendors?business=${businessId}`}
          >
            <Storefront size={16} /> Add a vendor to connect it here
          </Link>
        )}
        <div className="item-builder-actions">
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
            <Plus size={17} weight="bold" />
            {pending ? "Adding…" : `Add to ${module}`}
          </button>
        </div>
      </form>
    </details>
  );
}
