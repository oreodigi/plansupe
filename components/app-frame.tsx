"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  List,
  ListChecks,
  SignOut,
  SquaresFour,
  Storefront,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/auth-actions";
import type { Business, BusinessModule } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/vendors", label: "Vendors", icon: Storefront },
];

export function AppFrame({
  businesses,
  business,
  businessModules,
  name,
  email,
  children,
}: {
  businesses: Business[];
  business: Business;
  businessModules: BusinessModule[];
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const businessQuery = `?business=${business.id}`;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const active = (href: string) =>
    href === "/dashboard"
      ? pathname === href || pathname.startsWith("/dashboard/module/")
      : pathname.startsWith(href);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("drawer-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("drawer-open");
    };
  }, [menuOpen]);

  return (
    <div className="app-frame">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <button
            className="menu-button"
            type="button"
            aria-label="Open module menu"
            aria-expanded={menuOpen}
            aria-controls="module-drawer"
            onClick={() => setMenuOpen(true)}
          >
            <List size={22} weight="bold" />
          </button>
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                className={active(href) ? "active" : ""}
                href={`${href}${businessQuery}`}
              >
                <Icon size={19} weight={active(href) ? "fill" : "regular"} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="topbar-tools">
            {businesses.length > 1 && (
              <label className="business-switcher">
                <span>Business</span>
                <select
                  aria-label="Switch business"
                  value={business.id}
                  onChange={(event) => {
                    const params = new URLSearchParams(search.toString());
                    params.set("business", event.target.value);
                    router.push(`${pathname}?${params}`);
                  }}
                >
                  {businesses.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Link
              className={`account-chip ${pathname.startsWith("/dashboard/account") ? "active" : ""}`}
              href={`/dashboard/account${businessQuery}`}
              aria-label="My account"
            >
              <span className="avatar">{initials}</span>
              <span className="account-chip-copy">
                <b>{name}</b>
                <small>{email}</small>
              </span>
            </Link>
            <form action={signOutAction}>
              <button
                className="icon-button signout-top"
                type="submit"
                aria-label="Sign out"
                title="Sign out"
              >
                <SignOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <button
        className={`drawer-backdrop ${menuOpen ? "open" : ""}`}
        type="button"
        aria-label="Close module menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        id="module-drawer"
        className={`module-drawer ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="drawer-head">
          <div>
            <p>Business workspace</p>
            <h2>{business.name}</h2>
            <span>
              {business.category} · {business.city}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close module menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={21} weight="bold" />
          </button>
        </div>
        <nav className="drawer-modules" aria-label="Selected modules">
          <p className="drawer-label">Your modules</p>
          {businessModules.map((module, index) => {
            const href = `/dashboard/module/${module.module_key.toLowerCase()}${businessQuery}`;
            const isActive =
              pathname.toLowerCase() === href.split("?")[0].toLowerCase();
            return (
              <Link
                key={module.id}
                className={isActive ? "active" : ""}
                href={href}
                onClick={() => setMenuOpen(false)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{module.module_key}</b>
              </Link>
            );
          })}
          {businessModules.length === 0 && (
            <p className="drawer-empty">
              Choose modules in business setup to see them here.
            </p>
          )}
        </nav>
        <nav className="drawer-shortcuts" aria-label="Workspace shortcuts">
          <Link
            href={`/dashboard${businessQuery}`}
            onClick={() => setMenuOpen(false)}
          >
            <SquaresFour size={19} />
            Dashboard
          </Link>
          <Link
            href={`/dashboard/vendors${businessQuery}`}
            onClick={() => setMenuOpen(false)}
          >
            <Storefront size={19} />
            Vendor directory
          </Link>
          <Link
            href={`/dashboard/account${businessQuery}`}
            onClick={() => setMenuOpen(false)}
          >
            <UserCircle size={19} />
            My account
          </Link>
        </nav>
      </aside>
      <main className="app-content">{children}</main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            className={active(href) ? "active" : ""}
            href={`${href}${businessQuery}`}
          >
            <Icon size={22} weight={active(href) ? "fill" : "regular"} />
            <span>{label}</span>
          </Link>
        ))}
        <Link
          className={pathname.startsWith("/dashboard/account") ? "active" : ""}
          href={`/dashboard/account${businessQuery}`}
        >
          <UserCircle
            size={22}
            weight={
              pathname.startsWith("/dashboard/account") ? "fill" : "regular"
            }
          />
          <span>Account</span>
        </Link>
      </nav>
    </div>
  );
}
