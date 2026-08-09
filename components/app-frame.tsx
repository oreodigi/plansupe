"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { House, ListChecks, SignOut, Storefront, UserCircle } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/auth-actions";
import type { Business } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/vendors", label: "Vendors", icon: Storefront },
];

export function AppFrame({ businesses, business, name, email, children }: { businesses: Business[]; business: Business; name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const businessQuery = `?business=${business.id}`;
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const active = (href: string) => href === "/dashboard" ? pathname === href || pathname.startsWith("/dashboard/module/") : pathname.startsWith(href);

  return (
    <div className="app-frame">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(({ href, label, icon: Icon }) => <Link key={href} className={active(href) ? "active" : ""} href={`${href}${businessQuery}`}><Icon size={19} weight={active(href) ? "fill" : "regular"} />{label}</Link>)}
          </nav>
          <div className="topbar-tools">
            {businesses.length > 1 && <label className="business-switcher"><span>Business</span><select aria-label="Switch business" value={business.id} onChange={(event) => { const params = new URLSearchParams(search.toString()); params.set("business", event.target.value); router.push(`${pathname}?${params}`); }}>{businesses.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>}
            <Link className={`account-chip ${pathname.startsWith("/dashboard/account") ? "active" : ""}`} href={`/dashboard/account${businessQuery}`} aria-label="My account"><span className="avatar">{initials}</span><span className="account-chip-copy"><b>{name}</b><small>{email}</small></span></Link>
            <form action={signOutAction}><button className="icon-button signout-top" type="submit" aria-label="Sign out" title="Sign out"><SignOut size={20} /></button></form>
          </div>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(({ href, label, icon: Icon }) => <Link key={href} className={active(href) ? "active" : ""} href={`${href}${businessQuery}`}><Icon size={22} weight={active(href) ? "fill" : "regular"} /><span>{label}</span></Link>)}
        <Link className={pathname.startsWith("/dashboard/account") ? "active" : ""} href={`/dashboard/account${businessQuery}`}><UserCircle size={22} weight={pathname.startsWith("/dashboard/account") ? "fill" : "regular"} /><span>Account</span></Link>
      </nav>
    </div>
  );
}

