"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CaretDown, Coins, Storefront } from "@phosphor-icons/react";
import { updateSetupItemDetailsAction, type ActionState } from "@/app/actions";
import type { SetupItem, Vendor } from "@/lib/types";

const initialState: ActionState = {};

export function RequirementDetailsForm({
  item,
  vendors,
  currency,
  businessId,
}: {
  item: SetupItem;
  vendors: Vendor[];
  currency: string;
  businessId: string;
}) {
  const [state, action, pending] = useActionState(
    updateSetupItemDetailsAction,
    initialState,
  );
  const assignedVendor = vendors.find((vendor) => vendor.id === item.vendor_id);
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  });

  return (
    <details className="requirement-details">
      <summary>
        <span className="requirement-details-title">
          <Coins size={18} weight="duotone" />
          Pricing &amp; vendor
        </span>
        <span className="requirement-details-preview">
          {formatter.format(
            Number(item.committed_cost || item.estimated_cost || 0),
          )}
          {assignedVendor ? ` · ${assignedVendor.name}` : " · No vendor"}
        </span>
        <CaretDown className="details-caret" size={16} weight="bold" />
      </summary>
      <form action={action} className="requirement-details-form">
        <input type="hidden" name="itemId" value={item.id} />
        <div className="pricing-fields">
          <label>
            <span>Estimated</span>
            <input
              name="estimatedCost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item.estimated_cost}
              inputMode="decimal"
            />
          </label>
          <label>
            <span>Agreed / quoted</span>
            <input
              name="committedCost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item.committed_cost}
              inputMode="decimal"
            />
          </label>
          <label>
            <span>Paid so far</span>
            <input
              name="paidAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={item.paid_amount}
              inputMode="decimal"
            />
          </label>
        </div>
        <label className="vendor-field">
          <span>Connected vendor</span>
          <select name="vendorId" defaultValue={item.vendor_id || ""}>
            <option value="">No vendor assigned</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
                {vendor.category ? ` · ${vendor.category}` : ""}
              </option>
            ))}
          </select>
        </label>
        {vendors.length === 0 && (
          <Link
            className="add-vendor-link"
            href={`/dashboard/vendors?business=${businessId}`}
          >
            <Storefront size={16} /> Add a vendor first
          </Link>
        )}
        <div className="requirement-details-actions">
          {state.error && <p className="form-message error">{state.error}</p>}
          {state.message && (
            <p className="form-message success">{state.message}</p>
          )}
          <button className="btn primary" disabled={pending}>
            {pending ? "Saving…" : "Save pricing & vendor"}
          </button>
        </div>
      </form>
    </details>
  );
}
