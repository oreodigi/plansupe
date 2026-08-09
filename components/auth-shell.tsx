import { Logo } from "./logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="auth-shell"><section className="auth-story"><Logo/><div><p className="kicker">Your business, organized</p><h1>Know what is required, what it costs, and what comes next.</h1><p>PlanSupe keeps every setup item, task, vendor and cost connected to the same business workspace.</p></div><small>Private workspaces · Mobile-first · Built for founders</small></section><section className="auth-panel"><div className="auth-box"><h2>{title}</h2><p>{subtitle}</p>{children}</div></section></main>;
}
