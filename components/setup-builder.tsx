"use client";

import { useActionState, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Buildings, CalendarBlank, Check, CheckCircle, ClipboardText,
  CurrencyInr, GearSix, IdentificationCard, MapPin, Megaphone, PaintBrush,
  Storefront, Toolbox, UsersThree,
} from "@phosphor-icons/react";
import { configureBusinessAction, createBusinessAction, type ActionState } from "@/app/actions";
import { BUSINESS_CATEGORIES } from "@/lib/templates";
import { MODULES, requirementsFor, type ModuleKey, type RequirementOption } from "@/lib/setup-catalog";
import type { Business } from "@/lib/types";

const moduleIcons = {
  Licenses: IdentificationCard, Location: MapPin, Interiors: PaintBrush, Equipment: Toolbox,
  Staff: UsersThree, Branding: Storefront, Operations: GearSix, Marketing: Megaphone,
} as const;

type Basics = { name: string; category: string; stage: string; city: string; budget: string; launchDate: string };
type Props = { firstName?: string; business?: Business; initialModules?: ModuleKey[]; initialRequirements?: string[] };
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function SetupBuilder({ firstName = "Founder", business, initialModules = [], initialRequirements = [] }: Props) {
  const editing = Boolean(business);
  const action = editing ? configureBusinessAction : createBusinessAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const [step, setStep] = useState(editing ? 1 : 0);
  const [basics, setBasics] = useState<Basics>({
    name: business?.name ?? "", category: business?.category ?? "", stage: business?.stage ?? "Planning",
    city: business?.city ?? "", budget: String(business?.budget ?? ""), launchDate: business?.launch_date ?? "",
  });
  const [modules, setModules] = useState<ModuleKey[]>(initialModules);
  const [requirements, setRequirements] = useState<string[]>(initialRequirements);
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(initialModules[0] ?? null);
  const [clientError, setClientError] = useState("");

  const catalog = useMemo(() => basics.category ? MODULES.flatMap(({ key }) => requirementsFor(basics.category, key)) : [], [basics.category]);
  const selectedItems = catalog.filter((entry) => requirements.includes(entry.id));
  const estimated = selectedItems.reduce((sum, entry) => sum + entry.estimatedCost, 0);
  const budget = Number(basics.budget || 0);

  function updateBasic(key: keyof Basics, value: string) {
    setBasics((current) => ({ ...current, [key]: value }));
    if (key === "category" && value !== basics.category) { setModules([]); setRequirements([]); setActiveModule(null); }
  }

  function toggleModule(module: ModuleKey) {
    const selected = modules.includes(module);
    setModules((current) => selected ? current.filter((entry) => entry !== module) : [...current, module]);
    if (selected) setRequirements((current) => current.filter((id) => !requirementsFor(basics.category, module).some((entry) => entry.id === id)));
    if (!selected) setActiveModule(module);
  }

  function next() {
    setClientError("");
    if (step === 0 && (!basics.name.trim() || !basics.category || !basics.city.trim() || !basics.budget || !basics.launchDate)) {
      setClientError("Complete the business name, category, city, budget and target date to continue."); return;
    }
    if (step === 1 && modules.length === 0) { setClientError("Choose at least one module for this business."); return; }
    if (step === 2 && requirements.length === 0) { setClientError("Choose at least one requirement to build your setup plan."); return; }
    setStep((current) => Math.min(3, current + 1));
  }

  return <form className="setup-builder" action={formAction}>
    <input type="hidden" name="name" value={basics.name}/><input type="hidden" name="category" value={basics.category}/>
    <input type="hidden" name="stage" value={basics.stage}/><input type="hidden" name="city" value={basics.city}/>
    <input type="hidden" name="budget" value={basics.budget}/><input type="hidden" name="launchDate" value={basics.launchDate}/>
    <input type="hidden" name="modulesJson" value={JSON.stringify(modules)}/><input type="hidden" name="requirementsJson" value={JSON.stringify(requirements)}/>
    {business && <input type="hidden" name="businessId" value={business.id}/>} 

    <header className="setup-progress">
      <div className="setup-progress-copy"><span>{editing ? "Configure workspace" : `Welcome, ${firstName}`}</span><strong>{["Business basics", "Choose modules", "Select requirements", "Review your plan"][step]}</strong></div>
      <div className="setup-step-count"><b>0{step + 1}</b><span>/ 04</span></div>
      <div className="setup-progress-track" aria-hidden="true"><i style={{ width: `${((step + 1) / 4) * 100}%` }}/></div>
    </header>

    <main className="setup-stage">
      {step === 0 && <BasicsStep basics={basics} update={updateBasic}/>} 
      {step === 1 && <ModulesStep selected={modules} toggle={toggleModule}/>} 
      {step === 2 && <RequirementsStep category={basics.category} modules={modules} selected={requirements} active={activeModule} setActive={setActiveModule} toggle={(id) => setRequirements((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])}/>} 
      {step === 3 && <ReviewStep basics={basics} modules={modules} items={selectedItems}/>} 
    </main>

    <footer className="setup-footer">
      <div className="selection-tally"><span>{requirements.length} requirements</span><b>{money(estimated)}</b>{budget > 0 && <small className={estimated > budget ? "over" : ""}>{estimated > budget ? `${money(estimated - budget)} over budget` : `${money(budget - estimated)} budget remaining`}</small>}</div>
      {(clientError || state.error) && <div className="form-error" role="alert">{clientError || state.error}</div>}
      {state.message && <div className="form-message" role="status">{state.message}</div>}
      <div className="setup-actions">
        {step > (editing ? 1 : 0) && <button type="button" className="btn secondary" onClick={() => { setClientError(""); setStep((current) => current - 1); }}><ArrowLeft/> Back</button>}
        {step < 3 ? <button key="continue" type="button" className="btn primary" onClick={(event) => { event.preventDefault(); next(); }}>Continue <ArrowRight/></button> : <button key="save" type="submit" className="btn primary" disabled={pending}>{pending ? "Building your workspace…" : editing ? "Save setup choices" : "Create my workspace"}<CheckCircle weight="fill"/></button>}
      </div>
    </footer>
  </form>;
}

