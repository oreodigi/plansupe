"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CaretDown,
  Coins,
  PencilSimple,
  Storefront,
  Trash,
  WhatsappLogo,
} from "@phosphor-icons/react";
import {
  deleteSetupItemAction,
  updateSetupItemDetailsAction,
  type ActionState,
} from "@/app/actions";
import type { SetupItem, Vendor } from "@/lib/types";

const initialState: ActionState = {};

export function RequirementDetailsForm({
  item,
  vendors,
  currency,
  businessId,
  businessName,
}: {
  item: SetupItem;
  vendors: Vendor[];
  currency: string;
  businessId: string;
  businessName: string;
}) {
  const [state, action, pending] = useActionState(
    updateSetupItemDetailsAction,
    initialState,
  );
  const assignedVendor = vendors.find((vendor) => vendor.id === item.vendor_id);
  const itemTerm = item.module === "Assets" ? "asset" : "requirement";
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  });
  const shareText = [
    `PlanSupe ${itemTerm} for ${businessName}`,
    `${item.module}: ${item.name}`,
    `Status: ${item.status}`,
    `Planned cost: ${formatter.format(Number(item.estimated_cost || 0))}`,
    `Agreed cost: ${formatter.format(Number(item.committed_cost || 0))}`,
    `Paid: ${formatter.format(Number(item.paid_amount || 0))}`,
    item.due_date ? `Due date: ${item.due_date}` : "Due date: Not set",
    `Vendor: ${assignedVendor?.name || "Not assigned"}`,
  ].join("\n");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <details className="requirement-details">
      <summary>
        <span className="requirement-details-title">
          <PencilSimple size={18} weight="duotone" />
          Edit {itemTerm}
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
        <div className="requirement-main-fields">
          <label>
            <span>Requirement name</span>
            <input
              name="name"
              defaultValue={item.name}
              minLength={2}
              maxLength={140}
              required
            />
          </label>
          <label>
            <span>Due date</span>
            <input
              name="dueDate"
              type="date"
              defaultValue={item.due_date || ""}
            />
          </label>
        </div>
        <div className="pricing-fields">
          <label>
            <span>
              <Coins size={14} /> Planned cost
            </span>
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
          <a
            className="btn whatsapp-button"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${item.name} on WhatsApp`}
          >
            <WhatsappLogo size={18} weight="fill" />
            Share
          </a>
          <button
            className="btn delete-requirement"
            formAction={deleteSetupItemAction}
            onClick={(event) => {
              if (
                !window.confirm(`Delete “${item.name}”? This cannot be undone.`)
              ) {
                event.preventDefault();
              }
            }}
          >
            <Trash size={17} /> Delete
          </button>
          <button className="btn primary" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </details>
  );
}
