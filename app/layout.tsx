import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanSupe — Business setup workspace",
  description: "Plan, launch and operate your business from one place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