function BasicsStep({ basics, update }: { basics: Basics; update: (key: keyof Basics, value: string) => void }) {
  return <section className="setup-panel"><div className="setup-intro"><span className="step-art"><Buildings weight="duotone"/></span><div><p className="kicker">Start with the essentials</p><h1>Tell us what you’re building.</h1><p>These details help PlanSupe tailor the setup options, costs and timeline to your business.</p></div></div><div className="wizard-fields">
    <label className="field wide"><span>Business or brand name</span><input value={basics.name} onChange={(event) => update("name", event.target.value)} placeholder="Riverstone Cafe" autoFocus/></label>
    <label className="field"><span>Business category</span><select value={basics.category} onChange={(event) => update("category", event.target.value)}><option value="">Choose a category</option>{BUSINESS_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
    <label className="field"><span>Current stage</span><select value={basics.stage} onChange={(event) => update("stage", event.target.value)}><option>Idea</option><option>Planning</option><option>Pre-launch</option><option>Operating</option></select></label>
    <label className="field"><span>Operating city</span><input value={basics.city} onChange={(event) => update("city", event.target.value)} placeholder="Bengaluru"/></label>
    <label className="field"><span>Setup budget</span><div className="input-prefix"><CurrencyInr/><input type="number" min="0" value={basics.budget} onChange={(event) => update("budget", event.target.value)} placeholder="500000"/></div></label>
    <label className="field wide"><span>Target launch date</span><div className="input-prefix"><CalendarBlank/><input type="date" value={basics.launchDate} onChange={(event) => update("launchDate", event.target.value)}/></div><small>We’ll work backwards from this date when scheduling selected requirements.</small></label>
  </div></section>;
}

function ModulesStep({ selected, toggle }: { selected: ModuleKey[]; toggle: (module: ModuleKey) => void }) {
  return <section className="setup-panel"><div className="setup-intro compact"><div><p className="kicker">Your workspace, your choice</p><h1>Which areas do you want to plan?</h1><p>Choose only the modules that matter now. No requirements are added until you select them next.</p></div><span className="selection-badge">{selected.length} selected</span></div><div className="module-selector">{MODULES.map((module, index) => { const Icon = moduleIcons[module.key]; const checked = selected.includes(module.key); return <button type="button" key={module.key} className={`module-option ${checked ? "selected" : ""}`} onClick={() => toggle(module.key)} aria-pressed={checked}><span className="module-number">0{index + 1}</span><span className="module-art"><Icon weight="duotone"/></span><span className="module-copy"><b>{module.label}</b><small>{module.short}</small></span><span className="option-check">{checked && <Check weight="bold"/>}</span></button>; })}</div></section>;
}

function RequirementsStep({ category, modules, selected, active, setActive, toggle }: { category: string; modules: ModuleKey[]; selected: string[]; active: ModuleKey | null; setActive: (module: ModuleKey) => void; toggle: (id: string) => void }) {
  const current = active && modules.includes(active) ? active : modules[0];
  const options = current ? requirementsFor(category, current) : [];
  return <section className="setup-panel requirements-panel"><div className="setup-intro compact"><div><p className="kicker">Tailored for {category}</p><h1>Choose what you actually need.</h1><p>Each option shows its likely cost and the time it should start before launch.</p></div></div><div className="requirement-layout"><nav className="module-rail" aria-label="Selected modules">{modules.map((module) => { const Icon = moduleIcons[module]; const count = selected.filter((id) => requirementsFor(category, module).some((entry) => entry.id === id)).length; return <button type="button" key={module} className={current === module ? "active" : ""} onClick={() => setActive(module)}><Icon weight="duotone"/><span>{module}</span><b>{count}</b></button>; })}</nav><div className="requirement-list">{options.map((option) => { const checked = selected.includes(option.id); return <button type="button" key={option.id} className={`requirement-option ${checked ? "selected" : ""}`} onClick={() => toggle(option.id)} aria-pressed={checked}><span className="option-check">{checked && <Check weight="bold"/>}</span><span className="requirement-copy"><span className={`requirement-tag ${option.tag.toLowerCase()}`}>{option.tag}</span><b>{option.title}</b><small>{option.description}</small><span className="requirement-meta"><em>{option.estimatedCost ? money(option.estimatedCost) : "No direct cost"}</em><em>Start {option.leadWeeks} {option.leadWeeks === 1 ? "week" : "weeks"} before launch</em></span></span></button>; })}<div className="custom-note"><ClipboardText/><div><b>Need something different?</b><span>You can add custom requirements from the setup plan after creating the workspace.</span></div></div></div></div></section>;
}

function ReviewStep({ basics, modules, items }: { basics: Basics; modules: ModuleKey[]; items: RequirementOption[] }) {
  return <section className="setup-panel"><div className="setup-intro"><span className="step-art success"><CheckCircle weight="duotone"/></span><div><p className="kicker">Ready to build</p><h1>Your workspace reflects your choices.</h1><p>Review the plan below. You can reconfigure modules and add custom requirements later.</p></div></div><div className="review-summary"><div><span>Business</span><b>{basics.name}</b><small>{basics.category} · {basics.city}</small></div><div><span>Target</span><b>{basics.launchDate ? new Date(`${basics.launchDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not set"}</b><small>{money(Number(basics.budget || 0))} budget</small></div></div><div className="review-modules">{modules.map((module) => { const Icon = moduleIcons[module]; const count = items.filter((entry) => entry.module === module).length; return <div key={module}><Icon weight="duotone"/><span><b>{module}</b><small>{count} {count === 1 ? "requirement" : "requirements"}</small></span></div>; })}</div></section>;
}
