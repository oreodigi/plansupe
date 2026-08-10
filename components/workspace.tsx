"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Buildings, Check, CheckSquare, ClipboardText, Gear, House, IdentificationCard,
  MapPin, Megaphone, Package, PaintBrush, Plus, SignOut, Storefront, Toolbox, UsersThree, Wallet, X,
} from "@phosphor-icons/react";
import { createSetupItemAction, createTaskAction, createVendorAction, toggleTaskAction, updateSetupStatusAction } from "@/app/actions";
import { signOutAction } from "@/app/auth-actions";
import { MODULES, type ModuleKey } from "@/lib/setup-catalog";
import type { Business, BusinessModule, BusinessTask, SetupItem, Vendor } from "@/lib/types";

type View = "overview" | "setup" | "tasks" | "vendors";
type Modal = "item" | "task" | "vendor" | null;
const moduleIcons = { Licenses: IdentificationCard, Location: MapPin, Interiors: PaintBrush, Equipment: Toolbox, Staff: UsersThree, Branding: Storefront, Operations: Gear, Marketing: Megaphone, Assets: Package } as const;
const currency = (value: number, code: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(value);

type WorkspaceProps = {
  businesses: Business[]; business: Business; items: SetupItem[]; tasks: BusinessTask[];
  vendors: Vendor[]; businessModules: BusinessModule[]; email: string; firstName: string;
};

export function Workspace({ businesses, business, items, tasks, vendors, businessModules, email, firstName }: WorkspaceProps) {
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const router = useRouter();
  const completed = items.filter((item) => item.status === "Completed" || item.status === "Not applicable").length;
  const readiness = items.length ? Math.round(completed / items.length * 100) : 0;
  const forecast = items.reduce((sum, item) => sum + Math.max(Number(item.committed_cost), Number(item.estimated_cost)), 0);
  const committed = items.reduce((sum, item) => sum + Number(item.committed_cost), 0);
  const paid = items.reduce((sum, item) => sum + Number(item.paid_amount), 0);
  const openTasks = tasks.filter((task) => task.status !== "Done");
  const selectedModules = (businessModules.length ? businessModules.map((entry) => entry.module_key) : [...new Set(items.map((item) => item.module))])
    .filter((entry): entry is ModuleKey => MODULES.some((module) => module.key === entry));
  const nav: [View, string, React.ReactNode][] = [
    ["overview", "Overview", <House key="overview"/>], ["setup", "Setup plan", <ClipboardText key="setup"/>],
    ["tasks", "Tasks", <CheckSquare key="tasks"/>], ["vendors", "Vendors", <Storefront key="vendors"/>],
  ];
  const title = view === "overview" ? business.name : view === "setup" ? "Setup plan" : view === "tasks" ? "Tasks" : "Vendors";
  const configureUrl = `/dashboard/configure?business=${business.id}`;

  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="logo"><span className="logo-mark">P</span><span>PlanSupe</span></Link>
      <select className="business-picker" value={business.id} onChange={(event) => router.push(`/dashboard?business=${event.target.value}`)} aria-label="Switch business">{businesses.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select>
      <nav className="side-nav">{nav.map(([key, label, icon]) => <button key={key} onClick={() => setView(key)} className={view === key ? "active" : ""}>{icon}{label}</button>)}<button onClick={() => setModal("item")}><Plus/>Quick add</button><Link href={configureUrl}><Gear/>Configure modules</Link><button><Wallet/>Finance</button></nav>
      <div className="sidebar-foot"><div className="user-line"><span className="user-avatar">{firstName.slice(0, 2).toUpperCase()}</span><div><b>{firstName}</b><small>{email}</small></div><form action={signOutAction}><button className="signout" aria-label="Sign out"><SignOut size={19}/></button></form></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><p className="kicker">{view === "overview" ? `${business.category} · ${business.stage}` : "Business workspace"}</p><h1>{title}</h1><p>{view === "overview" ? `${business.city}${business.launch_date ? ` · Launch ${business.launch_date}` : ""}` : `Manage ${view} for ${business.name}`}</p></div><button className="quick" onClick={() => setModal(view === "tasks" ? "task" : view === "vendors" ? "vendor" : "item")}><Plus size={18}/><span>Add {view === "tasks" ? "task" : view === "vendors" ? "vendor" : "record"}</span></button></header>
      <div className="view-tabs">{nav.map(([key, label]) => <button key={key} onClick={() => setView(key)} className={view === key ? "active" : ""}>{label}</button>)}</div>

      {view === "overview" && <>
        <section className="metrics"><article className="metric primary"><span>Launch readiness</span><b>{readiness}%</b><small>{completed} of {items.length} requirements complete</small><div className="progress"><i style={{ width: `${readiness}%` }}/></div></article><article className="metric"><span>Setup forecast</span><b>{currency(forecast, business.currency)}</b><small>Budget {currency(Number(business.budget), business.currency)}</small></article><article className="metric"><span>Committed / paid</span><b>{currency(committed, business.currency)}</b><small>{currency(paid, business.currency)} paid</small></article></section>
        <section className="attention">
          <div><div className="section-title"><div><h2>Next actions</h2><p>{openTasks.length} tasks need attention</p></div><button className="btn" onClick={() => setView("tasks")}>View all</button></div>{openTasks.length ? <div className="record-list">{openTasks.slice(0, 4).map((task) => <TaskRow task={task} businessId={business.id} key={task.id}/>)}</div> : <Empty title="No open tasks" copy="Add a task when there is something to move forward."/>}</div>
          <div><div className="section-title"><div><h2>Setup modules</h2><p>Only the areas you chose</p></div><Link className="text-action" href={configureUrl}>Configure</Link></div><div className="module-grid">{selectedModules.map((module) => { const group = items.filter((item) => item.module === module); const Icon = moduleIcons[module]; return <div className="module-card" key={module}><span className="module-icon"><Icon weight="duotone"/></span><div><b>{module}</b><span>{group.filter((item) => item.status === "Completed").length}/{group.length} complete</span></div></div>; })}</div></div>
        </section>
      </>}

      {view === "setup" && <><div className="section-title"><div><h2>{items.length} requirements</h2><p>Your selected and custom setup items</p></div><Link className="text-action" href={configureUrl}>Configure modules</Link></div>{items.length ? <div className="record-list">{items.map((item) => <SetupRow item={item} currencyCode={business.currency} key={item.id}/>)}</div> : <Empty title="Your setup plan is empty" copy="Configure modules or add a custom requirement."/>}</>}
      {view === "tasks" && <><div className="section-title"><div><h2>{openTasks.length} open tasks</h2><p>Work linked to this business</p></div></div>{tasks.length ? <div className="record-list">{tasks.map((task) => <TaskRow task={task} businessId={business.id} key={task.id}/>)}</div> : <Empty title="No tasks yet" copy="Create the first task for your launch."/>}</>}
      {view === "vendors" && <><div className="section-title"><div><h2>{vendors.length} vendors</h2><p>Partners and service providers for this business</p></div></div>{vendors.length ? <div className="record-list">{vendors.map((vendor) => <div className="record" key={vendor.id}><div><h3>{vendor.name}</h3><p>{vendor.category || "Uncategorized"}{vendor.contact_name ? ` · ${vendor.contact_name}` : ""}</p></div><span className="chip">{vendor.phone || vendor.email || "No contact"}</span></div>)}</div> : <Empty title="No vendors yet" copy="Add suppliers, consultants and service providers here."/>}</>}
      <nav className="mobile-nav">{nav.map(([key, label, icon]) => <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>{icon}{label}</button>)}</nav>
    </main>
    {modal ? <EntryModal type={modal} businessId={business.id} close={() => setModal(null)}/> : null}
  </div>;
}

function SetupRow({ item, currencyCode }: { item: SetupItem; currencyCode: string }) {
  return <div className="record"><div><h3>{item.name}</h3><p>{item.module} · {currency(Number(item.committed_cost || item.estimated_cost), currencyCode)} {Number(item.committed_cost) ? "committed" : "estimated"}{item.due_date ? ` · Due ${item.due_date}` : ""}</p></div><form action={updateSetupStatusAction}><input type="hidden" name="itemId" value={item.id}/><select className={`chip ${item.status.toLowerCase().replaceAll(" ", "-")}`} name="status" defaultValue={item.status} onChange={(event) => event.currentTarget.form?.requestSubmit()} aria-label={`Status for ${item.name}`}><option>Not started</option><option>In progress</option><option>Blocked</option><option>Completed</option><option>Not applicable</option></select></form></div>;
}

function TaskRow({ task, businessId }: { task: BusinessTask; businessId: string }) {
  const done = task.status === "Done";
  return <div className="record"><div><h3>{task.title}</h3><p>{task.module} · {task.priority} priority{task.due_date ? ` · Due ${task.due_date}` : ""}</p></div><form action={toggleTaskAction}><input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="taskId" value={task.id}/><input type="hidden" name="nextStatus" value={done ? "To do" : "Done"}/><button className={`task-check ${done ? "checked" : ""}`} aria-label={done ? "Mark task open" : "Complete task"}>{done && <Check size={15} weight="bold"/>}</button></form></div>;
}

function Empty({ title, copy }: { title: string; copy: string }) {
  return <div className="empty"><Buildings size={30}/><h3>{title}</h3><p>{copy}</p></div>;
}

function EntryModal({ type, businessId, close }: { type: Exclude<Modal, null>; businessId: string; close: () => void }) {
  const action = type === "item" ? createSetupItemAction : type === "task" ? createTaskAction : createVendorAction;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><form className="modal form" action={async (form) => { await action(form); close(); }}><div className="modal-head"><h2>{type === "item" ? "Add setup item" : type === "task" ? "Create task" : "Add vendor"}</h2><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18}/></button></div><input type="hidden" name="businessId" value={businessId}/>{type === "item" && <><Field name="name" label="Requirement" placeholder="e.g. Fire safety certificate"/><div className="field"><label htmlFor="module">Module</label><select id="module" name="module">{MODULES.map((module) => <option key={module.key}>{module.key}</option>)}</select></div><Field name="estimate" label="Estimated cost" type="number" placeholder="0"/><Field name="dueDate" label="Due date" type="date"/></>}{type === "task" && <><Field name="title" label="Task" placeholder="What needs to happen?"/><Field name="module" label="Module" placeholder="General"/><div className="field"><label htmlFor="priority">Priority</label><select id="priority" name="priority"><option>Low</option><option>Medium</option><option>High</option></select></div><Field name="dueDate" label="Due date" type="date"/></>}{type === "vendor" && <><Field name="name" label="Company or vendor name" placeholder="Vendor name"/><Field name="category" label="Category" placeholder="Equipment, legal, interiors…"/><Field name="contactName" label="Contact person"/><Field name="phone" label="Phone"/><Field name="email" label="Email" type="email"/></>}<button className="btn primary">Save</button></form></div>;
}

function Field({ name, label, type = "text", placeholder }: { name: string; label: string; type?: string; placeholder?: string }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} placeholder={placeholder} required={name === "name" || name === "title"}/></div>;
}
