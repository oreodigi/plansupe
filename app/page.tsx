import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/dashboard");
  return <main className="container">
    <nav className="public-nav"><Logo/><div className="nav-actions"><Link className="btn" href="/sign-in">Sign in</Link><Link className="btn primary" href="/sign-up">Start planning</Link></div></nav>
    <section className="hero">
      <div><p className="kicker">Business planning and operations</p><h1>Turn a business idea into a launch plan.</h1><p className="hero-copy">Build your setup checklist, organize vendors and tasks, and see exactly what your launch will cost—all in one private workspace.</p><div className="hero-actions"><Link className="btn primary" href="/sign-up">Create your workspace</Link><Link className="btn secondary" href="/sign-in">I already have an account</Link></div><div className="hero-proof"><div><b>10+</b><span>business templates</span></div><div><b>One</b><span>source of truth</span></div><div><b>360px</b><span>mobile ready</span></div></div></div>
      <div className="preview" aria-label="PlanSupe dashboard preview"><div className="preview-inner"><div className="preview-top"><div><span className="preview-label">Expected launch</span><h2>Your new business</h2><p>Setup plan generated from your category</p></div><span className="chip in-progress">Planning</span></div><div className="preview-score"><div><span className="preview-label">Launch readiness</span><p>Licenses, location, team and vendors</p></div><b>0%</b></div>{["Business registration","Location and workspace","Equipment and systems","Staff planning"].map((item,i)=><div className="preview-row" key={item}><span>{item}</span><small>{i===0?"Start here":"Not started"}</small></div>)}</div></div>
    </section>
  </main>;
}
